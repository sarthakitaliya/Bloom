import { tool } from "langchain";
import { z } from "zod";
import { Sandbox } from "@e2b/code-interpreter";

const RunWebsiteSchema = z.object({
  sandboxId: z
    .string()
    .describe("The ID of the sandbox to which the website will be run"),
});

export const runWebsite = tool(
  async (input) => {
    const { sandboxId } = RunWebsiteSchema.parse(input);
    const sandbox = await Sandbox.connect(sandboxId);
    await sandbox.commands.run(`npm run dev`);
    console.log("website running");

    return `Website is running at: ${sandbox.getHost(5173)}`;
  },
  {
    name: "runWebsite",
    description: "Runs the website in the development mode.",
    schema: RunWebsiteSchema,
  }
);
