import { tool } from "langchain";
import { z } from "zod";

export const generateComponent = tool(
    ({ name, content }) => {
        console.log("Generating $$ component:", name, content);
        // Simulate component generation (replace with actual logic)
        return `Generated component "${name}":\n${content}`;
    },
    {
        name: "generateComponent",
        description: "Generates a new React component with the given name and content.",
        schema: z.object({
            name: z.string().describe("The name of the component to generate."),
            content: z.string().describe("The content of the component."),
        }),
    }
);

