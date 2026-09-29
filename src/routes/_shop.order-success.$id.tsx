import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/_shop/order-success/$id")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Garimaa Fashion Hub" },
      { name: "description", content: "Your Garimaa Fashion Hub order summary." },
      { property: "og:title", content: "Order Confirmed — Garimaa Fashion Hub" },
      { property: "og:description", content: "Your Garimaa Fashion Hub order summary." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderSuccess,
});

function OrderSuccess() {
  const { id } = Route.useParams();
  const { orders, hydrated } = useShop();
  const order = orders.find((o) => o.id === id || o.orderNumber === id);

  if (!hydrated) return <div className="py-32" />;

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          title="Order not found"
          message="We could not find this order on this device."
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
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-5 font-display text-4xl text-foreground">Order Confirmed</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Thank you for shopping with Garimaa Fashion Hub. Your order has been created
          locally and will be reviewed by the admin team.
        </p>
      </div>

      <div className="mt-10 rounded-sm border border-border bg-cream/50 p-6 text-center">
        <p className="text-xs font-medium tracking-luxe text-primary uppercase">
          Order Reference
        </p>
        <p className="mt-2 font-display text-2xl text-foreground">{order.orderNumber}</p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild variant="outline" className="rounded-sm tracking-widest">
          <Link to="/categories">CONTINUE SHOPPING</Link>
        </Button>
      </div>
    </div>
  );
}
