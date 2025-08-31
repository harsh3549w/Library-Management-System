// Controller for handling book borrowing operations
import { Borrow } from "../models/borrowModel.js";
import { Book } from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";
import { calculateFine } from "../utils/fineCalculator.js";

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
  
  if (book.quantity <= 0) {
    return next(new ErrorHandler("Book not available", 400));
  }
  
  const isAlreadyBorrowed = user.borrowedBooks.find(
    b => b.bookId.toString() === id && !b.returned
  );
  
  if (isAlreadyBorrowed) {
    return next(new ErrorHandler("Book already borrowed by this user", 400));
  }
  
  book.quantity -= 1;
  book.availability = book.quantity > 0;
  await book.save();
  
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  user.borrowedBooks.push({
    bookId: book._id,
    bookTitle: book.title,
    borrowedDate: new Date(),
    dueDate,
    returned: false
  });
  await user.save();
  
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
    message: "Book borrowed successfully"
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
  const { email } = req.body;
  
  const book = await Book.findById(bookId);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }
  
  const user = await User.findOne({ email, accountVerified: true });
  if (!user) {
    return next(new ErrorHandler("User not found or not verified", 404));
  }
  
  const borrowedBook = user.borrowedBooks.find(
    b => b.bookId.toString() === bookId && !b.returned
  );
  
  if (!borrowedBook) {
    return next(new ErrorHandler("You have not borrowed this book", 400));
  }
  
  borrowedBook.returned = true;
  await user.save();
  
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
  
  res.status(200).json({
    success: true,
    message: fine > 0 
      ? `Book returned successfully with fine of $${fine}` 
      : "Book returned successfully"
  });
});