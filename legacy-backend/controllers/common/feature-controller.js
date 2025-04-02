const cloudinary = require("cloudinary").v2;
const { imageUploadUtil, imageDeleteUtil } = require("../../helpers/cloudinary");
const Feature = require("../../models/Feature");

// Add Feature Image
const addFeatureImage = async (req, res) => {
  try {
    const { image } = req.body;

    const featureImages = new Feature({
      image,
    });

    await featureImages.save();

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// Get Feature Images
const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({});

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// Updated delete function
const deleteFeatureImage = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: "Image URL is required" });
    }

    // Correct public ID extraction
    const publicId = url.split('/').pop().split('.')[0];
    
    // Alternative using Cloudinary's built-in method
    // const publicId = cloudinary.url(publicId, { secure: true }).split('/').slice(-1)[0].split('.')[0];

    const result = await imageDeleteUtil(publicId, { resource_type: 'image' });

    if (result.result !== 'ok') {
      return res.status(400).json({
        success: false,
        message: result.result === 'not found' ? "Image not found" : "Failed to delete image"
      });
    }

    const deletedEntry = await Feature.findOneAndDelete({ image: url });
    
    if (!deletedEntry) {
      return res.status(404).json({ 
        success: false, 
        message: "Image entry not found in database" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully"
    });
  } catch (error) {
    console.error("Feature image deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while deleting image"
    });
  }
};

module.exports = { 
  addFeatureImage, 
  getFeatureImages, 
  deleteFeatureImage 
};