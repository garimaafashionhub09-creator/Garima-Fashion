import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, ShieldCheck, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { EmptyState } from "@/components/EmptyState";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BUSINESS, formatPrice } from "@/lib/config";
import { useShop } from "@/lib/store";
import { cartWhatsAppLink } from "@/lib/whatsapp";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; phone?: string };
  theme?: { color?: string };
};

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
};

type CreatePaymentOrderResponse = {
  success: boolean;
  order?: { id: string };
  message?: string;
};

async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.Razorpay) return true;

  return await new Promise((resolve) => {
    const existing = document.querySelector("script[data-razorpay]");
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpay = "true";
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const Route = createFileRoute("/_shop/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Garimaa Fashion Hub" },
      { name: "description", content: "Complete your order securely." },
      { property: "og:title", content: "Checkout — Garimaa Fashion Hub" },
      { property: "og:description", content: "Complete your order securely." },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().regex(/^[0-9+\-\s]{8,15}$/, "Enter a valid phone number"),
  address: z.string().trim().min(5, "Enter your street address").max(200),
  city: z.string().trim().min(2, "Enter your city").max(80),
  state: z.string().trim().min(2, "Enter your state").max(80),
  postalCode: z.string().trim().regex(/^[0-9]{4,10}$/, "Enter a valid postal code"),
  country: z.string().trim().min(2).max(80),
});

type Form = z.infer<typeof schema>;

