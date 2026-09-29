import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, Minus, Plus, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";
import { ProductGrid } from "@/components/ProductGrid";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/config";
import { useShop } from "@/lib/store";
import { productWhatsAppLink } from "@/lib/whatsapp";
import { normalizeImageUrl } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shop/product/$id")({
  head: () => ({
    meta: [
      { title: "Product — Garimaa Fashion Hub" },
      {
        name: "description",
        content: "View product details, sizes and colors at Garimaa Fashion Hub.",
      },
      { property: "og:title", content: "Product — Garimaa Fashion Hub" },
      {
        property: "og:description",
        content: "Premium Indian fashion, available online and on WhatsApp.",
      },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { products, hydrated, addToCart, toggleWishlist, isWishlisted } = useShop();
  const product = products.find((p) => p.id === id || p.slug === id);

  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  if (!hydrated) {
    return (
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!product || !product.isActive) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          title="Product is currently unavailable"
          message="This piece may be sold out or no longer listed."
          action={
            <Button asChild>
              <Link to="/categories">Continue shopping</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const wished = isWishlisted(product.id);
  const outOfStock = product.stock <= 0;
  const related = products
    .filter((p) => p.isActive && p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const requireOptions = () => {
    if (product.sizes.length && !size) {
      toast.error("Please select a size");
      return false;
    }
    if (product.colors.length && !color) {
      toast.error("Please select a color");
      return false;
    }
    return true;
  };

  const add = () => {
    if (!requireOptions()) return false;
    addToCart({
      productId: product.id,
      name: product.name,
      image: normalizeImageUrl(product.images[0] ?? "", 'thumbnail'),
      price: product.price,
      quantity: qty,
      size: size ?? "",
      color: color ?? "",
    });
    return true;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        {" / "}
        <Link to="/category/$slug" params={{ slug: product.category }} className="hover:text-primary">
          {product.category}
        </Link>
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-sm bg-cream">
            <img
              src={normalizeImageUrl(product.images[imageIndex] ?? product.images[0], 'product-detail')}
              alt={product.name}
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setImageIndex(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    "h-20 w-16 overflow-hidden rounded-sm border",
                    i === imageIndex ? "border-primary" : "border-border",
                  )}
                >
                  <img src={normalizeImageUrl(img, 'thumbnail')} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-gold">
              <Star className="h-4 w-4 fill-gold" />
              {product.rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-6 grid gap-3 rounded-sm border border-border bg-cream/50 p-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-foreground">Fabric</span>
              <span className="text-muted-foreground">{product.fabric ?? "Premium fabric"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-foreground">Occasion</span>
              <span className="text-muted-foreground">{product.occasion ?? "Everyday styling"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-foreground">Care</span>
              <span className="text-muted-foreground">{product.care ?? "Dry clean or gentle hand wash"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-foreground">Fit</span>
              <span className="text-muted-foreground">{product.fit ?? "Standard fit"}</span>
            </div>
          </div>

          {product.sizes.length > 0 && (
            <Options
              label="Size"
              items={product.sizes}
              value={size}
              onChange={setSize}
            />
          )}
          {product.colors.length > 0 && (
            <Options
              label="Color"
              items={product.colors}
              value={color}
              onChange={setColor}
            />
          )}

          <div className="mt-6">
            <p className="text-xs font-semibold tracking-luxe text-foreground uppercase">
              Quantity
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center rounded-sm border border-border">
                <button
                  className="px-3 py-2"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-sm">{qty}</span>
                <button
                  className="px-3 py-2"
                  onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className={cn("text-xs", outOfStock ? "text-destructive" : "text-muted-foreground")}>
                {outOfStock ? "Out of stock" : `${product.stock} in stock`}
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Button
              className="h-12 w-full rounded-sm tracking-widest"
              disabled={outOfStock}
              onClick={() => {
                if (add()) navigate({ to: "/checkout" });
              }}
            >
              BUY NOW
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full rounded-sm tracking-widest"
              disabled={outOfStock}
              onClick={() => {
                if (add()) toast.success("Added to cart");
              }}
            >
              ADD TO CART
            </Button>
            <WhatsAppButton
              href={productWhatsAppLink(product, size ?? undefined, color ?? undefined)}
              label="ORDER ON WHATSAPP"
            />
            <button
              onClick={() => {
                const added = toggleWishlist(product.id);
                toast[added ? "success" : "message"](
                  added ? "Added to wishlist" : "Removed from wishlist",
                );
              }}
              className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <Heart className={cn("h-4 w-4", wished && "fill-primary text-primary")} />
              {wished ? "Saved to wishlist" : "Add to wishlist"}
            </button>
          </div>

          <div className="mt-8 flex items-center gap-2 rounded-sm bg-cream px-4 py-3 text-xs text-muted-foreground">
            <Truck className="h-4 w-4 text-primary" />
            Dispatched with tracking. Shipping calculated at checkout.
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl text-foreground">You may also like</h2>
          <div className="mt-8">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}

function Options({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: string[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-6">
      <p className="text-xs font-semibold tracking-luxe text-foreground uppercase">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onChange(item)}
            aria-pressed={value === item}
            className={cn(
              "min-w-11 rounded-sm border px-3 py-2 text-sm transition-colors",
              value === item
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary",
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
