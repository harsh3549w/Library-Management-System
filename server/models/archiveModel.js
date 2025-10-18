import mongoose from "mongoose";

const archiveSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Description is required"]
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: [
      "Research Papers",
      "Thesis",
      "Dissertations",
      "Conference Papers",
      "Journals",
      "Reports",
      "Presentations",
      "Other"
    ]
  },
  fileType: {
    type: String,
    required: true,
    default: "pdf"
  },
  fileUrl: {
    type: String,
    required: [true, "File URL is required"]
  },
  publicId: {
    type: String,
    required: false // S3 file path or ETag
  },
  provider: {
    type: String,
    enum: ['s3'],
    default: 's3'
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadedBy: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  accessLevel: {
    type: String,
    enum: ["public", "restricted"],
    default: "public"
  },
  author: {
    type: String,
    trim: true
  },
  publishedYear: {
    type: Number
  }
}, { timestamps: true });

// Index for faster searches
archiveSchema.index({ title: 'text', description: 'text', tags: 'text' });
archiveSchema.index({ category: 1, createdAt: -1 });
archiveSchema.index({ "uploadedBy.id": 1 });

export const Archive = mongoose.model("Archive", archiveSchema);

