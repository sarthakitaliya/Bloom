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
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/projects", authMiddleware, projectsRouter);
app.use("/api/conversations", authMiddleware, conversationsRouter);

app.listen(3030, () => {
  console.log("API server running on http://localhost:3030");
});