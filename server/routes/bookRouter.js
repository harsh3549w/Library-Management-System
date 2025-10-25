import express from "express";
import { 
    addBook, 
    deleteBook, 
    getAllBooks,
    updateBook
} from "../controllers/bookController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { isAuthorized } from "../middlewares/authMiddleware.js";
import { readLimiter, writeLimiter } from "../middlewares/rateLimiter.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router();

// Admin routes with write rate limiting
router.post("/admin/add", writeLimiter, isAuthenticated, isAuthorized("Admin"), addBook);
router.delete("/admin/delete/:id", writeLimiter, isAuthenticated, isAuthorized("Admin"), deleteBook);
router.put("/admin/update/:id", writeLimiter, isAuthenticated, isAuthorized("Admin"), updateBook);

// Public routes with caching and read rate limiting (cache for 5 minutes)
router.get("/all", readLimiter, cacheMiddleware(300), getAllBooks);

export default router;