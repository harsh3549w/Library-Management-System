// Controller for handling book borrowing operations
import { Borrow } from "../models/borrowModel.js";
import { Book } from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";
import { calculateFine } from "../utils/fineCalculator.js";
import { checkAndNotifyReservations } from "./reservationController.js";
import { createTransaction } from "./transactionController.js";
import { sendEmail } from "../utils/emailService.js";

// Update fines for all overdue books
export const updateOverdueFines = catchAsyncErrors(async (req, res, next) => {
  try {
    const today = new Date();
    
    // Find all overdue books that haven't been returned
    const overdueBooks = await Borrow.find({
      dueDate: { $lt: today },
      returnDate: null
    }).populate('book');

    let updatedCount = 0;
    let totalFines = 0;

    for (const borrow of overdueBooks) {
      const fine = calculateFine(borrow.dueDate);
      
      if (fine > 0 && borrow.fine !== fine) {
        // Store old fine before updating
        const oldFine = borrow.fine || 0;
        
        // Update the borrow record with new fine
        borrow.fine = fine;
        await borrow.save();

        // Update user's fine balance
        const user = await User.findById(borrow.user.id);
        if (user) {
          // Remove old fine from balance and add new fine
          user.fineBalance = Math.max(0, user.fineBalance - oldFine) + fine;
          await user.save();
        }

        updatedCount++;
        totalFines += fine;
      }
    }

    res.status(200).json({
      success: true,
      message: `Updated fines for ${updatedCount} overdue books`,
      updatedCount,
      totalFines
    });

  } catch (error) {
    console.error("Error updating overdue fines:", error);
    return next(new ErrorHandler("Failed to update overdue fines", 500));
  }
});

export const recordBorrowedBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { email } = req.body;
  
  const book = await Book.findById(id);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }
  
  const user = await User.findOne({ email, accountVerified: true });
  if (!user) {
    return next(new ErrorHandler("User not found or not verified", 404));
  }

  // Check if user has unpaid fines
  if (user.fineBalance > 0) {
    return next(new ErrorHandler(`Cannot borrow books. You have an outstanding fine balance of ₹${user.fineBalance.toFixed(2)}. Please pay your fines before borrowing.`, 403));
  }
  
  if (book.quantity <= 0) {
    return next(new ErrorHandler("Book not available", 400));
  }
  
  const isAlreadyBorrowed = await Borrow.findOne({
    "user.id": user._id,
    book: id,
    returnDate: null,
  });
  
  if (isAlreadyBorrowed) {
    return next(new ErrorHandler("Book already borrowed by this user", 400));
  }
  
  book.quantity -= 1;
  book.availability = book.quantity > 0;
  await book.save();
  
  const dueDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes for testing
  
  
  const borrow = await Borrow.create({
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    },
    book: book._id,
    dueDate,
    price: book.price
  });

  // Create transaction record
  await createTransaction({
    type: 'borrow',
    user: user._id,
    book: book._id,
    amount: 0,
    description: `Borrowed "${book.title}" by ${book.author}`,
    metadata: {
      borrowId: borrow._id,
      dueDate: dueDate
    }
  });
  
  res.status(200).json({
    success: true,
    message: "Book borrowed successfully"
  });
});

// User borrows a book for themselves
export const borrowBookForSelf = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  
  const book = await Book.findById(id);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  // Check if user has unpaid fines
  if (user.fineBalance > 0) {
    return next(new ErrorHandler(`Cannot borrow books. You have an outstanding fine balance of ₹${user.fineBalance.toFixed(2)}. Please pay your fines before borrowing.`, 403));
  }
  
  if (book.quantity <= 0) {
    return next(new ErrorHandler("Book not available", 400));
  }
  
  const isAlreadyBorrowed = await Borrow.findOne({
    "user.id": user._id,
    book: id,
    returnDate: null,
  });
  
  if (isAlreadyBorrowed) {
    return next(new ErrorHandler("You have already borrowed this book", 400));
  }
  
  book.quantity -= 1;
  book.availability = book.quantity > 0;
  await book.save();
  
  const dueDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes for testing
  
  const borrow = await Borrow.create({
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    },
    book: book._id,
    dueDate,
    price: book.price
  });

  // Create transaction record
  await createTransaction({
    type: 'borrow',
    user: user._id,
    book: book._id,
    amount: 0,
    description: `Borrowed "${book.title}" by ${book.author}`,
    metadata: {
      borrowId: borrow._id,
      dueDate: dueDate
    }
  });

  // Send email notification
  try {
    console.log(`Attempting to send borrow notification to ${user.email}`);
    await sendEmail({
      email: user.email,
      subject: "Book Successfully Borrowed",
      message: `Hello ${user.name},\n\nYour book has been successfully borrowed!\n\nBook Details:\n• Title: "${book.title}"\n• Author: ${book.author}\n• ISBN: ${book.isbn || 'N/A'}\n\nDue Date: ${dueDate.toLocaleDateString()}\n\nPlease return the book by the due date to avoid late fees.\n\nBest regards,\nLibrary Team`
    });
    console.log(`✅ Borrow notification sent successfully to ${user.email}`);
  } catch (error) {
    console.error("❌ Failed to send borrow notification:", error);
  }
  
  res.status(200).json({
    success: true,
    message: "Book borrowed successfully! Due date: " + dueDate.toLocaleDateString(),
    borrow
  });
});

