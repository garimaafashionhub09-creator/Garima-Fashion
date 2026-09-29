const cloudinary = require("../config/cloudinary");

/**
 * Cloudinary Service with comprehensive error handling and retry logic
 * Implements exponential backoff for network errors and proper handling of various HTTP status codes
 */

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable (network connectivity issues)
 */
function isRetryableError(error) {
  if (!error) return false;

  const retryableCodes = [
    "ECONNREFUSED",
    "ENOTFOUND",
    "ETIMEDOUT",
    "ESOCKETTIMEDOUT",
    "ECONNRESET",
  ];

  return (
    retryableCodes.includes(error.code) ||
    retryableCodes.includes(error.errno) ||
    error.message?.includes("socket") ||
    error.message?.includes("timeout")
  );
}

/**
 * Execute Cloudinary operation with retry logic
 * @param {Function} operation - The Cloudinary operation to execute
 * @param {string} operationType - Description of operation (for logging)
 * @param {string|null} publicId - Public ID involved (for logging)
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @returns {Promise<any>} - Result of the Cloudinary operation
 */
async function executeWithRetry(
  operation,
  operationType,
  publicId = null,
  maxRetries = 3
) {
  const delays = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Set timeout for Cloudinary operations (30 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Cloudinary request timed out")),
          30000
        )
      );

      const result = await Promise.race([operation(), timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error;

      // Handle specific HTTP status codes
      if (error.http_code) {
        // HTTP 401 Unauthorized - Invalid credentials
        if (error.http_code === 401) {
          console.error(
            `[Cloudinary] Authentication failed for ${operationType}. API Key: ${process.env.CLOUDINARY_API_KEY?.substring(0, 8)}...`
          );
          throw {
            message: "Invalid Cloudinary credentials",
            errorDetails: {
              timestamp: new Date().toISOString(),
              operation: operationType,
              publicId,
              httpCode: 401,
              originalError: error.message,
            },
          };
        }

        // HTTP 403 Forbidden - Insufficient permissions
        if (error.http_code === 403) {
          console.error(
            `[Cloudinary] Authorization failed for ${operationType}: ${publicId || "N/A"}`
          );
          throw {
            message: "Insufficient permissions for Cloudinary operation",
            errorDetails: {
              timestamp: new Date().toISOString(),
              operation: operationType,
              publicId,
              httpCode: 403,
              originalError: error.message,
            },
          };
        }

        // HTTP 429 Rate Limit - Respect Retry-After header
        if (error.http_code === 429) {
          const retryAfter = error.retryAfter || 60; // Default to 60 seconds
          console.warn(
            `[Cloudinary] Rate limit hit for ${operationType}. Waiting ${retryAfter}s before retry.`
          );
          await sleep(retryAfter * 1000);
          continue; // Retry once after waiting
        }

        // Other 4xx errors are not retryable
        if (error.http_code >= 400 && error.http_code < 500) {
          console.error(
            `[Cloudinary] Client error ${error.http_code} for ${operationType}: ${error.message}`
          );
          throw {
            message: `Cloudinary request failed with status ${error.http_code}`,
            errorDetails: {
              timestamp: new Date().toISOString(),
              operation: operationType,
              publicId,
              httpCode: error.http_code,
              originalError: error.message,
              responseBody: error.message,
            },
          };
        }
      }

      // Check if error is retryable (network issues)
      if (isRetryableError(error) && attempt < maxRetries) {
        const delay = delays[attempt] || 4000;
        console.warn(
          `[Cloudinary] ${operationType} failed (attempt ${attempt + 1}/${maxRetries + 1}): ${error.message}. Retrying in ${delay}ms...`
        );
        await sleep(delay);
        continue;
      }

      // If we've exhausted retries or it's a non-retryable error
      if (attempt >= maxRetries) {
        console.error(
          `[Cloudinary] ${operationType} failed after ${maxRetries + 1} attempts. Public ID: ${publicId || "N/A"}. Error: ${error.message}`
        );
      }

      break; // Exit retry loop
    }
  }

  // If we get here, all retries failed
  throw {
    message: lastError?.message || "Cloudinary operation failed",
    errorDetails: {
      timestamp: new Date().toISOString(),
      operation: operationType,
      publicId,
      originalError: lastError?.message || "Unknown error",
      code: lastError?.code,
      httpCode: lastError?.http_code,
    },
  };
}

/**
 * Upload an image to Cloudinary with retry logic
 * @param {string} filePath - Path to file or base64 data URL
 * @param {object} options - Upload options (folder, public_id, etc.)
 * @returns {Promise<object>} - Upload result
 */
async function uploadImage(filePath, options = {}) {
  return executeWithRetry(
    () => cloudinary.uploader.upload(filePath, options),
    "upload",
    options.public_id || null
  );
}

/**
 * Delete an image from Cloudinary with retry logic
 * @param {string} publicId - Public ID of image to delete
 * @param {object} options - Deletion options
 * @returns {Promise<object>} - Deletion result
 */
async function deleteImage(publicId, options = {}) {
  return executeWithRetry(
    () => cloudinary.uploader.destroy(publicId, options),
    "delete",
    publicId
  );
}

/**
 * Get details of an image from Cloudinary with retry logic
 * @param {string} publicId - Public ID of image
 * @returns {Promise<object>} - Image details
 */
async function getImageDetails(publicId) {
  return executeWithRetry(
    () => cloudinary.api.resource(publicId),
    "get_details",
    publicId
  );
}

/**
 * Search for images in Cloudinary with retry logic
 * @param {string} expression - Search expression
 * @returns {Promise<object>} - Search results
 */
async function searchImages(expression) {
  return executeWithRetry(
    () => cloudinary.search.expression(expression).execute(),
    "search",
    null
  );
}

module.exports = {
  uploadImage,
  deleteImage,
  getImageDetails,
  searchImages,
  executeWithRetry,
};
