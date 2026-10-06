import { useState, useEffect } from "react";
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
  { to: "/offers", label: "Special Offers" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { cartCount, wishlist, customer } = useShop();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">

          {/* Hamburger — mobile only */}
          <button
            className="mr-3 shrink-0 p-1 md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo — takes remaining space on mobile, fixed on desktop */}
          <Link to="/" className="flex min-w-0 flex-1 items-center gap-2 md:flex-none md:mr-8">
            <img
              src="/garimaa-logo.jpeg"
              alt="Garimaa Fashion Hub logo"
              className="h-9 w-9 shrink-0 rounded-full object-cover object-center"
            />
            <span className="truncate font-display text-base font-semibold tracking-[0.14em] text-primary sm:text-lg">
              GARIMAA
            </span>
            <span className="hidden font-display text-base tracking-[0.14em] text-foreground lg:inline lg:text-lg">
              FASHION HUB
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="mr-auto hidden items-center gap-6 md:flex">
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

          {/* Right icons — shrink-0 so they never compress */}
          <div className="ml-auto flex shrink-0 items-center gap-1">
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
                <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-primary" />
              )}
            </Link>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-border bg-background">
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

      {/* ── Mobile drawer ──────────────────────────────────────────────────
          Rendered via portal directly into <body> so it sits on top of
          everything including the sticky header and hero slider.          */}
      {open &&
        createPortal(
          <div
            style={{ position: "fixed", inset: 0, zIndex: 99999 }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Solid dark backdrop — covers the entire viewport */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.7)",
              }}
              onClick={close}
            />

            {/* Drawer panel — slides in from left, solid white background */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: "280px",
                backgroundColor: "#fff",
                display: "flex",
                flexDirection: "column",
                boxShadow: "4px 0 24px rgba(0,0,0,0.18)",
                overflowY: "auto",
              }}
            >
              {/* Drawer header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <Link to="/" onClick={close} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img
                    src="/garimaa-logo.jpeg"
                    alt="Garimaa Fashion Hub"
                    style={{ height: 36, width: 36, borderRadius: "50%", objectFit: "cover" }}
                  />
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 16, color: "#7c2d12", letterSpacing: "0.12em" }}>
                    GARIMAA
                  </span>
                </Link>
                <button
                  onClick={close}
                  aria-label="Close menu"
                  style={{ padding: 6, color: "#6b7280" }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Nav links */}
              <nav style={{ padding: "8px 12px", flex: 1 }}>
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={close}
                    style={{
                      display: "block",
                      padding: "14px 12px",
                      fontSize: 15,
                      fontWeight: 500,
                      color: "#1c1917",
                      textDecoration: "none",
                      borderRadius: 4,
                    }}
                    activeProps={{
                      style: {
                        display: "block",
                        padding: "14px 12px",
                        fontSize: 15,
                        fontWeight: 500,
                        color: "#9f1239",
                        textDecoration: "none",
                        borderRadius: 4,
                        backgroundColor: "#fdf2f8",
                      },
                    }}
                    activeOptions={{ exact: n.to === "/" }}
                  >
                    {n.label}
                  </Link>
                ))}
                <Link
                  to="/track-order"
                  onClick={close}
                  style={{
                    display: "block",
                    padding: "14px 12px",
                    fontSize: 15,
                    fontWeight: 500,
                    color: "#1c1917",
                    textDecoration: "none",
                    borderRadius: 4,
                  }}
                >
                  Track Order
                </Link>
                <Link
                  to={customer ? "/profile" : "/login"}
                  onClick={close}
                  style={{
                    display: "block",
                    padding: "14px 12px",
                    fontSize: 15,
                    fontWeight: 500,
                    color: "#9f1239",
                    textDecoration: "none",
                    borderRadius: 4,
                  }}
                >
                  {customer ? `My Profile` : "Sign In"}
                </Link>
              </nav>

              {/* Footer */}
              <div
                style={{
                  padding: "16px 20px",
                  borderTop: "1px solid #e5e7eb",
                  backgroundColor: "#fdf8f4",
                }}
              >
                <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>Need help?</p>
                <a
                  href={`https://wa.me/${BUSINESS.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 14, fontWeight: 600, color: "#9f1239" }}
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
