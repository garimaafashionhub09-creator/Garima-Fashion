const cloudinary = require("../config/cloudinary");
const cloudinaryService = require("../services/cloudinaryService");
const Product = require("../models/Product");

/**
 * Generate signed upload parameters for secure frontend uploads to Cloudinary
 * @route POST /api/cloudinary/signature
 * @access Admin only
 */
const generateUploadSignature = async (req, res) => {
  try {
    // Get the API secret from config (never expose this to frontend)
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiSecret) {
      return res.status(500).json({
        success: false,
        message: "Configuration failure: Cloudinary API secret is unavailable",
      });
    }

    // Generate timestamp (Unix seconds)
    const timestamp = Math.round(Date.now() / 1000);

    // Define upload parameters
    const uploadParams = {
      timestamp: timestamp,
      folder: "garima-fashion/products",
      // Signature expires in 3600 seconds (1 hour)
    };

    // Generate signature using Cloudinary SDK
    const signature = cloudinary.utils.api_sign_request(uploadParams, apiSecret);

    // Return signed upload parameters
    res.status(200).json({
      success: true,
      signature: signature,
      timestamp: timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      folder: "garima-fashion/products",
    });
  } catch (error) {
    console.error("Error generating upload signature:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate upload signature",
      error: error.message,
    });
  }
};

/**
 * Delete an image from Cloudinary
 * @route DELETE /api/cloudinary/images/:publicId
 * @access Admin only
 */
const deleteImage = async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Public ID is required",
      });
    }

    // Check if image is still referenced by any products
    const productsUsingImage = await Product.find({ images: publicId });

    if (productsUsingImage.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete image: still referenced by ${productsUsingImage.length} product(s)`,
        productIds: productsUsingImage.map((p) => p._id),
      });
    }

    // Delete from Cloudinary using service with retry logic
    const result = await cloudinaryService.deleteImage(publicId);

    if (result.result === "ok" || result.result === "not found") {
      return res.status(200).json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Cloudinary deletion failed",
        details: result,
      });
    }
  } catch (error) {
    console.error("Error deleting image:", error);

    // Handle structured errors from cloudinaryService
    if (error.errorDetails) {
      return res.status(error.errorDetails.httpCode || 500).json({
        success: false,
        message: error.message,
        errorDetails: error.errorDetails,
      });
    }

    // Handle timeout errors
    if (error.message === "Cloudinary request timed out") {
      return res.status(408).json({
        success: false,
        message: "Deletion request timed out",
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message,
    });
  }
};

module.exports = {
  generateUploadSignature,
  deleteImage,
};
