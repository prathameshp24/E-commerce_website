const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  brand: String,
  price: { type: Number, required: true },
  salePrice: Number,
  totalStock: Number,
  averageReview: { type: Number, default: 0 },
  image: String
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);