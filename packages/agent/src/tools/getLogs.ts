import { tool } from "langchain";
import { z } from "zod";
import { sandboxManager } from "../class/sandboxManager";

const GetLogsSchema = z.object({
  sandboxId: z.string().describe("The ID of the sandbox to read logs from"),
  lines: z.number().optional().describe("Number of log lines to show (default 100)"),
  path: z.string().optional().describe("Path to log file inside sandbox (default /tmp/dev.log)"),
});

export const getLogs = tool(
  async (input) => {
    const { sandboxId, lines = 100, path = "/tmp/dev.log" } = GetLogsSchema.parse(input);

    const sandbox = await sandboxManager.getSandbox(sandboxId);

    try {
      const result = await sandbox.commands.run(`tail -n ${lines} ${path}`);
      if (result.exitCode !== 0) {
        return `Failed to read logs. stderr: ${result.stderr}`;
      }
      return result.stdout || "No logs found.";
    } catch (error) {
      console.error("Error reading logs:", error);
      return `Error fetching logs: ${error}`;
    }
  },
  {
    name: "getLogs",
    description: "Fetches the latest lines from the sandbox log file (e.g., /tmp/dev.log).",
    schema: GetLogsSchema,
  }
);