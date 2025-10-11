import express from "express";
import {
  createSuggestion,
  getAllSuggestions,
  getMySuggestions,
  voteForSuggestion,
  approveSuggestion,
  rejectSuggestion,
  deleteSuggestion,
  getVotingStats
} from "../controllers/suggestionController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User routes
router.post("/create", isAuthenticated, createSuggestion);
router.get("/all", isAuthenticated, getAllSuggestions);
router.get("/my-suggestions", isAuthenticated, getMySuggestions);
router.post("/vote/:id", isAuthenticated, voteForSuggestion);

// Admin routes
router.post("/approve/:id", isAuthenticated, isAuthorized("Admin"), approveSuggestion);
router.post("/reject/:id", isAuthenticated, isAuthorized("Admin"), rejectSuggestion);
router.delete("/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteSuggestion);
router.get("/stats", isAuthenticated, isAuthorized("Admin"), getVotingStats);

export default router;

