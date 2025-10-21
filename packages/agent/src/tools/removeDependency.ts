import { tool } from "langchain";
import { z } from "zod";
import { sandboxManager } from "../class/sandboxManager";

const RemoveDependencySchema = z.object({
  sandboxId: z
    .string()
    .describe("The ID of the sandbox to which the dependency will be removed"),
  packageName: z.string().describe("The name of the package to remove"),
});

export const removeDependency = tool(
  async (input) => {
    const { sandboxId, packageName } = RemoveDependencySchema.parse(input);
    const sandbox = await sandboxManager.getSandbox(sandboxId);
    await sandbox.commands.run(`npm uninstall ${packageName}`);
    console.log("removed dependency", packageName);

    return `Dependency "${packageName}" removed from the project. and sandboxId: ${sandboxId}`;
  },
  {
    name: "removeDependency",
    description:
      "Removes a dependency from the project with the given package name.",
    schema: RemoveDependencySchema,
  }
);
