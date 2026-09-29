import { useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { useShop } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_shop/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In — Garimaa Fashion Hub" },
      {
        name: "description",
        content: "Sign in or create an account at Garimaa Fashion Hub.",
      },
    ],
  }),
  component: LoginPage,
});

type Tab = "login" | "signup";

function LoginPage() {
  const { customer, loginCustomer, registerCustomer, loginGoogleCustomer } = useShop();
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/_shop/login" });

  // If already logged in, redirect away
  if (customer) {
    navigate({ to: redirect ?? "/profile", replace: true });
    return null;
  }

  const [tab, setTab] = useState<Tab>("login");

  // Shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup-only fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const dest = redirect ?? "/profile";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (tab === "signup") {
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
    }

    setBusy(true);

    try {
      if (tab === "signup") {
        const result = await registerCustomer({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        });

        if (!result.success) {
          setError(result.message ?? "Unable to create account.");
          setBusy(false);
          return;
        }

        toast.success("Account created! Welcome to Garimaa.");
      } else {
        const ok = await loginCustomer({
          email: email.trim().toLowerCase(),
          password,
        });

        if (!ok) {
          setError("Invalid email or password.");
          setBusy(false);
          return;
        }

        toast.success("Welcome back!");
      }

      navigate({ to: dest, replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter your Gmail address above first.");
      return;
    }
    if (!/@gmail\.com$/i.test(trimmed) && !/@googlemail\.com$/i.test(trimmed)) {
      setError("Please enter a valid Gmail address (@gmail.com).");
      return;
    }

    setBusy(true);
    try {
      const ok = await loginGoogleCustomer({
        name: name.trim() || trimmed.split("@")[0],
        email: trimmed,
      });

      if (!ok) {
        setError("Unable to continue with Google sign-in.");
        setBusy(false);
        return;
      }

      toast.success("Signed in with Google!");
      navigate({ to: dest, replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Link to="/">
            <img
              src="/garimaa-logo.jpeg"
              alt="Garimaa Fashion Hub"
              className="h-16 w-16 rounded-full object-cover object-center shadow-soft"
            />
          </Link>
          <h1 className="font-display text-3xl text-foreground">
            {tab === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tab === "login"
              ? "Sign in to your Garimaa account"
              : "Join Garimaa Fashion Hub today"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-border bg-background p-8 shadow-soft">
          {/* Tabs */}
          <div className="mb-6 flex rounded-sm border border-border p-1">
            <button
              type="button"
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 rounded-sm py-2 text-sm font-medium transition-colors ${
                tab === "login"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab("signup"); setError(""); }}
              className={`flex-1 rounded-sm py-2 text-sm font-medium transition-colors ${
                tab === "signup"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Signup-only fields */}
            {tab === "signup" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="login-name">Full Name</Label>
                  <Input
                    id="login-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-phone">Phone Number</Label>
                  <Input
                    id="login-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email Address</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete={tab === "signup" ? "new-password" : "current-password"}
                placeholder={tab === "signup" ? "Min. 8 characters" : "Your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {/* Submit */}
            <Button type="submit" disabled={busy} className="w-full">
              {busy
                ? "Please wait…"
                : tab === "login"
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground uppercase tracking-wider">
                or
              </span>
            </div>
          </div>

          {/* Google sign-in */}
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={handleGoogleLogin}
            className="w-full gap-2"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            For Google sign-in, enter your Gmail address in the email field above.
          </p>
        </div>

        {/* Footer links */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">← Back to store</Link>
          <span className="text-border">·</span>
          <Link to="/checkout" className="hover:text-primary">Go to checkout</Link>
          <span className="text-border">·</span>
          <Link to="/profile" className="hover:text-primary">My profile</Link>
        </div>
      </div>
    </div>
  );
}
