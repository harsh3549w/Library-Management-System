import express from 'express';
import { 
  createFinePaymentOrder, 
  verifyPayment,
  getPaymentDetails,
  getMyPayments
} from '../controllers/paymentController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/create-order/:borrowId', isAuthenticated, createFinePaymentOrder);
router.post('/verify', isAuthenticated, verifyPayment);
router.get('/details/:paymentId', isAuthenticated, getPaymentDetails);
router.get('/my-payments', isAuthenticated, getMyPayments);

export default router;

