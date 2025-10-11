import { Archive } from "../models/archiveModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { ErrorHandler } from "../middlewares/errorMiddlewares.js";
import { uploadMedia, deleteMedia } from "../utils/mediaUploader.js";

// Upload archive
export const uploadArchive = catchAsyncErrors(async (req, res, next) => {
  if (!req.files?.file) {
    return next(new ErrorHandler("Please upload a file", 400));
  }

  const { title, description, category, tags, accessLevel, author, publishedYear } = req.body;

  if (!title || !description || !category) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const file = req.files.file;

  // Validate file type (PDF only)
  const allowedTypes = ['application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    return next(new ErrorHandler("Only PDF files are allowed", 400));
  }

  // Validate file size (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return next(new ErrorHandler("File size should not exceed 50MB", 400));
  }

  // Upload to Cloudinary
  const uploadResult = await uploadMedia(file, "library-app/archives", "raw");

  // Parse tags if provided as string
  let tagsArray = [];
  if (tags) {
    tagsArray = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
  }

  const archive = await Archive.create({
    title,
    description,
    category,
    fileType: file.mimetype.split('/')[1],
    fileUrl: uploadResult.url,
    publicId: uploadResult.public_id,
    fileSize: file.size,
    uploadedBy: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    },
    tags: tagsArray,
    accessLevel: accessLevel || 'public',
    author,
    publishedYear: publishedYear ? parseInt(publishedYear) : undefined
  });

  res.status(201).json({
    success: true,
    message: "Archive uploaded successfully",
    archive
  });
});

// Get all archives with filters
export const getAllArchives = catchAsyncErrors(async (req, res, next) => {
  const { category, search, sortBy = 'recent' } = req.query;

  const query = {};

  // Filter by category
  if (category && category !== 'all') {
    query.category = category;
  }

  // Search in title, description, and tags
  if (search) {
    query.$text = { $search: search };
  }

  // Sort options
  const sortOptions = {
    recent: { createdAt: -1 },
    oldest: { createdAt: 1 },
    popular: { downloads: -1 },
    views: { views: -1 }
  };

  const archives = await Archive.find(query)
    .sort(sortOptions[sortBy] || sortOptions.recent);

  res.status(200).json({
    success: true,
    count: archives.length,
    archives
  });
});

// Get single archive by ID
export const getArchiveById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const archive = await Archive.findById(id);
  if (!archive) {
    return next(new ErrorHandler("Archive not found", 404));
  }

  // Increment views
  archive.views += 1;
  await archive.save();

  res.status(200).json({
    success: true,
    archive
  });
});

// Download archive (increment download count)
export const downloadArchive = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const archive = await Archive.findById(id);
  if (!archive) {
    return next(new ErrorHandler("Archive not found", 404));
  }

  // Increment downloads
  archive.downloads += 1;
  await archive.save();

  res.status(200).json({
    success: true,
    message: "Download count updated",
    fileUrl: archive.fileUrl
  });
});

// Delete archive
export const deleteArchive = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const archive = await Archive.findById(id);
  if (!archive) {
    return next(new ErrorHandler("Archive not found", 404));
  }

  // Check if user is admin or the uploader
  if (req.user.role !== 'Admin' && archive.uploadedBy.id.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to delete this archive", 403));
  }

  // Delete from Cloudinary
  try {
    await deleteMedia(archive.publicId);
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
  }

  await archive.deleteOne();

  res.status(200).json({
    success: true,
    message: "Archive deleted successfully"
  });
});

// Search archives
export const searchArchives = catchAsyncErrors(async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return next(new ErrorHandler("Please provide a search query", 400));
  }

  const archives = await Archive.find({
    $text: { $search: query }
  }).sort({ score: { $meta: "textScore" } });

  res.status(200).json({
    success: true,
    count: archives.length,
    archives
  });
});

// Get archive statistics
export const getArchiveStats = catchAsyncErrors(async (req, res, next) => {
  const totalArchives = await Archive.countDocuments();
  const totalDownloads = await Archive.aggregate([
    { $group: { _id: null, total: { $sum: '$downloads' } } }
  ]);
  const totalViews = await Archive.aggregate([
    { $group: { _id: null, total: { $sum: '$views' } } }
  ]);

  // Category breakdown
  const categoryStats = await Archive.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 }, downloads: { $sum: '$downloads' } } },
    { $sort: { count: -1 } }
  ]);

  // Most popular archives
  const popularArchives = await Archive.find()
    .sort({ downloads: -1 })
    .limit(10)
    .select('title category downloads views createdAt');

  res.status(200).json({
    success: true,
    stats: {
      total: totalArchives,
      totalDownloads: totalDownloads[0]?.total || 0,
      totalViews: totalViews[0]?.total || 0,
      categoryStats,
      popularArchives
    }
  });
});

