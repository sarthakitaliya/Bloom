import { Job, Worker } from "bullmq";
import { connection } from "@bloom/queue";
import { agentInvoke, sandboxManager } from "@bloom/agent";
import { prisma } from "@bloom/db";
import { snapshotManager } from "./handlers/SnapshotManager";
import { getSignedUrlCommand } from "./lib/s3";
export * from "./lib/s3";

type Payload = {
  id: string;
  projectId: string;
  prompt?: string;
  sandboxId: string;
  jobType: "INIT" | "RESTORE" | "UPDATE";
};

const worker = new Worker(
  "builder-queue",
  async (job: Job<Payload>) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    const { projectId, prompt, sandboxId, jobType, id } = job.data;
    console.log("project id:", projectId);

    try {
      const client = await sandboxManager.getSandbox(projectId);
      if (!client) throw new Error("Sandbox client not found");
      await prisma.job.update({
        where: { id },
        data: { status: "ACTIVE" },
      });
      if (jobType === "INIT" && prompt) {
        console.log("[worker] Initializing sandbox...");

        const response = await agentInvoke(prompt, projectId);
        console.log("[worker] Agent response:", response);
        await client.commands.run(`nohup npm run dev > /tmp/dev.log 2>&1 &`, {timeoutMs: 50 * 1000}).catch((error) => {
          console.error("[worker] Error starting dev server:", error);
        }); // 50 seconds timeout

        //TODO: UPDATE: chat history in DB with agentResponse
        const previewUrl = await client.getHost(5173);
        console.log("[worker] Preview URL:", previewUrl);
        connection.publish(
          projectId,
          JSON.stringify({ type: "Initialized", previewUrl })
        );
        await prisma.project.update({
          where: { id: projectId },
          data: {
            previewUrl: `https://${previewUrl}`,
            sandboxId: sandboxId,
            lastSeenAt: new Date(),
          },
        });
        const snapshotResult = await snapshotManager.createSnapshot(
          sandboxId,
          projectId
        );
        if (!snapshotResult.ok) {
          throw new Error("Snapshot creation failed");
        }
        console.log(
          "[worker] Snapshot created with result:",
          snapshotResult.raw
        );
      } else if (jobType === "UPDATE" && prompt) {
        console.log("[worker] Updating sandbox...");
        const response = await agentInvoke(prompt, projectId);
        console.log("[worker] Agent response:", response);
        const snapshotResult = await snapshotManager.createSnapshot(
          sandboxId,
          projectId
        );
        if (!snapshotResult.ok) {
          throw new Error("Snapshot update failed");
        }
        console.log(
          "[worker] Snapshot updated with result:",
          snapshotResult.raw
        );
      } else if (jobType === "RESTORE") {
        console.log("[worker] Restoring snapshot...");
        const snapshotExists = await prisma.project.findFirst({
          where: {
            id: projectId,
          },
        });
        if (!snapshotExists || !snapshotExists.currentSnapshotS3Key) {
          throw new Error("No snapshot found to restore");
        }

        console.log("[worker] Restoring snapshot..");
        const url = await getSignedUrlCommand(
          3600,
          projectId
        ); // expiry 1 hour
        const restoreResult = await snapshotManager.restoreSnapshot(
          projectId,
          url
        );
        if (!restoreResult.ok) {
          throw new Error("Snapshot restore failed");
        }
        console.log(
          "[worker] Snapshot restored with result:",
          restoreResult.raw
        );
         await client.commands.run(`nohup npm run dev > /tmp/dev.log 2>&1 &`, {timeoutMs: 50 * 1000}).catch((error) => {
          console.error("[worker] Error starting dev server:", error);
        }); // 50 seconds timeout
        const previewUrl = await client.getHost(5173);
        console.log("[worker] Preview URL:", previewUrl);
        connection.publish(
          projectId,
          JSON.stringify({ type: "Initialized", previewUrl })
        );
        await prisma.project.update({
          where: { id: projectId },
          data: {
            previewUrl: `https://${previewUrl}`,
            sandboxId: sandboxId,
            lastSeenAt: new Date(),
            currentSnapshotAt: new Date(),
          },
        });
      }
      await prisma.job.update({
        where: { id },
        data: { status: "COMPLETED" },
      });
      return;
    } catch (error) {
      console.error("Error processing job:", error);
      await prisma.job.update({
        where: { id },
        data: { status: "FAILED" },
      });
      throw error;
    }
  },
  {
    concurrency: 3,
    connection,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} has completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} has failed with error: ${err.message}`);
});
