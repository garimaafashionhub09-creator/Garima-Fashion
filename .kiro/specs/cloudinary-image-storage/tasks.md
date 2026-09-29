# Implementation Plan: Cloudinary Image Storage Integration

## Overview

This implementation plan converts the Cloudinary image storage design into discrete coding tasks. The feature replaces the current multer-based local file storage and ImageKit configuration with Cloudinary cloud storage, enabling secure image upload, transformation, and delivery for product images in the Garima Fashion e-commerce application.

The implementation follows a phased approach:
1. Backend infrastructure (configuration, signature generation, validation)
2. Frontend image delivery utilities (URL generation, transformations)
3. Frontend upload component (file validation, upload flow, progress tracking)
4. Product integration (associate images with products, update models)
5. Image deletion and cleanup operations
6. Testing and validation

## Tasks

- [ ] 1. Set up backend Cloudinary configuration and dependencies
  - Install `cloudinary` package in backend directory
  - Create `backend/config/cloudinary.js` with configuration initialization
  - Load and validate environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
  - Export configured Cloudinary instance for reuse
  - Implement fail-fast validation that prevents startup if required variables are missing or empty
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [ ]* 1.1 Write property test for environment variable validation
  - **Property 1: Environment Variable Validation Prevents Startup**
  - **Validates: Requirements 1.4, 1.5, 1.6**
  - Test that any missing, empty, or whitespace-only value for required environment variables prevents initialization

- [ ] 2. Implement secure upload signature generation endpoint
  - [ ] 2.1 Create backend Cloudinary controller with signature generation
    - Create `backend/controllers/cloudinaryController.js`
    - Implement `generateUploadSignature` function using `cloudinary.utils.api_sign_request()`
    - Include timestamp with 3600 second expiration
    - Set upload folder to "garima-fashion/products"
    - Return signature, timestamp, api_key, cloud_name, and folder
    - _Requirements: 3.3, 3.4, 3.5, 3.6_
  
  - [ ] 2.2 Create Cloudinary routes with authentication
    - Create `backend/routes/cloudinary.js`
    - Define POST `/api/cloudinary/signature` route
    - Apply existing JWT authentication middleware
    - Apply admin authorization middleware
    - Handle configuration errors with HTTP 500 responses
    - _Requirements: 3.1, 3.2, 3.7_
  
  - [ ] 2.3 Register Cloudinary routes in Express app
    - Import and mount Cloudinary routes in `backend/server.js`
    - Ensure route is registered after authentication middleware setup
    - _Requirements: 3.1, 3.2_

- [ ]* 2.4 Write property test for signature generation parameters
  - **Property 5: Signature Generation Parameters**
  - **Validates: Requirements 3.4, 3.5**
  - Test that all generated signatures include correct timestamp expiration and folder specification

- [ ]* 2.5 Write property test for administrator authorization
  - **Property 4: Administrator Authorization for Signature Requests**
  - **Validates: Requirements 3.1, 3.2, 6.1, 6.2**
  - Test that signature handler verifies admin privileges and returns HTTP 403 for non-admin users

- [ ] 3. Checkpoint - Verify backend configuration and signature generation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Create frontend image delivery service
  - [ ] 4.1 Create image URL generation utility module
    - Create `src/lib/cloudinary.ts`
    - Define TypeScript interfaces for ImageContext and TransformationOptions
    - Implement `generateImageUrl(publicId: string, context: ImageContext): string`
    - Implement `generateImageUrlWithOptions(publicId: string, options: TransformationOptions): string`
    - Implement `getPlaceholderUrl(): string` returning "https://via.placeholder.com/800x600.png?text=No+Image"
    - Load VITE_CLOUDINARY_CLOUD_NAME from environment
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 9.2, 9.3, 9.4, 9.6, 9.7_
  
  - [ ] 4.2 Define transformation presets for different contexts
    - Create TRANSFORMATIONS constant with thumbnail, product-detail, and gallery presets
    - Thumbnail: w_300, h_300, c_fill, q_auto, f_auto
    - Product-detail: w_800, q_auto, f_auto
    - Gallery: w_1200, q_auto, f_auto
    - Implement URL structure: `https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{publicId}`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 9.1_

