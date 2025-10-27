import express from "express";
import {
  getProjectById,
  getProjects,
  initProject,
} from "../controllers/projects.controller";

const router = express.Router();

router.get("/", getProjects);
router.post("/", initProject);
router.get("/:projectId", getProjectById);
router.post("/:projectId/extend-sandbox", getProjectById);

export default router;
