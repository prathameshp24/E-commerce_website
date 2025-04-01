const cloudinary = require("cloudinary").v2;
const multer = require("multer");
require('dotenv').config(); 

// Cloudinary configuration - SECURITY WARNING: Never expose API secrets in code!
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Memory storage configuration for multer
const storage = new multer.memoryStorage(); // Stores files as Buffer objects

// Improved upload utility with error handling
async function imageUploadUtil(file) {
  try {
    // Convert Buffer to base64 string for Cloudinary
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = "data:" + file.mimetype + ";base64," + b64;
    
    // Upload with additional validation
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      transformation: [{ width: 800, height: 600, crop: "limit" }],
      folder: "ecommerce-products" // Add organized folder structure
    });
    
    return { success: true, result };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return { success: false, error: error.message };
  }
}

// Configure multer for proper file handling
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpe?g|png|webp)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"), false);
    }
  }
});

module.exports = { upload, imageUploadUtil };