// User returns their own borrowed book
export const returnMyBorrowedBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params; // borrow id
  const user = req.user;

  const borrow = await Borrow.findById(id).populate('book');
  if (!borrow) {
    return next(new ErrorHandler("Borrow record not found", 404));
  }

  // Check if user owns this borrow record
  if (borrow.user.id.toString() !== user._id.toString()) {
    return next(new ErrorHandler("You can only return your own borrowed books", 403));
  }

  // Check if book is already returned
  if (borrow.returnDate) {
    return next(new ErrorHandler("Book has already been returned", 400));
  }

  const book = await Book.findById(borrow.book._id);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  // Mark as returned
  borrow.returnDate = new Date();
  const fine = calculateFine(borrow.dueDate);
  borrow.fine = fine;
  await borrow.save();

  // Update book quantity
  book.quantity += 1;
  book.availability = book.quantity > 0;
  await book.save();

  // Update user's fine balance if there's a fine
  if (fine > 0) {
    user.fineBalance += fine;
    await user.save();
  }

  // Create transaction record for return
  await createTransaction({
    type: 'return',
    user: user._id,
    book: borrow.book._id,
    amount: fine,
    description: `Returned "${book.title}" by ${book.author}${fine > 0 ? ` with fine of ₹${fine.toFixed(2)}` : ''}`,
    metadata: {
      borrowId: borrow._id,
      returnDate: borrow.returnDate,
      fine: fine
    }
  });

  // Auto-allocate books to waiting users
  const { autoAllocateBooks } = await import("../services/autoAllocationService.js");
  await autoAllocateBooks(borrow.book._id);

  res.status(200).json({
    success: true,
    message: fine > 0 
      ? `Book returned successfully. Fine of ₹${fine.toFixed(2)} has been added to your account.` 
      : "Book returned successfully",
    fine: fine > 0 ? fine : 0,
    userFineBalance: user.fineBalance,
    borrow
  });
});

export const getMyBorrowedBooks = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  
  // First, update fines for overdue books
  const today = new Date();
  const overdueBooks = await Borrow.find({
    "user.id": userId,
    dueDate: { $lt: today },
    returnDate: null
  });

  // Calculate and update fines for overdue books
  for (const borrow of overdueBooks) {
    const fine = calculateFine(borrow.dueDate);
    if (fine > 0 && borrow.fine !== fine) {
      const oldFine = borrow.fine || 0;
      borrow.fine = fine;
      await borrow.save();

      // Update user's fine balance
      const user = await User.findById(userId);
      if (user) {
        user.fineBalance = Math.max(0, user.fineBalance - oldFine) + fine;
        await user.save();
      }
    }
  }

  const borrows = await Borrow.find({ "user.id": userId }).populate("book");

  res.status(200).json({
    success: true,
    borrowedBooks: borrows,
  });
});

export const getBorrowedBooksForAdmin = catchAsyncErrors(async (req, res, next) => {
  const borrowedBooks = await Borrow.find().populate('book');
  res.status(200).json({
    success: true,
    borrowedBooks
  });
});

