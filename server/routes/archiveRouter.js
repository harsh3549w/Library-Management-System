import express from "express";
import {
  uploadArchive,
  getAllArchives,
  getArchiveById,
  downloadArchive,
  deleteArchive,
  searchArchives,
  getArchiveStats
} from "../controllers/archiveController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public/User routes
router.get("/all", isAuthenticated, getAllArchives);
router.get("/search", isAuthenticated, searchArchives);
router.get("/:id", isAuthenticated, getArchiveById);
router.post("/download/:id", isAuthenticated, downloadArchive);

// Admin routes
router.post("/upload", isAuthenticated, isAuthorized("Admin"), uploadArchive);
router.delete("/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteArchive);
router.get("/stats/overview", isAuthenticated, isAuthorized("Admin"), getArchiveStats);

export default router;

