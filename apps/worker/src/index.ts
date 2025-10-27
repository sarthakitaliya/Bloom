import { Job, Worker } from "bullmq";
import { connection, builderQueue } from "@bloom/queue";
import { agentInvoke, sandboxManager } from "@bloom/agent";
import { prisma } from "@bloom/db";
import { snapshotManager } from "./handlers/SnapshotManager";

type Payload = {
  id: string;
  projectId: string;
  prompt?: string;
  sandboxId: string;
  jobType?: "INIT" | "RESTORE" | "UPDATE" | "SNAPSHOT";
};

const worker = new Worker(
  "builder-queue",
  async (job: Job<Payload>) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    const { projectId, prompt, sandboxId, jobType, id } = job.data;
    console.log("project id:", projectId);

    try {
      const client = await sandboxManager.getSandbox(projectId);
      await prisma.job.update({
        where: { id },
        data: { status: "ACTIVE" },
      });
      if (jobType === "INIT" && prompt) {
        console.log("[worker] Initializing sandbox...");

        const response = await agentInvoke(prompt, projectId);
        console.log("[worker] Agent response:", response);
        //TODO: UPDATE: chat history in DB with agentResponse
        const previewUrl = await client.getHost(5173);
        console.log("[worker] Preview URL:", previewUrl);
        connection.publish(
          projectId,
          JSON.stringify({ type: "Initialized", previewUrl })
        );
        await prisma.job.update({
          where: { id },
          data: { status: "COMPLETED" },
        });
        await prisma.project.update({
          where: { id: projectId },
          data: {
            previewUrl: `https://${previewUrl}`,
            sandboxId: sandboxId,
            lastSeenAt: new Date(),
          },
        });
        return;
      } else if (jobType === "UPDATE" && prompt) {
        console.log("[worker] Updating sandbox...");
        const response = await agentInvoke(prompt, projectId);
        console.log("[worker] Agent response:", response);
        await prisma.job.update({
          where: { id },
          data: { status: "COMPLETED" },
        });
        //TODO: Implement UPDATE logic
        return;
      } else if (jobType === "RESTORE") {
        console.log("[worker] Restoring snapshot...");
        const snapshot = await prisma.snapshot.findFirst({
          where: { projectId },
          orderBy: { createdAt: "desc" },
        });

        if (snapshot) {
          console.log("[worker] Restoring snapshot..");
          await snapshotManager.restoreSnapshot(sandboxId, snapshot.storageUrl);
          // await client.commands.run("npm run dev");
          console.log("[worker] Restoring snapshot..");
        }
        const previewUrl = await client.getHost(5173);
        console.log("[worker] Preview URL:", previewUrl);
        await prisma.job.update({
          where: { id },
          data: { status: "COMPLETED" },
        });
        return;
      } else if (jobType === "SNAPSHOT") {
        //TODO: Implement SNAPSHOT logic
        return;
      }

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
