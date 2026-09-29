import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, PolicySection, PolicyList } from "@/components/PolicyPage";
import { BUSINESS } from "@/lib/config";

export const Route = createFileRoute("/_shop/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund & Return Policy — Garimaa Fashion Hub" },
      {
        name: "description",
        content:
          "7-day return window, exchange rules, refund timelines and cancellation policy at Garimaa Fashion Hub.",
      },
      { property: "og:title", content: "Refund & Return Policy — Garimaa Fashion Hub" },
      {
        property: "og:description",
        content: "No-questions-asked 7-day returns on most products.",
      },
    ],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <PolicyPage
      title="Refund Policy"
      intro={`At ${BUSINESS.name}, we value our customers and strive to build a lasting relationship by offering a No-Questions-Asked 7-Day Return & Refund Policy for most products.`}
    >
      <PolicySection title="Easy Returns — Simple & Transparent">
        <PolicyList
          items={[
            "We offer a straightforward 7-day return policy from the date of delivery. If you are not satisfied with your purchase, you can initiate a return request within 7 days.",
            "Returns will not be accepted beyond the 7-day window for any reason. Refunds are applicable only for returned items.",
          ]}
        />
      </PolicySection>

      <PolicySection title="Important Sale Update">
        <PolicyList
          items={[
            "Buy 2 Get 1 Free Sale: exchange only with the same products; returns are not allowed.",
            "Exchanges are permitted only in case of damaged, defective, or incorrect products.",
            "To request an exchange, customers must share clear photos along with an uncut opening video of the package.",
            "All exchange requests must be raised within 24 hours of delivery. Please review your order carefully before placing it.",
          ]}
        />
      </PolicySection>

      <PolicySection title="How to Place a Return Request">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Return requests must be placed within 7 days of delivery. After this period,
            returns will not be accepted.
          </li>
          <li>
            Message us on WhatsApp at +{BUSINESS.whatsappNumber} or call {BUSINESS.phone}{" "}
            ({BUSINESS.supportHours}) to create a return request.
          </li>
          <li>Record an unboxing video while returning the package to ensure a smooth process.</li>
          <li>
            Return pickup: once the request is placed, our courier partner will pick up
            the package within 72 hours (3 days).
          </li>
        </ol>
      </PolicySection>

      <PolicySection title="Refund Processing">
        <p>
          We process refunds only after the returned product reaches our warehouse and
          passes the quality check.
        </p>
        <p className="font-medium text-foreground">Prepaid Orders</p>
        <PolicyList
          items={[
            "Refunds will be credited to your original payment method within 3–4 business days after the product passes our quality check.",
          ]}
        />
        <p className="font-medium text-foreground">Cash on Delivery (COD) Orders</p>
        <PolicyList
          items={[
            `You will receive a refund link via email, SMS or WhatsApp within 4–5 business days after the quality check.`,
            "Click the link received, verify your identity using an OTP, then enter your bank account details or UPI ID.",
          ]}
        />
      </PolicySection>

      <PolicySection title="Cancellation Policy">
        <PolicyList
          items={[
            "Orders can be cancelled only within 12 hours of placing them. After this period, cancellations will not be accepted.",
            "For prepaid orders, refunds may take 5–7 working days to reflect in your account from the cancellation date.",
          ]}
        />
      </PolicySection>

      <PolicySection title="Colour & Description Disclaimer">
        <p>
          We strive to display colours as accurately as possible, but slight variations may
          occur due to lighting, photography conditions and screen settings.
        </p>
        <p>
          Product details such as weight, work details and size may vary slightly.
          Customers should consider these minor differences when making a purchase.
        </p>
        <p className="text-foreground">
          Thank you for shopping with {BUSINESS.name}. We appreciate your trust and support.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
