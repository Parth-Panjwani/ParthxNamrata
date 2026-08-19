import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Divider, Monogram } from "@/components/invite/Ornaments";

export const Route = createFileRoute("/auth")({
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
    "mt-2 w-full border border-gold/40 bg-ivory/80 px-4 py-3 text-[0.9rem] text-charcoal outline-none focus:border-gold";

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
    <main className="flex min-h-screen items-center justify-center px-5 py-14">
      <div className="paper inner-frame grain w-full max-w-sm px-6 py-10 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <Monogram size={72} />
          <p className="eyebrow mt-5">Hosts Only</p>
          <h1 className="font-display mt-2 text-3xl text-burgundy">Wedding Desk</h1>
          <Divider className="mt-5" />
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-[0.6rem] uppercase tracking-[0.26em] text-gold-deep" htmlFor="email">
              Host Email
            </label>
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
          <div>
            <label className="block text-[0.6rem] uppercase tracking-[0.26em] text-gold-deep" htmlFor="password">
              Admin Password
            </label>
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

          {error && (
            <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-[0.78rem] text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full border border-gold/70 bg-burgundy px-6 py-4 text-[0.66rem] uppercase tracking-[0.3em] text-ivory transition-colors hover:bg-burgundy-deep disabled:opacity-70"
          >
            {busy ? "Signing In…" : "Sign In to RSVP Desk"}
          </button>
        </form>
      </div>
    </main>
  );
}
