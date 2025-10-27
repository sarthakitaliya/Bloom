import { tool } from "langchain";
import { z } from "zod";
import { sandboxManager } from "../class/sandboxManager";

const AddDependencySchema = z.object({
  projectId: z
    .string()
    .describe("The ID of the project"),
  packageName: z.string().describe("The name of the package to add"),
  version: z.string().describe("The version of the package to add"),
});

export const addDependency = tool(
  async (input) => {
    const { projectId, packageName, version } =
      AddDependencySchema.parse(input);
    const sandbox = await sandboxManager.getSandbox(projectId);
    await sandbox.commands.run(`npm install ${packageName}@${version}`);
    console.log("added dependency", packageName);

    return `Dependency "${packageName}@${version}" added to the project. and sandboxId: ${sandbox.sandboxId}`;
  },
  {
    name: "addDependency",
    description:
      "Adds a dependency to the project with the given package name and version.",
    schema: AddDependencySchema,
  }
);
