import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function WhatsAppButton({
  href,
  label = "Order on WhatsApp",
  className,
}: {
  href: string;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm border border-whatsapp/40 bg-whatsapp/10 px-6 text-sm font-medium tracking-wide text-whatsapp transition-colors hover:bg-whatsapp hover:text-whatsapp-foreground",
        className,
      )}
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}

export function WhatsAppFloating({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-soft transition-transform hover:scale-105"
    >
      <MessageCircle className="h-5 w-5" />
    </a>
  );
}