export const returnBorrowBook = catchAsyncErrors(async (req, res, next) => {
  const { bookId } = req.params;
  const { email } = req.body;
  
  const book = await Book.findById(bookId);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }
  
  const user = await User.findOne({ email, accountVerified: true });
  if (!user) {
    return next(new ErrorHandler("User not found or not verified", 404));
  }
  
  
  
  
  book.quantity += 1;
  book.availability = book.quantity > 0;
  await book.save();
  
  const borrow = await Borrow.findOne({
    book: bookId,
    "user.email": email,
    returnDate: null
  });
  
  if (!borrow) {
    return next(new ErrorHandler("Borrow record not found", 404));
  }
  
  borrow.returnDate = new Date();
  const fine = calculateFine(borrow.dueDate);
  borrow.fine = fine;
  await borrow.save();

  // Update user's fine balance if there's a fine
  if (fine > 0) {
    user.fineBalance += fine;
    await user.save();
  }

  // Create transaction record for return
  await createTransaction({
    type: 'return',
    user: user._id,
    book: bookId,
    amount: fine,
    description: `Returned "${book.title}" by ${book.author}${fine > 0 ? ` with fine of ₹${fine.toFixed(2)}` : ''}`,
    metadata: {
      borrowId: borrow._id,
      returnDate: borrow.returnDate,
      fine: fine
    }
  });
  
  // Auto-allocate books to waiting users
  const { autoAllocateBooks } = await import("../services/autoAllocationService.js");
  await autoAllocateBooks(bookId);
  
  res.status(200).json({
    success: true,
    message: fine > 0 
      ? `Book returned successfully. Fine of ₹${fine.toFixed(2)} has been added to your account.` 
      : "Book returned successfully",
    fine: fine > 0 ? fine : 0,
    userFineBalance: user.fineBalance
  });
});

// Renew a borrowed book
export const renewBook = catchAsyncErrors(async (req, res, next) => {
  const { borrowId } = req.params;

  const borrow = await Borrow.findById(borrowId).populate('book');
  if (!borrow) {
    return next(new ErrorHandler("Borrow record not found", 404));
  }

  // Check if book is already returned
  if (borrow.returnDate) {
    return next(new ErrorHandler("Book has already been returned", 400));
  }

  // Check if book is overdue
  const today = new Date();
  if (today > borrow.dueDate) {
    return next(new ErrorHandler("Cannot renew overdue books. Please return the book and pay any fines.", 400));
  }

  // Check if already renewed
  if (borrow.renewalCount >= 1) {
    return next(new ErrorHandler("Book has already been renewed once. Maximum renewals reached.", 400));
  }

  // Check if there are active reservations for this book
  const { Reservation } = await import("../models/reservationModel.js");
  const activeReservation = await Reservation.findOne({
    book: borrow.book._id,
    status: 'active'
  });

  if (activeReservation) {
    return next(new ErrorHandler("Cannot renew. This book has been reserved by another user.", 400));
  }

  // Extend due date by 10 minutes for testing
  const newDueDate = new Date(borrow.dueDate);
  newDueDate.setMinutes(newDueDate.getMinutes() + 10);

  borrow.dueDate = newDueDate;
  borrow.renewalCount += 1;
  borrow.renewedAt = new Date();
  await borrow.save();

  // Create transaction record for renewal
  await createTransaction({
    type: 'renewal',
    user: borrow.user.id,
    book: borrow.book._id,
    amount: 0,
    description: `Renewed "${borrow.book.title}" - Extended due date to ${newDueDate.toLocaleDateString()}`,
    metadata: {
      borrowId: borrow._id,
      oldDueDate: new Date(borrow.dueDate.getTime() - 10 * 60 * 1000), // 10 minutes for testing
      newDueDate: newDueDate
    }
  });

  res.status(200).json({
    success: true,
    message: "Book renewed successfully",
    newDueDate: newDueDate,
    borrow
  });
});

// Get all fines for a user
export const getMyFines = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;

  // First, update fines for overdue books
  const today = new Date();
  const overdueBooks = await Borrow.find({
    "user.id": userId,
    dueDate: { $lt: today },
    returnDate: null
  });

  // Calculate and update fines for overdue books
  for (const borrow of overdueBooks) {
    const fine = calculateFine(borrow.dueDate);
    if (fine > 0 && borrow.fine !== fine) {
      const oldFine = borrow.fine || 0;
      borrow.fine = fine;
      await borrow.save();

      // Update user's fine balance
      const user = await User.findById(userId);
      if (user) {
        user.fineBalance = Math.max(0, user.fineBalance - oldFine) + fine;
        await user.save();
      }
    }
  }

  // Get all borrows with fines
  const borrowsWithFines = await Borrow.find({
    "user.id": userId,
    fine: { $gt: 0 }
  }).populate('book');

  const user = await User.findById(userId);

  res.status(200).json({
    success: true,
    fineBalance: user.fineBalance,
    totalFinesPaid: user.totalFinesPaid,
    borrowsWithFines
  });
});

