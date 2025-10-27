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
  runWebsite,
  planner,
} from "./tools";
import { generateComponent } from "./tools/generateComponent";
import { config } from "@bloom/config";
import { MemorySaver } from "@langchain/langgraph";
import { getLogs } from "./tools/getLogs";

export const model = new ChatGoogleGenerativeAI({
  apiKey: config.googleGenAiApiKey,
  model: "gemini-2.5-flash-lite",
  temperature: 0,
});

const checkpointer = new MemorySaver();

const handleToolErrors = createMiddleware({
  name: "HandleToolErrors",
  wrapToolCall: (request, handler) => {
    try {
      return handler(request.toolCall);
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
    generateComponent,
    updateFile,
    addDependency,
    removeDependency,
    runWebsite,
    getLogs,
    planner
  ],
  checkpointer,
  middleware: [handleToolErrors],
  systemPrompt: systemPrompt,
});

export const titleAgent = createAgent({
  model,
  systemPrompt: systemPromptForTitleAgent,
});
