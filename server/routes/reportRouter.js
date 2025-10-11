import express from "express";
import {
  getLibraryStats,
  getBorrowingReport,
  getPopularBooksReport,
  getUserActivityReport,
  getFinancialReport,
  getOverdueReport,
  getCategoryReport
} from "../controllers/reportController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All report routes are admin-only
router.get("/library-stats", isAuthenticated, isAuthorized("Admin"), getLibraryStats);
router.get("/borrowing", isAuthenticated, isAuthorized("Admin"), getBorrowingReport);
router.get("/popular-books", isAuthenticated, isAuthorized("Admin"), getPopularBooksReport);
router.get("/user-activity", isAuthenticated, isAuthorized("Admin"), getUserActivityReport);
router.get("/financial", isAuthenticated, isAuthorized("Admin"), getFinancialReport);
router.get("/overdue", isAuthenticated, isAuthorized("Admin"), getOverdueReport);
router.get("/category", isAuthenticated, isAuthorized("Admin"), getCategoryReport);

export default router;

