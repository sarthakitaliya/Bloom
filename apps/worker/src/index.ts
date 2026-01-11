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
    console.log("job id and data:", job.id, job.data);
    const { projectId, prompt, sandboxId, jobType, id } = job.data;
    console.log("project id:", projectId);
    console.log("job Id, worker ID", id, job.id);

    try {
      const client = await sandboxManager.getSandbox(projectId);
      if (!client) throw new Error("Sandbox client not found");
      const jobRecord = await prisma.job.findUnique({
        where: { id },
      });
      if (!jobRecord) {
        console.log("[worker] Job record not found in DB");
        connection.publish(
          projectId,
          JSON.stringify({ type: "ERROR", message: "Job record not found" })
        );
        throw new Error("Job record not found in DB");
      }
      await prisma.job.update({
        where: { id },
        data: { status: "ACTIVE" },
      });
      if (jobType === "INIT" && prompt) {
        console.log("[worker] Initializing sandbox...");

        const response = await agentInvoke(prompt, projectId);
        console.log("[worker] Agent response:", response);

        const lastMsg = response.messages[response.messages.length - 1];
        const agentResponse =
          typeof lastMsg?.content === "string"
            ? lastMsg.content
            : "Done — all changes have been applied successfully.";
        connection.publish(
          projectId,
          JSON.stringify({ type: "agentMsg", message: agentResponse })
        );
        await prisma.chatHistory.create({
          data: {
            projectId: projectId,
            content: agentResponse,
            from: "AGENT",
          },
        });
        //TODO: UPDATE: chat history in DB with agentResponse
        const previewUrl = await client.getHost(5173);
        // console.log("[worker] Preview URL:", previewUrl);
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
          connection.publish(
            projectId,
            JSON.stringify({
              type: "ERROR",
              message: "Snapshot creation failed",
            })
          );
          throw new Error("Snapshot creation failed");
        }
        // console.log(
        //   "[worker] Snapshot created with result:",
        //   snapshotResult.raw
        // );
      } else if (jobType === "UPDATE" && prompt) {
        console.log("[worker] Updating sandbox...");
        const response = await agentInvoke(prompt, projectId);
        console.log("[worker] Agent response:", response);
        const snapshotResult = await snapshotManager.createSnapshot(
          sandboxId,
          projectId
        );
        if (!snapshotResult.ok) {
          connection.publish(
            projectId,
            JSON.stringify({ type: "ERROR", message: "Snapshot update failed" })
          );
          throw new Error("Snapshot update failed");
        }
        const lastMsg = response.messages[response.messages.length - 1];
        const agentResponse =
          typeof lastMsg?.content === "string"
            ? lastMsg.content
            : "Done — all changes have been applied successfully.";
        connection.publish(
          projectId,
          JSON.stringify({ type: "agentMsg", message: agentResponse })
        );
        await prisma.chatHistory.create({
          data: {
            projectId: projectId,
            content: agentResponse,
            from: "AGENT",
          },
        });
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
          connection.publish(
            projectId,
            JSON.stringify({ type: "ERROR", message: "No snapshot found" })
          );
          throw new Error("No snapshot found to restore");
        }

        console.log("[worker] Restoring snapshot..");
        const url = await getSignedUrlCommand(3600, projectId); // expiry 1 hour
        const restoreResult = await snapshotManager.restoreSnapshot(
          projectId,
          url
        );
        if (!restoreResult.ok) {
          connection.publish(
            projectId,
            JSON.stringify({
              type: "ERROR",
              message: "Snapshot restore failed",
            })
          );
          throw new Error("Snapshot restore failed");
        }
        console.log(
          "[worker] Snapshot restored with result:",
          restoreResult.raw
        );
        await client.commands
          .run(`nohup npm run dev > /tmp/dev.log 2>&1 &`, {
            timeoutMs: 50 * 1000,
          })
          .catch((error) => {
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

      const errorMessage = error instanceof Error
        ? error.message
        : "Something went wrong while processing the job";

      await prisma.chatHistory.create({
        data: {
          projectId: projectId,
          content: `Error: ${errorMessage}`,
          from: "AGENT",
        },
      });

      connection.publish(
        projectId,
        JSON.stringify({
          type: "ERROR",
          message: errorMessage,
        })
      );
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
