import express from "express";
import {
  getMyBorrowedBooks,
  getBorrowedBooksForAdmin,
  recordBorrowedBook,
  returnBorrowBook
} from "../controllers/borrowControllers.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes
router.post("/record-borrow-book/:id", isAuthenticated, isAuthorized("Admin"), recordBorrowedBook);
router.get("/borrowed-books-by-users", isAuthenticated, isAuthorized("Admin"), getBorrowedBooksForAdmin);
router.put("/return-borrowed-book/:bookId", isAuthenticated, isAuthorized("Admin"), returnBorrowBook);

// User routes
router.get("/my-borrowed-books", isAuthenticated, getMyBorrowedBooks);

export default router;