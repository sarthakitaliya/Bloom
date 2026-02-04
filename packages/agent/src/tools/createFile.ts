import { tool } from "langchain";
import { z } from "zod";
import { sandboxManager } from "../class/sandboxManager";

const CreateFileSchema = z.object({
  projectId: z
    .string()
    .describe("The ID of the project"),
  filename: z.string().describe("The name of the file to create"),
  content: z.string().describe("The content to write into the file"),
});

export const createFile = tool(
  async (input) => {
    const { projectId, filename, content } = CreateFileSchema.parse(input);
    const sandbox = await sandboxManager.getSandbox(projectId);
    if (!sandbox) {
      throw new Error(`Sandbox not found for project ID: ${projectId}`);
    }
    await sandbox.files.write(filename, content);
    console.log("created file", filename);
    const logResult = await sandbox.commands.run("tail -n 120 /tmp/dev.log");
    const logs =
      logResult.exitCode === 0 ? logResult.stdout : logResult.stderr;
    const logErrorsDetected =
      typeof logs === "string" &&
      /(error:|failed to compile|syntaxerror|cannot find module|typeerror|referenceerror)/i.test(
        logs
      );

      console.log("detected", logErrorsDetected)
      console.log(logs)

    return {
      created: true,
      action: "createFile",
      filename,
      logs,
      logErrorsDetected,
    }
  },
  {
    name: "createFile",
    description: "Creates a file with the given filename and content.",
    schema: CreateFileSchema,
  }
);
