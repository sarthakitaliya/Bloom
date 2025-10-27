import { tool } from "langchain";
import { success, z } from "zod";
import { model } from "../agent";

const PlannerInput = z.object({
  projectId: z.string().describe("The ID of the project"),
  userInstruction: z.string().describe("The user's instruction"),
});


export const planner = tool(
  async (input) => {
    const {
      projectId,
      userInstruction,
    } = PlannerInput.parse(input);
    const prompt = `
You are a planner. Given a user instruction and a compact project snapshot, produce an ordered JSON array of actions to perform.
Allowed actions: listFiles, readFile, createFile, updateFile, generateComponent, addDependency, removeDependency, runWebsite.

Rules:
- Filenames must be relative and include projectId only inside actionInput.
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
      };
    } catch (error) {
      return {
        success: false,
        error: "Planner returned non-JSON",
        raw: String(error),
      }
    }
  },
  {
    name: "planner",
    description:
      "Generate an ordered list of actions (JSON array) to satisfy a user instruction. Input: {projectId, userInstruction, snapshot}.",
    schema: PlannerInput,
  }
);
