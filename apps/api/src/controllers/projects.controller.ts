import { prisma } from "@bloom/db";
import type { Request, Response } from "express";
import type { ApiResponse } from "../types/ApiResponse";
import { agentInvoke, titleAgent } from "@bloom/agent";
import { sandboxManager } from "@bloom/agent";

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

export const createProject = async (req: Request, res: Response) => {
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
    res.status(201).json({
      success: true,
      data: newProject,
    } as ApiResponse<typeof newProject>);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error" } as ApiResponse<null>);
  }
};

export const createProjectWithAgent = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      } as ApiResponse<null>);
    }
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      } as ApiResponse<null>);
    }
    const prompt = await prisma.chatHistory.findFirst({
      where: {
        projectId: project.id,
        from: "USER",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: "No user prompt found",
      } as ApiResponse<null>);
    }

    const sandbox = await sandboxManager.createSandbox();
    const agentResponse = await agentInvoke(prompt.content!, sandbox.sandboxId);

    res.status(201).json({
      success: true,
      data: {
        sandboxId: sandbox.sandboxId,
        agentMessages: agentResponse.messages,
        previewUrl: `https://${sandbox.getHost(5173)}`,
      },
    } as ApiResponse<{
      sandboxId: string;
      agentMessages: typeof agentResponse.messages;
    }>);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error" } as ApiResponse<null>);
  }
};
