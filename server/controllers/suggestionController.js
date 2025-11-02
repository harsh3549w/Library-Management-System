import { BookSuggestion } from "../models/bookSuggestionModel.js";
import { Book } from "../models/bookModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";
import { sendEmail } from "../utils/emailService.js";

// Create a new book suggestion
export const createSuggestion = catchAsyncErrors(async (req, res, next) => {
  const { title, author, description, isbn, category } = req.body;

  if (!title || !author || !description || !category) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  // Normalize inputs for case-insensitive matching
  const normTitle = title.trim();
  const normAuthor = author.trim();

  // If a suggestion for the same book already exists (by anyone),
  // add the current user's vote to it instead of blocking creation.
  // This avoids duplicate documents and also sidesteps any unique index on title+author.
  let existingByBook = await BookSuggestion.findOne({
    title: { $regex: new RegExp(`^${normTitle}$`, 'i') },
    author: { $regex: new RegExp(`^${normAuthor}$`, 'i') },
    status: 'pending'
  });

  if (existingByBook) {
    // If the same user already suggested this exact book, keep original error
    if (existingByBook.suggestedBy?.id?.toString() === req.user._id.toString()) {
      return next(new ErrorHandler("You have already suggested this book", 400));
    }

    // Ensure the current user has an upvote on the existing suggestion
    const alreadyVoted = existingByBook.votes.some(v => v.toString() === req.user._id.toString());
    if (!alreadyVoted) {
      existingByBook.votes.push(req.user._id);
      existingByBook.voteCount = (existingByBook.voteCount || 0) + 1;
      await existingByBook.save();
    }

    return res.status(200).json({
      success: true,
      message: "This book is already suggested. We've added your vote to it.",
      suggestion: existingByBook
    });
  }

  // Create a fresh suggestion and count the suggester's support as the first vote
  const suggestion = await BookSuggestion.create({
    title: normTitle,
    author: normAuthor,
    description,
    isbn,
    category,
    suggestedBy: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    },
    votes: [req.user._id],
    voteCount: 1
  });

  res.status(201).json({
    success: true,
    message: "Book suggestion created successfully",
    suggestion
  });
});

// Get all suggestions (with filters)
export const getAllSuggestions = catchAsyncErrors(async (req, res, next) => {
  const { status, sortBy = 'voteCount' } = req.query;
  
  const query = {};
  if (status && status !== 'all') {
    query.status = status;
  }

  const sortOptions = {
    voteCount: { voteCount: -1, createdAt: -1 },
    recent: { createdAt: -1 },
    oldest: { createdAt: 1 }
  };

  const suggestions = await BookSuggestion.find(query)
    .sort(sortOptions[sortBy] || sortOptions.voteCount)
    .populate('approvedBy', 'name email');

  res.status(200).json({
    success: true,
    count: suggestions.length,
    suggestions
  });
});

// Get user's own suggestions
export const getMySuggestions = catchAsyncErrors(async (req, res, next) => {
  const suggestions = await BookSuggestion.find({
    "suggestedBy.id": req.user._id
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: suggestions.length,
    suggestions
  });
});

// Vote for a suggestion (toggle)
export const voteForSuggestion = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const suggestion = await BookSuggestion.findById(id);
  if (!suggestion) {
    return next(new ErrorHandler("Suggestion not found", 404));
  }

  if (suggestion.status !== 'pending') {
    return next(new ErrorHandler("Cannot vote on this suggestion", 400));
  }

  const userIdStr = req.user._id.toString();
  const hasVoted = suggestion.votes.some(v => v.toString() === userIdStr);

  if (hasVoted) {
    // Remove vote
    suggestion.votes = suggestion.votes.filter(v => v.toString() !== userIdStr);
    suggestion.voteCount = Math.max(0, (suggestion.voteCount || 0) - 1);
  } else {
    // Add vote
    suggestion.votes.push(req.user._id);
    suggestion.voteCount = (suggestion.voteCount || 0) + 1;
  }

  await suggestion.save();

  res.status(200).json({
    success: true,
    message: hasVoted ? "Vote removed" : "Vote added",
    voteCount: suggestion.voteCount,
    hasVoted: !hasVoted
  });
});

