import { Book } from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import { Borrow } from "../models/borrowModel.js";
import { Transaction } from "../models/transactionModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";

// Get library statistics
export const getLibraryStats = catchAsyncErrors(async (req, res, next) => {
  // Total books
  const totalBooks = await Book.countDocuments();
  const availableBooks = await Book.countDocuments({ availability: true });
  
  // Total users
  const totalUsers = await User.countDocuments({ role: 'User' });
  const totalAdmins = await User.countDocuments({ role: 'Admin' });
  
  // Active borrows (not returned)
  const activeBorrows = await Borrow.countDocuments({ returnDate: null });
  
  // Overdue books
  const today = new Date();
  const overdueBooks = await Borrow.countDocuments({
    returnDate: null,
    dueDate: { $lt: today }
  });
  
  // Total fines
  const fineStats = await Borrow.aggregate([
    {
      $match: { fine: { $gt: 0 } }
    },
    {
      $group: {
        _id: null,
        totalFines: { $sum: '$fine' },
        paidFines: {
          $sum: {
            $cond: [{ $eq: ['$finePaid', true] }, '$fine', 0]
          }
        },
        unpaidFines: {
          $sum: {
            $cond: [{ $eq: ['$finePaid', false] }, '$fine', 0]
          }
        }
      }
    }
  ]);
  
  const fineData = fineStats[0] || { totalFines: 0, paidFines: 0, unpaidFines: 0 };
  
  res.status(200).json({
    success: true,
    stats: {
      books: {
        total: totalBooks,
        available: availableBooks,
        borrowed: totalBooks - availableBooks
      },
      users: {
        total: totalUsers,
        admins: totalAdmins
      },
      borrows: {
        active: activeBorrows,
        overdue: overdueBooks
      },
      fines: fineData
    }
  });
});

// Get borrowing report with trends
export const getBorrowingReport = catchAsyncErrors(async (req, res, next) => {
  const { period = 'monthly' } = req.query; // daily, weekly, monthly
  
  let groupBy;
  switch (period) {
    case 'daily':
      groupBy = {
        year: { $year: '$borrowDate' },
        month: { $month: '$borrowDate' },
        day: { $dayOfMonth: '$borrowDate' }
      };
      break;
    case 'weekly':
      groupBy = {
        year: { $year: '$borrowDate' },
        week: { $week: '$borrowDate' }
      };
      break;
    case 'monthly':
    default:
      groupBy = {
        year: { $year: '$borrowDate' },
        month: { $month: '$borrowDate' }
      };
  }
  
  const borrowTrends = await Borrow.aggregate([
    {
      $group: {
        _id: groupBy,
        count: { $sum: 1 },
        returned: {
          $sum: { $cond: [{ $ne: ['$returnDate', null] }, 1, 0] }
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$returnDate', null] },
                  { $lt: ['$dueDate', new Date()] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1, '_id.week': -1 } },
    { $limit: 12 }
  ]);
  
  res.status(200).json({
    success: true,
    period,
    trends: borrowTrends
  });
});

// Get popular books report
export const getPopularBooksReport = catchAsyncErrors(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  const popularBooks = await Borrow.aggregate([
    {
      $group: {
        _id: '$book',
        borrowCount: { $sum: 1 },
        currentlyBorrowed: {
          $sum: { $cond: [{ $eq: ['$returnDate', null] }, 1, 0] }
        }
      }
    },
    { $sort: { borrowCount: -1 } },
    { $limit: parseInt(limit) },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'bookDetails'
      }
    },
    { $unwind: '$bookDetails' }
  ]);
  
  res.status(200).json({
    success: true,
    popularBooks
  });
});

// Get user activity report
export const getUserActivityReport = catchAsyncErrors(async (req, res, next) => {
  // Active users (users who have borrowed books)
  const activeUsers = await Borrow.distinct('user.id');
  
  // New registrations by month
  const registrationTrends = await User.aggregate([
    {
      $match: { role: 'User' }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);
  
  // Users with most borrows
  const topBorrowers = await Borrow.aggregate([
    {
      $group: {
        _id: '$user.id',
        userName: { $first: '$user.name' },
        userEmail: { $first: '$user.email' },
        borrowCount: { $sum: 1 }
      }
    },
    { $sort: { borrowCount: -1 } },
    { $limit: 10 }
  ]);
  
  res.status(200).json({
    success: true,
    activeUsersCount: activeUsers.length,
    registrationTrends,
    topBorrowers
  });
});

// Get financial report
export const getFinancialReport = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }
  
  // Fine revenue
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
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Book purchases
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
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Pending fines
  const pendingFines = await Borrow.aggregate([
    {
      $match: {
        finePaid: false,
        fine: { $gt: 0 }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$fine' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Revenue by month
  const monthlyRevenue = await Transaction.aggregate([
    {
      $match: {
        ...dateFilter,
        paymentStatus: 'completed',
        amount: { $gt: 0 }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);
  
  res.status(200).json({
    success: true,
    fineRevenue: fineRevenue[0] || { total: 0, count: 0 },
    bookPurchases: bookPurchases[0] || { total: 0, count: 0 },
    pendingFines: pendingFines[0] || { total: 0, count: 0 },
    monthlyRevenue
  });
});

// Get overdue report
export const getOverdueReport = catchAsyncErrors(async (req, res, next) => {
  const today = new Date();
  
  try {
    const overdueBooks = await Borrow.find({
      returnDate: null,
      dueDate: { $lt: today }
    })
      .populate('book', 'title author isbn')
      .sort({ dueDate: 1 });
    
    console.log('Overdue books found:', overdueBooks.length);
    console.log('Sample overdue book:', overdueBooks[0]);
    
    res.status(200).json({
      success: true,
      count: overdueBooks.length,
      overdueBooks
    });
  } catch (error) {
    console.error('Error in getOverdueReport:', error);
    res.status(200).json({
      success: true,
      count: 0,
      overdueBooks: []
    });
  }
});

// Get category report
export const getCategoryReport = catchAsyncErrors(async (req, res, next) => {
  // Books by genre
  const booksByGenre = await Book.aggregate([
    {
      $group: {
        _id: '$genre',
        count: { $sum: 1 },
        available: {
          $sum: { $cond: [{ $eq: ['$availability', true] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  // Borrows by genre
  const borrowsByGenre = await Borrow.aggregate([
    {
      $lookup: {
        from: 'books',
        localField: 'book',
        foreignField: '_id',
        as: 'bookDetails'
      }
    },
    { $unwind: '$bookDetails' },
    {
      $group: {
        _id: '$bookDetails.genre',
        borrowCount: { $sum: 1 }
      }
    },
    { $sort: { borrowCount: -1 } }
  ]);
  
  res.status(200).json({
    success: true,
    booksByGenre,
    borrowsByGenre
  });
});

