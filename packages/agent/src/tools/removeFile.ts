import { tool } from "langchain";
import { z } from "zod";
import { sandboxManager } from "../class/sandboxManager";

const RemoveFileSchema = z.object({
  projectId: z
    .string()
    .describe("The ID of the project"),
  filename: z.string().describe("The name of the file to remove"),
});

export const removeFile = tool(
  async (input) => {
    const { projectId, filename } = RemoveFileSchema.parse(input);
    const sandbox = await sandboxManager.getSandbox(projectId);
    if (!sandbox) {
      throw new Error(`Sandbox not found for project ID: ${projectId}`);
    }
    await sandbox.files.remove(filename);
    console.log("removed file", filename);

    return {
      success: true,
      removed: "removeFile",
      filename,
    }
  },
  {
    name: "removeFile",
    description: "Removes a file with the given filename.",
    schema: RemoveFileSchema,
  }
);
