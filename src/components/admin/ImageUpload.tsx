import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface ImageUploadProps {
  onUploadComplete: (publicIds: string[], secureUrls: string[]) => void;
  onUploadError?: (error: string) => void;
  maxImages?: number;
  existingImages?: Array<{ publicId: string; secureUrl: string }>;
  adminToken?: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function ImageUpload({
  onUploadComplete,
  onUploadError,
  maxImages = 10,
  existingImages = [],
  adminToken,
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress[]>([]);
  const [uploadedPublicIds, setUploadedPublicIds] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  // Validate file type and size
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file extension
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    
    if (!validExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: `File type not supported. Accepted formats: JPEG, PNG, WEBP, GIF`,
      };
    }

    // Check MIME type
    const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid MIME type. File must be an image.`,
      };
    }

    // Check file size (10 MB = 10,485,760 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds 10 MB. Please select a smaller image.`,
      };
    }

    return { valid: true };
  }, []);

  // Handle file selection
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Check maximum images limit
    const totalImages = existingImages.length + files.length;
    if (totalImages > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed per product`);
      return;
    }

    // Validate each file
    const validatedFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error || "Invalid file");
        continue;
      }

      validatedFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setSelectedFiles(validatedFiles);
    setPreviews(newPreviews);
    setProgress(validatedFiles.map(() => ({ loaded: 0, total: 0, percentage: 0 })));
  }, [existingImages.length, maxImages, validateFile]);

  // Remove preview image
  const removePreview = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      // Revoke the object URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setProgress((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Get signed upload signature from backend
  const getUploadSignature = async () => {
    try {
      const response = await fetch(`${API_URL}/cloudinary/signature`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken && { Authorization: `Bearer ${adminToken}` }),
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to get upload signature");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting upload signature:", error);
      throw error;
    }
  };

  // Upload single file to Cloudinary
  const uploadFileToCloudinary = async (file: File, index: number, signatureData: any) => {
    return new Promise<{ publicId: string; secureUrl: string }>((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signatureData.signature);
      formData.append("timestamp", signatureData.timestamp);
      formData.append("api_key", signatureData.api_key);
      formData.append("folder", signatureData.folder);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setProgress((prev) => {
            const updated = [...prev];
            updated[index] = {
              loaded: event.loaded,
              total: event.total,
              percentage,
            };
            return updated;
          });
        }
      });

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              publicId: response.public_id,
              secureUrl: response.secure_url,
            });
          } catch (error) {
            reject(new Error("Invalid response from Cloudinary"));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      // Handle timeout
      xhr.addEventListener("timeout", () => {
        reject(new Error("Upload timed out"));
      });

      // Set timeout to 60 seconds
      xhr.timeout = 60000;

      // Send request
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`);
      xhr.send(formData);
    });
  };

  // Upload all files
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select images to upload");
      return;
    }

    setUploading(true);

    try {
      // Get signed upload parameters
      const signatureData = await getUploadSignature();

      // Upload all files
      const uploadPromises = selectedFiles.map((file, index) =>
        uploadFileToCloudinary(file, index, signatureData)
      );

      const results = await Promise.all(uploadPromises);

      // Extract public IDs and secure URLs
      const publicIds = results.map((r) => r.publicId);
      const secureUrls = results.map((r) => r.secureUrl);

      setUploadedPublicIds(publicIds);
      setUploadedUrls(secureUrls);

      toast.success(`${results.length} image(s) uploaded successfully!`);

      // Call the callback with uploaded data
      onUploadComplete(publicIds, secureUrls);

      // Clear selection
      setSelectedFiles([]);
      setPreviews((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
      setProgress([]);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      toast.error(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="image-upload">Product Images (Cloudinary)</Label>
        <Input
          id="image-upload"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif"
          multiple
          onChange={handleFileChange}
          disabled={uploading}
          className="cursor-pointer"
        />
        <p className="text-xs text-muted-foreground">
          Select up to {maxImages} images (JPEG, PNG, WEBP, GIF). Max 10 MB per image.
        </p>
      </div>

      {/* Preview Section */}
      {previews.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Images ({previews.length})</Label>
          <div className="flex flex-wrap gap-3">
            {previews.map((preview, index) => (
              <div key={`${preview}-${index}`} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="h-24 w-24 rounded-md border object-cover"
                />

                {/* Progress Indicator */}
                {uploading && progress[index] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                    <span className="text-white text-sm font-bold">
                      {progress[index].percentage}%
                    </span>
                  </div>
                )}

                {/* Remove Button */}
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => removePreview(index)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white hover:bg-destructive/90"
                    title="Remove image"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Upload Button */}
          {!uploading && (
            <Button type="button" onClick={handleUpload} className="mt-2">
              Upload to Cloudinary
            </Button>
          )}

          {uploading && (
            <p className="text-sm text-muted-foreground">
              Uploading images... Please wait.
            </p>
          )}
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <Label>Current Images ({existingImages.length})</Label>
          <div className="flex flex-wrap gap-3">
            {existingImages.map((img, index) => (
              <div key={`existing-${index}`} className="relative">
                <img
                  src={img.secureUrl}
                  alt={`Current ${index + 1}`}
                  className="h-24 w-24 rounded-md border object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
