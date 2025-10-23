import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";
import { Book } from "../models/bookModel.js";
import { Borrow } from "../models/borrowModel.js";

// Get book recommendations based on user's borrowing history (genre, author, random)
export const getBookRecommendations = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;

    try {
        // Get user's borrowing history
        const userBorrows = await Borrow.find({
            "user.id": userId
        })
        .populate('book')
        .sort({ borrowDate: -1 })
        .limit(10); // Look at last 10 borrows

        const borrowedBookIds = userBorrows.map(b => b.book?._id).filter(Boolean);
        let recommendedBooks = [];
        let recommendationBasis = [];

        if (userBorrows.length > 0 && userBorrows[0].book) {
            const latestBook = userBorrows[0].book;
            
            // Step 1: Find books by same author (excluding already borrowed)
            if (latestBook.author) {
                const authorBooks = await Book.find({
                    author: latestBook.author,
                    availability: true,
                    _id: { $nin: borrowedBookIds }
                })
                .limit(2);
                recommendedBooks.push(...authorBooks);
                if (authorBooks.length > 0) {
                    recommendationBasis.push(`author: ${latestBook.author}`);
                }
            }

            // Step 2: Find books from same genre (excluding already borrowed and already recommended)
            if (latestBook.genre && recommendedBooks.length < 4) {
                const genreBooks = await Book.find({
                    genre: latestBook.genre,
                    availability: true,
                    _id: { 
                        $nin: [
                            ...borrowedBookIds,
                            ...recommendedBooks.map(b => b._id)
                        ]
                    }
                })
                .limit(4 - recommendedBooks.length);
                recommendedBooks.push(...genreBooks);
                if (genreBooks.length > 0) {
                    recommendationBasis.push(`genre: ${latestBook.genre}`);
                }
            }
        }

        // Step 3: Fill remaining slots with random available books
        if (recommendedBooks.length < 4) {
            const randomBooks = await Book.aggregate([
                {
                    $match: {
                        availability: true,
                        _id: {
                            $nin: [
                                ...borrowedBookIds,
                                ...recommendedBooks.map(b => b._id)
                            ]
                        }
                    }
                },
                { $sample: { size: 4 - recommendedBooks.length } }
            ]);
            recommendedBooks.push(...randomBooks);
            if (randomBooks.length > 0) {
                recommendationBasis.push('random selection');
            }
        }

        // If still no books, just get any available books
        if (recommendedBooks.length === 0) {
            recommendedBooks = await Book.find({ availability: true })
                .limit(4);
            recommendationBasis = ['popular books'];
        }

        res.status(200).json({
            success: true,
            recommendations: recommendedBooks,
            basedOn: recommendationBasis.length > 0 
                ? recommendationBasis.join(', ') 
                : 'popular books',
            message: userBorrows.length > 0 && userBorrows[0].book
                ? `Recommendations based on "${userBorrows[0].book.title}"`
                : "Popular books for you"
        });

    } catch (error) {
        console.error("Error getting recommendations:", error);
        return next(new ErrorHandler("Failed to get book recommendations", 500));
    }
});
