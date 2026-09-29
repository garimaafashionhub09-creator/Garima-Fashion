import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gem, Sparkles, ShieldCheck, Truck } from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import catSarees from "@/assets/cat-sarees.jpg";
import catKurtis from "@/assets/cat-kurtis.jpg";
import catWestern from "@/assets/cat-western.jpg";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/_shop/")({
  head: () => ({
    meta: [
      { title: "Garimaa Fashion Hub — Elegance in Every Thread" },
      {
        name: "description",
        content:
          "Shop premium sarees, kurtis, lehengas and dresses at Garimaa Fashion Hub. Buy online or order on WhatsApp.",
      },
      { property: "og:title", content: "Garimaa Fashion Hub — Elegance in Every Thread" },
      {
        property: "og:description",
        content:
          "Trendy collections that celebrate your style and confidence. Sarees, kurtis, lehengas and more.",
      },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { icon: Sparkles, title: "Trending Collections", text: "Handpicked Styles" },
  { icon: Gem, title: "Premium Quality", text: "Best Fabrics" },
  { icon: ShieldCheck, title: "Easy Ordering", text: "Online + WhatsApp" },
  { icon: Truck, title: "Safe Shipping", text: "Reliable Delivery" },
];

const collectionSlides = [
  {
    image: catSarees,
    eyebrow: "Saree Edit",
    title: "Sarees for Every Celebration",
    subtitle: "Silk, georgette and handcrafted festive drapes.",
    cta: "Shop Sarees",
    route: "/category/$slug" as const,
    slug: "sarees",
  },
  {
    image: catKurtis,
    eyebrow: "Kurtis Collection",
    title: "Everyday Kurtis",
    subtitle: "Soft cotton, graceful fits and modern comfort.",
    cta: "Shop Kurtis",
    route: "/category/$slug" as const,
    slug: "kurtis",
  },
  {
    image: catWestern,
    eyebrow: "Western Wear",
    title: "Modern Western Styles",
    subtitle: "Relaxed co-ords, elegant dresses and fresh edits.",
    cta: "Shop Western Wear",
    route: "/category/$slug" as const,
    slug: "western-wear",
  },
  {
    image: heroImage,
    eyebrow: "Special Offer",
    title: "Festival Styling Picks",
    subtitle: "Shop curated fashion edits with exclusive savings.",
    cta: "Shop Offers",
    route: "/new-arrivals" as const,
    slug: "new-arrivals",
  },
];

function Home() {
  const { products, categories, hydrated } = useShop();
  const active = products.filter((p) => p.isActive);
  const newArrivals = active.filter((p) => p.isNewArrival).slice(0, 4);
  const featured = active.filter((p) => p.isFeatured).slice(0, 4);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % collectionSlides.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="relative overflow-hidden rounded-sm border border-border bg-foreground shadow-soft">
          <div className="relative h-[440px] sm:h-[500px]">
            {collectionSlides.map((slide, index) => (
              <div
                key={slide.title}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  index === activeSlide ? "z-10 opacity-100" : "z-0 opacity-0"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/35 to-transparent" />
                <div className="absolute left-6 top-1/2 max-w-xl -translate-y-1/2 px-2 sm:left-10">
                  <span className="inline-block rounded-sm bg-white/90 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                    {slide.eyebrow}
                  </span>
                  <h2 className="mt-5 font-display text-4xl leading-none text-white sm:text-5xl lg:text-6xl">
                    {slide.title}
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
                    {slide.subtitle}
                  </p>
                  <div className="mt-7">
                    <Link
                      to={slide.route}
                      params={slide.route === "/category/$slug" ? { slug: slide.slug } : undefined}
                      className="inline-flex items-center rounded-sm bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-primary/90"
                    >
                      {slide.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {collectionSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                className={`h-2.5 rounded-full transition-all ${
                  index === activeSlide ? "w-8 bg-white" : "w-2.5 bg-white/60"
                }`}
                aria-label={`Show ${slide.title}`}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="gradient-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
          <div className="order-2 md:order-1">
            <p className="text-xs font-medium tracking-luxe text-primary uppercase">
              Premium Indian Fashion
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.1] text-foreground sm:text-5xl lg:text-6xl">
              Elegance in
              <br />
              Every Thread
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Trendy collections that celebrate your style and confidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-sm tracking-widest">
                <Link to="/categories">SHOP NOW</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-sm tracking-widest">
                <Link to="/new-arrivals">NEW ARRIVALS</Link>
              </Button>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <img
              src={heroImage}
              alt="Model wearing an embroidered dusty rose and wine saree"
              width={1200}
              height={1504}
              className="mx-auto aspect-[4/5] w-full max-w-md rounded-sm object-cover shadow-soft"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border/60 sm:px-6 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-background px-5 py-7 text-center">
              <f.icon className="mx-auto h-5 w-5 text-primary" />
              <h3 className="mt-3 text-sm font-medium text-foreground">{f.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading title="Shop by Category" subtitle="Find your occasion" />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories
            .filter((c) => c.isActive)
            .map((c) => (
              <Link
                key={c.id}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group relative overflow-hidden rounded-sm"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
                <span className="absolute bottom-4 left-4 font-display text-lg text-white">
                  {c.name}
                </span>
              </Link>
            ))}
          <Link
            to="/new-arrivals"
            className="flex aspect-[3/4] flex-col items-center justify-center rounded-sm bg-cream text-center transition-colors hover:bg-accent"
          >
            <span className="font-display text-lg text-primary">New Arrivals</span>
            <ArrowRight className="mt-2 h-4 w-4 text-primary" />
          </Link>
        </div>
      </section>

      <section className="bg-cream/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading title="New Arrivals" subtitle="Fresh in this season" />
          <div className="mt-10">
            <ProductGrid products={newArrivals} loading={!hydrated} />
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" className="rounded-sm tracking-widest">
              <Link to="/new-arrivals">VIEW ALL</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading title="Featured Products" subtitle="Loved by our customers" />
        <div className="mt-10">
          <ProductGrid
            products={featured}
            loading={!hydrated}
            emptyTitle="No featured pieces yet"
            emptyMessage="Mark products as featured from the admin dashboard to show them here."
          />
        </div>
      </section>
    </>
  );
}

export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      {subtitle && (
        <p className="text-xs font-medium tracking-luxe text-primary uppercase">
          {subtitle}
        </p>
      )}
      <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">{title}</h2>
    </div>
  );
}
