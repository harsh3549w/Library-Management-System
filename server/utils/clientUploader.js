import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

export const getClientImagesFromCloudinary = async () => {
  try {
    const { resources } = await cloudinary.search
      .expression('folder:library-app/client-images')
      .sort_by('public_id', 'desc')
      .max_results(30)
      .execute();

    return resources.map(file => file.secure_url);
  } catch (error) {
    console.error('Failed to fetch client images from Cloudinary:', error);
    throw new Error('Failed to fetch client images');
  }
};
