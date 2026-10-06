const Product = require("../models/Product");

/**
 * Detect and log ImageKit URLs for migration tracking
 */
function detectImageKitUrls(images, productId) {
  if (!Array.isArray(images)) return;
  
  images.forEach((image) => {
    if (typeof image === "string" && image.includes("ik.imagekit.io")) {
      console.warn(
        `[ImageKit Migration] Product ${productId} contains ImageKit URL: ${image}`
      );
    }
  });
}

/**
 * Validate Cloudinary public ID format
 */
function isValidCloudinaryPublicId(publicId) {
  if (typeof publicId !== "string") return false;
  
  // Allow legacy URLs during migration
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    return true;
  }
  
  // Cloudinary public ID format: alphanumeric with forward slashes, hyphens, underscores
  const publicIdRegex = /^[a-zA-Z0-9/_-]+$/;
  return publicIdRegex.test(publicId);
}

function normalizeStringArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  const text = String(value).trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map(String).map((item) => item.trim()).filter(Boolean);
    }
  } catch {
    // Fall through to text parsing.
  }

  return text
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeProductArrayFields(body = {}) {
  return {
    sizes: normalizeStringArray(body.sizes),
    colors: normalizeStringArray(body.colors),
  };
}

// Helper function to create image URLs
const getImageUrls = (req) => {
  if (!req.files || req.files.length === 0) {
    return [];
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  return req.files.map((file) => `${baseUrl}/uploads/${file.filename}`);
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    // Detect ImageKit URLs for migration tracking
    products.forEach((product) => {
      detectImageKitUrls(product.images, product._id);
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create a product
const createProduct = async (req, res) => {
  try {
    // Check if we have Cloudinary public IDs or multer file uploads
    let imageReferences = [];
    
    if (req.body.cloudinaryImages) {
      // Handle Cloudinary public IDs (sent as JSON string)
      try {
        const cloudinaryImages = JSON.parse(req.body.cloudinaryImages);
        if (Array.isArray(cloudinaryImages)) {
          // Validate each public ID
          const invalidIds = cloudinaryImages.filter(id => !isValidCloudinaryPublicId(id));
          if (invalidIds.length > 0) {
            return res.status(400).json({
              success: false,
              message: "Invalid Cloudinary public ID format",
              invalidIds,
            });
          }
          imageReferences = cloudinaryImages;
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid cloudinaryImages format",
        });
      }
    } else {
      // Fallback to multer file uploads (legacy)
      imageReferences = getImageUrls(req);
    }

    // Validate maximum image count
    if (imageReferences.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 images allowed per product",
      });
    }

    const productData = {
      ...req.body,
      images: imageReferences,
      fabric: req.body.fabric || "Premium fabric",
      occasion: req.body.occasion || "Everyday styling",
      care: req.body.care || "Dry clean or gentle hand wash",
      fit: req.body.fit || "Standard fit",
      details: req.body.details || req.body.description || "",
    };

    // Convert string values from FormData
    productData.sizes = normalizeStringArray(req.body.sizes);
    productData.colors = normalizeStringArray(req.body.colors);

    productData.price = Number(req.body.price);
    productData.stock = Number(req.body.stock);

    if (req.body.compareAtPrice) {
      productData.compareAtPrice = Number(req.body.compareAtPrice);
    }

    productData.rating = req.body.rating
      ? Number(req.body.rating)
      : 0;

    productData.reviewCount = req.body.reviewCount
      ? Number(req.body.reviewCount)
      : 0;

    productData.featured =
      req.body.featured === "true";

    productData.isNewArrival =
      req.body.isNewArrival === "true";

    productData.isOffer =
      req.body.isOffer === "true";

    productData.isActive =
      req.body.isActive !== "false";

    const product = await Product.create(productData);

    // Log ImageKit URLs if detected
    detectImageKitUrls(product.images, product._id);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if we have Cloudinary public IDs or multer file uploads
    let imageReferences = null;
    
    if (req.body.cloudinaryImages) {
      // Handle Cloudinary public IDs (sent as JSON string)
      try {
        const cloudinaryImages = JSON.parse(req.body.cloudinaryImages);
        if (Array.isArray(cloudinaryImages)) {
          // Validate each public ID
          const invalidIds = cloudinaryImages.filter(id => !isValidCloudinaryPublicId(id));
          if (invalidIds.length > 0) {
            return res.status(400).json({
              success: false,
              message: "Invalid Cloudinary public ID format",
              invalidIds,
            });
          }
          
          // Validate maximum image count
          if (cloudinaryImages.length > 10) {
            return res.status(400).json({
              success: false,
              message: "Maximum 10 images allowed per product",
            });
          }
          
          imageReferences = cloudinaryImages;
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid cloudinaryImages format",
        });
      }
    } else {
      // Fallback to multer file uploads (legacy)
      const uploadedImages = getImageUrls(req);
      if (uploadedImages.length > 0) {
        imageReferences = uploadedImages;
      }
    }

    const productData = {
      ...req.body,
      fabric: req.body.fabric || product.fabric || "Premium fabric",
      occasion: req.body.occasion || product.occasion || "Everyday styling",
      care: req.body.care || product.care || "Dry clean or gentle hand wash",
      fit: req.body.fit || product.fit || "Standard fit",
      details: req.body.details || req.body.description || product.details || product.description || "",
    };

    // Only replace images if new images were provided
    if (imageReferences !== null) {
      productData.images = imageReferences;
    }

    productData.sizes = normalizeStringArray(req.body.sizes);
    productData.colors = normalizeStringArray(req.body.colors);

    if (req.body.price !== undefined) {
      productData.price = Number(req.body.price);
    }

    if (req.body.stock !== undefined) {
      productData.stock = Number(req.body.stock);
    }

    if (req.body.compareAtPrice) {
      productData.compareAtPrice = Number(req.body.compareAtPrice);
    }

    if (req.body.rating !== undefined) {
      productData.rating = Number(req.body.rating);
    }

    if (req.body.reviewCount !== undefined) {
      productData.reviewCount = Number(req.body.reviewCount);
    }

    if (req.body.featured !== undefined) {
      productData.featured =
        req.body.featured === "true";
    }

    if (req.body.isNewArrival !== undefined) {
      productData.isNewArrival =
        req.body.isNewArrival === "true";
    }

    if (req.body.isOffer !== undefined) {
      productData.isOffer =
        req.body.isOffer === "true";
    }

    if (req.body.isActive !== undefined) {
      productData.isActive =
        req.body.isActive === "true";
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      {
        new: true,
        runValidators: true,
      }
    );

    // Log ImageKit URLs if detected
    detectImageKitUrls(updatedProduct.images, updatedProduct._id);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  normalizeStringArray,
  normalizeProductArrayFields,
};