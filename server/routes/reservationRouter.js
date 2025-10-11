import express from "express";
import {
  reserveBook,
  getMyReservations,
  getAllReservations,
  cancelReservation,
  fulfillReservation
} from "../controllers/reservationController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User routes
router.post("/reserve/:id", isAuthenticated, reserveBook);
router.get("/my-reservations", isAuthenticated, getMyReservations);
router.post("/cancel/:id", isAuthenticated, cancelReservation);

// Admin routes
router.get("/all", isAuthenticated, isAuthorized("Admin"), getAllReservations);
router.post("/fulfill/:id", isAuthenticated, isAuthorized("Admin"), fulfillReservation);

export default router;

