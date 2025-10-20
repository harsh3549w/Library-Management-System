import { config } from 'dotenv';
import Joi from 'joi';

// Load environment variables
config({ path: './config/config.env' });

// Environment validation schema
const envSchema = Joi.object({
  // Server Configuration
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(4000),
  
  // Database Configuration
  MONGO_URI: Joi.string().uri().required(),
  
  // JWT Configuration
  JWT_SECRET_KEY: Joi.string().min(32).required(),
  JWT_EXPIRE: Joi.string().default('1d'),
  COOKIE_EXPIRE: Joi.number().default(3),
  
  // Frontend Configuration
  FRONTEND_URL: Joi.string().uri().required(),
  
  // Email Configuration
  SMTP_HOST: Joi.string().hostname().required(),
  SMTP_SERVICE: Joi.string().default('gmail'),
  SMTP_PORT: Joi.number().port().default(465),
  SMTP_MAIL: Joi.string().email().required(),
  SMTP_PASSWORD: Joi.string().required(),
  
  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  
  // Payment Gateway Configuration
  RAZORPAY_KEY_ID: Joi.string().required(),
  RAZORPAY_KEY_SECRET: Joi.string().required(),
  
  // AWS S3 Configuration
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_REGION: Joi.string().default('ap-south-1'),
  AWS_S3_BUCKET: Joi.string().required(),
}).unknown();

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

// Export validated environment variables
export const env = {
  NODE_ENV: envVars.NODE_ENV,
  PORT: envVars.PORT,
  MONGO_URI: envVars.MONGO_URI,
  JWT_SECRET_KEY: envVars.JWT_SECRET_KEY,
  JWT_EXPIRE: envVars.JWT_EXPIRE,
  COOKIE_EXPIRE: envVars.COOKIE_EXPIRE,
  FRONTEND_URL: envVars.FRONTEND_URL,
  SMTP_HOST: envVars.SMTP_HOST,
  SMTP_SERVICE: envVars.SMTP_SERVICE,
  SMTP_PORT: envVars.SMTP_PORT,
  SMTP_MAIL: envVars.SMTP_MAIL,
  SMTP_PASSWORD: envVars.SMTP_PASSWORD,
  CLOUDINARY_CLOUD_NAME: envVars.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: envVars.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: envVars.CLOUDINARY_API_SECRET,
  RAZORPAY_KEY_ID: envVars.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: envVars.RAZORPAY_KEY_SECRET,
  AWS_ACCESS_KEY_ID: envVars.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: envVars.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: envVars.AWS_REGION,
  AWS_S3_BUCKET: envVars.AWS_S3_BUCKET,
};

// Log environment status
console.log(`Environment: ${env.NODE_ENV}`);
console.log(`Server running on port: ${env.PORT}`);
