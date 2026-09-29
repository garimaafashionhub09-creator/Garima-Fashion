import { createFileRoute, Link } from "@tanstack/react-router";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/_shop/categories")({
  head: () => ({
    meta: [
      { title: "Shop by Category — Garimaa Fashion Hub" },
      {
        name: "description",
        content:
          "Browse sarees, kurtis, lehengas, dresses, dupattas, kids wear and western wear.",
      },
      { property: "og:title", content: "Shop by Category — Garimaa Fashion Hub" },
      {
        property: "og:description",
        content: "Explore every Garimaa Fashion Hub collection in one place.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories, products } = useShop();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl text-foreground">Categories</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Every collection, curated for your occasion.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {categories
          .filter((c) => c.isActive)
          .map((c) => {
            const count = products.filter(
              (p) => p.category === c.slug && p.isActive,
            ).length;
            return (
              <Link
                key={c.id}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group overflow-hidden rounded-sm bg-cream"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="p-4">
                  <h2 className="font-display text-lg text-foreground">{c.name}</h2>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {c.description}
                  </p>
                  <p className="mt-2 text-xs text-primary">{count} products</p>
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
