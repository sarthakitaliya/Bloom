import { agent, setStatusCallback } from "./agent";
import { connection } from "@bloom/queue";

export * from "./agent";
export * from "./class/sandboxManager";

export async function agentInvoke(prompt: string, projectId: string) {
  setStatusCallback((status) => {
    connection.publish(
      projectId,
      JSON.stringify({ msgType: "agentStatus", ...status })
    );
  });

  try {
    const response = await agent.invoke({
      messages: [
        {
          role: "user",
          content: `${prompt} here is project id: ${projectId}`,
        },
      ],
    }, { recursionLimit: 25, configurable: { thread_id: projectId } });
    return response;
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message.includes("Cannot read properties of undefined")) {
      const wrappedError = new Error(
        `Google Generative AI returned an invalid response. This may be due to: ` +
        `1) Content blocked by safety filters, ` +
        `2) API rate limit exceeded, ` +
        `3) API quota exhausted `
      );
      wrappedError.cause = error;
      throw wrappedError;
    }
    throw error;
  } finally {
    setStatusCallback(null);
  }
}
