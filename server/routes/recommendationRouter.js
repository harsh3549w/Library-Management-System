import express from "express";
import { getBookRecommendations } from "../controllers/recommendationController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get book recommendations for authenticated users
router.get("/books", isAuthenticated, getBookRecommendations);

export default router;
