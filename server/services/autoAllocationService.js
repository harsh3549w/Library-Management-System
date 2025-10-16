import { Borrow } from "../models/borrowModel.js";
import { Book } from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import { Reservation } from "../models/reservationModel.js";
import { createTransaction } from "../controllers/transactionController.js";
import { sendEmail } from "../utils/emailService.js";

// Automated book allocation service
export const autoAllocateBooks = async (bookId) => {
  try {
    console.log(`Starting auto-allocation for book: ${bookId}`);
    
    const book = await Book.findById(bookId);
    if (!book || book.quantity <= 0) {
      console.log(`Book ${bookId} not available for allocation`);
      return;
    }

    // Get active reservations for this book, ordered by creation date (first-come-first-served)
    const activeReservations = await Reservation.find({
      book: bookId,
      status: 'active'
    })
      .populate('book')
      .sort({ createdAt: 1 }); // Oldest first

    console.log(`Found ${activeReservations.length} active reservations for book ${bookId}`);

    let allocatedCount = 0;
    const maxAllocations = book.quantity; // Don't allocate more than available

    for (const reservation of activeReservations) {
      if (allocatedCount >= maxAllocations) {
        console.log(`Reached maximum allocations (${maxAllocations}) for book ${bookId}`);
        break;
      }

      try {
        // Get the user
        const user = await User.findById(reservation.user.id);
        if (!user) {
          console.log(`User ${reservation.user.id} not found, skipping reservation`);
          continue;
        }

        // Check if user has unpaid fines
        if (user.fineBalance > 0) {
          console.log(`User ${user.name} has unpaid fines (₹${user.fineBalance}), skipping allocation`);
          // Send notification about fine requirement
          await sendEmail({
            email: user.email,
            subject: "Book Available - Payment Required",
            message: `Hello ${user.name},\n\nThe book "${book.title}" that you reserved is now available, but you have an outstanding fine balance of ₹${user.fineBalance.toFixed(2)}.\n\nPlease pay your fines first, then the book will be automatically allocated to you.\n\nBest regards,\nLibrary Team`
          });
          continue;
        }

        // Check if user already has this book borrowed
        const existingBorrow = await Borrow.findOne({
          "user.id": user._id,
          book: bookId,
          returnDate: null
        });

        if (existingBorrow) {
          console.log(`User ${user.name} already has this book borrowed, skipping allocation`);
          // Mark reservation as fulfilled since user already has the book
          reservation.status = 'fulfilled';
          reservation.fulfilledAt = new Date();
          await reservation.save();
          continue;
        }

        // Allocate the book (borrow it for the user)
        const dueDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes for testing

        const borrow = await Borrow.create({
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          },
          book: bookId,
          dueDate,
          price: book.price
        });

        // Decrease book quantity
        book.quantity -= 1;
        book.availability = book.quantity > 0;
        await book.save();

        // Mark reservation as fulfilled
        reservation.status = 'fulfilled';
        reservation.fulfilledAt = new Date();
        await reservation.save();

        // Create transaction record
        await createTransaction({
          type: 'borrow',
          user: user._id,
          book: bookId,
          amount: 0,
          description: `Auto-allocated "${book.title}" via reservation queue`,
          metadata: {
            borrowId: borrow._id,
            reservationId: reservation._id,
            dueDate: dueDate,
            autoAllocated: true
          }
        });

        // Send notification to user
        await sendEmail({
          email: user.email,
          subject: "Book Auto-Allocated - Ready for Pickup",
          message: `Hello ${user.name},\n\nGreat news! The book "${book.title}" that you reserved has been automatically allocated to you.\n\nDue Date: ${dueDate.toLocaleDateString()}\n\nPlease visit the library to collect your book.\n\nBest regards,\nLibrary Team`
        });

        console.log(`Successfully auto-allocated book "${book.title}" to user ${user.name}`);
        allocatedCount++;

      } catch (error) {
        console.error(`Error allocating book to user ${reservation.user.name}:`, error);
        // Continue with next reservation even if one fails
      }
    }

    console.log(`Auto-allocation completed for book ${bookId}. Allocated ${allocatedCount} books.`);

  } catch (error) {
    console.error(`Error in auto-allocation for book ${bookId}:`, error);
  }
};

// Check and process all books that might need allocation
export const processAllocationQueue = async () => {
  try {
    console.log('Processing allocation queue...');
    
    // Find all books with available quantity and active reservations
    const booksWithReservations = await Book.aggregate([
      {
        $match: {
          quantity: { $gt: 0 },
          availability: true
        }
      },
      {
        $lookup: {
          from: 'reservations',
          let: { bookId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$book', '$$bookId'] },
                    { $eq: ['$status', 'active'] }
                  ]
                }
              }
            }
          ],
          as: 'reservations'
        }
      },
      {
        $match: {
          'reservations.0': { $exists: true } // Has at least one active reservation
        }
      }
    ]);

    console.log(`Found ${booksWithReservations.length} books with available copies and active reservations`);

    for (const book of booksWithReservations) {
      await autoAllocateBooks(book._id);
    }

    console.log('Allocation queue processing completed');
  } catch (error) {
    console.error('Error processing allocation queue:', error);
  }
};
