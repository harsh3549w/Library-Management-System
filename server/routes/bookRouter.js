import express from "express";
import { 
    addBook, 
    deleteBook, 
    getAllBooks,
    updateBook
} from "../controllers/bookController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { isAuthorized } from "../middlewares/authMiddleware.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router();

// Admin routes
router.post("/admin/add", isAuthenticated, isAuthorized("Admin"), addBook);
router.delete("/admin/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteBook);
router.put("/admin/update/:id", isAuthenticated, isAuthorized("Admin"), updateBook);

// Public routes with caching (cache for 5 minutes)
router.get("/all", cacheMiddleware(300), getAllBooks);

export default router;