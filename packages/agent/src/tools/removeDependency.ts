import { tool } from "langchain";
import { z } from "zod";
import { sandboxManager } from "../class/sandboxManager";

const RemoveDependencySchema = z.object({
  projectId: z
    .string()
    .describe("The ID of the project"),
  packageName: z.string().describe("The name of the package to remove"),
});

export const removeDependency = tool(
  async (input) => {
    const { projectId, packageName } = RemoveDependencySchema.parse(input);
    const sandbox = await sandboxManager.getSandbox(projectId);
    if (!sandbox) {
      throw new Error(`Sandbox not found for project ID: ${projectId}`);
    }
    await sandbox.commands.run(`npm uninstall ${packageName}`, { timeoutMs: 1 * 60 * 1000 }); // 1 minutes timeout
    console.log("removed dependency", packageName);

    return {
      success: true,
      action: "removeDependency",
      packageName,
    }
  },
  {
    name: "removeDependency",
    description:
      "Removes a dependency from the project with the given package name.",
    schema: RemoveDependencySchema,
  }
);
