import express from "express";
import { createConversation, getConversations } from "../controllers/conversations.controller";

const router = express.Router();

router.get("/:projectId", getConversations);
router.post("/", createConversation);

export default router;
