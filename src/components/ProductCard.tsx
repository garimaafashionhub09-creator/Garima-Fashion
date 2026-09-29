import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/config";
import { useShop } from "@/lib/store";
import { normalizeImageUrl } from "@/lib/cloudinary";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isWishlisted } = useShop();
  const wished = isWishlisted(product.id);
  const onSale = !!product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <article className="group relative">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="block overflow-hidden rounded-sm bg-cream"
      >
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={normalizeImageUrl(product.images[0], 'thumbnail')}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1">
        {product.isNewArrival && <Tag>New</Tag>}
        {onSale && <Tag>Sale</Tag>}
        {product.isFeatured && <Tag>Featured</Tag>}
      </div>

      <button
        onClick={() => {
          const added = toggleWishlist(product.id);
          toast[added ? "success" : "message"](
            added ? "Added to wishlist" : "Removed from wishlist",
          );
        }}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wished}
        className="absolute right-3 top-3 rounded-full bg-background/90 p-2 text-foreground/70 shadow-card transition-colors hover:text-primary"
      >
        <Heart className={cn("h-4 w-4", wished && "fill-primary text-primary")} />
      </button>

      <div className="pt-3">
        <h3 className="font-sans text-sm font-medium leading-snug text-foreground">
          <Link to="/product/$id" params={{ id: product.id }} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-primary">
            {formatPrice(product.price)}
          </span>
          {onSale && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-fit bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">
      {children}
    </span>
  );
}
