import Razorpay from 'razorpay';
import crypto from 'crypto';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import { ErrorHandler } from '../middlewares/errorMiddlewares.js';
import { User } from '../models/userModel.js';
import { Borrow } from '../models/borrowModel.js';
import { createTransaction } from './transactionController.js';

// Initialize Razorpay (lazy initialization)
let razorpay = null;

const getRazorpayInstance = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials missing!');
      console.error('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing');
      console.error('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing');
      throw new Error('Razorpay credentials not configured. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in config.env');
    }
    console.log('Initializing Razorpay with key:', process.env.RAZORPAY_KEY_ID);
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('Razorpay initialized successfully');
  }
  return razorpay;
};

// Create Razorpay order for fine payment
export const createFinePaymentOrder = catchAsyncErrors(async (req, res, next) => {
  const { borrowId } = req.params;
  
  const borrow = await Borrow.findById(borrowId).populate('book');
  if (!borrow) {
    return next(new ErrorHandler('Borrow record not found', 404));
  }
  
  if (borrow.fine === 0) {
    return next(new ErrorHandler('No fine to pay', 400));
  }
  
  if (borrow.finePaid) {
    return next(new ErrorHandler('Fine already paid', 400));
  }
  
  // Create Razorpay order
  // Generate a short receipt ID (max 40 chars)
  const shortReceiptId = `fine_${Date.now()}`.substring(0, 40);
  
  const options = {
    amount: Math.round(borrow.fine * 100), // Convert to paise (1 rupee = 100 paise)
    currency: 'INR',
    receipt: shortReceiptId,
    notes: {
      borrowId: borrow._id.toString(),
      userId: req.user._id.toString(),
      bookTitle: borrow.book.title,
      type: 'fine_payment'
    }
  };
  
  try {
    const razorpayInstance = getRazorpayInstance();
    const order = await razorpayInstance.orders.create(options);
    
    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: borrow.fine,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      borrowId: borrow._id,
      bookTitle: borrow.book.title
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    console.error('Error details:', error.message);
    console.error('Error description:', error.description || 'No description');
    return next(new ErrorHandler(`Failed to create payment order: ${error.message}`, 500));
  }
});

// Verify Razorpay payment signature
export const verifyPayment = catchAsyncErrors(async (req, res, next) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    borrowId
  } = req.body;
  
  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
  
  const isAuthentic = expectedSignature === razorpay_signature;
  
  if (!isAuthentic) {
    return next(new ErrorHandler('Payment verification failed', 400));
  }
  
  // Payment is authentic, update records
  const borrow = await Borrow.findById(borrowId).populate('book');
  if (!borrow) {
    return next(new ErrorHandler('Borrow record not found', 404));
  }
  
  if (borrow.finePaid) {
    return res.status(200).json({
      success: true,
      message: 'Fine already marked as paid'
    });
  }
  
  // Mark fine as paid
  borrow.finePaid = true;
  await borrow.save();
  
  // Update user balance
  const user = await User.findById(borrow.user.id);
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }
  
  const fineAmount = borrow.fine;
  user.fineBalance = Math.max(0, user.fineBalance - fineAmount);
  user.totalFinesPaid += fineAmount;
  await user.save();
  
  // Create transaction record
  await createTransaction({
    type: 'fine_payment',
    user: user._id,
    book: borrow.book._id,
    amount: fineAmount,
    paymentMethod: 'online',
    paymentStatus: 'completed',
    description: `Fine payment of ₹${fineAmount.toFixed(2)} for "${borrow.book.title}" via Razorpay`,
    metadata: {
      borrowId: borrow._id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentGateway: 'razorpay'
    }
  });
  
  res.status(200).json({
    success: true,
    message: `Fine of ₹${fineAmount.toFixed(2)} paid successfully!`,
    userFineBalance: user.fineBalance,
    totalFinesPaid: user.totalFinesPaid
  });
});

// Get payment details
export const getPaymentDetails = catchAsyncErrors(async (req, res, next) => {
  const { paymentId } = req.params;
  
  try {
    const razorpayInstance = getRazorpayInstance();
    const payment = await razorpayInstance.payments.fetch(paymentId);
    
    res.status(200).json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        createdAt: new Date(payment.created_at * 1000)
      }
    });
  } catch (error) {
    return next(new ErrorHandler('Failed to fetch payment details', 500));
  }
});

// Get all user payments (for history)
export const getMyPayments = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  
  const payments = await Borrow.find({
    'user.id': userId,
    finePaid: true,
    fine: { $gt: 0 }
  })
    .populate('book')
    .sort({ updatedAt: -1 });
  
  res.status(200).json({
    success: true,
    payments
  });
});

