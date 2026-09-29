# Cloudinary Integration Setup Guide

## Overview

This guide explains how to set up and use Cloudinary cloud storage for product images in the Garima Fashion e-commerce application.

## What Was Implemented

### Backend Components
- **Cloudinary Configuration** (`backend/config/cloudinary.js`)
  - Environment variable validation
  - Fail-fast startup if credentials missing
  - Secure Cloudinary SDK initialization

- **Cloudinary Controller** (`backend/controllers/cloudinaryController.js`)
  - `generateUploadSignature` - Creates signed upload parameters for secure frontend uploads
  - `deleteImage` - Deletes images from Cloudinary with safety checks

- **Cloudinary Routes** (`backend/routes/cloudinary.js`)
  - `POST /api/cloudinary/signature` - Get signed upload parameters (Admin only)
  - `DELETE /api/cloudinary/images/:publicId` - Delete image (Admin only)

- **Product Controller Updates**
  - Support for both Cloudinary public IDs and legacy multer uploads
  - ImageKit URL detection and logging for migration tracking
  - Validation for maximum 10 images per product
  - Cloudinary public ID format validation

### Frontend Components
- **Image Delivery Service** (`src/lib/cloudinary.ts`)
  - `generateImageUrl()` - Generate optimized image URLs with transformations
  - Context-specific presets: thumbnail (300x300), product-detail (800px), gallery (1200px)
  - `normalizeImageUrl()` - Handle both Cloudinary IDs and legacy URLs
  - Placeholder image support

- **Image Upload Component** (`src/components/admin/ImageUpload.tsx`)
  - File validation (type, size, MIME type)
  - Upload progress tracking
  - Direct upload to Cloudinary from browser
  - Support for up to 10 images per product

## Prerequisites

1. **Cloudinary Account**
   - Sign up at https://cloudinary.com (free tier available)
   - You'll need: Cloud Name, API Key, API Secret

2. **Node.js & npm**
   - Backend requires Node.js 16+ 
   - npm packages already installed

## Step-by-Step Setup

### 1. Get Cloudinary Credentials

