import { createFileRoute } from "@tanstack/react-router";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/_shop/new-arrivals")({
  head: () => ({
    meta: [
      { title: "New Arrivals — Garimaa Fashion Hub" },
      {
        name: "description",
        content: "The newest sarees, kurtis, lehengas and dresses added this season.",
      },
      { property: "og:title", content: "New Arrivals — Garimaa Fashion Hub" },
      {
        property: "og:description",
        content: "Fresh styles, just landed at Garimaa Fashion Hub.",
      },
    ],
  }),
  component: NewArrivals,
});

function NewArrivals() {
  const { products } = useShop();
  const list = products.filter((p) => p.isActive && p.isNewArrival);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl text-foreground">New Arrivals</h1>
      <p className="mt-2 text-sm text-muted-foreground">Fresh in this season.</p>
      <div className="mt-10">
        <CatalogBrowser
          products={list}
          emptyTitle="No new arrivals right now"
          emptyMessage="Mark products as new arrivals in the admin dashboard to feature them here."
        />
      </div>
    </div>
  );
}
