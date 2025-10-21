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
    await sandbox.commands.run(`npm run dev`);
    console.log(`website running on https://${sandbox.getHost(5173)}`);

    return `Website is running at: https://${sandbox.getHost(5173)}`;
  },
  {
    name: "runWebsite",
    description: "Runs the website in the development mode.",
    schema: RunWebsiteSchema,
  }
);
