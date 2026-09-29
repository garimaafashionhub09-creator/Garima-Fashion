import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, PolicySection, PolicyList } from "@/components/PolicyPage";
import { BUSINESS } from "@/lib/config";

export const Route = createFileRoute("/_shop/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Details — Garimaa Fashion Hub" },
      {
        name: "description",
        content:
          "Free shipping across India, order processing timelines and tracking details for Garimaa Fashion Hub orders.",
      },
      { property: "og:title", content: "Shipping Details — Garimaa Fashion Hub" },
      { property: "og:description", content: "Free shipping across India on all orders." },
    ],
  }),
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Shipping Details"
      intro="Free shipping across India on all orders. Your order will be delivered within 7–14 working days from the date of dispatch (excluding sale and promotional periods)."
    >
      <PolicySection title="Order Processing & Delivery">
        <PolicyList
          items={[
            "Orders are processed within 24 to 48 hours and handed over to our courier partners.",
            "Most orders are delivered within 5–7 working days with free shipping. During high-demand periods (sales, festive seasons and special promotions), delivery times may be extended.",
            "We are not responsible for delays caused by courier services, unforeseen logistical issues, or if the recipient is unavailable at the time of delivery.",
          ]}
        />
      </PolicySection>

      <PolicySection title="Shipment & Tracking Details">
        <PolicyList
          items={[
            `Once your order is shipped, you will receive a WhatsApp notification from +${BUSINESS.whatsappNumber} with the tracking details.`,
            "The tracking number may take up to 24 business hours to become active on the courier website.",
            "You can track your order using the provided link, or from the Track Order page on this website.",
          ]}
        />
      </PolicySection>

      <PolicySection title="Unboxing Recommendation">
        <PolicyList
          items={[
            "To ensure a smooth support experience, we recommend recording an unboxing video while opening your package. This helps in case of any concerns regarding your order.",
          ]}
        />
        <p className="text-foreground">
          We appreciate your support and patience. Thank you for choosing {BUSINESS.name}.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
