import { createAgent, createMiddleware, ToolMessage } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { systemPrompt, systemPromptForTitleAgent } from "./prompt/systemPrompt";
import {
  createFile,
  addDependency,
  removeDependency,
  updateFile,
  listFiles,
  readFile,
  planner,
} from "./tools";
import { config } from "@bloom/config";
import { MemorySaver } from "@langchain/langgraph";
import { getLogs } from "./tools/getLogs";
import { removeFile } from "./tools/removeFile";

export type StatusCallback = (status: {
  type: "tool_start" | "tool_end";
  toolName: string;
  args?: Record<string, any>;
}) => void;

let statusCallback: StatusCallback | null = null;

export function setStatusCallback(cb: StatusCallback | null) {
  statusCallback = cb;
}

export const model = new ChatGoogleGenerativeAI({
  apiKey: config.googleGenAiApiKey,
  model: "gemini-2.5-flash-lite",
  temperature: 0.2,
});

const checkpointer = new MemorySaver();

const handleToolErrors = createMiddleware({
  name: "HandleToolErrors",
  wrapToolCall: async (request, handler) => {
    if (statusCallback) {
      statusCallback({
        type: "tool_start",
        toolName: request.toolCall.name,
        args: request.toolCall.args as Record<string, any>,
      });
    }

    try {
      const result = await handler(request);

      if (statusCallback) {
        statusCallback({
          type: "tool_end",
          toolName: request.toolCall.name,
        });
      }

      return result;
    } catch (error) {
      // Emit tool_end even on error
      if (statusCallback) {
        statusCallback({
          type: "tool_end",
          toolName: request.toolCall.name,
        });
      }

      return new ToolMessage({
        content: `Tool error: Please check your input and try again. (${error})`,
        tool_call_id: request.toolCall.id!,
      });
    }
  },
});

export const agent = createAgent({
  model,
  tools: [
    listFiles,
    readFile,
    createFile,
    removeFile,
    updateFile,
    addDependency,
    removeDependency,
    getLogs,
  ],
  checkpointer,
  middleware: [handleToolErrors],
  systemPrompt: systemPrompt,
});

export const titleAgent = createAgent({
  model,
  systemPrompt: systemPromptForTitleAgent,
});

