import express from "express";
import cors from "cors";
import { authMiddleware } from "./middleware/auth.middleware";
import projectsRouter from "./routes/projects.route";
import conversationsRouter from "./routes/conversations.route";
import axios from "axios";
import Sandbox from "@e2b/code-interpreter";

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
