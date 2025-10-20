import mongoose from 'mongoose'

const bookDonationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Book title is required']
  },
  author: {
    type: String,
    required: [true, 'Book author is required']
  },
  isbn: {
    type: String,
    required: false
  },
  publicationYear: {
    type: Number,
    required: false
  },
  genre: {
    type: String,
    required: false
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    required: [true, 'Book condition is required'],
    default: 'Good'
  },
  description: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    required: false
  },
  processedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  processedAt: {
    type: Date,
    required: false
  },
  donatedBook: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: false
  }
}, {
  timestamps: true
})

// Index for better query performance
bookDonationSchema.index({ user: 1, status: 1 })
bookDonationSchema.index({ status: 1, createdAt: -1 })

const BookDonation = mongoose.model('BookDonation', bookDonationSchema)

export default BookDonation
