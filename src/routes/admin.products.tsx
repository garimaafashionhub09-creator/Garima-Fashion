import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useShop } from "@/lib/store";
import { formatPrice } from "@/lib/config";
import { normalizeImageUrl } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const blank = (category: string): Product => ({
  id: `prd_${Date.now()}`,
  name: "",
  slug: "",
  description: "",
  price: 0,
  compareAtPrice: undefined,
  category,
  images: [],
  sizes: ["Free Size"],
  colors: [],
  rating: 5,
  reviewCount: 0,
  stock: 10,
  isFeatured: false,
  isNewArrival: true,
  isOffer: false,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const list = (text: string) =>
  text
    .trim()
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

function AdminProducts() {
  const {
    products,
    categories,
    saveProduct,
    deleteProduct,
    adminToken,
  } = useShop();

  const [draft, setDraft] = useState<Product | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [cloudinaryPublicIds, setCloudinaryPublicIds] = useState<string[]>([]);
  const [useCloudinary, setUseCloudinary] = useState(true); // Toggle between Cloudinary and legacy upload
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = products.filter((product) =>
    product.name
      .toLowerCase()
      .includes(q.trim().toLowerCase()),
  );

  const handleAddProduct = () => {
    setDraft(blank(categories[0]?.slug ?? ""));
    setImageFiles([]);
    setImagePreviews([]);
    setCloudinaryPublicIds([]);
  };

  const handleEditProduct = (product: Product) => {
    setDraft(product);

    // Existing images from backend
    setImagePreviews(product.images || []);

    // No new files selected initially
    setImageFiles([]);
    setCloudinaryPublicIds([]);
  };

  // Handler for Cloudinary upload completion
  const handleCloudinaryUploadComplete = (publicIds: string[], secureUrls: string[]) => {
    setCloudinaryPublicIds(publicIds);
    toast.success(`${publicIds.length} image(s) ready to save with product`);
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(
      event.target.files || [],
    );

    if (selectedFiles.length === 0) return;

    if (selectedFiles.length > 5) {
      toast.error("You can upload a maximum of 5 images");
      return;
    }

    // Check image types
    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith("image/"),
    );

    if (invalidFile) {
      toast.error("Please select only image files");
      return;
    }

    // Check total size - optional 10MB limit per image
    const largeFile = selectedFiles.find(
      (file) => file.size > 10 * 1024 * 1024,
    );

    if (largeFile) {
      toast.error(
        "Each image must be smaller than 10MB",
      );
      return;
    }

    const previews = selectedFiles.map((file) =>
      URL.createObjectURL(file),
    );

    setImageFiles(selectedFiles);
    setImagePreviews(previews);
  };

  const removeNewImage = (index: number) => {
    setImageFiles((files) =>
      files.filter((_, fileIndex) => fileIndex !== index),
    );

    setImagePreviews((previews) =>
      previews.filter(
        (_, previewIndex) => previewIndex !== index,
      ),
    );
  };

  const submit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!draft) return;

    if (!draft.name.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    if (!draft.description.trim()) {
      toast.error("Please enter a product description");
      return;
    }

    if (!draft.category) {
      toast.error("Please select a category");
      return;
    }

    // Validate Cloudinary images if using Cloudinary
    if (useCloudinary && cloudinaryPublicIds.length === 0 && imageFiles.length === 0 && (!draft.images || draft.images.length === 0)) {
      toast.error("Please upload at least one image");
      return;
    }

    setSaving(true);

    const productToSave: Product = {
      ...draft,
      slug: draft.slug || slugify(draft.name),
      updatedAt: new Date().toISOString(),
      // If we have Cloudinary public IDs, use those; otherwise keep existing images
      images: cloudinaryPublicIds.length > 0 ? cloudinaryPublicIds : draft.images,
    };

    const success = await saveProduct(
      productToSave,
      useCloudinary ? [] : imageFiles, // Only pass files if using legacy upload
    );

    setSaving(false);

    if (success) {
      toast.success(
        draft.id.startsWith("prd_")
          ? "Product added successfully"
          : "Product updated successfully",
      );

      setDraft(null);
      setImageFiles([]);
      setImagePreviews([]);
      setCloudinaryPublicIds([]);
    } else {
      toast.error(
        "Could not save product. Please check if the backend is running.",
      );
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    const success = await deleteProduct(id);

    if (success) {
      toast.success("Product deleted successfully");
    } else {
      toast.error("Could not delete product");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-foreground">
            Products
          </h1>

          <p className="text-sm text-muted-foreground">
            {products.length} total
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            value={q}
            onChange={(event) =>
              setQ(event.target.value)
            }
            placeholder="Search products"
            className="w-48"
          />

          <Button onClick={handleAddProduct}>
            Add product
          </Button>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      {draft && (
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-lg border border-border bg-background p-5 sm:grid-cols-2"
        >
          {/* NAME */}
          <div className="space-y-1.5">
            <Label htmlFor="p-name">
              Product Name
            </Label>

            <Input
              id="p-name"
              value={draft.name}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  name: event.target.value,
                  slug:
                    draft.slug ||
                    slugify(event.target.value),
                })
              }
              required
            />
          </div>

          {/* CATEGORY */}
          <div className="space-y-1.5">
            <Label htmlFor="p-cat">
              Category
            </Label>

            <select
              id="p-cat"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={draft.category}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  category: event.target.value,
                })
              }
            >
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.slug}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* PRICE */}
          <div className="space-y-1.5">
            <Label htmlFor="p-price">
              Price (₹)
            </Label>

            <Input
              id="p-price"
              type="number"
              min={0}
              value={draft.price}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  price: Number(event.target.value),
                })
              }
              required
            />
          </div>

          {/* COMPARE PRICE */}
          <div className="space-y-1.5">
            <Label htmlFor="p-compare">
              Compare at price (₹)
            </Label>

            <Input
              id="p-compare"
              type="number"
              min={0}
              value={draft.compareAtPrice ?? ""}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  compareAtPrice: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                })
              }
            />
          </div>

          {/* STOCK */}
          <div className="space-y-1.5">
            <Label htmlFor="p-stock">
              Stock
            </Label>

            <Input
              id="p-stock"
              type="number"
              min={0}
              value={draft.stock}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  stock: Number(event.target.value),
                })
              }
            />
          </div>

          {/* SIZES */}
          <div className="space-y-1.5">
            <Label htmlFor="p-sizes">
              Sizes (comma separated)
            </Label>

            <Input
              id="p-sizes"
              value={draft.sizes.join(", ")}
              placeholder="S, M, L, XL"
              onChange={(event) =>
                setDraft({
                  ...draft,
                  sizes: list(event.target.value),
                })
              }
            />
          </div>

          {/* COLORS */}
          <div className="space-y-1.5">
            <Label htmlFor="p-colors">
              Colors (comma separated)
            </Label>

            <Input
              id="p-colors"
              value={draft.colors.join(", ")}
              placeholder="Red, Blue, Green"
              onChange={(event) =>
                setDraft({
                  ...draft,
                  colors: list(event.target.value),
                })
              }
            />
          </div>

          {/* IMAGE UPLOAD - CLOUDINARY */}
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <Label>Product Images</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUseCloudinary(!useCloudinary)}
              >
                {useCloudinary ? "Switch to Legacy Upload" : "Switch to Cloudinary"}
              </Button>
            </div>

            {useCloudinary ? (
              <ImageUpload
                onUploadComplete={handleCloudinaryUploadComplete}
                maxImages={10}
                existingImages={draft.images?.map((img) => ({
                  publicId: img,
                  secureUrl: img,
                })) || []}
                adminToken={adminToken ?? undefined}
              />
            ) : (
              <>
                <Input
                  id="p-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Legacy upload: Select up to 5 images from your PC or mobile.
                </p>
              </>
            )}
          </div>

          {/* LEGACY IMAGE PREVIEW */}
          {!useCloudinary && imagePreviews.length > 0 && (
            <div className="space-y-2 sm:col-span-2">
              <Label>
                Image Preview
              </Label>

              <div className="flex flex-wrap gap-3">
                {imagePreviews.map(
                  (image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="relative"
                    >
                      <img
                        src={image}
                        alt={`Product preview ${index + 1}`}
                        className="h-24 w-24 rounded-md border object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeNewImage(index)
                        }
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* DESCRIPTION */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="p-desc">
              Description
            </Label>

            <Textarea
              id="p-desc"
              value={draft.description}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  description: event.target.value,
                })
              }
              required
            />
          </div>

          {/* CHECKBOXES */}
          <div className="flex flex-wrap gap-4 text-sm sm:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.isFeatured}
                onChange={(event) =>
                  setDraft({ ...draft, isFeatured: event.target.checked })
                }
              />
              Featured
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.isNewArrival}
                onChange={(event) =>
                  setDraft({ ...draft, isNewArrival: event.target.checked })
                }
              />
              New arrival
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.isOffer ?? false}
                onChange={(event) =>
                  setDraft({ ...draft, isOffer: event.target.checked })
                }
              />
              <span className="font-medium text-primary">Special Offer</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(event) =>
                  setDraft({ ...draft, isActive: event.target.checked })
                }
              />
              Active
            </label>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDraft(null);
                setImageFiles([]);
                setImagePreviews([]);
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Product"}
            </Button>
          </div>
        </form>
      )}

      {/* PRODUCTS TABLE */}
      <div className="overflow-x-auto rounded-lg border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-cream/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">
                Product
              </th>

              <th className="px-4 py-3">
                Category
              </th>

              <th className="px-4 py-3">
                Price
              </th>

              <th className="px-4 py-3">
                Stock
              </th>

              <th className="px-4 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {filtered.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {product.images[0] && (
                      <img
                        src={normalizeImageUrl(product.images[0], 'thumbnail')}
                        alt={product.name}
                        className="h-10 w-10 rounded-sm object-cover"
                      />
                    )}

                    <div>
                      <p className="font-medium">
                        {product.name}
                      </p>

                      {!product.isActive && (
                        <p className="text-xs text-destructive">
                          Inactive
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  {product.category}
                </td>

                <td className="px-4 py-3">
                  {formatPrice(product.price)}
                </td>

                <td className="px-4 py-3">
                  {product.stock}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleEditProduct(product)
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() =>
                        handleDelete(product.id)
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}