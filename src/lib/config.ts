/**
 * Central business configuration.
 */
export const BUSINESS = {
  name: "Garimaa Fashion Hub",
  tagline: "Elegance in Every Thread",
  /** WhatsApp number in international format, digits only. */
  whatsappNumber: "918830817754",
  email: "garimafashionhub@gmail.com",
  phone: "8830817754",
  upi: "gaurigorivale133@oksbi",
  supportHours: "Monday–Saturday, 10:00 AM – 6:00 PM",
  jurisdiction: "Pune, Maharashtra, India",
  address: "Garimaa Fashion Hub, Pune, Maharashtra, India",
  instagram: "@garimafashionhub",
  facebook: "Garimaa Fashion Hub",
  razorpayKeyId: "rzp_test_xxxxxxxxxxxxxxxxx",
  /** Free shipping across India. */
  shippingFee: 0,
  freeShippingThreshold: 0,
  currency: "INR",
} as const;

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
