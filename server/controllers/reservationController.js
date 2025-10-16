import { Reservation } from "../models/reservationModel.js";
import { Book } from "../models/bookModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";
import { sendEmail } from "../utils/emailService.js";

// Create a book reservation
export const reserveBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params; // book id

  // Check if user has unpaid fines
  if (req.user.fineBalance > 0) {
    return next(new ErrorHandler(`Cannot reserve books. You have an outstanding fine balance of $${req.user.fineBalance.toFixed(2)}. Please pay your fines before reserving.`, 403));
  }

  const book = await Book.findById(id);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  // Check if book is available
  if (book.availability && book.quantity > 0) {
    return next(new ErrorHandler("Book is currently available. Please borrow it directly.", 400));
  }

  // Check if user already has an active reservation for this book
  const existingReservation = await Reservation.findOne({
    "user.id": req.user._id,
    book: id,
    status: "active"
  });

  if (existingReservation) {
    return next(new ErrorHandler("You already have an active reservation for this book", 400));
  }

  // Create reservation
  const reservation = await Reservation.create({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    },
    book: id
  });

  res.status(201).json({
    success: true,
    message: "Book reserved successfully. You will be notified when it becomes available.",
    reservation
  });
});

// Get user's reservations
export const getMyReservations = catchAsyncErrors(async (req, res, next) => {
  const reservations = await Reservation.find({
    "user.id": req.user._id
  })
    .populate('book')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reservations.length,
    reservations
  });
});

// Get all reservations (admin)
export const getAllReservations = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.query;

  const query = {};
  if (status && status !== 'all') {
    query.status = status;
  }

  const reservations = await Reservation.find(query)
    .populate('book')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reservations.length,
    reservations
  });
});

// Cancel reservation
export const cancelReservation = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const reservation = await Reservation.findById(id);
  if (!reservation) {
    return next(new ErrorHandler("Reservation not found", 404));
  }

  // Check if user owns this reservation or is admin
  if (reservation.user.id.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    return next(new ErrorHandler("Not authorized to cancel this reservation", 403));
  }

  if (reservation.status !== 'active') {
    return next(new ErrorHandler("Cannot cancel this reservation", 400));
  }

  reservation.status = 'cancelled';
  reservation.cancelledAt = new Date();
  await reservation.save();

  res.status(200).json({
    success: true,
    message: "Reservation cancelled successfully",
    reservation
  });
});

// Fulfill reservation (admin/system) - Automatically borrows the book
export const fulfillReservation = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const reservation = await Reservation.findById(id).populate('book');
  if (!reservation) {
    return next(new ErrorHandler("Reservation not found", 404));
  }

  if (reservation.status !== 'active') {
    return next(new ErrorHandler("Reservation is not active", 400));
  }

  // Check if this is the first (oldest) active reservation for this book
  const olderReservation = await Reservation.findOne({
    book: reservation.book._id,
    status: 'active',
    createdAt: { $lt: reservation.createdAt }
  });

  if (olderReservation) {
    return next(new ErrorHandler("Please fulfill previous reservations for this book first", 400));
  }

  // Check if book is now available
  const book = await Book.findById(reservation.book._id);
  if (!book || book.quantity <= 0) {
    return next(new ErrorHandler("Book is still not available", 400));
  }

  // Import Borrow model
  const { Borrow } = await import("../models/borrowModel.js");
  const { User } = await import("../models/userModel.js");
  
  // Get the user
  const user = await User.findById(reservation.user.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Check if user has unpaid fines
  if (user.fineBalance > 0) {
    return next(new ErrorHandler(`Cannot fulfill reservation. User has an outstanding fine balance of $${user.fineBalance.toFixed(2)}`, 403));
  }

  // Use auto-allocation service instead of manual borrowing
  const { autoAllocateBooks } = await import("../services/autoAllocationService.js");
  
  // Mark reservation as fulfilled (auto-allocation will handle the borrowing)
  reservation.status = 'fulfilled';
  reservation.fulfilledAt = new Date();
  await reservation.save();

  // Trigger auto-allocation for this book
  await autoAllocateBooks(book._id);

  res.status(200).json({
    success: true,
    message: "Reservation fulfilled - Book will be auto-allocated to user",
    reservation
  });
});

// Check for reservations when book is returned (helper function)
export const checkAndNotifyReservations = async (bookId) => {
  try {
    // Find the oldest active reservation for this book
    const reservation = await Reservation.findOne({
      book: bookId,
      status: 'active'
    })
      .sort({ createdAt: 1 })
      .populate('book');

    if (reservation) {
      // Notify user that book is available
      try {
        console.log(`Attempting to send book available notification to ${reservation.user.email}`);
        await sendEmail({
          email: reservation.user.email,
          subject: "Reserved Book Now Available",
          message: `Hello ${reservation.user.name},\n\nGood news! The book "${reservation.book.title}" that you reserved is now available. Please visit the library to borrow it within 48 hours.\n\nBest regards,\nLibrary Team`
        });
        console.log(`✅ Book available notification sent successfully to ${reservation.user.email}`);

        reservation.notified = true;
        await reservation.save();

        console.log(`Notified ${reservation.user.email} about available book: ${reservation.book.title}`);
      } catch (error) {
        console.error("Failed to send reservation notification:", error);
      }
    }
  } catch (error) {
    console.error("Error checking reservations:", error);
  }
};

