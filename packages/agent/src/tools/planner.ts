import { tool } from "langchain";
import { success, z } from "zod";
import { model } from "../agent";

const PlannerInput = z.object({
  projectId: z.string().describe("The ID of the project"),
  userInstruction: z.string().describe("The user's instruction"),
});

export const planner = tool(
  async (input) => {
    const { projectId, userInstruction } = PlannerInput.parse(input);
    const prompt = `
You are a planner. Given a user instruction and a compact project snapshot, produce an ordered JSON array of actions to perform.
Allowed actions: listFiles, readFile, createFile, updateFile, removeFile, addDependency, removeDependency, getLogs.

Rules:
- Filenames must be relative and include projectId in every occurrence.
- you must have to create on react + typescript component inside src/components for every new component.
- For addDependency and removeDependency, specify the package name only.
- Use getLogs only when you need to debug issues in the sandbox.
- Each action must have an actionName and actionInput.
- actionInput must be a JSON object with necessary parameters for the action.
- Use previous actions' results as needed by referencing them.
- Return ONLY valid JSON (an array). No extra text.

User instruction:
${userInstruction}

Return JSON now.
`.trim();
    try {
      const res = await model.invoke([{ role: "user", content: prompt }]);
      console.log(res);

      console.log(res.content);
      console.log(res.text);
      const plan = JSON.parse(res.text);
      return {
        success: true,
        plan,
        projectId,
        userInstruction,
      };
    } catch (error) {
      return {
        success: false,
        error: "Planner returned non-JSON",
        raw: String(error),
      };
    }
  },
  {
    name: "planner",
    description:
      "Generate an ordered list of actions (JSON array) to satisfy a user instruction. Input: {projectId, userInstruction, snapshot}.",
    schema: PlannerInput,
  }
);
