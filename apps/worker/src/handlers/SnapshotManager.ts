import { sandboxManager } from "@bloom/agent";
import { config } from "@bloom/config";
import { s3 } from "../lib/s3";
import tar from "tar-stream";
import { createGzip } from "zlib";
import { PassThrough } from "stream";
import { Upload } from "@aws-sdk/lib-storage";
import { prisma } from "@bloom/db";

function shellQuote(s: string) {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

class SnapshotManager {
  public async createSnapshot(sandboxId: string, projectId: string) {
    if (!sandboxId) throw new Error("sandboxId required");
    if (!projectId) throw new Error("projectId required");

    try {
      const client = await sandboxManager.getSandbox(projectId);
      if (!client) throw new Error("Sandbox client not found");
      const findCmd = [
        `find . -type f -not -path "./node_modules/*" -not -path "./dist/*" -not -path "./.cache/*" -print0`,
      ].join(" ");
      const findResult = await client.commands.run(findCmd, {
        timeoutMs: 60_000,
      });
      const filePaths = findResult.stdout
        ? findResult.stdout.split("\0").filter(Boolean)
        : [];
      const pack = tar.pack();
      const gzip = createGzip();
      const pass = new PassThrough();

      pack.pipe(gzip).pipe(pass);
      const upload = new Upload({
        client: s3,
        params: {
          Bucket: config.doSpacesBucket,
          Key: `snapshots/${projectId}.tar.gz`,
          Body: pass,
        },
      });

      const uploadPromise = upload.done();
      for (const path of filePaths) {
        const cleanPath = path.startsWith("./") ? path.slice(2) : path;
        console.log("path", cleanPath);

        const content = await client.files.read(cleanPath, { format: "text" });
        pack.entry(
          { name: cleanPath, size: content.length, mode: 0o644 },
          content
        );
      }
      pack.finalize();
      const uploadResult = await uploadPromise;
      console.log("Upload result:", uploadResult);
      await prisma.project.update({
        where: { id: projectId },
        data: {
          currentSnapshotS3Key: `snapshots/${projectId}.tar.gz`,
          currentSnapshotAt: new Date(),
        },
      });
      return { ok: true, message: "Snapshot created", raw: uploadResult };
    } catch (error) {
      console.error("Error creating snapshot:", error);
      throw error;
    }
  }
  public async restoreSnapshot(projectId: string, snapshotUrl: string): Promise<{ ok: boolean; message: string; raw: unknown }> {
    if (!projectId) throw new Error("projectId required");
    try {
      if (!snapshotUrl) throw new Error("snapshotUrl required");
      if (!projectId) throw new Error("projectId required");
      let client = await sandboxManager.getSandbox(projectId);
      if (!client) throw new Error("Sandbox client not found");
      console.log(snapshotUrl);
      const quotedUrl = shellQuote(snapshotUrl);
      const processSubCmd = [
        `WORKDIR=.`,
        `SNAP_URL=${quotedUrl}`,
        `curl --fail --show-error -L "$SNAP_URL" | tar -C "$WORKDIR" -xz --exclude='node_modules'`,
      ].join(" && ");
      const result = await client.commands.run(processSubCmd, {
        timeoutMs: 10 * 60 * 1000,
      }); // 10 minutes timeout
      const installResult = await client.commands.run("npm install", {
        timeoutMs: 10 * 60 * 1000,
      });
      console.log("Install result:", installResult);
      return { ok: true, message: "Snapshot restored", raw: result };
    } catch (error) {
      console.error("Error restoring snapshot:", error);
      throw error;
    }
  }
}
export const snapshotManager = new SnapshotManager();
