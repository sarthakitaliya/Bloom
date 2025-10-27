import { tool } from "langchain";
import { z } from "zod";
import { sandboxManager } from "../class/sandboxManager";

const UpdateFileSchema = z.object({
  filename: z.string().describe("The relative path of the file to update (do not start with /)"),
  content: z.string().describe("The new content to write into the file"),
  projectId: z
    .string()
    .describe("The ID of the project"),
});

export const updateFile = tool(
  async (input) => {
    const { filename, content, projectId } = UpdateFileSchema.parse(input);
    const sandbox = await sandboxManager.getSandbox(projectId);
    await sandbox.files.write(filename, content);
    console.log("file updated", filename);
    
    return `File "${filename}" updated with new content: ${content}`;
  },
  {
    name: "updateFile",
    description:
      "Updates an existing file with the given filename and new content.",
    schema: UpdateFileSchema,
  }
);
