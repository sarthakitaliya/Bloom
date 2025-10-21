import { tool } from "langchain";
import { z } from "zod";
import { sandboxManager } from "../class/sandboxManager";

const ReadFileSchema = z.object({
  filename: z.string().describe("The name of the file to read"),
  sandboxId: z
    .string()
    .describe("The ID of the sandbox where the file is located"),
});

export const readFile = tool(
  async (input) => {
    const { filename, sandboxId } = ReadFileSchema.parse(input);
    const sandbox = await sandboxManager.getSandbox(sandboxId);
    const exists = await sandbox.files.exists(filename);
    if (!exists) {
      return `File "${filename}" does not exist in sandboxId: ${sandboxId}`;
    }
    const content = await sandbox.files.read(filename);
    console.log("file read", filename, content);

    return {
        filename,
        content,
        sandboxId,
    };
  },
  {
    name: "readFile",
    description: "Reads the content of a file with the given filename.",
    schema: ReadFileSchema,
  }
);
