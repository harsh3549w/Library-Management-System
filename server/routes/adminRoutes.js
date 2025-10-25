import express from 'express';
import { isAuthenticated, isAuthorized } from '../middlewares/authMiddleware.js';
import { batchRegisterUsers } from '../controllers/adminController.js';

const router = express.Router();

// Batch register users - Admin only
router.post('/batch-register', isAuthenticated, isAuthorized('Admin'), batchRegisterUsers);

export default router;

