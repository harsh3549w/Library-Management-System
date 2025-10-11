import { BookSuggestion } from "../models/bookSuggestionModel.js";
import { Book } from "../models/bookModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";

// Create a new book suggestion
export const createSuggestion = catchAsyncErrors(async (req, res, next) => {
  const { title, author, description, isbn, category } = req.body;

  if (!title || !author || !description || !category) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  // Check if user already suggested this book
  const existingSuggestion = await BookSuggestion.findOne({
    title: { $regex: new RegExp(`^${title}$`, 'i') },
    author: { $regex: new RegExp(`^${author}$`, 'i') },
    "suggestedBy.id": req.user._id
  });

  if (existingSuggestion) {
    return next(new ErrorHandler("You have already suggested this book", 400));
  }

  const suggestion = await BookSuggestion.create({
    title,
    author,
    description,
    isbn,
    category,
    suggestedBy: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
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

  const userVoteIndex = suggestion.votes.indexOf(req.user._id);

  if (userVoteIndex > -1) {
    // User already voted, remove vote
    suggestion.votes.splice(userVoteIndex, 1);
    suggestion.voteCount = Math.max(0, suggestion.voteCount - 1);
  } else {
    // Add vote
    suggestion.votes.push(req.user._id);
    suggestion.voteCount += 1;
  }

  await suggestion.save();

  res.status(200).json({
    success: true,
    message: userVoteIndex > -1 ? "Vote removed" : "Vote added",
    voteCount: suggestion.voteCount,
    hasVoted: userVoteIndex === -1
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

