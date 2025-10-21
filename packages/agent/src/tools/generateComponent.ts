import { tool } from "langchain";
import { z } from "zod";
import { sandboxManager } from "../class/sandboxManager";

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

    const sandbox = await sandboxManager.getSandbox(sandboxId);
    await sandbox.files.write(`src/components/${name}.jsx`, content);
    console.log("generated component", name);
    
    return `Generated component "${name}":\n${content}`;
  },
  {
    name: "generateComponent",
    description:
      "Generates a new React component with the given name and content.",
    schema: GenerateComponentSchema,
  }
);
