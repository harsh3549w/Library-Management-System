import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'config/config.env') });

console.log('🔍 Validating AWS Credentials...\n');

async function validateCredentials() {
  try {
    console.log('📋 Current Configuration:');
    console.log(`Access Key ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`Secret Key: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`Region: ${process.env.AWS_REGION || '❌ Missing'}`);
    console.log(`Bucket: ${process.env.AWS_S3_BUCKET || '❌ Missing'}\n`);

    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    console.log('🔍 Testing AWS Connection...');
    
    // Try to list buckets (this tests credentials)
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log('✅ AWS Credentials are VALID!');
    console.log(`📦 Available buckets: ${response.Buckets.length}`);
    
    // Check if our bucket exists
    const bucketExists = response.Buckets.some(bucket => bucket.Name === process.env.AWS_S3_BUCKET);
    
    if (bucketExists) {
      console.log(`✅ Bucket '${process.env.AWS_S3_BUCKET}' exists!`);
    } else {
      console.log(`❌ Bucket '${process.env.AWS_S3_BUCKET}' does NOT exist!`);
      console.log(`📋 Available buckets:`);
      response.Buckets.forEach(bucket => {
        console.log(`   - ${bucket.Name}`);
      });
    }
    
  } catch (error) {
    console.log('❌ AWS Credentials are INVALID!');
    console.log(`Error: ${error.message}`);
    
    if (error.name === 'InvalidAccessKeyId') {
      console.log('\n💡 Solution: Your Access Key ID is invalid');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.log('\n💡 Solution: Your Secret Access Key is invalid');
    } else if (error.name === 'InvalidUserID') {
      console.log('\n💡 Solution: Your credentials don\'t exist');
    } else {
      console.log('\n💡 Solution: Create new IAM user with S3 permissions');
    }
    
    console.log('\n🔧 Steps to fix:');
    console.log('1. Go to AWS Console → IAM → Users');
    console.log('2. Create new user with AmazonS3FullAccess policy');
    console.log('3. Copy new credentials to config.env');
  }
}

validateCredentials();
