import express from "express";
import {
  createProject,
  createVIdeo,
  deleteProject,
  getAllPublishedProjects,
} from "../controllers/projectController.js";
import { protect } from "../middlewares/auth.js";
import upload from "../configs/multer.js";

const projectRouter = express.Router();

projectRouter.post("/create", upload.array("images", 2), protect, createProject);
projectRouter.post("/video", protect, createVIdeo);
projectRouter.get("/published", getAllPublishedProjects);
projectRouter.post("/:projectId", protect, deleteProject);

export default projectRouter;
