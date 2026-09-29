import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useShop } from "@/lib/store";
import { formatPrice } from "@/lib/config";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const API_URL = `${import.meta.env.VITE_API_URL ?? "http://localhost:5000/api"}`;

function Dashboard() {
  const { products, categories, orders: localOrders, adminToken } = useShop();
  const [remoteOrders, setRemoteOrders] = useState<any[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!adminToken) {
        setRemoteOrders([]);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          setRemoteOrders([]);
          return;
        }

        setRemoteOrders(data.orders || []);
      } catch {
        setRemoteOrders([]);
      }
    };

    loadOrders();
  }, [adminToken]);

  const orders = adminToken ? remoteOrders : localOrders;

  const revenue = orders
    .filter((o) => {
      const paymentStatus = o.paymentStatus ?? o.payment?.status ?? "pending";
      const orderStatus = o.orderStatus ?? "pending";

      return paymentStatus === "paid" && orderStatus !== "pending" && orderStatus !== "cancelled";
    })
    .reduce((s, o) => s + (o.totalAmount ?? 0), 0);

  const pending = orders.filter((o) => (o.orderStatus ?? "pending") === "pending").length;

  const stats = [
    { label: "Products", value: String(products.length) },
    { label: "Categories", value: String(categories.length) },
    { label: "Orders", value: String(orders.length) },
    { label: "Pending orders", value: String(pending) },
    { label: "Paid revenue", value: formatPrice(revenue) },
    { label: "Low stock (<5)", value: String(products.filter((p) => p.stock < 5).length) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your store</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-background p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-2xl text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-background p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg">Recent orders</h2>
          <Link to="/admin/orders" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {orders.slice(0, 5).map((o: any) => {
              const orderTotal = o.totalAmount ?? o.total ?? 0;
              const orderStatus = o.orderStatus ?? "pending";
              const orderTitle = o.trackingNumber ?? o.orderNumber ?? o._id ?? "Order";
              const orderCustomer = o.user?.name ?? o.customer?.name ?? "Customer";

              return (
                <li key={o._id ?? o.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{orderTitle}</p>
                    <p className="text-xs text-muted-foreground">{orderCustomer}</p>
                  </div>
                  <div className="text-right">
                    <p>{formatPrice(orderTotal)}</p>
                    <p className="text-xs capitalize text-muted-foreground">{orderStatus}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
