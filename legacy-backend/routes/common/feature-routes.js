const express = require("express");

const {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage // Add this import
} = require("../../controllers/common/feature-controller");

const router = express.Router();

router.post("/add", addFeatureImage);
router.get("/get", getFeatureImages);
router.delete("/delete", deleteFeatureImage); // Add this route

module.exports = router;