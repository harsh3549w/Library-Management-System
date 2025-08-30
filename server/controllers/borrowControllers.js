// Controller for handling book borrowing operations
import { Borrow } from "../models/borrowModel.js";
import { Book } from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";

export const recordBorrowedBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { email } = req.body;
  
  const book = await Book.findById(id);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }
  
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  if (book.quantity === 0) {
    return next(new ErrorHandler("Book not available", 400));
  }
  
  const isAlreadyBorrowed = user.borrowedBooks.find(
    b => b.bookId.toString() === id && !b.returned
  );
  
  if (isAlreadyBorrowed) {
    return next(new ErrorHandler("Book already borrowed", 400));
  }
  
  book.quantity -= 1;
  await book.save();
  
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  await Borrow.create({
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    },
    book: book._id,
    dueDate,
    price: book.price
  });
  
  res.status(200).json({
    success: true,
    message: "Borrowed book recorded successfully"
  });
});

export const getMyBorrowedBooks = catchAsyncErrors(async (req, res, next) => {
  const borrows = await Borrow.find({ "user.id": req.user.id }).populate("book");

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
  
  const borrowRecord = await Borrow.findOne({
    book: bookId,
    returnDate: { $exists: false }
  });
  
  if (!borrowRecord) {
    return next(new ErrorHandler("Borrow record not found", 404));
  }
  
  const book = await Book.findById(bookId);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }
  
  book.quantity += 1;
  await book.save();
  
  borrowRecord.returnDate = new Date();
  await borrowRecord.save();
  
  res.status(200).json({
    success: true,
    message: "Book returned successfully"
  });
});