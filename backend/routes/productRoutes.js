const express = require("express");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const upload = require("../config/multer");
const requireAdmin = require("../middleware/adminAuth");

const router = express.Router();

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProductById);

// Create product with images
router.post("/", requireAdmin, upload.array("images", 5), createProduct);

// Update product with images
router.put("/:id", requireAdmin, upload.array("images", 5), updateProduct);

// Delete product
router.delete("/:id", requireAdmin, deleteProduct);

module.exports = router;