import { tool } from "langchain";
import { z } from "zod";

export const addDependency = tool(
  ({ packageName, version }) => {
    // Simulate adding a dependency (replace with actual package management logic)
    return `Dependency "${packageName}@${version}" added to the project.`;
  },
  {
    name: "addDependency",
    description: "Adds a dependency to the project with the given package name and version.",
    schema: z.object({
      packageName: z.string().describe("The name of the package to add"),
      version: z.string().describe("The version of the package to add"),
    }),
  }
);