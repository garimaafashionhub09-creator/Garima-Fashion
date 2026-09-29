import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloating } from "@/components/WhatsAppButton";
import { enquiryWhatsAppLink } from "@/lib/whatsapp";
import { BUSINESS } from "@/lib/config";

export const Route = createFileRoute("/_shop")({
  component: ShopLayout,
});

function ShopLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <WhatsAppFloating
        href={enquiryWhatsAppLink(
          `Hello ${BUSINESS.name}, I would like to know more about your collections.`,
        )}
      />
    </div>
  );
}
