import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";
import { Book } from "../models/bookModel.js";
import { Borrow } from "../models/borrowModel.js";

// Get book recommendations based on user's latest borrowed book genre
export const getBookRecommendations = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;

    try {
        // Get user's latest borrowed book
        const latestBorrow = await Borrow.findOne({
            "user.id": userId,
            returnDate: null // Only active borrows
        })
        .populate('book')
        .sort({ borrowDate: -1 }); // Get the most recent borrow

        if (!latestBorrow || !latestBorrow.book) {
            // If user has no borrowed books, return popular books
            const popularBooks = await Book.find({ availability: true })
                .sort({ createdAt: -1 })
                .limit(4);
            
            return res.status(200).json({
                success: true,
                recommendations: popularBooks,
                message: "Popular books recommendation"
            });
        }

        const latestBook = latestBorrow.book;
        const userGenre = latestBook.genre;

        if (!userGenre) {
            // If latest book has no genre, return popular books
            const popularBooks = await Book.find({ availability: true })
                .sort({ createdAt: -1 })
                .limit(4);
            
            return res.status(200).json({
                success: true,
                recommendations: popularBooks,
                message: "Popular books recommendation"
            });
        }

        // Find books from the same genre, excluding the user's current borrowed book
        const recommendedBooks = await Book.find({
            genre: userGenre,
            availability: true,
            _id: { $ne: latestBook._id } // Exclude the book user already has
        })
        .sort({ createdAt: -1 })
        .limit(4);

        // If we don't have enough books from the same genre, fill with popular books
        if (recommendedBooks.length < 4) {
            const additionalBooks = await Book.find({
                availability: true,
                _id: { 
                    $nin: [
                        latestBook._id,
                        ...recommendedBooks.map(book => book._id)
                    ]
                }
            })
            .sort({ createdAt: -1 })
            .limit(4 - recommendedBooks.length);

            recommendedBooks.push(...additionalBooks);
        }

        res.status(200).json({
            success: true,
            recommendations: recommendedBooks,
            basedOn: {
                book: latestBook.title,
                genre: userGenre
            },
            message: `Books similar to "${latestBook.title}"`
        });

    } catch (error) {
        console.error("Error getting recommendations:", error);
        return next(new ErrorHandler("Failed to get book recommendations", 500));
    }
});
