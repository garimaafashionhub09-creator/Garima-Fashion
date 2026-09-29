const cloudinary = require("cloudinary").v2;

/**
 * Initialize and validate Cloudinary configuration
 * Prevents application startup if required credentials are missing
 */
function initializeCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Validate required environment variables
  const errors = [];

  if (!cloudName || cloudName.trim() === "") {
    errors.push("CLOUDINARY_CLOUD_NAME is required");
  }

  if (!apiKey || apiKey.trim() === "") {
    errors.push("CLOUDINARY_API_KEY is required");
  }

  if (!apiSecret || apiSecret.trim() === "") {
    errors.push("CLOUDINARY_API_SECRET is required");
  }

  if (errors.length > 0) {
    console.error("Cloudinary configuration errors:");
    errors.forEach((error) => console.error(`  - ${error}`));
    console.error("Refusing to start without valid Cloudinary credentials.");
    process.exit(1);
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  console.log("Cloudinary configured successfully!");

  return cloudinary;
}

// Initialize on module load
const cloudinaryInstance = initializeCloudinary();

module.exports = cloudinaryInstance;
