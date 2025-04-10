const Product = require('../models/Product');
const { imageUploadUtil, imageDeleteUtil, extractPublicId } = require('../utils/cloudinary');

const getProducts = async (req, res) => {
  try {
    const products = await Product.find(req.filter).sort(req.sort);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const createProduct = async (req, res) => {
  try {
    let imageData;
    if (req.file) {
      const result = await imageUploadUtil(req.file.buffer, req.file.mimetype);
      imageData = { url: result.secure_url, publicId: extractPublicId(result.secure_url) };
      console.log()
    }
    
    const product = await Product.create({ ...req.body, image: imageData });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    if (req.file) {
      if (product.image?.publicId) await imageDeleteUtil(product.image.publicId);
      const result = await imageUploadUtil(req.file.buffer, req.file.mimetype);
      product.image = { url: result.secure_url, publicId: extractPublicId(result.secure_url) };
    }

    Object.assign(product, req.body);
    await product.save();
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    
    if (product.image?.publicId) await imageDeleteUtil(product.image.publicId);
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};