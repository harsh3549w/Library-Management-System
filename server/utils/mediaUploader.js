import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { ErrorHandler } from '../middlewares/errorMiddlewares.js';

export const uploadMedia = async (file, folder, resourceType = 'auto') => {
  try {
    if (!file || !file.tempFilePath) {
      throw new ErrorHandler("Invalid file upload", 400);
    }
    
    const uploadOptions = {
      folder,
      resource_type: resourceType,
      unsigned: true,
      upload_preset: 'library_app_unsigned' // Create this in Cloudinary dashboard
    };
    
    const result = await cloudinary.uploader.upload(file.tempFilePath, uploadOptions);
    
    if (!result || !result.secure_url) {
      throw new ErrorHandler("Cloudinary upload failed", 500);
    }
    
    fs.unlinkSync(file.tempFilePath);
    
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    if (file?.tempFilePath && fs.existsSync(file.tempFilePath)) {
      fs.unlinkSync(file.tempFilePath);
    }
    
    if (error instanceof ErrorHandler) throw error;
    throw new ErrorHandler("Media upload failed. Please try again.", 500);
  }
};

export const deleteMedia = async (publicId) => {
  try {
    if (!publicId) return;
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result?.result !== 'ok') {
      throw new ErrorHandler("Failed to delete media from Cloudinary", 500);
    }
    
    return result;
  } catch (error) {
    if (error instanceof ErrorHandler) throw error;
    throw new ErrorHandler("Media deletion failed", 500);
  }
};
