import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Book } from "../models/bookModel.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";

export const addBook = catchAsyncErrors(async (req, res, next) => {
    const { title, author, description, price, quantity } = req.body;
    
    if (!title || !author || !description || !price || !quantity) {
        return next(new ErrorHandler("Please fill all fields", 400));
    }

    const book = await Book.create({
        title,
        author,
        description,
        price,
        quantity
    });

    res.status(201).json({
        success: true,
        message: "Book added successfully",
        book
    });
});

export const deleteBook = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
        return next(new ErrorHandler("Book not found", 404));
    }

    await book.deleteOne();
    
    res.status(200).json({
        success: true,
        message: "Book deleted successfully"
    });
});

export const getAllBooks = catchAsyncErrors(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const books = await Book.find().skip(skip).limit(limit);
    const totalBooks = await Book.countDocuments();
    
    res.status(200).json({
        success: true,
        books,
        currentPage: page,
        totalPages: Math.ceil(totalBooks / limit),
        totalBooks
    });
});

export const updateBook = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { title, author, description, price, quantity } = req.body;
    
    const book = await Book.findById(id);
    
    if (!book) {
        return next(new ErrorHandler("Book not found", 404));
    }
    
    if (title) book.title = title;
    if (author) book.author = author;
    if (description) book.description = description;
    if (price) book.price = price;
    if (quantity) book.quantity = quantity;
    
    await book.save();
    
    res.status(200).json({
        success: true,
        message: "Book updated successfully",
        book
    });
});