- [ ]* 4.3 Write property test for context-specific transformations
  - **Property 9: Context-Specific Image Transformation URLs**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
  - Test that each context generates URLs with correct transformation parameters

- [ ]* 4.4 Write property test for URL generation determinism
  - **Property 20: URL Generation Determinism**
  - **Validates: Requirements 9.5**
  - Test that identical inputs produce byte-for-byte identical URL strings

- [ ]* 4.5 Write property test for placeholder handling
  - **Property 21: Placeholder for Empty Public IDs**
  - **Validates: Requirements 9.6, 9.7**
  - Test that null, empty, or whitespace-only public IDs return placeholder URL

- [ ]* 4.6 Write property test for HTTPS protocol enforcement
  - **Property 18: HTTPS Protocol for All URLs**
  - **Validates: Requirements 9.2**
  - Test that all generated URLs use HTTPS protocol

- [ ]* 4.7 Write property test for URL structure consistency
  - **Property 19: URL Structure Consistency**
  - **Validates: Requirements 9.3, 9.4**
  - Test that URLs include cloud name, public ID, and transformations in correct positions

- [ ] 5. Implement frontend image upload component
  - [ ] 5.1 Create ImageUpload component with TypeScript interfaces
    - Create `src/components/admin/ImageUpload.tsx`
    - Define ImageUploadProps interface (onUploadComplete, onUploadError, maxImages, existingImages)
    - Define ImageUploadState interface (selectedFiles, previews, uploading, progress, errors)
    - Implement component structure with file input, preview area, progress indicators
    - _Requirements: 2.9, 2.10, 10.1, 10.2, 10.3, 10.4_
  
  - [ ] 5.2 Implement file validation logic
    - Validate file extensions: .jpg, .jpeg, .png, .webp, .gif (case-insensitive)
    - Validate MIME types: image/jpeg, image/png, image/webp, image/gif
    - Validate file size: maximum 10,485,760 bytes (10 MiB)
    - Display specific error messages for validation failures
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 5.3 Implement upload flow with signature request
    - Request signed upload parameters from `/api/cloudinary/signature` with JWT token
    - Handle timeout for signature request (10 seconds)
    - Display error if signature request fails or times out
    - Allow retry on failure
    - _Requirements: 2.5, 2.6_
  
  - [ ] 5.4 Implement direct upload to Cloudinary
    - Upload file to Cloudinary using signed parameters with multipart/form-data
    - Handle upload timeout (60 seconds)
    - Track and display upload progress
    - Extract public_id and secure_url from response
    - Validate response contains required fields
    - _Requirements: 2.7, 2.8, 2.9, 2.10, 10.1, 10.2_
  
  - [ ] 5.5 Implement error handling and retry mechanism
    - Display user-friendly error messages with error type context
    - Provide Retry and Cancel buttons for failed uploads
    - Show warning for stalled uploads (>10 seconds no progress)
    - Display success message and thumbnail on completion
    - Clean up preview URLs on component unmount
    - _Requirements: 2.3, 2.4, 2.6, 2.8, 10.5, 10.6_

- [ ]* 5.6 Write property test for file validation
  - **Property 2: File Extension and MIME Type Validation**
  - **Validates: Requirements 2.1**
  - Test that files are accepted only with both valid extension AND valid MIME type

- [ ]* 5.7 Write property test for file size validation
  - **Property 3: File Size Validation**
  - **Validates: Requirements 2.2**
  - Test that files exceeding 10 MiB are rejected

