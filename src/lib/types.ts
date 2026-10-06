export type Review = {
  _id: string;
  product: string;
  user: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | undefined;
  category: string; // category slug
  images: string[];
  sizes: string[];
  colors: string[];
  fabric?: string;
  occasion?: string;
  care?: string;
  fit?: string;
  details?: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isOffer: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
};

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  orderNumber: string;
  customerId?: string;
  customer: { name: string; email: string; phone: string };
  items: CartItem[];
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  payment: {
    provider: "razorpay";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    status: PaymentStatus;
  };
  orderStatus: OrderStatus;
  shipping: {
    shiprocketOrderId?: string;
    courier?: string;
    trackingNumber?: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
};
