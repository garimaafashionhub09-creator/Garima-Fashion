import { BUSINESS, formatPrice } from "./config";
import type { CartItem, Product } from "./types";

const link = (message: string) =>
  `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(message)}`;

export function productWhatsAppLink(
  product: Product,
  size?: string,
  color?: string,
) {
  const lines = [
    `Hello ${BUSINESS.name},`,
    "",
    "I am interested in:",
    "",
    `Product: ${product.name}`,
    `Price: ${formatPrice(product.price)}`,
  ];
  if (size) lines.push(`Size: ${size}`);
  if (color) lines.push(`Color: ${color}`);
  lines.push("", "Please confirm availability and ordering details.");
  return link(lines.join("\n"));
}

export function cartWhatsAppLink(items: CartItem[], total: number) {
  const lines = [
    `Hello ${BUSINESS.name},`,
    "",
    "I would like to order:",
    "",
    ...items.map(
      (i) =>
        `${i.quantity} × ${i.name}${i.size ? ` (${i.size})` : ""} — ${formatPrice(i.price * i.quantity)}`,
    ),
    "",
    `Total: ${formatPrice(total)}`,
    "",
    "Please confirm availability and ordering details.",
  ];
  return link(lines.join("\n"));
}

export function enquiryWhatsAppLink(message: string) {
  return link(message);
}