// Get all fines for admin
export const getAllFines = catchAsyncErrors(async (req, res, next) => {
  const borrowsWithFines = await Borrow.find({
    fine: { $gt: 0 }
  }).populate('book');

  // Get users with outstanding fines
  const usersWithFines = await User.find({
    fineBalance: { $gt: 0 }
  }).select('name email fineBalance totalFinesPaid');

  res.status(200).json({
    success: true,
    borrowsWithFines,
    usersWithFines
  });
});

// Mark fine as paid (Admin only)
export const markFineAsPaid = catchAsyncErrors(async (req, res, next) => {
  const { borrowId } = req.params;
  const { paymentMethod } = req.body;

  const borrow = await Borrow.findById(borrowId);
  if (!borrow) {
    return next(new ErrorHandler("Borrow record not found", 404));
  }

  if (borrow.fine === 0) {
    return next(new ErrorHandler("No fine to pay for this borrow", 400));
  }

  if (borrow.finePaid) {
    return next(new ErrorHandler("Fine has already been paid", 400));
  }

  const user = await User.findById(borrow.user.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Mark fine as paid
  borrow.finePaid = true;
  await borrow.save();

  // Update user's balance
  user.fineBalance = Math.max(0, user.fineBalance - borrow.fine);
  user.totalFinesPaid += borrow.fine;
  await user.save();

  // Create transaction record for fine payment
  await createTransaction({
    type: 'fine_payment',
    user: user._id,
    book: borrow.book,
    amount: borrow.fine,
    paymentMethod: paymentMethod || 'cash',
    paymentStatus: 'completed',
    description: `Fine payment of ₹${borrow.fine.toFixed(2)} for overdue book`,
    processedBy: req.user._id,
    metadata: {
      borrowId: borrow._id,
      paymentMethod: paymentMethod
    }
  });

  res.status(200).json({
    success: true,
    message: `Fine of ₹${borrow.fine.toFixed(2)} marked as paid`,
    userFineBalance: user.fineBalance
  });
});

// Extend due date for a specific user's book
export const extendDueDate = catchAsyncErrors(async (req, res, next) => {
  const { email, isbn } = req.body;

  if (!email || !isbn) {
    return next(new ErrorHandler("Email and ISBN are required", 400));
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  // Find the book by ISBN
  const book = await Book.findOne({ 
    isbn: isbn.trim() 
  });
  if (!book) {
    return next(new ErrorHandler("Book not found with this ISBN", 404));
  }

  // Find the active borrow record for this user and book
  const borrow = await Borrow.findOne({
    "user.id": user._id,
    book: book._id,
    returnDate: null // Only active borrows
  }).populate('book');

  if (!borrow) {
    return next(new ErrorHandler("No active borrow found for this user and book", 404));
  }

  // Extend due date by 7 days
  const currentDueDate = new Date(borrow.dueDate);
  const newDueDate = new Date(currentDueDate);
  newDueDate.setDate(newDueDate.getDate() + 7);

  // Update the borrow record
  borrow.dueDate = newDueDate;
  borrow.renewed = true;
  borrow.renewalCount = (borrow.renewalCount || 0) + 1;
  await borrow.save();

  // Send email notification to user
  try {
    await sendEmail({
      email: user.email,
      subject: "Book Due Date Extended",
      message: `Hello ${user.name},\n\nYour book due date has been extended by the library administrator.\n\nBook Details:\n• Title: "${book.title}"\n• Author: ${book.author}\n• ISBN: ${book.isbn || 'N/A'}\n\nPrevious Due Date: ${currentDueDate.toLocaleDateString()}\nNew Due Date: ${newDueDate.toLocaleDateString()}\n\nPlease return the book by the new due date to avoid late fees.\n\nBest regards,\nLibrary Team`
    });
  } catch (emailError) {
    console.error(`Failed to send extension email to ${user.email}:`, emailError);
  }

  res.status(200).json({
    success: true,
    message: `Due date extended successfully by 7 days for "${book.title}"`,
    borrow: {
      _id: borrow._id,
      bookTitle: book.title,
      userName: user.name,
      userEmail: user.email,
      previousDueDate: currentDueDate,
      newDueDate: newDueDate,
      renewalCount: borrow.renewalCount
    }
  });
});