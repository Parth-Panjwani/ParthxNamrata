import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, LogIn, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CornerFlourishes, Divider, Monogram } from "@/components/invite/Ornaments";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Host Sign In — Parth & Namrata" },
      { name: "description", content: "Private sign in for the wedding hosts to manage RSVPs." },
      { property: "og:title", content: "Host Sign In — Parth & Namrata" },
      { property: "og:description", content: "Private sign in for the wedding hosts." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("parth.namrata2027@gmail.com");
  const [password, setPassword] = useState("parthxnamrata");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("pn_admin_authed") === "true") {
      navigate({ to: "/admin", replace: true });
    }
  }, [navigate]);

  const field =
    "w-full rounded-xl border border-gold/45 bg-ivory/90 pl-10 pr-4 py-3 font-sans text-sm text-charcoal outline-none transition-all duration-200 placeholder:text-warmgrey/50 shadow-sm focus:border-gold focus:bg-ivory focus:ring-2 focus:ring-gold/30";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const validEmail = "parth.namrata2027@gmail.com";
      const validPassword = "parthxnamrata";

      if (email.trim().toLowerCase() === validEmail && password === validPassword) {
        localStorage.setItem("pn_admin_authed", "true");
        try {
          await supabase.auth.signInWithPassword({ email, password });
        } catch {
          /* optional client session */
        }
        navigate({ to: "/admin", replace: true });
        return;
      }

      setError("Invalid host email or password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="paper inner-frame grain relative w-full max-w-sm px-6 py-9 sm:px-8 rounded-3xl shadow-lift">
        <CornerFlourishes />
        <div className="flex flex-col items-center text-center">
          <Monogram size={64} />
          <p className="eyebrow mt-4 text-[0.6rem] tracking-[0.3em] text-gold-deep font-semibold whitespace-nowrap">
            Hosts Only
          </p>
          <h1 className="font-creative mt-1.5 text-2xl sm:text-3xl font-semibold text-burgundy">
            Wedding Desk
          </h1>
          <Divider className="mt-4" />
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label
              className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold"
              htmlFor="email"
            >
              Host Email
            </label>
            <div className="relative mt-1.5">
              <Mail
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-warmgrey"
              />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
              />
            </div>
          </div>

          <div>
            <label
              className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold"
              htmlFor="password"
            >
              Admin Password
            </label>
            <div className="relative mt-1.5">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-warmgrey"
              />
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={field}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-[0.75rem] text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-3d-primary mt-2 flex w-full items-center justify-center gap-2 !py-3.5 text-[0.68rem] tracking-[0.2em] whitespace-nowrap disabled:opacity-60"
          >
            <LogIn size={13} strokeWidth={1.6} />
            <span className="relative z-10 whitespace-nowrap">
              {busy ? "Signing In…" : "Sign In to RSVP Desk"}
            </span>
          </button>
        </form>
      </div>
    </main>
  );
}
