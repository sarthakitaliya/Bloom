import { tool } from "langchain";
import { z } from "zod";
import { Sandbox } from "@e2b/code-interpreter";

const AddDependencySchema = z.object({
  sandboxId: z
    .string()
    .describe("The ID of the sandbox to which the dependency will be added"),
  packageName: z.string().describe("The name of the package to add"),
  version: z.string().describe("The version of the package to add"),
});

export const addDependency = tool(
  async (input) => {
    const { sandboxId, packageName, version } =
      AddDependencySchema.parse(input);
    // Simulate adding a dependency (replace with actual package management logic)
    const sandbox = await Sandbox.connect(sandboxId);
    await sandbox.commands.run(`npm install ${packageName}@${version}`);

    return `Dependency "${packageName}@${version}" added to the project. and sandboxId: ${sandboxId}`;
  },
  {
    name: "addDependency",
    description:
      "Adds a dependency to the project with the given package name and version.",
    schema: AddDependencySchema,
  }
);
