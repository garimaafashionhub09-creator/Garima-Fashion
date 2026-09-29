import { createFileRoute, Link } from "@tanstack/react-router";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/_shop/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string).slice(0, 100) : "",
  }),
  head: () => ({
    meta: [
      { title: "Search — Garimaa Fashion Hub" },
      { name: "description", content: "Search the Garimaa Fashion Hub catalogue." },
      { property: "og:title", content: "Search — Garimaa Fashion Hub" },
      { property: "og:description", content: "Find your next favourite piece." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { products, categories } = useShop();
  const term = q.trim().toLowerCase();

  const results = products.filter((p) => {
    if (!p.isActive) return false;
    if (!term) return false;
    const cat = categories.find((c) => c.slug === p.category)?.name ?? p.category;
    return (
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      cat.toLowerCase().includes(term)
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl text-foreground">
        {term ? `Results for “${q}”` : "Search"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {term ? `${results.length} products found` : "Use the search icon in the header to begin."}
      </p>

      <div className="mt-10">
        {term ? (
          <CatalogBrowser
            products={results}
            emptyTitle="No matching products"
            emptyMessage="Try a different keyword, or browse our collections."
          />
        ) : (
          <Button asChild variant="outline">
            <Link to="/categories">Browse categories</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
