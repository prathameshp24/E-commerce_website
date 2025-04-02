const express = require("express");

const {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
  handleImageDelete // ADD THIS IMPORT
} = require("../../controllers/admin/products-controller");

const { upload } = require("../../helpers/cloudinary");

const router = express.Router();

// Image handling routes
router.post("/upload-image", upload.single("my_file"), handleImageUpload);
router.delete("/delete-image", handleImageDelete); // ADD THIS ROUTE

// Product CRUD routes
router.post("/add", addProduct);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/get", fetchAllProducts);

module.exports = router;