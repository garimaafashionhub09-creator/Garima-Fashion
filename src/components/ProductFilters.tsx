import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatPrice } from "@/lib/config";
import type { Category } from "@/lib/types";

export type Filters = {
  categories: string[];
  maxPrice: number;
  inStockOnly: boolean;
  sizes: string[];
  colors: string[];
};

export function ProductFilters({
  categories,
  sizes,
  colors,
  value,
  onChange,
  priceCeiling,
}: {
  categories: Category[];
  sizes: string[];
  colors: string[];
  value: Filters;
  onChange: (f: Filters) => void;
  priceCeiling: number;
}) {
  const toggle = (key: "categories" | "sizes" | "colors", item: string) => {
    const list = value[key];
    onChange({
      ...value,
      [key]: list.includes(item) ? list.filter((x) => x !== item) : [...list, item],
    });
  };

  return (
    <aside className="space-y-8">
      <Group title="Categories">
        {categories.map((c) => (
          <Row key={c.slug}>
            <Checkbox
              id={`cat-${c.slug}`}
              checked={value.categories.includes(c.slug)}
              onCheckedChange={() => toggle("categories", c.slug)}
            />
            <Label htmlFor={`cat-${c.slug}`} className="text-sm font-normal">
              {c.name}
            </Label>
          </Row>
        ))}
      </Group>

      <Group title="Price">
        <Slider
          value={[value.maxPrice]}
          min={0}
          max={priceCeiling}
          step={100}
          onValueChange={([v]) => onChange({ ...value, maxPrice: v ?? 0 })}
          aria-label="Maximum price"
        />
        <p className="mt-3 text-xs text-muted-foreground">
          Up to {formatPrice(value.maxPrice)}
        </p>
      </Group>

      <Group title="Availability">
        <Row>
          <Checkbox
            id="in-stock"
            checked={value.inStockOnly}
            onCheckedChange={(c) => onChange({ ...value, inStockOnly: c === true })}
          />
          <Label htmlFor="in-stock" className="text-sm font-normal">
            In stock only
          </Label>
        </Row>
      </Group>

      {sizes.length > 0 && (
        <Group title="Size">
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => toggle("sizes", s)}
                aria-pressed={value.sizes.includes(s)}
                className={`rounded-sm border px-3 py-1 text-xs transition-colors ${
                  value.sizes.includes(s)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Group>
      )}

      {colors.length > 0 && (
        <Group title="Color">
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => toggle("colors", c)}
                aria-pressed={value.colors.includes(c)}
                className={`rounded-sm border px-3 py-1 text-xs transition-colors ${
                  value.colors.includes(c)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Group>
      )}
    </aside>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold tracking-luxe text-foreground uppercase">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}
