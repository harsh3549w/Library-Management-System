import express from "express";
import { 
    verifyOTP, 
    login, 
    logout, 
    getUser,
    forgotPassword,
    resetPassword,
    verifyOTPAndChangePassword,
    updateUserInfo
} from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { authLimiter, strictAuthLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Auth routes with specific rate limiters
router.post("/verify-otp", authLimiter, verifyOTP); // 10 attempts per 15 min
router.post("/login", authLimiter, login); // 10 attempts per 15 min
router.get("/logout", isAuthenticated, logout); // No rate limit for logout
router.get("/me", isAuthenticated, getUser); // No rate limit for getting user info
router.put("/update-info", isAuthenticated, updateUserInfo); // Protected by general limiter

// Strict rate limiting for password operations (5 attempts per hour)
router.post("/password/forgot", strictAuthLimiter, forgotPassword);
router.put("/password/reset", strictAuthLimiter, resetPassword);
router.post("/verify-otp-change-password", strictAuthLimiter, verifyOTPAndChangePassword);

export default router;
