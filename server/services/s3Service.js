import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { ErrorHandler } from '../middlewares/errorMiddlewares.js';
import { Readable } from 'stream';
import fs from 'fs';

// Get S3 Client instance
const getS3Client = () => {
  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
};

/**
 * Upload a PDF file to AWS S3
 * @param {Object} file - The file object from multer
 * @param {String} fileName - Custom filename (optional)
 * @returns {Object} - Upload result with URL and file info
 */
export const uploadToS3 = async (file, fileName = null) => {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new ErrorHandler('AWS S3 credentials not configured', 500);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.originalname || 'document.pdf';
    const extension = originalName.split('.').pop();
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    
    // If fileName is provided, use it but ensure it has the correct extension
    let finalFileName;
    if (fileName) {
      // Remove any existing extension from fileName and add the original extension
      const cleanFileName = fileName.replace(/\.[^/.]+$/, '');
      finalFileName = `${cleanFileName}_${timestamp}.${extension}`;
    } else {
      finalFileName = `${baseName}_${timestamp}.${extension}`;
    }
    
    // Ensure filename is URL-safe and has proper extension
    const safeFileName = finalFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    // Generate final filename
    
    // File object has 'data' property (from express-fileupload)
    let fileBody;
    if (file.buffer && file.buffer.length > 0) {
      fileBody = file.buffer;
    } else if (file.data && file.data.length > 0) {
      fileBody = file.data;
    } else {
      // Try to read from tempFilePath if available
      if (file.tempFilePath) {
        fileBody = fs.readFileSync(file.tempFilePath);
      } else {
        throw new ErrorHandler('No valid file data found', 400);
      }
    }

    // Upload parameters
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `archives/${safeFileName}`,
      Body: fileBody,
      ContentType: file.mimetype || 'application/pdf',
      ContentDisposition: 'inline', // Allow browser to display inline
      Metadata: {
        'original-name': file.originalname,
        'uploaded-by': 'library-system',
        'upload-time': new Date().toISOString()
      }
    };
    
    // Upload to S3 using Upload library
    const s3Client = getS3Client();
    const upload = new Upload({
      client: s3Client,
      params: {
        ...uploadParams,
        Body: fileBody
      }
    });
    
    const result = await upload.done();

    // Generate public URL
    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/archives/${safeFileName}`;

    return {
      success: true,
      url: fileUrl,
      fileName: safeFileName,
      filePath: `archives/${safeFileName}`,
      etag: result.ETag || result.$metadata?.requestId,
      size: file.size,
      provider: 's3'
    };
    
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new ErrorHandler(
      `Failed to upload to S3: ${error.message}`, 
      error.status || 500
    );
  }
};

/**
 * Delete a file from AWS S3
 * @param {String} fileName - Path to file in S3
 * @returns {Boolean} - Success status
 */
export const deleteFromS3 = async (fileName) => {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new ErrorHandler('AWS S3 credentials not configured', 500);
    }

    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
    };

    const s3Client = getS3Client();
    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);

    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new ErrorHandler(
      `Failed to delete from S3: ${error.message}`, 
      error.status || 500
    );
  }
};

/**
 * Check if S3 is properly configured
 * @returns {Object} - Configuration status
 */
export const checkS3Config = async () => {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET) {
      return {
        configured: false,
        error: 'AWS S3 credentials not set in environment variables'
      };
    }

    // Test S3 connection by trying to head the bucket
    const s3Client = getS3Client();
    const command = new HeadObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: 'test-connection'
    });

    try {
      await s3Client.send(command);
    } catch (error) {
      // If it's a 404, that's fine - bucket exists but test file doesn't
      if (error.name !== 'NotFound') {
        console.error('S3 connection test failed:', error.message);
        throw error;
      }
    }

    return {
      configured: true,
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION,
      url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`
    };
  } catch (error) {
    console.error('S3 configuration check failed:', error.message);
    return {
      configured: false,
      error: `S3 configuration error: ${error.message}`,
      details: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing',
        secretKey: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing',
        region: process.env.AWS_REGION || 'Missing',
        bucket: process.env.AWS_S3_BUCKET || 'Missing'
      }
    };
  }
};

/**
 * Get S3 bucket information
 * @returns {Object} - Bucket details
 */
export const getS3Info = async () => {
  try {
    return {
      bucketName: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION,
      url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`,
      archivesUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/archives/`
    };
  } catch (error) {
    throw new ErrorHandler(
      `Failed to get S3 info: ${error.message}`, 
      500
    );
  }
};

export default {
  uploadToS3,
  deleteFromS3,
  checkS3Config,
  getS3Info
};

