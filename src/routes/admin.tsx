import { useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useShop } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Panel — Garimaa Fashion Hub" },
      {
        name: "description",
        content:
          "Manage products, categories and orders for Garimaa Fashion Hub from the admin dashboard.",
      },
      { property: "og:title", content: "Admin Panel — Garimaa Fashion Hub" },
      {
        property: "og:description",
        content: "Manage products, categories and orders for Garimaa Fashion Hub.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLayout,
});

const LINKS = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/products", label: "Products", exact: false },
  { to: "/admin/categories", label: "Categories", exact: false },
  { to: "/admin/orders", label: "Orders", exact: false },
] as const;

function AdminLayout() {
  const { adminEmail, adminToken, hydrated, logout } = useShop();
  const navigate = useNavigate();

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!adminEmail || !adminToken) return <LoginScreen />;

  return (
    <div className="flex min-h-screen flex-col bg-cream/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <img
            src="/garimaa-logo.jpeg"
            alt="Garimaa Fashion Hub logo"
            className="h-8 w-8 rounded-full object-cover object-center"
          />
          <span className="font-display tracking-[0.14em] text-primary">GARIMAA ADMIN</span>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/" className="text-xs text-muted-foreground hover:text-primary">
              View store
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                logout();
                toast.success("Signed out");
                navigate({ to: "/", replace: true });
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              className="rounded-sm px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-cream"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

function LoginScreen() {
  const { login } = useShop();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const authenticated = await login(username, password);
    setSubmitting(false);
    if (authenticated) toast.success("Welcome back");
    else toast.error("Invalid admin username or password");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream/50 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-lg border border-border bg-background p-8 shadow-soft"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <img
            src="/garimaa-logo.jpeg"
            alt="Garimaa Fashion Hub logo"
            className="h-14 w-14 rounded-full object-cover object-center"
          />
          <h1 className="font-display text-xl text-primary">Admin Login</h1>
          <p className="text-xs text-muted-foreground">Garimaa Fashion Hub dashboard</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </div>
        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary">
            ← Back to store
          </Link>
        </div>
      </form>
    </div>
  );
}
