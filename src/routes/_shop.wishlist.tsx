import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/EmptyState";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/_shop/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Garimaa Fashion Hub" },
      { name: "description", content: "The pieces you have saved for later." },
      { property: "og:title", content: "Wishlist — Garimaa Fashion Hub" },
      { property: "og:description", content: "The pieces you have saved for later." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, products, hydrated } = useShop();
  const items = products.filter((p) => wishlist.includes(p.id) && p.isActive);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl text-foreground">Wishlist</h1>
      <div className="mt-10">
        {hydrated && items.length === 0 ? (
          <EmptyState
            title="Your wishlist is waiting for something beautiful."
            message="Tap the heart on any product to save it here."
            action={
              <Button asChild>
                <Link to="/new-arrivals">Explore new arrivals</Link>
              </Button>
            }
          />
        ) : (
          <ProductGrid products={items} loading={!hydrated} />
        )}
      </div>
    </div>
  );
}
