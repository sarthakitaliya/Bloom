import { tool } from "langchain";
import { z } from "zod";

export const updateFile = tool(
    ({ filename, content }) => {
        // Simulate file update (replace with actual file system logic)
        return `File "${filename}" updated with new content: ${content}`;
    },
    {
        name: "updateFile",
        description: "Updates an existing file with the given filename and new content.",
        schema: z.object({
            filename: z.string().describe("The name of the file to update"),
            content: z.string().describe("The new content to write into the file"),
        }),
    }
);