1. Go to https://cloudinary.com and sign up (or log in)
2. Navigate to your Dashboard
3. Copy the following credentials:
   - **Cloud name** (e.g., `your-cloud-name`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

### 2. Configure Backend Environment

Edit `backend/.env`:

```env
# Add these Cloudinary variables
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
```

**Important**: Replace `your-actual-*` with your real Cloudinary credentials.

### 3. Configure Frontend Environment

Edit `.env` (root directory):

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
```

### 4. Start the Backend Server

```bash
cd backend
node server.js
```

**Expected output:**
```
Cloudinary configured successfully!
MongoDB Connected Successfully!
Server running on port 5000
```

If you see "Cloudinary configuration errors", check that your credentials are correct.

### 5. Start the Frontend

```bash
# From project root
npm run dev
```

## Using Cloudinary Image Upload

### Admin Panel - Adding Product Images

1. Navigate to `/admin/products`
2. Click "Add product" or "Edit" existing product
3. Use the new **ImageUpload component**:
   - Click "Choose files" and select images
   - Supports: JPEG, PNG, WEBP, GIF
   - Max size: 10 MB per image
   - Max images: 10 per product
4. Click "Upload to Cloudinary"
5. Watch upload progress
6. Fill in product details and click "Save Product"

### How It Works

1. **Frontend Requests Signature**
   - Admin uploads trigger a request to `/api/cloudinary/signature`
   - Backend generates a signed upload URL (valid for 1 hour)

2. **Direct Upload to Cloudinary**
   - Images upload directly from browser to Cloudinary
   - No image data passes through your backend (saves bandwidth)

3. **Store Public IDs**
   - Cloudinary returns a `public_id` (e.g., `garima-fashion/products/abc123`)
   - This public ID is stored in MongoDB instead of file paths

4. **Display Images**
   - Frontend uses `generateImageUrl(publicId, context)` to create optimized URLs
   - Automatic transformations based on context (thumbnail, detail, gallery)

## Image Transformations

The system automatically optimizes images for different contexts:

### Thumbnail (Product Grid)
```typescript
generateImageUrl(publicId, 'thumbnail')
// Generates: 300x300, cropped, auto format, auto quality
```

### Product Detail
```typescript
generateImageUrl(publicId, 'product-detail')
// Generates: 800px width, auto format, auto quality
```

### Gallery View
```typescript
generateImageUrl(publicId, 'gallery')
// Generates: 1200px width, auto format, auto quality
```

### Benefits
- **Automatic WebP delivery** for supported browsers
- **Responsive images** optimized for device size
- **CDN delivery** for fast loading worldwide
- **No server bandwidth** consumed for images

## Migration from Local/ImageKit

### Detection
The system automatically detects and logs ImageKit URLs:

```
[ImageKit Migration] Product 123abc contains ImageKit URL: https://ik.imagekit.io/...
```

### Migration Strategy

**Option 1: Gradual Migration (Recommended)**
- Keep existing local/ImageKit images working
- Use Cloudinary for all new uploads
- Manually migrate high-priority products over time

**Option 2: Bulk Migration**
1. Download all existing images
2. Upload to Cloudinary using bulk upload API
3. Update MongoDB with new public IDs
4. Test thoroughly before deploying

### Backward Compatibility
The system supports mixed image formats during migration:
- Cloudinary public IDs: `garima-fashion/products/saree-001`
- Local URLs: `http://localhost:5000/uploads/image.jpg`
- ImageKit URLs: `https://ik.imagekit.io/...`

## API Endpoints

### Generate Upload Signature
```http
POST /api/cloudinary/signature
Authorization: Bearer <admin-jwt-token>

Response:
{
  "success": true,
  "signature": "abc123...",
  "timestamp": 1234567890,
  "api_key": "123456789",
  "cloud_name": "your-cloud-name",
  "folder": "garima-fashion/products"
}
```

### Delete Image
```http
DELETE /api/cloudinary/images/:publicId
Authorization: Bearer <admin-jwt-token>

Response:
{
  "success": true,
  "message": "Image deleted successfully"
}
```

## Security Features

1. **Admin-Only Access**
   - All Cloudinary operations require admin JWT token
   - Non-admin users cannot upload or delete images

2. **Signed Uploads**
   - API secret never exposed to frontend
   - Signatures expire after 1 hour
   - Uploads restricted to `garima-fashion/products` folder

3. **Validation**
   - File type validation (extensions + MIME types)
   - File size limits (10 MB max)
   - Maximum 10 images per product
   - Public ID format validation

4. **Deletion Safety**
   - Cannot delete images still in use by products
   - Atomic operations (Cloudinary + database)

## Troubleshooting

### "Cloudinary configuration errors"
- Check that all three environment variables are set
- Ensure no extra spaces or quotes in `.env` file
- Verify credentials are correct from Cloudinary dashboard

### Upload fails with "401 Unauthorized"
- Make sure you're logged in as admin
- Check that admin JWT token is valid
- Verify backend is running on port 5000

### Images not displaying
- Check `VITE_CLOUDINARY_CLOUD_NAME` in frontend `.env`
- Verify public IDs are stored correctly in MongoDB
- Check browser console for errors

### "Maximum 10 images allowed"
- Each product can have up to 10 images
- Remove existing images before adding more

## Cloudinary Dashboard

Access your Cloudinary dashboard at: https://cloudinary.com/console

**Useful Features:**
- **Media Library** - View all uploaded images
- **Transformations** - See transformation usage
- **Usage** - Monitor storage and bandwidth
- **Settings** - Configure upload presets, security settings

## Cost Considerations

Cloudinary Free Tier includes:
- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month

For production use, monitor your usage and upgrade plan if needed.

## Next Steps

1. **Add Cloudinary credentials** to environment files
2. **Test image upload** in admin panel
3. **Verify image display** on product pages
4. **Monitor Cloudinary usage** in dashboard
5. **Plan migration** of existing images (if applicable)

## Support

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Cloudinary Support**: https://support.cloudinary.com
- **Project Issues**: Check console logs for detailed error messages
