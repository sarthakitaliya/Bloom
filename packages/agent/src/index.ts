import { agent } from "./agent";

export * from "./agent";
export * from "./class/sandboxManager";

export async function agentInvoke(prompt: string, projectId: string) {
  const response = await agent.invoke({
    messages: [
      {
        role: "user",
        content: `${prompt} here is project id: ${projectId}`,
      },
    ],
  }, {recursionLimit: 25, configurable: {thread_id: projectId}});
  return response;
}
