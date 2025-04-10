const cloudinary = require("cloudinary").v2;
const { promisify } = require('util');
const streamifier = require('streamifier');

// Configure from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Always use HTTPS
});

// Promisify Cloudinary methods
const uploadStream = promisify(cloudinary.uploader.upload_stream);
const destroy = promisify(cloudinary.uploader.destroy);

const imageUploadUtil = async (fileBuffer, mimetype) => {
  try {
    if (!fileBuffer) throw new Error('No file buffer provided');
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
          folder: 'ecommerce/products',
          format: 'webp', // Force modern format
          quality: 'auto:best',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Image upload failed');
  }
};

const imageDeleteUtil = async (publicId) => {
  try {
    const result = await destroy(publicId, {
      resource_type: 'image',
      invalidate: true
    });
    
    if (result.result !== 'ok') {
      throw new Error(result.result === 'not found' 
        ? 'Image not found' 
        : 'Deletion failed'
      );
    }
    return true;
  } catch (error) {
    console.error('Deletion error:', error);
    throw error;
  }
};

module.exports = {
  imageUploadUtil,
  imageDeleteUtil,
  extractPublicId: (url) => {
    const matches = url.match(/\/upload\/v\d+\/(.+?)\./);
    return matches ? matches[1] : null;
  }
};


