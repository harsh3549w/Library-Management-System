import express from "express";
import {
  getMyBorrowedBooks,
  getBorrowedBooksForAdmin,
  recordBorrowedBook,
  returnBorrowBook,
  renewBook,
  getMyFines,
  getAllFines,
  markFineAsPaid,
  borrowBookForSelf,
  returnMyBorrowedBook,
  extendDueDate,
  updateOverdueFines
} from "../controllers/borrowControllers.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes
router.post("/record-borrow-book/:id", isAuthenticated, isAuthorized("Admin"), recordBorrowedBook);
router.get("/borrowed-books-by-users", isAuthenticated, isAuthorized("Admin"), getBorrowedBooksForAdmin);
router.put("/return-borrowed-book/:bookId", isAuthenticated, isAuthorized("Admin"), returnBorrowBook);
router.get("/all-fines", isAuthenticated, isAuthorized("Admin"), getAllFines);
router.put("/mark-fine-paid/:borrowId", isAuthenticated, isAuthorized("Admin"), markFineAsPaid);
router.post("/extend-due", isAuthenticated, isAuthorized("Admin"), extendDueDate);
router.post("/update-overdue-fines", isAuthenticated, isAuthorized("Admin"), updateOverdueFines);

// User routes
router.post("/borrow/:id", isAuthenticated, borrowBookForSelf);
router.get("/my-borrowed-books", isAuthenticated, getMyBorrowedBooks);
router.put("/return/:id", isAuthenticated, returnMyBorrowedBook);
router.put("/renew/:borrowId", isAuthenticated, renewBook);
router.get("/my-fines", isAuthenticated, getMyFines);
router.post("/update-my-fines", isAuthenticated, updateOverdueFines);

export default router;