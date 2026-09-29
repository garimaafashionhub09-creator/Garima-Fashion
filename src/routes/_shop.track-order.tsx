import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useShop } from "@/lib/store";
import { formatPrice } from "@/lib/config";

export const Route = createFileRoute("/_shop/track-order")({
  head: () => ({
    meta: [
      { title: "Track Your Order — Garimaa Fashion Hub" },
      {
        name: "description",
        content: "Check the status of your Garimaa Fashion Hub order.",
      },
      { property: "og:title", content: "Track Your Order — Garimaa Fashion Hub" },
      { property: "og:description", content: "Check the status of your order." },
    ],
  }),
  component: TrackOrder,
});

function TrackOrder() {
  const { customer, customerToken } = useShop();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customer || !customerToken) {
      setOrders([]);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000"}/api/orders/mine`, {
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          setError(data.message ?? "Unable to load your orders.");
          setOrders([]);
          return;
        }

        setOrders(data.orders || []);
      } catch (err) {
        setError("Unable to load your order tracking details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customer, customerToken]);

  if (!customer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-display text-4xl text-foreground">Track Your Order</h1>
        <div className="mt-8 rounded-sm border border-border bg-cream/50 p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Please sign up or log in to view your order history, payment status,
            order status and unique tracking number.
          </p>
          <div className="mt-4">
            <Link to="/checkout" className="text-sm font-semibold text-primary underline">
              Go to checkout and create an account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl text-foreground">Track Your Order</h1>

      {loading && <p className="mt-4 text-sm text-muted-foreground">Loading your orders...</p>}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {!loading && orders.length === 0 && (
        <div className="mt-8 rounded-sm border border-border bg-cream/50 p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            No orders found for this customer account yet.
          </p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-8 space-y-5">
          {orders.map((order) => (
            <div key={order._id} className="rounded-sm border border-border bg-cream/50 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium tracking-luxe text-primary uppercase">Order #{order._id}</p>
                  <p className="mt-2 font-display text-2xl text-foreground">{order.trackingNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-muted-foreground">Order Status</p>
                  <p className="font-semibold capitalize text-foreground">{order.orderStatus}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-sm border border-border bg-background p-3">
                  <p className="text-xs uppercase text-muted-foreground">Payment Status</p>
                  <p className="mt-1 font-semibold capitalize text-foreground">{order.paymentStatus}</p>
                </div>
                <div className="rounded-sm border border-border bg-background p-3">
                  <p className="text-xs uppercase text-muted-foreground">Tracking Number</p>
                  <p className="mt-1 font-semibold text-foreground">{order.trackingNumber}</p>
                </div>
                <div className="rounded-sm border border-border bg-background p-3">
                  <p className="text-xs uppercase text-muted-foreground">Order Total</p>
                  <p className="mt-1 font-semibold text-primary">{formatPrice(order.totalAmount)}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {order.items?.map((item, idx) => (
                  <span key={idx} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    {item.quantity} × {item.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
