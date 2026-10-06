import { createFileRoute } from "@tanstack/react-router";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/_shop/offers")({
  head: () => ({
    meta: [
      { title: "Special Offers — Garimaa Fashion Hub" },
      {
        name: "description",
        content: "Exclusive deals and curated fashion edits at special prices.",
      },
      { property: "og:title", content: "Special Offers — Garimaa Fashion Hub" },
      {
        property: "og:description",
        content: "Shop special offers and exclusive savings at Garimaa Fashion Hub.",
      },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const { products } = useShop();
  const list = products.filter((p) => p.isActive && p.isOffer);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl text-foreground">Special Offers</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Curated fashion edits with exclusive savings.
      </p>
      <div className="mt-10">
        <CatalogBrowser
          products={list}
          emptyTitle="No offers right now"
          emptyMessage="Check back soon — new deals are added regularly."
        />
      </div>
    </div>
  );
}
