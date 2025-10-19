import { tool } from "langchain";
import { z } from "zod";
import { Sandbox } from "@e2b/code-interpreter";

const GenerateComponentSchema = z.object({
  name: z.string().describe("The name of the component to generate."),
  content: z.string().describe("The content of the component."),
  sandboxId: z
    .string()
    .describe("The ID of the sandbox to which the component will be added."),
});

export const generateComponent = tool(
  async (input) => {
    const { name, content, sandboxId } = GenerateComponentSchema.parse(input);
    // Simulate component generation (replace with actual logic)
    const sandbox = await Sandbox.connect(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox with ID ${sandboxId} not found.`);
    }
    await sandbox.files.write(`src/components/${name}.jsx`, content);
    return `Generated component "${name}":\n${content}`;
  },
  {
    name: "generateComponent",
    description:
      "Generates a new React component with the given name and content.",
    schema: GenerateComponentSchema,
  }
);
