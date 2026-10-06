import { useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useShop } from "@/lib/store";
import { BUSINESS } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/categories", label: "Categories" },
  { to: "/new-arrivals", label: "New Arrivals" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { cartCount, wishlist, customer } = useShop();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setSearchOpen(false);
    close();
    navigate({ to: "/search", search: { q: q.trim() } });
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          {/* Hamburger — mobile only */}
          <button
            className="-ml-2 p-2 md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link to="/" className="mr-auto flex items-center gap-2 md:mr-8">
            <img
              src="/garimaa-logo.jpeg"
              alt="Garimaa Fashion Hub logo"
              className="h-9 w-9 rounded-full object-cover object-center"
            />
            <span className="font-display text-lg font-semibold tracking-[0.14em] text-primary sm:text-xl">
              GARIMAA
            </span>
            <span className="ml-1 hidden font-display text-lg tracking-[0.14em] text-foreground sm:inline sm:text-xl">
              FASHION HUB
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="mr-auto hidden items-center gap-7 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-[13px] font-medium tracking-wide text-muted-foreground transition-colors hover:text-primary"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <button
            className="p-2 text-foreground/80 transition-colors hover:text-primary"
            onClick={() => setSearchOpen((s) => !s)}
            aria-label="Search products"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            to="/wishlist"
            className="relative p-2 text-foreground/80 transition-colors hover:text-primary"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && <Badge>{wishlist.length}</Badge>}
          </Link>
          <Link
            to="/cart"
            className="relative p-2 text-foreground/80 transition-colors hover:text-primary"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && <Badge>{cartCount}</Badge>}
          </Link>
          <Link
            to={customer ? "/profile" : "/login"}
            className={cn(
              "relative p-2 transition-colors hover:text-primary",
              customer ? "text-primary" : "text-foreground/80",
            )}
            aria-label={customer ? "My profile" : "Sign in"}
            title={customer ? customer.name : "Sign in"}
          >
            <User className="h-5 w-5" />
            {customer && (
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-primary" />
            )}
          </Link>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-border bg-cream/60">
            <form onSubmit={submit} className="mx-auto flex max-w-7xl gap-2 px-4 py-3 sm:px-6">
              <Input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search sarees, kurtis, lehengas…"
                aria-label="Search products"
                className="bg-background"
              />
              <Button type="submit">Search</Button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile drawer — rendered via portal directly into <body> so it
          escapes the header's stacking context and sits above everything */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Full-screen backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={close}
            />

            {/* Drawer panel */}
            <div className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-background shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <Link to="/" onClick={close} className="flex items-center gap-2">
                  <img
                    src="/garimaa-logo.jpeg"
                    alt="Garimaa Fashion Hub"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="font-display text-base tracking-[0.14em] text-primary">
                    GARIMAA
                  </span>
                </Link>
                <button
                  onClick={close}
                  aria-label="Close menu"
                  className="rounded p-1.5 text-muted-foreground hover:bg-cream hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col overflow-y-auto px-3 py-3">
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={close}
                    className="rounded-sm px-3 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-cream hover:text-primary"
                    activeProps={{ className: "bg-cream text-primary" }}
                    activeOptions={{ exact: n.to === "/" }}
                  >
                    {n.label}
                  </Link>
                ))}
                <Link
                  to="/track-order"
                  onClick={close}
                  className="rounded-sm px-3 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-cream hover:text-primary"
                >
                  Track Order
                </Link>
                <Link
                  to={customer ? "/profile" : "/login"}
                  onClick={close}
                  className="rounded-sm px-3 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-cream hover:text-primary"
                >
                  {customer ? `My Profile (${customer.name})` : "Sign In"}
                </Link>
              </nav>

              {/* Footer */}
              <div className="mt-auto border-t border-border px-5 py-4">
                <p className="text-xs text-muted-foreground">Need help?</p>
                <a
                  href={`https://wa.me/${BUSINESS.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm font-medium text-primary"
                >
                  WhatsApp: +91 88308 17754
                </a>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
      {children}
    </span>
  );
}
