const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    fabric: {
      type: String,
      default: "Premium fabric",
    },

    occasion: {
      type: String,
      default: "Everyday styling",
    },

    care: {
      type: String,
      default: "Dry clean or gentle hand wash",
    },

    fit: {
      type: String,
      default: "Standard fit",
    },

    details: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    compareAtPrice: {
      type: Number,
      default: null,
    },

    category: {
      type: String,
      required: true,
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(arr) {
          // Maximum 10 images per product
          if (arr.length > 10) {
            return false;
          }
          
          // Validate each public ID format (alphanumeric with forward slashes, hyphens, underscores)
          const publicIdRegex = /^[a-zA-Z0-9/_-]+$/;
          return arr.every((id) => {
            if (typeof id !== "string") return false;
            // Allow legacy URLs (starting with http) during migration
            if (id.startsWith("http://") || id.startsWith("https://")) return true;
            // Validate Cloudinary public ID format
            return publicIdRegex.test(id);
          });
        },
        message: function(props) {
          if (props.value.length > 10) {
            return "Maximum 10 images allowed per product";
          }
          return "Invalid image reference format";
        },
      },
    },

    sizes: {
      type: [String],
      default: [],
    },

    colors: {
      type: [String],
      default: [],
    },

    rating: {
      type: Number,
      default: 0,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    stock: {
      type: Number,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;