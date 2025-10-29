import express from "express";
import {
  getFileContent,
  getFilesTree,
  getProjectById,
  getProjects,
  initProject,
} from "../controllers/projects.controller";

const router = express.Router();

router.get("/", getProjects);
router.post("/", initProject);
router.get("/:projectId", getProjectById);
router.get("/:projectId/files", getFilesTree);
router.get("/:projectId/files/:filepath", getFileContent);
router.post("/:projectId/extend-sandbox", getProjectById);

export default router;
