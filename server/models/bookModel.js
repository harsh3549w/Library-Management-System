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

// Index for ISBN lookups
bookSchema.index({ isbn: 1 });

export const Book = mongoose.model("Book", bookSchema);