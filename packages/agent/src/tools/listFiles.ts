import { tool } from "langchain";
import { z } from "zod";
import { sandboxManager } from "../class/sandboxManager";

const ListFilesSchema = z.object({
  projectId: z.string().describe("The ID of the project"),
});

export const listFiles = tool(
  async (input) => {
    const { projectId } = ListFilesSchema.parse(input);
    const sandbox = await sandboxManager.getSandbox(projectId);
    if (!sandbox) {
      throw new Error(`Sandbox not found for project ID: ${projectId}`);
    }
    const cmd = `find . -type f \
      -not -path "./node_modules/*" \
      -not -path "./.git/*" \
      -not -path "./dist/*" \
      -not -path "./build/*" \
      -not -name "*.png" \
      -not -name "*.jpg" \
      -not -name "*.jpeg" \
      -not -name "*.gif" \
      -not -name "*.svg" \
      -not -name "*.ico" \
      -not -name "*.env" \
      -not -name "*.env.*" \
      -print`;
    const files = await sandbox.commands
      .run(cmd)
      .then((res) => res.stdout.split("\n"));
    console.log("listed files", files);

    return {
      projectId,
      files,
    };
  },
  {
    name: "listFiles",
    description: "Lists all files in the specified sandbox.",
    schema: ListFilesSchema,
  }
);
