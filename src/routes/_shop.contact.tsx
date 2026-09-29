import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { z } from "zod";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BUSINESS } from "@/lib/config";
import { enquiryWhatsAppLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/_shop/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Garimaa Fashion Hub" },
      {
        name: "description",
        content: "Reach the Garimaa Fashion Hub team on WhatsApp or send us a message.",
      },
      { property: "og:title", content: "Contact Us — Garimaa Fashion Hub" },
      { property: "og:description", content: "We are happy to help with sizing and orders." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  message: z.string().trim().min(5, "Please write a short message").max(1000),
});

function Contact() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const parsed = schema.safeParse({ name, message });
  const waHref = parsed.success
    ? enquiryWhatsAppLink(
        `Hello ${BUSINESS.name},\n\nMy name is ${parsed.data.name}.\n\n${parsed.data.message}`,
      )
    : enquiryWhatsAppLink(`Hello ${BUSINESS.name}, I have a question.`);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl text-foreground">Contact Us</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The fastest way to reach us is WhatsApp.
      </p>

      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!parsed.success) {
              setError(parsed.error.issues[0]?.message ?? "Please check the form");
              return;
            }
            setError("");
            window.open(waHref, "_blank", "noopener,noreferrer");
          }}
        >
          <div>
            <Label htmlFor="name" className="text-xs">Your Name</Label>
            <Input
              id="name"
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 h-11"
            />
          </div>
          <div>
            <Label htmlFor="message" className="text-xs">Message</Label>
            <Textarea
              id="message"
              value={message}
              maxLength={1000}
              rows={6}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1.5"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" className="h-11 rounded-sm tracking-widest">
            SEND VIA WHATSAPP
          </Button>
        </form>

        <div className="space-y-6 rounded-sm border border-border bg-cream/50 p-6">
          <h2 className="font-display text-xl text-foreground">Reach Us</h2>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-primary" />
              <span>WhatsApp: +{BUSINESS.whatsappNumber}<br />Phone: {BUSINESS.phone}</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              {BUSINESS.email}
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              {BUSINESS.address}
            </li>
          </ul>
          <WhatsAppButton href={waHref} label="CHAT ON WHATSAPP" />
          <p className="text-xs text-muted-foreground">
            We reply on WhatsApp and email for styling, fabric, sizing, and delivery questions.
          </p>
        </div>
      </div>
    </div>
  );
}
