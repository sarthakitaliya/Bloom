import express from "express";
import cors from "cors";
import { authMiddleware } from "./middleware/auth.middleware";
import projectsRouter from "./routes/projects.route";
import conversationsRouter from "./routes/conversations.route";
import Sandbox from "@e2b/code-interpreter";
import { config } from "@bloom/config";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: config.allowedOrigin,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/health", (req, res) => {
  res.send("API is healthy");
});

app.use("/api/projects", authMiddleware, projectsRouter);
app.use("/api/conversations", authMiddleware, conversationsRouter);

app.listen(4040, () => {
  console.log("API server running on http://localhost:4040");
});
