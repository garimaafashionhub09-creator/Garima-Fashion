import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useShop } from "@/lib/store";
import { formatPrice } from "@/lib/config";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];
const API_URL = `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000"}/api`;

function AdminOrders() {
  const { adminToken, logout } = useShop();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const expireAdminSession = () => {
    logout();
    setError("Invalid or expired admin session. Please sign in again.");
    setOrders([]);
  };

  const loadOrders = async () => {
    if (!adminToken) {
      setOrders([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        if (response.status === 401 || data.message?.toLowerCase().includes("invalid or expired admin session")) {
          expireAdminSession();
        } else {
          setError(data.message ?? "Unable to load orders.");
          setOrders([]);
        }
        return;
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError("Unable to load orders from the backend.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [adminToken]);

  const deleteOrder = async (id: string) => {
    if (!adminToken) return;
    if (!window.confirm("Delete this order? This action cannot be undone.")) return;

    try {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        if (response.status === 401 || data.message?.toLowerCase().includes("invalid or expired admin session")) {
          expireAdminSession();
        } else {
          setError(data.message ?? "Unable to delete order.");
        }
        return;
      }

      setOrders((current) => current.filter((order) => order._id !== id));
    } catch (err) {
      setError("Unable to delete order.");
    }
  };

  const saveStatus = async (id: string, patch: Record<string, string>) => {
    if (!adminToken) return;

    try {
      const response = await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(patch),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        if (response.status === 401 || data.message?.toLowerCase().includes("invalid or expired admin session")) {
          expireAdminSession();
        } else {
          setError(data.message ?? "Unable to update order status.");
        }
        return;
      }

      setOrders((current) =>
        current.map((order) =>
          order._id === id
            ? {
                ...order,
                ...patch,
              }
            : order,
        ),
      );
    } catch (err) {
      setError("Unable to update order status.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground">{orders.length} total</p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading orders...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {orders.length === 0 && !loading ? (
        <p className="rounded-lg border border-border bg-background p-6 text-sm text-muted-foreground">
          No orders yet. Orders placed on the storefront appear here.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="rounded-lg border border-border bg-background p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{o.trackingNumber ?? o._id}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleString("en-IN")}
                  </p>
                  <p className="mt-2 text-sm">
                    {o.user?.name ?? "Customer"} · {o.user?.phone ?? o.shippingAddress?.phone ?? ""}
                  </p>
                  <p className="text-xs text-muted-foreground">{o.user?.email ?? ""}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {o.shippingAddress?.address ?? ""}, {o.shippingAddress?.city ?? ""},{" "}
                    {o.shippingAddress?.state ?? ""} {o.shippingAddress?.pincode ?? ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg text-primary">{formatPrice(o.totalAmount)}</p>
                  <button
                    className="rounded-sm border border-destructive px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => deleteOrder(o._id)}
                  >
                    Delete order
                  </button>
                </div>
              </div>

              <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
                {o.items?.map((i: any, idx: number) => (
                  <li key={idx}>
                    {i.quantity} × {i.name} ({i.size ?? ""}/{i.color ?? ""}) — {formatPrice(i.price)}
                  </li>
                ))}
              </ul>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <label className="text-xs">
                  <span className="mb-1 block text-muted-foreground">Order status</span>
                  <select
                    className="w-full rounded-sm border border-input bg-background px-2 py-1.5 text-sm"
                    value={o.orderStatus}
                    onChange={(e) => saveStatus(o._id, { orderStatus: e.target.value })}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs">
                  <span className="mb-1 block text-muted-foreground">Payment</span>
                  <select
                    className="w-full rounded-sm border border-input bg-background px-2 py-1.5 text-sm"
                    value={o.paymentStatus}
                    onChange={(e) => saveStatus(o._id, { paymentStatus: e.target.value })}
                  >
                    {PAYMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs">
                  <span className="mb-1 block text-muted-foreground">Tracking number</span>
                  <input
                    className="w-full rounded-sm border border-input bg-background px-2 py-1.5 text-sm"
                    value={o.trackingNumber ?? ""}
                    placeholder="e.g. GFH20260914-ABCDEF12"
                    onBlur={(e) => saveStatus(o._id, { trackingNumber: e.target.value.trim() })}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
