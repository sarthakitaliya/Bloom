import { prisma } from "@bloom/db";
import type { Request, Response } from "express";
import type { ApiResponse } from "../types/ApiResponse";
import { agentInvoke, titleAgent } from "@bloom/agent";
import { sandboxManager } from "@bloom/agent";
import { builderQueue, connection as redis } from "@bloom/queue";

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: req.user.id,
      },
    });
    res
      .status(200)
      .json({ success: true, data: projects } as ApiResponse<typeof projects>);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error" } as ApiResponse<null>);
  }
};

export const initProject = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const titleResponse = await titleAgent.invoke({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const projectTitle = titleResponse?.messages[1]?.content as string;

    const newProject = await prisma.project.create({
      data: {
        title: projectTitle || "Untitled Project",
        visibility: "PUBLIC",
        userId: req.user.id,
      },
    });

    await prisma.chatHistory.create({
      data: {
        projectId: newProject.id,
        from: "USER",
        content: prompt,
      },
    });

    const job = await prisma.job.create({
      data: {
        projectId: newProject.id,
        type: "BUILDING",
        status: "QUEUED",
      },
    });

    const sandbox = await sandboxManager.createSandbox(newProject.id);
    redis.set(
      `sandbox-${newProject.id}`,
      JSON.stringify({ client: sandbox, sandboxId: sandbox.sandboxId }),
      "EX",
      60 * 60 * 1 // 1 hour expiration
    );
    console.log("from API", sandbox.sandboxId);

    await builderQueue.obliterate({ force: true });
    await builderQueue.add(
      "builder-queue",
      {
        projectId: newProject.id,
        sandboxId: sandbox.sandboxId,
        prompt,
        id: job.id,
        jobType: "INIT",
      },
      { removeOnComplete: true, removeOnFail: false }
    );

    res.status(201).json({
      success: true,
      data: { project: { ...newProject }, job: { ...job } },
    } as ApiResponse<{ project: typeof newProject; job: typeof job }>);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error" } as ApiResponse<null>);
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user.id,
      },
    });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      } as ApiResponse<null>);
    }
    const job = await prisma.job.findFirst({
      where: {
        projectId: project.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!project.sandboxId || !project.lastSeenAt) {
      if (job && ["QUEUED", "ACTIVE"].includes(job.status)) {
        return res.status(200).json({
          success: true,
          data: {
            project,
            job,
          },
        } as ApiResponse<{ project: typeof project; job: typeof job }>);
      }
      return res.status(404).json({
        success: false,
        message: "Sandbox not found or not initialized",
      } as ApiResponse<null>);
    }

    try {
      const lastSeen = new Date(project.lastSeenAt);
      const now = new Date();
      const EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes
      if (now.getTime() - lastSeen.getTime() > EXPIRATION_MS) {
        await redis.del(`sandbox-${project.id}`);
        const sandbox = await sandboxManager.createSandbox(project.id);
        redis.set(
          `sandbox-${project.id}`,
          JSON.stringify({ client: sandbox, sandboxId: sandbox.sandboxId }),
          "EX",
          60 * 60 * 1 // 1 hour expiration
        );
        const job = await prisma.job.create({
          data: {
            projectId: project.id,
            type: "RESTORE",
            status: "QUEUED",
          },
        });

        await builderQueue.add("builder-queue", {
          projectId: project.id,
          sandboxId: project.sandboxId,
          jobType: "RESTORE",
          id: job.id,
        });
        return res.status(200).json({
          success: true,
          data: project,
          restoring: true,
        } as ApiResponse<typeof project>);
      } else {
        console.log("restoring from existing preview url");

        return res.status(200).json({
          success: true,
          data: project,
          restoring: false,
        } as ApiResponse<typeof project>);
      }
    } catch (e) {
      return res.status(404).json({
        success: false,
        message: "Sandbox not found",
      } as ApiResponse<null>);
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error" } as ApiResponse<null>);
  }
};

export const extendSandbox = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user.id,
      },
    });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      } as ApiResponse<null>);
    }

    const client = await sandboxManager.getSandbox(project.id);
    if (!client) {
      await redis.del(`sandbox-${project.id}`);
      const sandbox = await sandboxManager.createSandbox(project.id);
      redis.set(
        `sandbox-${project.id}`,
        JSON.stringify({ client: sandbox, sandboxId: sandbox.sandboxId }),
        "EX",
        60 * 60 * 1 // 1 hour expiration
      );
      const job = await prisma.job.create({
        data: {
          projectId: project.id,
          type: "RESTORE",
          status: "QUEUED",
        },
      });

      await builderQueue.add("builder-queue", {
        projectId: project.id,
        sandboxId: sandbox.sandboxId,
        jobType: "RESTORE",
        id: job.id,
      });
      return res.status(200).json({
        success: true,
        data: project,
        restoring: true,
      } as ApiResponse<typeof project>);
    }
    await client.setTimeout(10 * 60 * 1000); // Extend timeout by 10 minutes

    await prisma.project.update({
      where: { id: project.id },
      data: { lastSeenAt: new Date() },
    });
    res.status(200).json({
      success: true,
      message: "Sandbox extended",
      restoring: false,
    } as ApiResponse<null>);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error" } as ApiResponse<null>);
  }
};
