import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { ProductGrid } from "./ProductGrid";
import { ProductFilters, type Filters } from "./ProductFilters";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShop } from "@/lib/store";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 8;

export function CatalogBrowser({
  products,
  lockedCategory,
  emptyTitle,
  emptyMessage,
}: {
  products: Product[];
  lockedCategory?: string;
  emptyTitle?: string;
  emptyMessage?: string;
}) {
  const { categories, hydrated } = useShop();
  const priceCeiling = useMemo(
    () => Math.max(2000, ...products.map((p) => p.price)),
    [products],
  );
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    maxPrice: 100000,
    inStockOnly: false,
    sizes: [],
    colors: [],
  });
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const sizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes))),
    [products],
  );
  const colors = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.colors))),
    [products],
  );

  const filtered = useMemo(() => {
    const out = products.filter((p) => {
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (p.price > filters.maxPrice) return false;
      if (filters.inStockOnly && p.stock <= 0) return false;
      if (filters.sizes.length && !p.sizes.some((s) => filters.sizes.includes(s))) return false;
      if (filters.colors.length && !p.colors.some((c) => filters.colors.includes(c))) return false;
      return true;
    });
    switch (sort) {
      case "price-asc":
        return [...out].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...out].sort((a, b) => b.price - a.price);
      case "popular":
        return [...out].sort((a, b) => b.reviewCount - a.reviewCount);
      default:
        return [...out].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  }, [products, filters, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const filterPanel = (
    <ProductFilters
      categories={
        lockedCategory
          ? categories.filter((c) => c.slug === lockedCategory)
          : categories.filter((c) => c.isActive)
      }
      sizes={sizes}
      colors={colors}
      value={filters}
      onChange={(f) => {
        setFilters(f);
        setPage(1);
      }}
      priceCeiling={priceCeiling}
    />
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
      <div className="hidden lg:block">{filterPanel}</div>

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowFilters((s) => !s)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px]" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Popularity</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showFilters && (
          <div className="mb-8 rounded-sm border border-border p-5 lg:hidden">{filterPanel}</div>
        )}

        <ProductGrid
          products={visible}
          loading={!hydrated}
          emptyTitle={emptyTitle ?? "No products match these filters"}
          emptyMessage={emptyMessage ?? "Try widening your price range or clearing filters."}
        />

        {pages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: pages }).map((_, i) => (
              <Button
                key={i}
                size="sm"
                variant={current === i + 1 ? "default" : "outline"}
                onClick={() => setPage(i + 1)}
                aria-current={current === i + 1 ? "page" : undefined}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
