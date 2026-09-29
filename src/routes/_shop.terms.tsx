import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, PolicySection, PolicyList } from "@/components/PolicyPage";
import { BUSINESS } from "@/lib/config";

export const Route = createFileRoute("/_shop/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Garimaa Fashion Hub" },
      {
        name: "description",
        content:
          "Terms & Conditions governing orders, eligibility, pricing and liability at Garimaa Fashion Hub.",
      },
      { property: "og:title", content: "Terms & Conditions — Garimaa Fashion Hub" },
      {
        property: "og:description",
        content: "Read the terms that apply when you shop with Garimaa Fashion Hub.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PolicyPage
      title="Terms & Conditions"
      intro="By accessing or using this website and its services, you acknowledge that you have read, understood, and agreed to be bound by the Terms & Conditions mentioned below."
    >
      <PolicySection title="1. Eligibility to Use the Website">
        <p>
          The use of this website is available only to persons who are legally capable
          of entering into a binding contract under applicable laws. Persons who are
          “incompetent to contract” within the meaning of the Indian Contract Act, 1872,
          including undischarged insolvents, are not eligible to use this website.
        </p>
        <p>
          If you are a minor, i.e., under 18 years of age but at least 13 years old, you
          may use this website only under the supervision of your parent or legal
          guardian, who agrees to be bound by these Terms & Conditions. If you are below
          18 years of age, your parent or legal guardian may transact on your behalf if
          they are registered users.
        </p>
        <p>
          Minors are prohibited from purchasing any products or materials that are
          restricted for adult consumption or that cannot legally be sold to or purchased
          by minors.
        </p>
      </PolicySection>

      <PolicySection title="2. Products, Orders and Acceptance">
        <p>
          All products, services, descriptions, prices and other information displayed on
          this website constitute an “invitation to offer.” Your placement of an order
          constitutes your “offer” to purchase the selected product or service and is
          subject to these Terms & Conditions.
        </p>
        <p>
          {BUSINESS.name} reserves the right to accept or reject any order at its sole
          discretion. If you provide a valid email address, we will send you an email
          acknowledging receipt of your order. Further communication may be sent to
          confirm the order details and facilitate its processing.
        </p>
        <p>
          We will make reasonable efforts to deliver products according to the delivery
          schedule communicated at the time of ordering. However, any delay or early
          delivery caused by circumstances beyond our reasonable control shall not
          entitle the user to claim damages or compensation.
        </p>
        <p>
          We will take reasonable care to deliver the product to the correct person and
          address provided in the order. However, {BUSINESS.name} shall not be responsible
          for claims, losses, damages or compensation arising from incorrect or incomplete
          information provided by the customer.
        </p>
      </PolicySection>

      <PolicySection title="3. Questions and Clarifications">
        <p>
          If you have any questions, doubts or concerns regarding these Terms &
          Conditions, please contact us through the channels listed on our contact page
          and seek written clarification before using the relevant service.
        </p>
      </PolicySection>

      <PolicySection title="4. Disclaimer of Warranties">
        <p>
          The products, services and information provided through this website are offered
          without warranties of any kind, whether express or implied, to the fullest
          extent permitted by applicable law. {BUSINESS.name} does not warrant that:
        </p>
        <PolicyList
          items={[
            "The products or services will always be error-free.",
            "Any defects or errors will necessarily be corrected.",
            "The website will always be available without interruption.",
            "The website or its servers will always be free from viruses or other harmful components.",
          ]}
        />
      </PolicySection>

      <PolicySection title="5. Limitation of Liability">
        <p>
          To the fullest extent permitted by applicable law, {BUSINESS.name} shall not be
          liable for any loss of data, loss of profits or any indirect, special,
          incidental, consequential or other damages arising from or relating to the use
          of, or inability to use, the products, services or website.
        </p>
        <p>
          Notwithstanding the foregoing, to the extent permitted by law, our total
          liability for any claim, loss, damage or cause of action, whether arising from
          negligence, breach of contract or otherwise, shall not exceed the amount
          actually paid by the user for the specific product or service giving rise to
          the claim.
        </p>
      </PolicySection>

      <PolicySection title="6. Prices, Charges and Taxes">
        <p>
          Unless otherwise specifically stated, the prices displayed on the website
          include applicable cartage, service charges, packaging charges and other costs
          associated with processing and delivering the order.
        </p>
        <p>
          Any applicable taxes, customs duties, government charges or other statutory
          charges that are not included in the displayed or invoiced price shall be
          payable as applicable under the law.
        </p>
      </PolicySection>

      <PolicySection title="7. Communication and Consent">
        <p>
          By registering on or using this website, you consent to receive communications
          from {BUSINESS.name} through email, telephone calls and SMS regarding your
          orders, transactions and services. Users are required to provide valid contact
          details, including their phone number and email address, to facilitate such
          communication.
        </p>
        <p>
          We may also use your email address to provide service-related updates,
          newsletters, information about changes to website features, promotional
          communications and other information intended to improve your experience,
          subject to applicable laws and your communication preferences.
        </p>
      </PolicySection>

      <PolicySection title="8. Jurisdiction">
        <p>
          Any dispute, claim or matter arising out of or relating to the use of this
          website, products or services shall be subject to the jurisdiction of the
          competent courts in {BUSINESS.jurisdiction}, to the extent permitted by
          applicable law.
        </p>
      </PolicySection>

      <PolicySection title="9. Modification of Terms & Conditions">
        <p>
          {BUSINESS.name} reserves the right to modify, update or revise these Terms &
          Conditions at any time without prior notice. The latest version will be made
          available on the website, and users are advised to review it periodically.
        </p>
        <p>
          If any modified Terms & Conditions are not acceptable to you, you should
          discontinue using the website and its services. Your continued use after
          modifications are published constitutes your acceptance of the revised Terms &
          Conditions.
        </p>
      </PolicySection>

      <PolicySection title="10. General">
        <p>
          These Terms & Conditions govern your use of the website and the purchase or use
          of products and services offered through it. If any provision is found to be
          invalid or unenforceable under applicable law, the remaining provisions shall
          continue in full force and effect.
        </p>
        <p>
          For any questions regarding these Terms & Conditions, contact {BUSINESS.name} at{" "}
          {BUSINESS.email} or {BUSINESS.phone}.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
