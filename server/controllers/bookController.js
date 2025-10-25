import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Book } from "../models/bookModel.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";
import { uploadMedia, deleteMedia } from "../utils/mediaUploader.js";
import { invalidateCache } from "../utils/cache.js";

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
        availability: quantity > 0,
        coverImage
    });

    // Invalidate book list cache
    invalidateCache('/api/v1/book/all');

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
    
    // Invalidate book list cache
    invalidateCache('/api/v1/book/all');
    
    res.status(200).json({
        success: true,
        message: "Book deleted successfully"
    });
});

export const getAllBooks = catchAsyncErrors(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query object for filtering
    const query = {};
    if (req.query.genre) query.genre = req.query.genre;
    if (req.query.availability) query.availability = req.query.availability === 'true';
    if (req.query.search) {
        query.$text = { $search: req.query.search };
    }
    
    // Run queries in parallel for better performance
    const [books, totalBooks] = await Promise.all([
        Book.find(query)
            .select('title author isbn genre price quantity availability coverImage createdAt') // Only fetch needed fields
            .sort({ createdAt: -1 }) // Use indexed field for sorting
            .skip(skip)
            .limit(limit)
            .lean(), // Return plain JavaScript objects (faster)
        Book.countDocuments(query)
    ]);
    
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
    const oldQuantity = book.quantity;
    if (quantity) book.quantity = quantity;
    
    // Update availability based on quantity
    book.availability = book.quantity > 0;
    
    await book.save();
    
    // Invalidate book list cache
    invalidateCache('/api/v1/book/all');
    
    // Trigger auto-allocation if quantity increased from 0
    if (oldQuantity === 0 && book.quantity > 0) {
        const { autoAllocateBooks } = await import("../services/autoAllocationService.js");
        await autoAllocateBooks(book._id);
    }
    
    res.status(200).json({
        success: true,
        message: "Book updated successfully",
        book
    });
});