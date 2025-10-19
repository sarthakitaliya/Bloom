import { createAgent, createMiddleware, ToolMessage } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";
import { systemPrompt } from "./prompt/systemPrompt";
import { createFile } from "./tools/createFile";
import { addDependency } from "./tools/addDependency";
import { webSearch } from "./tools/webSearch";
import { updateFile } from "./tools/updateFile";
import { generateComponent } from "./tools/generateComponent";
import {config} from "@bloom/config";
import { z } from "zod";
import { removeDependency } from "./tools/removeDependency";
import { runWebsite } from "./tools/runWebsite";

dotenv.config({ path: "../../.env" });

const model = new ChatGoogleGenerativeAI({
  apiKey: config.googleGenAiApiKey,
  model: "gemini-2.5-pro",
  temperature: 0,
});

const handleToolErrors = createMiddleware({
  name: "HandleToolErrors",
  wrapToolCall: (request, handler) => {
    try {
      return handler(request.toolCall);
    } catch (error) {
      // Return a custom error message to the model
      return new ToolMessage({
        content: `Tool error: Please check your input and try again. (${error})`,
        tool_call_id: request.toolCall.id!,
      });
    }
  },
});

export const agent = createAgent({
  model,
  tools: [createFile, generateComponent, addDependency, removeDependency, runWebsite],
  systemPrompt: systemPrompt,
});
