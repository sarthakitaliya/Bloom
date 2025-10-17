import { tool } from "langchain";
import { z } from "zod";

export const createFile = tool(
  ({ filename, content }) => {
    // Simulate file creation (replace with actual file system logic)
    return `File "${filename}" created with content: ${content}`;
  },
  {
    name: "createFile",
    description: "Creates a file with the given filename and content.",
    schema: z.object({
      filename: z.string().describe("The name of the file to create"),
      content: z.string().describe("The content to write into the file"),
    }),
  }
);