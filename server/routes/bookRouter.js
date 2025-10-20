import express from "express";
import { 
    addBook, 
    deleteBook, 
    getAllBooks,
    updateBook
} from "../controllers/bookController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes
router.post("/admin/add", isAuthenticated, isAuthorized("Admin"), addBook);
router.delete("/admin/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteBook);
router.put("/admin/update/:id", isAuthenticated, isAuthorized("Admin"), updateBook);

// Public routes
router.get("/all", getAllBooks);

export default router;