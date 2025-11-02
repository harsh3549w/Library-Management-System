import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    isbn: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    publisher: {
        type: String,
        trim: true
    },
    genre: {
        type: String,
        trim: true
    },
    publicationYear: {
        type: Number,
        min: 1000,
        max: new Date().getFullYear() + 1
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    availability: {
        type: Boolean,
        default: true
    },
    coverImage: {
        public_id: {
            type: String
        },
        url: {
            type: String
        }
    }
}, { timestamps: true });

// Pre-save hook to automatically update availability based on quantity
bookSchema.pre('save', function(next) {
  this.availability = this.quantity > 0;
  next();
});

// Performance indexes for high-traffic scenarios
// Note: Unique ISBN index is already created via the schema field (unique: true, sparse: true)
// so we avoid defining a duplicate plain index on { isbn: 1 } to prevent duplicate index warnings.
bookSchema.index({ createdAt: -1 }); // Sort by newest books
bookSchema.index({ title: 'text', author: 'text' }); // Full-text search on title and author
bookSchema.index({ genre: 1 }); // Filter by genre
bookSchema.index({ availability: 1 }); // Filter by availability

export const Book = mongoose.model("Book", bookSchema);