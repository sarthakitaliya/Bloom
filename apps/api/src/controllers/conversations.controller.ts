import { prisma } from "@bloom/db";
import type { Request, Response } from "express";
import type { ApiResponse } from "../types/ApiResponse";
import { builderQueue, connection as redis } from "@bloom/queue";
import Sandbox from "@e2b/code-interpreter";
import { sandboxManager } from "@bloom/agent";

export const getConversations = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  try {
    const conversations = await prisma.chatHistory.findMany({
      where: {
        projectId: projectId,
      },
    });
    res
      .status(200)
      .json({ success: true, data: conversations } as ApiResponse<
        typeof conversations
      >);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error" } as ApiResponse<null>);
  }
};

export const createConversation = async (req: Request, res: Response) => {
  try {
    const { projectId, prompt } = req.body;
    const newConversation = await prisma.chatHistory.create({
      data: {
        projectId: projectId,
        content: prompt,
        from: "USER",
      },
    });

    const client = await sandboxManager.getSandbox(projectId);
    const job = await prisma.job.create({
      data: {
        projectId: projectId,
        type: "BUILDING",
        status: "QUEUED",
      },
    });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Sandbox client not found you may need to refresh the page",
      } as ApiResponse<null>);
    }

    await builderQueue.add("builder-queue", {
      projectId,
      prompt,
      sandboxId: client.sandboxId,
      jobType: "UPDATE",
      id: job.id,
    });
    res
      .status(201)
      .json({ success: true, data: newConversation } as ApiResponse<
        typeof newConversation
      >);
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ success: false, message: "Server Error" } as ApiResponse<null>);
  }
};
