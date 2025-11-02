import express from 'express';
import { isAuthenticated, isAuthorized } from '../middlewares/authMiddleware.js';
import { batchRegisterUsers } from '../controllers/adminController.js';
import { 
	createInventoryIssue, 
	listInventoryIssues, 
	resolveInventoryIssue 
} from '../controllers/inventoryIssueController.js';

const router = express.Router();

// Batch register users - Admin only
router.post('/batch-register', isAuthenticated, isAuthorized('Admin'), batchRegisterUsers);

// Inventory issues (Missing/Stolen)
router.get('/inventory-issues', isAuthenticated, isAuthorized('Admin'), listInventoryIssues);
router.post('/inventory-issues', isAuthenticated, isAuthorized('Admin'), createInventoryIssue);
router.patch('/inventory-issues/:id/resolve', isAuthenticated, isAuthorized('Admin'), resolveInventoryIssue);

export default router;

