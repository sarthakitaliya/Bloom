import { tool } from "langchain";
import { z } from "zod";
import { Sandbox } from "@e2b/code-interpreter";

const UpdateFileSchema = z.object({
  filename: z.string().describe("The name of the file to update"),
  content: z.string().describe("The new content to write into the file"),
  sandboxId: z
    .string()
    .describe("The ID of the sandbox where the file will be updated"),
});

export const updateFile = tool(
  async (input) => {
    const { filename, content, sandboxId } = UpdateFileSchema.parse(input);
    const sandbox = await Sandbox.connect(sandboxId);
    await sandbox.files.write(filename, content);
    return `File "${filename}" updated with new content: ${content}`;
  },
  {
    name: "updateFile",
    description:
      "Updates an existing file with the given filename and new content.",
    schema: UpdateFileSchema,
  }
);
