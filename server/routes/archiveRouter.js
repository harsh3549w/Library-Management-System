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


// Admin routes - MUST come before /:id route
router.get("/stats/overview", isAuthenticated, isAuthorized("Admin"), getArchiveStats);
router.post("/upload", isAuthenticated, isAuthorized("Admin"), uploadArchive);
router.delete("/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteArchive);

// Public/User routes
router.get("/all", isAuthenticated, getAllArchives);
router.get("/search", isAuthenticated, searchArchives);
router.post("/download/:id", isAuthenticated, downloadArchive);
router.get("/:id", isAuthenticated, getArchiveById); // MUST be last

export default router;

