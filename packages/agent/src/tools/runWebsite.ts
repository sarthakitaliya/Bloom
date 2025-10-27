import { tool } from "langchain";
import { z } from "zod";
import { sandboxManager } from "../class/sandboxManager";

const RunWebsiteSchema = z.object({
  sandboxId: z
    .string()
    .describe("The ID of the sandbox to which the website will be run"),
});

export const runWebsite = tool(
  async (input) => {
    const { sandboxId } = RunWebsiteSchema.parse(input);
    const sandbox = await sandboxManager.getSandbox(sandboxId);
    try {
      await sandbox.commands.run(`npm run dev > /tmp/dev.log 2>&1`);
    } catch (error) {
      console.error("Error running website:", error);
      console.log(`website running on https://${sandbox.getHost(5173)}`);
      return `Failed to run website: ${error}`;
    }

    return `Website is running at: https://${sandbox.getHost(5173)}`;
  },
  {
    name: "runWebsite",
    description: "Runs the website in the development mode.",
    schema: RunWebsiteSchema,
  }
);
