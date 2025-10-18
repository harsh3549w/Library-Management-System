import { checkS3Config, getS3Info } from './services/s3Service.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'config/config.env') });

console.log('🔧 Testing AWS S3 Integration...\n');

async function testS3Integration() {
  try {
    console.log('📋 Environment Variables:');
    console.log(`AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`AWS_REGION: ${process.env.AWS_REGION || '❌ Missing'}`);
    console.log(`AWS_S3_BUCKET: ${process.env.AWS_S3_BUCKET || '❌ Missing'}\n`);

    console.log('🔍 Testing S3 Configuration...');
    const s3Config = await checkS3Config();
    
    if (s3Config.configured) {
      console.log('✅ S3 Configuration: VALID');
      console.log(`   Bucket: ${s3Config.bucket}`);
      console.log(`   Region: ${s3Config.region}`);
      console.log(`   URL: ${s3Config.url}`);
    } else {
      console.log('❌ S3 Configuration: INVALID');
      console.log(`   Error: ${s3Config.error}`);
    }

    console.log('\n📊 S3 Information:');
    const s3Info = await getS3Info();
    console.log(`   Bucket Name: ${s3Info.bucketName}`);
    console.log(`   Region: ${s3Info.region}`);
    console.log(`   Base URL: ${s3Info.url}`);
    console.log(`   Archives URL: ${s3Info.archivesUrl}`);

    console.log('\n🎉 S3 Integration Test Complete!');
    
  } catch (error) {
    console.error('❌ S3 Integration Test Failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testS3Integration();

