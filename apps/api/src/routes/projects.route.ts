import expres from "express";
import {
  createProject,
  createProjectWithAgent,
  getProjects,
} from "../controllers/projects.controller";

const router = expres.Router();

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:projectId/agent", createProjectWithAgent);

export default router;
