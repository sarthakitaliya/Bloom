import { tool } from "langchain";
import { z } from "zod";
import { sandboxManager } from "../class/sandboxManager";

const GetLogsSchema = z.object({
  projectId: z.string().describe("The ID of the project"),
  lines: z
    .number()
    .optional()
    .describe("Number of log lines to show (default 100)"),
  path: z
    .string()
    .optional()
    .describe("Path to log file inside sandbox (default /tmp/dev.log)"),
});

export const getLogs = tool(
  async (input) => {
    const {
      projectId,
      lines = 100,
      path = "/tmp/dev.log",
    } = GetLogsSchema.parse(input);

    const sandbox = await sandboxManager.getSandbox(projectId);
    if (!sandbox) {
      throw new Error(`Sandbox not found for project ID: ${projectId}`);
    }
    try {
      console.log("getting logs...");
  
      const result = await sandbox.commands.run(`tail -n ${lines} ${path}`);
      console.log(result);
      
      if (result.exitCode !== 0) {
        return `Failed to read logs. stderr: ${result.stderr}`;
      }
      return{
        success: true,
        logs: result.stdout,
      }
    } catch (error) {
      console.error("Error reading logs:", error);
      return {
        success: false,
        error: `Error fetching logs: ${error}`,
      };
    }
  },
  {
    name: "getLogs",
    description:
      "Fetches the latest lines from the sandbox log file (e.g., /tmp/dev.log).",
    schema: GetLogsSchema,
  }
);
