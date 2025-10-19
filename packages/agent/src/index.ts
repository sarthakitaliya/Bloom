import { agent } from "./agent";

export async function agentInvoke(prompt: string, sandboxId: string) {
  const response = await agent.invoke({
    messages: [
      {
        role: "user",
        content: `${prompt} here is sandbox id: ${sandboxId}`,
      },
    ],
  }, {recursionLimit: 25});
  return response;
}
