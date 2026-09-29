import { Link } from "@tanstack/react-router";
import { BUSINESS } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-cream/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src="/garimaa-logo.jpeg"
              alt="Garimaa Fashion Hub logo"
              className="h-11 w-11 rounded-full object-cover object-center"
              loading="lazy"
            />
            <p className="font-display text-xl tracking-[0.12em] text-primary">
              GARIMAA FASHION HUB
            </p>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Trendy collections that celebrate your style and confidence — crafted
            fabrics, considered detail, everyday elegance.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Free shipping across India · 3-day easy returns
          </p>
        </div>


        <div>
          <h2 className="mb-4 text-xs font-semibold tracking-luxe text-foreground uppercase">
            Shop
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/categories" className="hover:text-primary">Categories</Link></li>
            <li><Link to="/new-arrivals" className="hover:text-primary">New Arrivals</Link></li>
            <li><Link to="/wishlist" className="hover:text-primary">Wishlist</Link></li>
            <li><Link to="/track-order" className="hover:text-primary">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-semibold tracking-luxe text-foreground uppercase">
            Policies
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shipping-policy" className="hover:text-primary">Shipping Details</Link></li>
            <li><Link to="/refund-policy" className="hover:text-primary">Refund & Returns</Link></li>
            <li><Link to="/terms" className="hover:text-primary">Terms & Conditions</Link></li>
            <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-semibold tracking-luxe text-foreground uppercase">
            Contact
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>WhatsApp: +{BUSINESS.whatsappNumber}</li>
            <li>Phone: {BUSINESS.phone}</li>
            <li className="break-all">Email: {BUSINESS.email}</li>
            <li className="break-all">UPI: {BUSINESS.upi}</li>
            <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Garimaa Fashion Hub. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/track-order" className="hover:text-primary">Track Order</Link>
            <Link to="/admin" className="hover:text-primary">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
