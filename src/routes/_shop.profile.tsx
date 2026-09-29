import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useShop } from "@/lib/store";
import { formatPrice } from "@/lib/config";

export const Route = createFileRoute("/_shop/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Garimaa Fashion Hub" },
      { name: "description", content: "View your Garimaa Fashion Hub profile, past orders, and tracking details." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { customer, customerToken, logoutCustomer } = useShop();
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
        setError("Unable to load your profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customer, customerToken]);

  const summary = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    return {
      totalOrders: orders.length,
      totalSpent,
      latestStatus: orders[0]?.orderStatus ?? "No orders yet",
      latestTracking: orders[0]?.trackingNumber ?? "—",
    };
  }, [orders]);

  if (!customer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="rounded-sm border border-border bg-cream/50 p-8">
          <h1 className="font-display text-4xl text-foreground">My Profile</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Create an account or sign in to see your profile, past orders, payment history, and live order tracking.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/login"
              search={{ redirect: "/profile" }}
              className="inline-flex items-center rounded-sm bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              search={{ redirect: "/profile" }}
              className="inline-flex items-center rounded-sm border border-border px-5 py-3 text-sm font-semibold text-foreground"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Garimaa Fashion Hub</p>
          <h1 className="mt-2 font-display text-4xl text-foreground">My Profile</h1>
        </div>
        <div className="rounded-sm border border-border bg-background px-4 py-3">
          <span className="text-xs uppercase text-muted-foreground">Customer</span>
          <p className="font-semibold text-foreground">{customer.name}</p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-sm border border-border bg-cream/50 p-5">
          <p className="text-xs uppercase text-muted-foreground">Total Orders</p>
          <p className="mt-2 font-display text-3xl text-foreground">{summary.totalOrders}</p>
        </div>
        <div className="rounded-sm border border-border bg-cream/50 p-5">
          <p className="text-xs uppercase text-muted-foreground">Order Spend</p>
          <p className="mt-2 font-display text-3xl text-foreground">{formatPrice(summary.totalSpent)}</p>
        </div>
        <div className="rounded-sm border border-border bg-cream/50 p-5">
          <p className="text-xs uppercase text-muted-foreground">Latest Status</p>
          <p className="mt-2 font-semibold capitalize text-foreground">{summary.latestStatus}</p>
        </div>
        <div className="rounded-sm border border-border bg-cream/50 p-5">
          <p className="text-xs uppercase text-muted-foreground">Latest Tracking</p>
          <p className="mt-2 font-mono text-sm font-semibold text-foreground">{summary.latestTracking}</p>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-sm border border-border bg-background p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              {customer.name?.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-display text-2xl text-foreground">{customer.name}</p>
              <p className="text-xs uppercase text-muted-foreground">Member</p>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-sm">
            <div className="rounded-sm border border-border p-4">
              <p className="text-xs uppercase text-muted-foreground">Email</p>
              <p className="mt-1 font-medium text-foreground">{customer.email}</p>
            </div>
            <div className="rounded-sm border border-border p-4">
              <p className="text-xs uppercase text-muted-foreground">Phone</p>
              <p className="mt-1 font-medium text-foreground">{customer.phone || "—"}</p>
            </div>
            <Link to="/track-order" className="block rounded-sm border border-border px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-cream hover:text-primary">
              Track My Orders
            </Link>
            <Link to="/wishlist" className="block rounded-sm border border-border px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-cream hover:text-primary">
              My Wishlist
            </Link>
            <button
              type="button"
              onClick={logoutCustomer}
              className="block w-full rounded-sm border border-destructive px-4 py-3 text-center text-sm font-semibold text-destructive transition hover:bg-destructive hover:text-destructive-foreground"
            >
              Logout
            </button>
          </div>
        </aside>

        <section className="rounded-sm border border-border bg-background p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Order History</p>
              <h2 className="mt-2 font-display text-3xl text-foreground">Past Orders</h2>
            </div>
            <Link to="/track-order" className="text-sm font-semibold text-primary underline">
              Track Orders
            </Link>
          </div>

          {loading && <p className="mt-4 text-sm text-muted-foreground">Loading your orders...</p>}
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          {!loading && orders.length === 0 && (
            <div className="mt-6 rounded-sm border border-dashed border-border p-6">
              <p className="text-sm text-muted-foreground">No orders found yet. Start shopping to create your first order.</p>
            </div>
          )}

          {orders.length > 0 && (
            <div className="mt-6 space-y-5">
              {orders.map((order) => (
                <article key={order._id} className="rounded-sm border border-border bg-cream/50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Order #{order._id.slice(-8)}</p>
                      <p className="mt-2 font-display text-2xl text-foreground">{order.trackingNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] uppercase text-muted-foreground">Order Total</p>
                      <p className="font-semibold text-primary">{formatPrice(order.totalAmount)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-sm border border-border bg-background p-3">
                      <p className="text-[11px] uppercase text-muted-foreground">Order Status</p>
                      <p className="mt-1 font-semibold capitalize text-foreground">{order.orderStatus}</p>
                    </div>
                    <div className="rounded-sm border border-border bg-background p-3">
                      <p className="text-[11px] uppercase text-muted-foreground">Payment Status</p>
                      <p className="mt-1 font-semibold capitalize text-foreground">{order.paymentStatus}</p>
                    </div>
                    <div className="rounded-sm border border-border bg-background p-3">
                      <p className="text-[11px] uppercase text-muted-foreground">Tracking</p>
                      <p className="mt-1 font-semibold text-foreground">{order.trackingNumber}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {order.items?.map((item: any, idx: number) => (
                      <span key={idx} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                        {item.quantity} × {item.name}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
