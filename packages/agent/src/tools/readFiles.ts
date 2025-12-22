import { tool } from "langchain";
import { z } from "zod";
import { sandboxManager } from "../class/sandboxManager";

const ReadFileSchema = z.object({
  filename: z
    .string()
    .describe("The relative path of the file to read (do not start with /)"),
  projectId: z.string().describe("The ID of the project"),
});

export const readFile = tool(
  async (input) => {
    const { filename, projectId } = ReadFileSchema.parse(input);
    const normalizedPath = filename.replace(/^\/+/, "");

    const sandbox = await sandboxManager.getSandbox(projectId);
    if (!sandbox) {
      throw new Error(`Sandbox not found for project ID: ${projectId}`);
    }
    const exists = await sandbox.files.exists(normalizedPath);
    if (!exists) {
      return `File "${normalizedPath}" does not exist in projectId: ${projectId}`;
    }
    const content = await sandbox.files.read(normalizedPath);
    console.log("file read", normalizedPath, content);

    return {
      success: true,
      filename,
      content,
      projectId,
    };
  },
  {
    name: "readFile",
    description: "Reads a text file from the sandbox. The path must be relative to the project root (no leading /).",
    schema: ReadFileSchema,
  }
);