const EMPTY: Form = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    cartSubtotal,
    shippingFee,
    cartTotal,
    createOrder,
    products,
    customer,
    customerToken,
    loginCustomer,
    loginGoogleCustomer,
    registerCustomer,
    logoutCustomer,
    refreshProducts,
  } = useShop();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Please enter your email and password.");
      return;
    }

    if (authMode === "signup" && !authName.trim()) {
      setAuthError("Please enter your name to create an account.");
      return;
    }

    if (authMode === "signup" && authPassword.length < 8) {
      setAuthError("Password must be at least 8 characters long.");
      return;
    }

    setAuthBusy(true);

    try {
      if (authMode === "signup") {
        const result = await registerCustomer({
          name: authName.trim(),
          email: authEmail.trim().toLowerCase(),
          phone: authPhone.trim(),
          password: authPassword,
        });

        if (!result.success) {
          setAuthError(result.message ?? "Unable to create the customer account.");
          setAuthBusy(false);
          return;
        }
      } else {
        const ok = await loginCustomer({
          email: authEmail.trim().toLowerCase(),
          password: authPassword,
        });

        if (!ok) {
          setAuthError("Invalid email or password.");
          setAuthBusy(false);
          return;
        }
      }

      setAuthBusy(false);
      setAuthError("");
      setAuthName("");
      setAuthEmail("");
      setAuthPhone("");
      setAuthPassword("");
    } catch {
      setAuthBusy(false);
      setAuthError("Something went wrong while connecting to the account service.");
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    const email = authEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setAuthError("Please enter your Gmail address.");
      return;
    }
    if (!/@gmail\.com$/i.test(email) && !/@googlemail\.com$/i.test(email)) {
      setAuthError("Please enter a Google/Gmail address.");
      return;
    }

    setAuthBusy(true);
    try {
      const ok = await loginGoogleCustomer({
        name: authName.trim() || email.split("@")[0],
        email,
      });

      if (!ok) {
        setAuthError("Unable to continue with Google login.");
        setAuthBusy(false);
        return;
      }

      setAuthBusy(false);
      setAuthError("");
      setAuthName("");
      setAuthEmail("");
      setAuthPhone("");
      setAuthPassword("");
    } catch {
      setAuthBusy(false);
      setAuthError("Something went wrong while connecting to Google sign-in.");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          title="There is nothing to check out"
          message="Add something you love to your cart first."
          action={
            <Button asChild>
              <Link to="/categories">Continue shopping</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const set = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const startRazorpay = async (orderData: { orderId: string; amount: number }, customer: Form) => {
    const razorpayKey = BUSINESS.razorpayKeyId ?? "";

    if (!window.Razorpay || !razorpayKey) {
      toast.error("Razorpay checkout is not configured in this browser session.");
      setSubmitting(false);
      return;
    }

    const razorpay = new window.Razorpay({
      key: razorpayKey,
      amount: orderData.amount,
      currency: "INR",
      name: BUSINESS.name,
      description: `Order payment for ${BUSINESS.name}`,
      order_id: orderData.orderId,
      handler: async function (response) {
        try {
          const verifyResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000"}/api/payments/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyResponse.json();
          if (!verifyResponse.ok || !verifyData.success) {
            toast.error(verifyData.message ?? "Payment verification failed.");
            setSubmitting(false);
            return;
          }

          const backendResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000"}/api/orders`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${customerToken}`,
            },
            body: JSON.stringify({
              items: cart.map((item) => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                image: item.image,
              })),
              totalAmount: cartTotal,
              shippingAddress: {
                fullName: customer.name,
                phone: customer.phone,
                address: customer.address,
                city: customer.city,
                state: customer.state,
                pincode: customer.postalCode,
                country: customer.country,
              },
              paymentStatus: "paid",
              orderStatus: "pending",
            }),
          });

          const backendData = await backendResponse.json();
          if (!backendResponse.ok || !backendData.success) {
            toast.error(backendData.message ?? "Unable to save the order details.");
            setSubmitting(false);
            return;
          }

          await refreshProducts();

          const order = createOrder({
            customer: { name: customer.name, email: customer.email, phone: customer.phone },
            shippingAddress: {
              address: customer.address,
              city: customer.city,
              state: customer.state,
              postalCode: customer.postalCode,
              country: customer.country,
            },
          });

          if (!order) {
            setSubmitting(false);
            toast.error("Something went wrong. Please try again.");
            return;
          }

          toast.success(`Order ${order.orderNumber} created`);
          setSubmitting(false);
          navigate({ to: "/order-success/$id", params: { id: order.id } });
        } catch (error) {
          console.error(error);
          toast.error(error instanceof Error ? error.message : "Payment verification failed.");
          setSubmitting(false);
        }
      },
      prefill: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      theme: {
        color: "#8d4455",
      },
    });

    razorpay.open();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!customer || !customerToken) {
      toast.error("Please sign up or log in before placing your order.");
      return;
    }

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Partial<Record<keyof Form, string>> = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as keyof Form] = issue.message;
      }
      setErrors(next);
      toast.error("Please correct the highlighted fields");
      return;
    }
    setErrors({});

    const unavailable = cart.find((item) => {
      const product = products.find((p) => p.id === item.productId);
      return !product || !product.isActive || product.stock < item.quantity;
    });

    if (unavailable) {
      toast.error("Some products are no longer available in the requested quantity.");
      return;
    }

    setSubmitting(true);

    const configuredRazorpayKey =
      typeof BUSINESS.razorpayKeyId === "string" &&
      BUSINESS.razorpayKeyId.startsWith("rzp_") &&
      !BUSINESS.razorpayKeyId.includes("xxxxxxxxxxxxxxxx");

    if (!configuredRazorpayKey) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000"}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${customerToken}`,
          },
          body: JSON.stringify({
            items: cart.map((item) => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              image: item.image,
            })),
            totalAmount: cartTotal,
            shippingAddress: {
              fullName: parsed.data.name,
              phone: parsed.data.phone,
              address: parsed.data.address,
              city: parsed.data.city,
              state: parsed.data.state,
              pincode: parsed.data.postalCode,
              country: parsed.data.country,
            },
            paymentStatus: "pending",
            orderStatus: "pending",
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          toast.error(data.message ?? "Unable to place order.");
          setSubmitting(false);
          return;
        }

        await refreshProducts();

        const localOrder = createOrder({
          customer: { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone },
          shippingAddress: {
            address: parsed.data.address,
            city: parsed.data.city,
            state: parsed.data.state,
            postalCode: parsed.data.postalCode,
            country: parsed.data.country,
          },
        });

        if (!localOrder) {
          setSubmitting(false);
          toast.error("Something went wrong. Please try again.");
          return;
        }

        toast.success(`Order ${localOrder.orderNumber} created`);
        setSubmitting(false);
        navigate({ to: "/order-success/$id", params: { id: localOrder.id } });
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Unable to save the order securely.");
        setSubmitting(false);
      }
      return;
    }

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        toast.error("Razorpay checkout script could not be loaded.");
        setSubmitting(false);
        return;
      }

      const payload = {
        amount: Math.round(cartTotal * 100),
        currency: "INR",
        receipt: `garimaa-${Date.now()}`,
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000"}/api/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as CreatePaymentOrderResponse;
      if (!response.ok || !data.success || !data.order) {
        toast.error(data.message ?? "Unable to create payment order.");
        setSubmitting(false);
        return;
      }

      await startRazorpay({
        orderId: data.order.id,
        amount: Math.round(cartTotal * 100),
      }, parsed.data);
    } catch (error) {
      console.error(error);
      toast.error("Unable to connect to Razorpay.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl text-foreground">Checkout</h1>

      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <section className="rounded-sm border border-border bg-cream/50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium tracking-luxe text-primary uppercase">Customer Account</p>
                <h2 className="mt-2 font-display text-xl text-foreground">
                  {customer ? `Welcome, ${customer.name}` : "Sign in or create an account"}
                </h2>
              </div>
              {customer && (
                <Button type="button" variant="outline" onClick={logoutCustomer}>
                  Logout
                </Button>
              )}
            </div>

            {!customer && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 flex gap-2">
                  <Button type="button" variant={authMode === "signup" ? "default" : "outline"} size="sm" onClick={() => setAuthMode("signup")}>Create Account</Button>
                  <Button type="button" variant={authMode === "login" ? "default" : "outline"} size="sm" onClick={() => setAuthMode("login")}>Sign In</Button>
                </div>

                {authMode === "signup" && (
                  <>
                    <div>
                      <Label htmlFor="auth-name" className="text-xs">Name</Label>
                      <Input id="auth-name" value={authName} onChange={(e) => setAuthName(e.target.value)} className="mt-1.5 h-11" placeholder="Your name" />
                    </div>
                    <div>
                      <Label htmlFor="auth-phone" className="text-xs">Phone</Label>
                      <Input id="auth-phone" value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} className="mt-1.5 h-11" placeholder="Phone number" />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="auth-email" className="text-xs">Email</Label>
                  <Input id="auth-email" type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="mt-1.5 h-11" placeholder="customer@email.com" />
                </div>
                <div>
                  <Label htmlFor="auth-password" className="text-xs">Password</Label>
                  <Input id="auth-password" type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="mt-1.5 h-11" placeholder="Password" />
                </div>

                {authError && <p className="sm:col-span-2 text-sm text-destructive">{authError}</p>}

                <div className="sm:col-span-2 flex flex-wrap justify-end gap-2">
                  <Button type="button" onClick={handleAuth} disabled={authBusy} className="rounded-sm tracking-widest">
                    {authBusy ? "Please wait…" : authMode === "signup" ? "Create account" : "Sign in"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleGoogleLogin} disabled={authBusy} className="rounded-sm tracking-widest">
                    Continue with Google
                  </Button>
                </div>
              </div>
            )}
          </section>

          <Section title="Customer Information">
            <Field id="name" label="Full Name" value={form.name} onChange={set("name")} error={errors.name} autoComplete="name" />
            <Field id="email" label="Email" type="email" value={form.email} onChange={set("email")} error={errors.email} autoComplete="email" />
            <Field id="phone" label="Phone Number" value={form.phone} onChange={set("phone")} error={errors.phone} autoComplete="tel" />
          </Section>

          <Section title="Shipping Address">
            <Field id="address" label="Address" value={form.address} onChange={set("address")} error={errors.address} autoComplete="street-address" className="sm:col-span-2" />
            <Field id="city" label="City" value={form.city} onChange={set("city")} error={errors.city} autoComplete="address-level2" />
            <Field id="state" label="State" value={form.state} onChange={set("state")} error={errors.state} autoComplete="address-level1" />
            <Field id="postalCode" label="Postal Code" value={form.postalCode} onChange={set("postalCode")} error={errors.postalCode} autoComplete="postal-code" />
            <Field id="country" label="Country" value={form.country} onChange={set("country")} error={errors.country} autoComplete="country-name" />
          </Section>

          <Section title="Payment">
            <div className="sm:col-span-2 rounded-sm border border-border bg-cream/50 p-5">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CreditCard className="h-4 w-4 text-primary" />
                Pay securely with Razorpay
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Razorpay is not connected on this environment yet. Your order is
                recorded with payment status <strong>Pending</strong>, and our team
                will confirm the payment link with you. Payment is only ever marked
                paid after server-side verification.
              </p>
              <p className="mt-3 rounded-sm border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                Prefer UPI? Pay to <strong className="text-foreground">{BUSINESS.upi}</strong>{" "}
                and share the payment screenshot on WhatsApp (+{BUSINESS.whatsappNumber}).
              </p>
              <ul className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <li className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Secure Payment</li>
                <li className="flex items-center gap-1"><Lock className="h-3.5 w-3.5 text-primary" /> SSL Protected</li>
              </ul>
            </div>
          </Section>
        </div>

        <aside className="h-fit rounded-sm border border-border bg-cream/50 p-6">
          <h2 className="font-display text-xl text-foreground">Order Summary</h2>
          <ul className="mt-5 space-y-4">
            {cart.map((item) => (
              <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                <img src={item.image} alt="" loading="lazy" className="h-16 w-12 rounded-sm object-cover" />
                <div className="flex-1 text-xs">
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-muted-foreground">
                    {[item.size, item.color].filter(Boolean).join(" · ")} × {item.quantity}
                  </p>
                </div>
                <p className="text-xs font-semibold text-primary">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            <SummaryRow label="Subtotal" value={formatPrice(cartSubtotal)} />
            <SummaryRow label="Shipping" value={shippingFee === 0 ? "Free" : formatPrice(shippingFee)} />
            <SummaryRow label="Discount" value={formatPrice(0)} />
            <div className="border-t border-border pt-2">
              <SummaryRow label="Total" value={formatPrice(cartTotal)} bold />
            </div>
          </dl>

          <Button type="submit" disabled={submitting} className="mt-6 h-12 w-full rounded-sm tracking-widest">
            {submitting ? "PLACING ORDER…" : "PLACE ORDER"}
          </Button>
          <div className="mt-3">
            <WhatsAppButton href={cartWhatsAppLink(cart, cartTotal)} label="ORDER ON WHATSAPP" />
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-foreground">{title}</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={bold ? "font-medium text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className={bold ? "font-semibold text-primary" : "text-foreground"}>{value}</dd>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string | undefined;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-xs tracking-wide">
        {label}
      </Label>
      <Input
        id={id}
        className="mt-1.5 h-11 bg-background"
        required
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
