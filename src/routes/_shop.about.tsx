import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_shop/about")({
  head: () => ({
    meta: [
      { title: "About Us — Garimaa Fashion Hub" },
      {
        name: "description",
        content:
          "Garimaa Fashion Hub curates premium Indian fashion — sarees, kurtis, lehengas and more.",
      },
      { property: "og:title", content: "About Us — Garimaa Fashion Hub" },
      {
        property: "og:description",
        content: "Our story, our craft, and how we curate every collection.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">
            Our Story
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Garimaa Fashion Hub curates fashion for women who want considered
              detail without compromise — everyday kurtis, festive lehengas,
              handwoven sarees and modern silhouettes.
            </p>
            <p>
              Every collection is selected for fabric quality, finishing and fit.
              We work closely with our makers, keep our range tight and refresh it
              often, so what you see is what we would wear ourselves.
            </p>
            <p>
              You can shop online with secure checkout, or simply message us on
              WhatsApp — whichever feels easier.
            </p>
          </div>
          <Button asChild className="mt-8 rounded-sm tracking-widest">
            <Link to="/categories">EXPLORE COLLECTIONS</Link>
          </Button>
        </div>
        <img
          src={heroImage}
          alt="Garimaa Fashion Hub collection"
          loading="lazy"
          className="aspect-[4/5] w-full rounded-sm object-cover shadow-soft"
        />
      </div>
    </div>
  );
}
