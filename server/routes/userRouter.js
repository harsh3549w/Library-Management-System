import express from "express";
import {
  getAllUsers,
  registerNewAdmin,
  registerNewUser
} from "../controllers/userController.js";
import {
  isAuthenticated,
  isAuthorized
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes
router.get("/all", isAuthenticated, isAuthorized("Admin"), getAllUsers);
router.post("/add/new-admin", isAuthenticated, isAuthorized("Admin"), registerNewAdmin);
router.post("/add/new-user", isAuthenticated, isAuthorized("Admin"), registerNewUser);

export default router;