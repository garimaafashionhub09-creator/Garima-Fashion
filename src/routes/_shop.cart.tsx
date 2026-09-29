import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { BUSINESS, formatPrice } from "@/lib/config";
import { useShop } from "@/lib/store";
import { cartWhatsAppLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/_shop/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Garimaa Fashion Hub" },
      { name: "description", content: "Review your selections before checkout." },
      { property: "og:title", content: "Your Cart — Garimaa Fashion Hub" },
      { property: "og:description", content: "Review your selections before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    shippingFee,
    cartTotal,
  } = useShop();

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          title="Your cart is empty"
          message="Add a piece you love and it will appear here."
          action={
            <Button asChild>
              <Link to="/categories">Continue shopping</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl text-foreground">Your Cart</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border border-y border-border">
          {cart.map((item, index) => (
            <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 py-5">
              <Link to="/product/$id" params={{ id: item.productId }} className="shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="h-28 w-22 rounded-sm object-cover"
                  style={{ width: 88 }}
                />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-medium text-foreground">
                      <Link to="/product/$id" params={{ id: item.productId }}>
                        {item.name}
                      </Link>
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[item.size, item.color].filter(Boolean).join(" · ") || "Standard"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-4 pt-4">
                  <div className="flex items-center rounded-sm border border-border">
                    <button
                      className="px-2.5 py-1.5"
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      className="px-2.5 py-1.5"
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      removeFromCart(index);
                      toast.message("Removed from cart");
                    }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-sm border border-border bg-cream/50 p-6">
          <h2 className="font-display text-xl text-foreground">Order Summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <Row label="Subtotal" value={formatPrice(cartSubtotal)} />
            <Row
              label="Shipping"
              value={shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
            />
            <Row label="Discount" value={formatPrice(0)} />
            <div className="border-t border-border pt-3">
              <Row label="Total" value={formatPrice(cartTotal)} bold />
            </div>
          </dl>
          {cartSubtotal < BUSINESS.freeShippingThreshold && (
            <p className="mt-3 text-xs text-muted-foreground">
              Free shipping over {formatPrice(BUSINESS.freeShippingThreshold)}.
            </p>
          )}

          <Button asChild className="mt-6 h-12 w-full rounded-sm tracking-widest">
            <Link to="/checkout">PROCEED TO CHECKOUT</Link>
          </Button>
          <div className="mt-3">
            <WhatsAppButton
              href={cartWhatsAppLink(cart, cartTotal)}
              label="ORDER CART ON WHATSAPP"
            />
          </div>
          <Link
            to="/categories"
            className="mt-4 block text-center text-xs text-muted-foreground hover:text-primary"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={bold ? "font-medium text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className={bold ? "font-semibold text-primary" : "text-foreground"}>{value}</dd>
    </div>
  );
}
