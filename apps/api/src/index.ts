import { Sandbox } from "@e2b/code-interpreter";
import { agentInvoke } from "@bloom/agent";
import express from "express";
import { config } from "@bloom/config";

const app = express();

app.post("/prompt", async (req, res) => {
  // const { prompt } = req.body;
  const TEMPLATE_ID = "ziksdofsuxuq20ijo96k";
  const sandbox = await Sandbox.create(TEMPLATE_ID, {
    timeoutMs: 10 * 60 * 1000,
    apiKey: config.e2bApiKey,
  });
  console.log(sandbox.sandboxId);
  // //llm call
  const response = await agentInvoke("create college dashboard wesite", sandbox.sandboxId);
  console.log(response.messages);
  // const sx = await Sandbox.connect(sandbox.sandboxId);
  // sx.files.write("src/App.jsx", "console.log('Hello, World!');");
  res.json({
    sandboxId: sandbox.sandboxId,
    message: "Sandbox created successfully",
    url: `https://${sandbox.getHost(5173)}`,
    log: sandbox.commands.list(),
  });
});

app.listen(3000, () => {
  console.log(`API server is running at http://localhost:3000`);
});
