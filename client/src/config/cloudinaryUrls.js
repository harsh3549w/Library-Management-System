// Cloudinary hosted static images
// These images are stored on Cloudinary CDN for better performance and optimization

export const CLOUDINARY_IMAGES = {
  // Background image for the app
  background: 'https://res.cloudinary.com/ds5kihtow/image/upload/v1761400418/library-static/background.webp',
  
  // IIITDM Logo
  logo: 'https://res.cloudinary.com/ds5kihtow/image/upload/v1761400422/library-static/iiitdm-logo.webp',
};

// Helper function to get optimized image URL with transformations
export const getOptimizedImageUrl = (imageKey, options = {}) => {
  const baseUrl = CLOUDINARY_IMAGES[imageKey];
  if (!baseUrl) return null;

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
  } = options;

  let transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  const transformString = transformations.join(',');
  
  // Insert transformations into URL
  return baseUrl.replace('/upload/', `/upload/${transformString}/`);
};

