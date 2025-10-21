import { tool } from "langchain";
import { z } from "zod";
import { sandboxManager } from "../class/sandboxManager";

const ListFilesSchema = z.object({
  sandboxId: z
    .string()
    .describe("The ID of the sandbox whose files will be listed"),
});

export const listFiles = tool(
  async (input) => {
    const { sandboxId } = ListFilesSchema.parse(input);
    const sandbox = await sandboxManager.getSandbox(sandboxId);
    const files = await sandbox.files.list("/");
    console.log("listed files", files);

    return {
      sandboxId,
      files,
    };
  },
  {
    name: "listFiles",
    description: "Lists all files in the specified sandbox.",
    schema: ListFilesSchema,
  }
);
