import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadDashboardLogo = async () => {
  try {
    console.log('🚀 Starting dashboard logo upload to Cloudinary...\n');

    // Upload dashboard logo
    console.log('📤 Uploading dashboard logo from client/public/images/dashboard-logo.jpeg...');
    const logoResult = await cloudinary.uploader.upload(
      path.join(__dirname, '../client/public/images/dashboard-logo.jpeg'),
      {
        folder: 'library-static',
        public_id: 'dashboard-logo',
        overwrite: true,
        resource_type: 'image'
      }
    );
    console.log('✅ Dashboard logo uploaded:', logoResult.secure_url);

    console.log('\n🎉 Dashboard logo uploaded successfully!\n');
    console.log('📋 Cloudinary URL:');
    console.log('-------------------');
    console.log(logoResult.secure_url);
    console.log('\n💡 Copy this URL to update your dashboard.\n');

    return logoResult.secure_url;
  } catch (error) {
    console.error('❌ Error uploading dashboard logo:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

uploadDashboardLogo().then((url) => {
  console.log('✨ Done! Your dashboard logo is now on Cloudinary.');
  console.log('URL:', url);
  process.exit(0);
});

