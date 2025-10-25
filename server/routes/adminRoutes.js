import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { batchRegisterUsers } from '../controllers/adminController.js';

const router = express.Router();

// Batch register users - Admin only
router.post('/batch-register', protect, authorize('Admin'), batchRegisterUsers);

export default router;

