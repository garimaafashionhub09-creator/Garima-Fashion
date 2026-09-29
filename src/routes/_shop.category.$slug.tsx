import { createFileRoute, Link } from "@tanstack/react-router";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/_shop/category/$slug")({
  head: ({ params }) => {
    const label = params.slug
      .split("-")
      .map((w) => (w[0] ?? "").toUpperCase() + w.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${label} — Garimaa Fashion Hub` },
        {
          name: "description",
          content: `Shop our ${label.toLowerCase()} collection at Garimaa Fashion Hub.`,
        },
        { property: "og:title", content: `${label} — Garimaa Fashion Hub` },
        {
          property: "og:description",
          content: `Premium ${label.toLowerCase()}, crafted for every occasion.`,
        },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { categories, products, hydrated } = useShop();
  const category = categories.find((c) => c.slug === slug);
  const list = products.filter((p) => p.isActive && p.category === slug);

  if (hydrated && !category) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          title="Category not found"
          message="This collection may have been renamed or removed."
          action={
            <Button asChild>
              <Link to="/categories">Browse categories</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        {" / "}
        <Link to="/categories" className="hover:text-primary">Categories</Link>
        {" / "}
        <span className="text-foreground">{category?.name ?? slug}</span>
      </nav>
      <h1 className="font-display text-4xl text-foreground">{category?.name ?? slug}</h1>
      {category?.description && (
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{category.description}</p>
      )}

      <div className="mt-10">
        <CatalogBrowser
          products={list}
          lockedCategory={slug}
          emptyTitle="This collection is being restocked"
          emptyMessage="New pieces arrive weekly — explore other collections meanwhile."
        />
      </div>
    </div>
  );
}