// Approve suggestion and create book
export const approveSuggestion = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { price, quantity, adminNotes } = req.body;

  if (!price || !quantity) {
    return next(new ErrorHandler("Please provide price and quantity", 400));
  }

  const suggestion = await BookSuggestion.findById(id);
  if (!suggestion) {
    return next(new ErrorHandler("Suggestion not found", 404));
  }

  if (suggestion.status !== 'pending') {
    return next(new ErrorHandler("Suggestion already processed", 400));
  }

  // Create book from suggestion
  const book = await Book.create({
    title: suggestion.title,
    author: suggestion.author,
    description: suggestion.description,
    price,
    quantity,
    availability: quantity > 0
  });

  // Update suggestion status
  suggestion.status = 'approved';
  suggestion.approvedBy = req.user._id;
  suggestion.approvedAt = new Date();
  suggestion.adminNotes = adminNotes || '';
  await suggestion.save();

  // Send approval email to suggester
  try {
    await sendEmail({
      email: suggestion.suggestedBy.email,
      subject: '✅ Book Suggestion Approved - IIIT Kurnool Library',
      message: `Dear ${suggestion.suggestedBy.name},

Great news! Your book suggestion has been approved and added to our library.

📚 Book Details:
Title: ${suggestion.title}
Author: ${suggestion.author}
Category: ${suggestion.category}

✅ Status: APPROVED
📅 Approved On: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
💰 Price: ₹${price}
📦 Quantity Added: ${quantity} ${quantity > 1 ? 'copies' : 'copy'}

${adminNotes ? `📝 Admin Notes:\n${adminNotes}\n\n` : ''}Thank you for your valuable contribution to our library! This book is now available for all students and faculty to borrow.

You can search for it in the Books section of the library system.

Best regards,
IIIT Kurnool Library Team`
    });
    console.log(`Approval email sent to ${suggestion.suggestedBy.email}`);
  } catch (emailError) {
    console.error(`Failed to send approval email to ${suggestion.suggestedBy.email}:`, emailError.message);
    // Don't fail the approval if email fails
  }

  res.status(200).json({
    success: true,
    message: "Suggestion approved and book added to library",
    book,
    suggestion
  });
});

// Reject suggestion
export const rejectSuggestion = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { adminNotes } = req.body;

  const suggestion = await BookSuggestion.findById(id);
  if (!suggestion) {
    return next(new ErrorHandler("Suggestion not found", 404));
  }

  if (suggestion.status !== 'pending') {
    return next(new ErrorHandler("Suggestion already processed", 400));
  }

  suggestion.status = 'rejected';
  suggestion.approvedBy = req.user._id;
  suggestion.rejectedAt = new Date();
  suggestion.adminNotes = adminNotes || 'Rejected by admin';
  await suggestion.save();

  // Send rejection email to suggester
  try {
    await sendEmail({
      email: suggestion.suggestedBy.email,
      subject: '📋 Book Suggestion Update - IIIT Kurnool Library',
      message: `Dear ${suggestion.suggestedBy.name},

Thank you for your book suggestion. After careful consideration, we regret to inform you that your suggestion has not been approved at this time.

📚 Book Details:
Title: ${suggestion.title}
Author: ${suggestion.author}
Category: ${suggestion.category}

❌ Status: NOT APPROVED
📅 Reviewed On: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

📝 Reason:
${adminNotes || 'The suggestion does not meet our current acquisition criteria.'}

We appreciate your interest in improving our library collection. Please feel free to submit other suggestions in the future. We consider various factors including:
• Budget constraints
• Collection development policies
• Availability from vendors
• Relevance to curriculum
• Existing collection duplicates

Your participation in building our library is valued!

Best regards,
IIIT Kurnool Library Team`
    });
    console.log(`Rejection email sent to ${suggestion.suggestedBy.email}`);
  } catch (emailError) {
    console.error(`Failed to send rejection email to ${suggestion.suggestedBy.email}:`, emailError.message);
    // Don't fail the rejection if email fails
  }

  res.status(200).json({
    success: true,
    message: "Suggestion rejected",
    suggestion
  });
});

// Delete suggestion (admin only, for cleanup)
export const deleteSuggestion = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const suggestion = await BookSuggestion.findById(id);
  if (!suggestion) {
    return next(new ErrorHandler("Suggestion not found", 404));
  }

  await suggestion.deleteOne();

  res.status(200).json({
    success: true,
    message: "Suggestion deleted successfully"
  });
});

// Get voting statistics
export const getVotingStats = catchAsyncErrors(async (req, res, next) => {
  const totalSuggestions = await BookSuggestion.countDocuments();
  const pendingSuggestions = await BookSuggestion.countDocuments({ status: 'pending' });
  const approvedSuggestions = await BookSuggestion.countDocuments({ status: 'approved' });
  const rejectedSuggestions = await BookSuggestion.countDocuments({ status: 'rejected' });

  // Top voted suggestions
  const topVoted = await BookSuggestion.find({ status: 'pending' })
    .sort({ voteCount: -1 })
    .limit(10)
    .select('title author voteCount category createdAt');

  // Category breakdown
  const categoryStats = await BookSuggestion.aggregate([
    { $match: { status: 'pending' } },
    { $group: { _id: '$category', count: { $sum: 1 }, totalVotes: { $sum: '$voteCount' } } },
    { $sort: { totalVotes: -1 } }
  ]);

  res.status(200).json({
    success: true,
    stats: {
      total: totalSuggestions,
      pending: pendingSuggestions,
      approved: approvedSuggestions,
      rejected: rejectedSuggestions,
      topVoted,
      categoryStats
    }
  });
});

