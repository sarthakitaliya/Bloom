import express, { type Router } from "express";
import { createConversation, getConversations } from "../controllers/conversations.controller";

const router:Router = express.Router();

router.get("/:projectId", getConversations);
router.post("/", createConversation);

export default router;
