import BookDonation from '../models/bookDonationModel.js'
import { Book } from '../models/bookModel.js'
import { User } from '../models/userModel.js'
import { ErrorHandler } from '../middlewares/errorMiddlewares.js'
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js'
import { sendEmail } from '../utils/sendEmail.js'

// User: Create donation request
export const createDonationRequest = catchAsyncErrors(async (req, res, next) => {
  const { title, author, isbn, publicationYear, genre, condition, description } = req.body

  const donationRequest = await BookDonation.create({
    user: req.user._id,
    title,
    author,
    isbn,
    publicationYear,
    genre,
    condition,
    description
  })

  res.status(201).json({
    success: true,
    message: 'Book donation request submitted successfully',
    donationRequest
  })
})

// User: Get user's donation requests
export const getUserDonations = catchAsyncErrors(async (req, res, next) => {
  const donations = await BookDonation.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('processedBy', 'name email')
    .populate('donatedBook', 'title author')

  res.status(200).json({
    success: true,
    donations
  })
})

// Admin: Get all donation requests
export const getAllDonations = catchAsyncErrors(async (req, res, next) => {
  const { status = 'all', page = 1, limit = 10 } = req.query

  let filter = {}
  if (status !== 'all') {
    filter.status = status
  }

  const skip = (page - 1) * limit

  const donations = await BookDonation.find(filter)
    .populate('user', 'name email')
    .populate('processedBy', 'name email')
    .populate('donatedBook', 'title author')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))

  const total = await BookDonation.countDocuments(filter)

  res.status(200).json({
    success: true,
    donations,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page)
  })
})

// Admin: Get donation statistics
export const getDonationStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await BookDonation.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ])

  const totalDonations = await BookDonation.countDocuments()
  const pendingDonations = await BookDonation.countDocuments({ status: 'pending' })
  const approvedDonations = await BookDonation.countDocuments({ status: 'approved' })
  const rejectedDonations = await BookDonation.countDocuments({ status: 'rejected' })
  const completedDonations = await BookDonation.countDocuments({ status: 'completed' })

  res.status(200).json({
    success: true,
    stats: {
      total: totalDonations,
      pending: pendingDonations,
      approved: approvedDonations,
      rejected: rejectedDonations,
      completed: completedDonations,
      byStatus: stats
    }
  })
})

// Admin: Approve donation request
export const approveDonation = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params
  const { adminNotes } = req.body

  const donation = await BookDonation.findById(id)
  if (!donation) {
    return next(new ErrorHandler('Donation request not found', 404))
  }

  if (donation.status !== 'pending') {
    return next(new ErrorHandler('Donation request has already been processed', 400))
  }

  // Create the book in the library
  const newBook = await Book.create({
    title: donation.title,
    author: donation.author,
    isbn: donation.isbn,
    publicationYear: donation.publicationYear,
    genre: donation.genre,
    quantity: 1,
    availableQuantity: 1,
    price: 0, // Donated books are free
    description: donation.description || `Donated book - Condition: ${donation.condition}`,
    addedBy: req.user._id
  })

  // Update donation status
  donation.status = 'approved'
  donation.adminNotes = adminNotes
  donation.processedBy = req.user._id
  donation.processedAt = new Date()
  donation.donatedBook = newBook._id
  await donation.save()

  // Send email notification to user
  const user = await User.findById(donation.user)
  if (user && user.email) {
    try {
      await sendEmail({
        email: user.email,
        subject: 'Book Donation Request Approved',
        message: `Dear ${user.name},\n\nGreat news! Your book donation request for "${donation.title}" by ${donation.author} has been approved and added to the library.\n\nBook Details:\n• Title: ${donation.title}\n• Author: ${donation.author}\n• ISBN: ${donation.isbn || 'N/A'}\n• Condition: ${donation.condition}\n\n${adminNotes ? `Admin Notes: ${adminNotes}\n\n` : ''}Thank you for your generous contribution to the library!\n\nBest regards,\nLibrary Team`
      })
    } catch (error) {
      console.error('Failed to send approval email:', error)
    }
  }

  res.status(200).json({
    success: true,
    message: 'Donation request approved and book added to library',
    donation,
    book: newBook
  })
})

// Admin: Reject donation request
export const rejectDonation = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params
  const { adminNotes } = req.body

  const donation = await BookDonation.findById(id)
  if (!donation) {
    return next(new ErrorHandler('Donation request not found', 404))
  }

  if (donation.status !== 'pending') {
    return next(new ErrorHandler('Donation request has already been processed', 400))
  }

  // Update donation status
  donation.status = 'rejected'
  donation.adminNotes = adminNotes
  donation.processedBy = req.user._id
  donation.processedAt = new Date()
  await donation.save()

  // Send email notification to user
  const user = await User.findById(donation.user)
  if (user && user.email) {
    try {
      await sendEmail({
        email: user.email,
        subject: 'Book Donation Request Update',
        message: `Dear ${user.name},\n\nThank you for your interest in donating a book to our library. Unfortunately, we cannot accept your donation request for "${donation.title}" by ${donation.author} at this time.\n\n${adminNotes ? `Reason: ${adminNotes}\n\n` : ''}We appreciate your generosity and encourage you to submit other book donation requests in the future.\n\nBest regards,\nLibrary Team`
      })
    } catch (error) {
      console.error('Failed to send rejection email:', error)
    }
  }

  res.status(200).json({
    success: true,
    message: 'Donation request rejected',
    donation
  })
})

// Admin: Mark donation as completed (book physically received)
export const completeDonation = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params

  const donation = await BookDonation.findById(id)
  if (!donation) {
    return next(new ErrorHandler('Donation request not found', 404))
  }

  if (donation.status !== 'approved') {
    return next(new ErrorHandler('Only approved donations can be marked as completed', 400))
  }

  donation.status = 'completed'
  donation.processedBy = req.user._id
  donation.processedAt = new Date()
  await donation.save()

  res.status(200).json({
    success: true,
    message: 'Donation marked as completed',
    donation
  })
})

// Admin: Get single donation details
export const getDonationById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params

  const donation = await BookDonation.findById(id)
    .populate('user', 'name email')
    .populate('processedBy', 'name email')
    .populate('donatedBook', 'title author isbn')

  if (!donation) {
    return next(new ErrorHandler('Donation request not found', 404))
  }

  res.status(200).json({
    success: true,
    donation
  })
})

// User: Get single donation details
export const getUserDonationById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params

  const donation = await BookDonation.findOne({ _id: id, user: req.user._id })
    .populate('processedBy', 'name email')
    .populate('donatedBook', 'title author isbn')

  if (!donation) {
    return next(new ErrorHandler('Donation request not found', 404))
  }

  res.status(200).json({
    success: true,
    donation
  })
})
