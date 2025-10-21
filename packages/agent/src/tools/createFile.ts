import { tool } from "langchain";
import { z } from "zod";
import { sandboxManager } from "../class/sandboxManager";

const CreateFileSchema = z.object({
  sandboxId: z
    .string()
    .describe("The ID of the sandbox where the file will be created"),
  filename: z.string().describe("The name of the file to create"),
  content: z.string().describe("The content to write into the file"),
});

export const createFile = tool(
  async (input) => {
    const { sandboxId, filename, content } = CreateFileSchema.parse(input);
    const sandbox = await sandboxManager.getSandbox(sandboxId);

    await sandbox.files.write(filename, content);
    console.log("created file", filename);
    
    return `File "${filename}" created with content: ${content} and sandboxId: ${sandboxId}`;
  },
  {
    name: "createFile",
    description: "Creates a file with the given filename and content.",
    schema: CreateFileSchema,
  }
);
