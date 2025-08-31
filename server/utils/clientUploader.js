import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

export const uploadClientImages = async () => {
  try {
    const imageDir = path.join(process.cwd(), '../client/image_slider_main');
    const files = fs.readdirSync(imageDir);
    
    const uploadResults = [];
    
    for (const file of files) {
      if (['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase())) {
        const filePath = path.join(imageDir, file);
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'library-app/client-images',
          use_filename: true,
          unique_filename: false,
          overwrite: true,
          unsigned: true,
          upload_preset: 'library_app_unsigned'
        });
        uploadResults.push(result.secure_url);
      }
    }
    
    return uploadResults;
  } catch (error) {
    console.error('Client image upload failed:', error);
    throw error;
  }
};
