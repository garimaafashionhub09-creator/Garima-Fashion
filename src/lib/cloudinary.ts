/**
 * Cloudinary Image Delivery Service
 * Generates optimized image URLs with transformations for different display contexts
 */

export type ImageContext = "thumbnail" | "product-detail" | "gallery";

export interface TransformationOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "crop";
  quality?: "auto" | number;
  format?: "auto" | "jpg" | "png" | "webp";
}

// Transformation presets for different contexts
const TRANSFORMATIONS: Record<ImageContext, TransformationOptions> = {
  thumbnail: {
    width: 300,
    height: 300,
    crop: "fill",
    quality: "auto",
    format: "auto",
  },
  "product-detail": {
    width: 800,
    quality: "auto",
    format: "auto",
  },
  gallery: {
    width: 1200,
    quality: "auto",
    format: "auto",
  },
};

// Get cloud name from environment variable
const getCloudName = (): string => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.warn("VITE_CLOUDINARY_CLOUD_NAME is not configured");
    return "demo"; // Fallback for development
  }
  return cloudName;
};

/**
 * Build transformation string from options
 * Example: "w_300,h_300,c_fill,q_auto,f_auto"
 */
const buildTransformationString = (options: TransformationOptions): string => {
  const parts: string[] = [];

  if (options.width) parts.push(`w_${options.width}`);
  if (options.height) parts.push(`h_${options.height}`);
  if (options.crop) parts.push(`c_${options.crop}`);
  if (options.quality) parts.push(`q_${options.quality}`);
  if (options.format) parts.push(`f_${options.format}`);

  return parts.join(",");
};

/**
 * Generate image URL with context-specific transformations
 * @param publicId - Cloudinary public ID (e.g., "garima-fashion/products/saree-001")
 * @param context - Display context (thumbnail, product-detail, or gallery)
 * @returns Optimized image URL with transformations
 */
export function generateImageUrl(publicId: string | null | undefined, context: ImageContext): string {
  // Return placeholder for null, empty, or whitespace-only public IDs
  if (!publicId || publicId.trim() === "") {
    return getPlaceholderUrl();
  }

  const transformations = TRANSFORMATIONS[context];
  return generateImageUrlWithOptions(publicId, transformations);
}

/**
 * Generate image URL with custom transformation options
 * @param publicId - Cloudinary public ID
 * @param options - Custom transformation options
 * @returns Image URL with specified transformations
 */
export function generateImageUrlWithOptions(
  publicId: string | null | undefined,
  options: TransformationOptions
): string {
  // Return placeholder for invalid public IDs
  if (!publicId || publicId.trim() === "") {
    return getPlaceholderUrl();
  }

  const cloudName = getCloudName();
  const transformationString = buildTransformationString(options);

  // Build Cloudinary URL structure
  // https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{publicId}
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${publicId}`;
}

/**
 * Get placeholder image URL for products with no images
 * @returns Placeholder image URL
 */
export function getPlaceholderUrl(): string {
  return "https://via.placeholder.com/800x600.png?text=No+Image";
}

/**
 * Check if a URL is from ImageKit (for migration detection)
 * @param url - Image URL to check
 * @returns True if URL is from ImageKit
 */
export function isImageKitUrl(url: string): boolean {
  return url.includes("ik.imagekit.io");
}

/**
 * Normalize image URL - handles both Cloudinary public IDs and legacy URLs
 * @param imageRef - Cloudinary public ID or legacy image URL
 * @param context - Display context for transformations
 * @returns Normalized image URL
 */
export function normalizeImageUrl(imageRef: string, context: ImageContext = "product-detail"): string {
  if (!imageRef || imageRef.trim() === "") {
    return getPlaceholderUrl();
  }

  // If it's already a full URL (legacy local or ImageKit), return as-is
  if (imageRef.startsWith("http://") || imageRef.startsWith("https://")) {
    if (isImageKitUrl(imageRef)) {
      console.warn(`ImageKit URL detected: ${imageRef}. Consider migrating to Cloudinary.`);
    }
    return imageRef;
  }

  // Otherwise, treat as Cloudinary public ID
  return generateImageUrl(imageRef, context);
}
