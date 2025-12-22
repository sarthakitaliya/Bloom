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

export const model = new ChatGoogleGenerativeAI({
  apiKey: config.googleGenAiApiKey,
  model: "gemini-2.5-flash-lite",
  temperature: 0.2,
});

const checkpointer = new MemorySaver();

const handleToolErrors = createMiddleware({
  name: "HandleToolErrors",
  wrapToolCall: (request, handler) => {
    try {
      return handler(request);
    } catch (error) {
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
