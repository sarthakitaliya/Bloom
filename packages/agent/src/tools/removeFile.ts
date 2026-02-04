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
    const logResult = await sandbox.commands.run("tail -n 120 /tmp/dev.log");
    const logs =
      logResult.exitCode === 0 ? logResult.stdout : logResult.stderr;
    const logErrorsDetected =
      typeof logs === "string" &&
      /(error:|failed to compile|syntaxerror|cannot find module|typeerror|referenceerror)/i.test(
        logs
      );

    return {
      success: true,
      removed: "removeFile",
      filename,
      logs,
      logErrorsDetected,
    }
  },
  {
    name: "removeFile",
    description: "Removes a file with the given filename.",
    schema: RemoveFileSchema,
  }
);
