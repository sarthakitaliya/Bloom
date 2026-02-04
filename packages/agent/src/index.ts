import {
  agent,
  resetToolRepeatTracker,
  setCurrentThreadId,
  setStatusCallback,
} from "./agent";
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
    setCurrentThreadId(projectId);
    resetToolRepeatTracker(projectId);
    const response = await agent.invoke(
      {
        messages: [
          {
            role: "user",
            content: `${prompt} here is project id: ${projectId}`,
          },
        ],
      },
      { recursionLimit: 60, configurable: { thread_id: projectId } }
    );
    return response;
  } catch (error: unknown) {
    if (
      error instanceof TypeError &&
      error.message.includes("Cannot read properties of undefined")
    ) {
      const wrappedError = new Error(
        `Model returned an invalid response. Please retry the request.`
      );
      wrappedError.cause = error;
      throw wrappedError;
    }
    throw error;
  } finally {
    resetToolRepeatTracker(projectId);
    setCurrentThreadId(null);
    setStatusCallback(null);
  }
}
