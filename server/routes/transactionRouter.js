import express from "express";
import {
  getAllTransactions,
  getUserTransactions,
  recordTransaction,
  getTransactionStats
} from "../controllers/transactionController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes
router.get("/all", isAuthenticated, isAuthorized("Admin"), getAllTransactions);
router.post("/record", isAuthenticated, isAuthorized("Admin"), recordTransaction);
router.get("/stats", isAuthenticated, isAuthorized("Admin"), getTransactionStats);

// User routes
router.get("/my-transactions", isAuthenticated, getUserTransactions);

export default router;