- [ ] 6. Checkpoint - Verify upload component and image delivery
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Update Product model for Cloudinary public IDs
  - [ ] 7.1 Modify Product schema validation
    - Open `backend/models/Product.js` (or similar)
    - Update images field validation to enforce maximum 10 images
    - Add custom validator function for images array length
    - Keep field type as array of strings (now stores public IDs instead of local URLs)
    - _Requirements: 4.6, 4.9_
  
  - [ ] 7.2 Implement public ID format validation helper
    - Create validation function for Cloudinary public ID format: `^[a-zA-Z0-9/_-]+$`
    - Return descriptive error for invalid formats
    - Allow empty arrays (products without images)
    - _Requirements: 4.7, 4.8_

- [ ]* 7.3 Write property test for public ID format validation
  - **Property 8: Public ID Format Validation**
  - **Validates: Requirements 4.7**
  - Test that invalid public ID formats are rejected with error message

- [ ] 8. Update Product controller for Cloudinary integration
  - [ ] 8.1 Modify createProduct to handle Cloudinary public IDs
    - Open `backend/controllers/productController.js`
    - Update createProduct to accept publicIds in req.body.images
    - Validate each public ID format using helper function
    - Enforce maximum 10 images per product
    - Store public IDs array in Product.images field
    - _Requirements: 4.1, 4.2, 4.3, 4.6, 4.7, 4.9_
  
  - [ ] 8.2 Modify updateProduct to replace images
    - Update updateProduct to handle image replacement
    - If req.body.images provided, replace all existing images
    - Validate new public IDs before updating
    - Allow empty array (clear all images)
    - _Requirements: 4.4, 4.7, 4.8, 4.9_
  
  - [ ] 8.3 Add ImageKit URL detection and logging
    - Implement detection logic to identify URLs containing "ik.imagekit.io"
    - Log warning with product ID and detected ImageKit URL
    - Process detection during product retrieval operations
    - _Requirements: 7.6, 7.7_

- [ ]* 8.4 Write property test for image association round-trip
  - **Property 6: Image Association Storage and Retrieval Round-Trip**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.5**
  - Test that product images stored in specified order are retrieved in same order

- [ ]* 8.5 Write property test for image replacement on update
  - **Property 7: Product Image Replacement on Update**
  - **Validates: Requirements 4.4**
  - Test that updating product with new public IDs completely replaces existing images

- [ ]* 8.6 Write property test for ImageKit URL detection
  - **Property 13: ImageKit URL Detection**
  - **Validates: Requirements 7.6**
  - Test that ImageKit URLs in products trigger warning logs with product ID

- [ ] 9. Implement image deletion endpoint
  - [ ] 9.1 Create deleteImage controller function
    - Add deleteImage function to `backend/controllers/cloudinaryController.js`
    - Verify admin JWT token using existing middleware
    - Extract and decode publicId from URL params
    - Check if image is referenced in any Product documents using MongoDB query
    - Return error 400 if image is still in use by products
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ] 9.2 Implement Cloudinary deletion with safety checks
    - Call `cloudinary.uploader.destroy(publicId)` with 30 second timeout
    - Only remove image reference from database if Cloudinary deletion succeeds
    - Return error if Cloudinary deletion fails (atomic operation)
    - Return success response when both operations complete
    - _Requirements: 6.5, 6.6, 6.7, 6.8, 6.9_
  
  - [ ] 9.3 Add DELETE route for image deletion
    - Add DELETE `/api/cloudinary/images/:publicId` route in `backend/routes/cloudinary.js`
    - Apply JWT authentication and admin authorization middleware
    - Connect route to deleteImage controller function
    - _Requirements: 6.1, 6.2_

- [ ]* 9.4 Write property test for deletion safety check
  - **Property 11: Image Deletion Safety Check**
  - **Validates: Requirements 6.4**
  - Test that images still referenced by products cannot be deleted

- [ ]* 9.5 Write property test for atomic deletion operation
  - **Property 12: Atomic Deletion Operation**
  - **Validates: Requirements 6.9**
  - Test that Cloudinary deletion failure prevents database reference removal

