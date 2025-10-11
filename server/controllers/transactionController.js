import { Transaction } from "../models/transactionModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";

// Get all transactions (Admin) with filters
export const getAllTransactions = catchAsyncErrors(async (req, res, next) => {
  const { type, status, startDate, endDate, userId } = req.query;
  
  const query = {};
  
  // Filter by type
  if (type && type !== 'all') {
    query.type = type;
  }
  
  // Filter by status
  if (status && status !== 'all') {
    query.paymentStatus = status;
  }
  
  // Filter by user
  if (userId) {
    query.user = userId;
  }
  
  // Filter by date range
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }
  
  const transactions = await Transaction.find(query)
    .populate('user', 'name email')
    .populate('book', 'title author')
    .populate('processedBy', 'name email')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: transactions.length,
    transactions
  });
});

// Get user's transactions
export const getUserTransactions = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  
  const transactions = await Transaction.find({ user: userId })
    .populate('book', 'title author')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: transactions.length,
    transactions
  });
});

// Create manual transaction (Admin)
export const recordTransaction = catchAsyncErrors(async (req, res, next) => {
  const { type, userId, bookId, amount, paymentMethod, paymentStatus, description, metadata } = req.body;
  
  if (!type || !userId || !description) {
    return next(new ErrorHandler("Type, user ID, and description are required", 400));
  }
  
  const transaction = await Transaction.create({
    type,
    user: userId,
    book: bookId,
    amount: amount || 0,
    paymentMethod: paymentMethod || 'n/a',
    paymentStatus: paymentStatus || 'completed',
    description,
    processedBy: req.user._id,
    metadata: metadata || {}
  });
  
  await transaction.populate('user', 'name email');
  if (bookId) {
    await transaction.populate('book', 'title author');
  }
  
  res.status(201).json({
    success: true,
    message: "Transaction recorded successfully",
    transaction
  });
});

// Get transaction statistics (Admin)
export const getTransactionStats = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) {
      dateFilter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.createdAt.$lte = new Date(endDate);
    }
  }
  
  // Total transactions by type
  const transactionsByType = await Transaction.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
  
  // Total revenue from fines
  const fineRevenue = await Transaction.aggregate([
    {
      $match: {
        ...dateFilter,
        type: 'fine_payment',
        paymentStatus: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  // Total book purchases
  const bookPurchases = await Transaction.aggregate([
    {
      $match: {
        ...dateFilter,
        type: 'book_purchase',
        paymentStatus: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  // Transactions by status
  const transactionsByStatus = await Transaction.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Recent transactions
  const recentTransactions = await Transaction.find(dateFilter)
    .populate('user', 'name email')
    .populate('book', 'title author')
    .sort({ createdAt: -1 })
    .limit(10);
  
  res.status(200).json({
    success: true,
    stats: {
      byType: transactionsByType,
      byStatus: transactionsByStatus,
      fineRevenue: fineRevenue[0]?.total || 0,
      bookPurchases: bookPurchases[0]?.total || 0,
      recentTransactions
    }
  });
});

// Helper function to create transaction (used by other controllers)
export const createTransaction = async (transactionData) => {
  try {
    const transaction = await Transaction.create(transactionData);
    return transaction;
  } catch (error) {
    console.error("Error creating transaction:", error);
    return null;
  }
};

