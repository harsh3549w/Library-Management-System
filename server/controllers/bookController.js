import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Book } from "../models/bookModel.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";
import { uploadMedia, deleteMedia } from "../utils/mediaUploader.js";

export const addBook = catchAsyncErrors(async (req, res, next) => {
    const { title, author, isbn, publisher, genre, publicationYear, description, price, quantity } = req.body;
    
    if (!title || !author || !description || !price || !quantity) {
        return next(new ErrorHandler("Please fill all required fields", 400));
    }
    
    let coverImage = {};
    if (req.files?.coverImage) {
        coverImage = await uploadMedia(req.files.coverImage, "library-app/books");
    }

    const book = await Book.create({
        title,
        author,
        isbn,
        publisher,
        genre,
        publicationYear: publicationYear ? parseInt(publicationYear) : undefined,
        description,
        price,
        quantity,
        coverImage
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

    // Delete cover image from Cloudinary if exists
    if (book.coverImage?.public_id) {
        await deleteMedia(book.coverImage.public_id);
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
    const { title, author, isbn, publisher, genre, publicationYear, description, price, quantity } = req.body;
    
    const book = await Book.findById(id);
    
    if (!book) {
        return next(new ErrorHandler("Book not found", 404));
    }
    
    // Handle new cover image upload
    if (req.files?.coverImage) {
        // Delete old image if exists
        if (book.coverImage?.public_id) {
            await deleteMedia(book.coverImage.public_id);
        }
        
        // Upload new image
        const coverImage = await uploadMedia(req.files.coverImage, "library-app/books");
        book.coverImage = coverImage;
    }
    
    if (title) book.title = title;
    if (author) book.author = author;
    if (isbn) book.isbn = isbn;
    if (publisher) book.publisher = publisher;
    if (genre) book.genre = genre;
    if (publicationYear) book.publicationYear = parseInt(publicationYear);
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