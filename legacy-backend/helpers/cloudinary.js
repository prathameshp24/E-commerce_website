const cloudinary = require("cloudinary").v2;
const multer = require("multer");
require('dotenv').config();

// Secure Cloudinary configuration using environment variables
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Memory storage configuration for multer
const storage = new multer.memoryStorage();

// Enhanced upload utility with validation and error handling
async function imageUploadUtil(file) {
  try {
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      transformation: [{ width: 800, height: 600, crop: "limit" }],
      folder: "ecommerce-products"
    });
    
    return { success: true, result };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return { success: false, error: error.message };
  }
}

// Secure delete utility with error handling
async function imageDeleteUtil(publicId, options = {}) {
  try {
    const defaultOptions = { 
      resource_type: 'image',
      invalidate: true // Ensures CDN cache is cleared
    };
    const mergedOptions = { ...defaultOptions, ...options };
    
    const result = await cloudinary.uploader.destroy(publicId, mergedOptions);
    
    if (result.result !== 'ok') {
      return {
        success: false,
        error: result.result === 'not found' 
          ? 'Image not found' 
          : 'Deletion failed'
      };
    }
    
    return { success: true, result };
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Secure multer configuration
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpe?g|png|webp)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type - Only images allowed"), false);
    }
  }
});

module.exports = { 
  upload, 
  imageUploadUtil,
  imageDeleteUtil // Added delete functionality
};