- [ ] 10. Checkpoint - Verify product integration and deletion
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement comprehensive error handling with retry logic
  - [ ] 11.1 Create Cloudinary service wrapper with retry logic
    - Create `backend/services/cloudinaryService.js` (optional abstraction)
    - Implement retry logic for network errors (ECONNREFUSED, ENOTFOUND, ETIMEDOUT)
    - Retry up to 3 times with exponential backoff (1s, 2s, 4s delays)
    - Log errors with operation type, public ID, and error message
    - _Requirements: 8.1, 8.2_
  
  - [ ] 11.2 Implement HTTP status code error handling
    - Handle HTTP 401 with "Invalid Cloudinary credentials" response
    - Handle HTTP 403 with "Insufficient permissions" response
    - Handle HTTP 429 with Retry-After header respect (or default 60s wait)
    - Do not retry non-retryable 4xx errors (except 401, 403, 429)
    - Implement 30 second timeout for all Cloudinary API requests
    - _Requirements: 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  
  - [ ] 11.3 Implement structured error responses
    - Return error responses with `message` field (user-facing)
    - Include `errorDetails` field with timestamp, operation type, and original error
    - Ensure sensitive data (api_secret, JWT tokens) never logged
    - _Requirements: 8.9_

- [ ]* 11.4 Write property test for network error retry logic
  - **Property 14: Network Error Retry Logic**
  - **Validates: Requirements 8.1**
  - Test that network errors trigger 3 retries with correct exponential backoff delays

- [ ]* 11.5 Write property test for rate limit handling
  - **Property 15: Rate Limit Response Handling**
  - **Validates: Requirements 8.5**
  - Test that HTTP 429 with Retry-After header value N waits exactly N seconds

- [ ]* 11.6 Write property test for non-retryable errors
  - **Property 16: Non-Retryable 4xx Errors**
  - **Validates: Requirements 8.7**
  - Test that 4xx errors (except 401, 403, 429) are not retried

- [ ]* 11.7 Write property test for error response structure
  - **Property 17: Error Response Structure**
  - **Validates: Requirements 8.9**
  - Test that all error responses contain both `message` and `errorDetails` fields

- [ ] 12. Update environment configuration files
  - [x] 12.1 Update backend .env file
    - Add CLOUDINARY_CLOUD_NAME variable to `backend/.env`
    - Add CLOUDINARY_API_KEY variable
    - Add CLOUDINARY_API_SECRET variable
    - Remove IMAGE_KIT_CLOUD_NAME if present (or document removal)
    - _Requirements: 7.1, 7.2, 7.4, 7.5_
  
  - [x] 12.2 Update frontend .env file
    - Add VITE_CLOUDINARY_CLOUD_NAME variable to root `.env`
    - Document that this is used by frontend for URL generation
    - _Requirements: 7.3_
  
  - [x] 12.3 Update .env.example files
    - Document all new environment variables in example files
    - Include descriptions for each variable
    - Note that IMAGE_KIT_CLOUD_NAME is deprecated

- [ ] 13. Integrate ImageUpload component into admin product form
  - [ ] 13.1 Add ImageUpload to product creation form
    - Import ImageUpload component in admin product creation page
    - Wire up onUploadComplete callback to update form state with public IDs
    - Handle upload errors with user-friendly messages
    - Display existing images if editing product
    - _Requirements: 2.1, 2.2, 2.9, 2.10, 4.3, 10.3, 10.4_
  
  - [ ] 13.2 Update product forms to use Cloudinary URLs
    - Replace local image paths with Cloudinary public IDs in form submissions
    - Use `generateImageUrl()` from cloudinary.ts for image preview displays
    - Apply appropriate transformation contexts (thumbnail in forms, product-detail in preview)
    - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3_

