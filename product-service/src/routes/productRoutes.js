const express = require('express');
const router = express.Router();
const { getProducts, getProductById } = require('../controllers/productController');

// Should handle GET /api/products
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;