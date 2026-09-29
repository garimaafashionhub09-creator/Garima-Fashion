const express = require("express");
const router = express.Router();
const { generateUploadSignature, deleteImage } = require("../controllers/cloudinaryController");
const requireAdmin = require("../middleware/adminAuth");

// Generate signed upload parameters (Admin only)
router.post("/signature", requireAdmin, generateUploadSignature);

// Delete image from Cloudinary (Admin only)
router.delete("/images/:publicId", requireAdmin, deleteImage);

module.exports = router;
