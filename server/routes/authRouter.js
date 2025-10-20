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

const router = express.Router();
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.put("/update-info", isAuthenticated, updateUserInfo);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset", resetPassword);
router.post("/verify-otp-change-password", verifyOTPAndChangePassword);

export default router;
