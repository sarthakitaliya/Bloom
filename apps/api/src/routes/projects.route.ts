import express, { type Router } from "express";
import {
  deleteProjectById,
  extendSandbox,
  getFileContent,
  getFilesTree,
  getProjectById,
  getProjects,
  initProject,
} from "../controllers/projects.controller";

const router:Router = express.Router();

router.get("/", getProjects);
router.post("/", initProject);
router.get("/:projectId", getProjectById);
router.delete("/:projectId", deleteProjectById);
router.get("/:projectId/files", getFilesTree);
router.get("/:projectId/files/:filepath", getFileContent);
router.post("/:projectId/extend-sandbox", extendSandbox);

export default router;
