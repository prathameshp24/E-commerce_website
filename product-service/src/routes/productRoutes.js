const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const upload = require('../middlewares/multer');
const { validateProduct } = require('../middlewares/validation');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes
router.post(
  '/add-product',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  validateProduct,
  createProduct
);

router.patch(
  '/:id',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  validateProduct,
  updateProduct
);

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  deleteProduct
);

module.exports = router;