- [ ] 14. Update product display components to use Cloudinary URLs
  - [ ] 14.1 Update product list/grid components
    - Replace image URLs with `generateImageUrl(publicId, 'thumbnail')`
    - Handle missing images with placeholder URL
    - Verify transformations are applied correctly
    - _Requirements: 5.1, 9.6, 9.7_
  
  - [ ] 14.2 Update product detail page components
    - Use `generateImageUrl(publicId, 'product-detail')` for main product images
    - Use `generateImageUrl(publicId, 'gallery')` for gallery/lightbox views
    - Implement image gallery navigation with Cloudinary URLs
    - _Requirements: 5.2, 5.3_

- [ ] 15. Final checkpoint - End-to-end verification
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Create test utilities and setup
  - [ ] 16.1 Install fast-check for property-based testing
    - Install `fast-check` as dev dependency in both frontend and backend
    - Create test configuration files if not present
  
  - [ ] 16.2 Create test data generators
    - Create arbitrary generators for valid/invalid file objects
    - Create generators for valid/invalid Cloudinary public IDs
    - Create generators for product data with images
    - Set up test environment with mock Cloudinary credentials

- [ ]* 16.3 Write unit tests for validation helpers
  - Test file extension validation edge cases
  - Test MIME type validation edge cases
  - Test public ID format validation edge cases
  - Test transformation URL building logic

- [ ]* 16.4 Write integration tests for upload flow
  - Test complete signature request → Cloudinary upload → product creation flow
  - Test upload failure and retry scenarios
  - Test authentication and authorization checks
  - Use test Cloudinary account with cleanup

- [ ] 17. Documentation and deployment preparation
  - [ ] 17.1 Update deployment documentation
    - Document environment variable setup requirements
    - Document Cloudinary account provisioning steps
    - Add migration notes for existing ImageKit/local images
    - Document rollback procedure
  
  - [ ] 17.2 Create deployment checklist
    - Cloudinary account setup with folder structure
    - Environment variables configured in hosting environment
    - Database backup before deployment
    - Monitoring and alerting setup for Cloudinary operations

## Notes

- Tasks marked with `*` are optional property-based and integration tests that can be skipped for faster MVP delivery
- Each task references specific requirements for traceability back to the requirements document
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation uses **TypeScript** for frontend and **JavaScript** for backend (Node.js/Express)
- Frontend uses TanStack Start (React 19) with Vite
- Backend uses Express 5 with MongoDB/Mongoose
- Image uploads follow client-side pattern (frontend uploads directly to Cloudinary, backend only generates signatures)
- All Cloudinary operations use HTTPS for security
- Maximum 10 images per product enforced at both frontend validation and backend model levels
- ImageKit migration is handled gracefully with detection and logging (no breaking changes)

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1", "12.1", "12.2", "12.3", "16.1"]
    },
    {
      "id": 1,
      "tasks": ["1.1", "2.1", "2.2", "4.1", "4.2", "7.1", "7.2", "16.2"]
    },
    {
      "id": 2,
      "tasks": ["2.3", "2.4", "2.5", "4.3", "4.4", "4.5", "4.6", "4.7", "7.3"]
    },
    {
      "id": 3,
      "tasks": ["5.1", "5.2", "8.1", "8.2", "8.3"]
    },
    {
      "id": 4,
      "tasks": ["5.3", "5.4", "5.5", "5.6", "5.7", "8.4", "8.5", "8.6", "9.1", "9.2"]
    },
    {
      "id": 5,
      "tasks": ["9.3", "9.4", "9.5", "11.1", "11.2", "11.3"]
    },
    {
      "id": 6,
      "tasks": ["11.4", "11.5", "11.6", "11.7", "13.1", "13.2"]
    },
    {
      "id": 7,
      "tasks": ["14.1", "14.2", "16.3", "16.4"]
    },
    {
      "id": 8,
      "tasks": ["17.1", "17.2"]
    }
  ]
}
```
