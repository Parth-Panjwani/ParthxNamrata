import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window === "undefined") {
      return { user: null };
    }

    const isAuthed = localStorage.getItem("pn_admin_authed") === "true";
    if (isAuthed) {
      return { user: { email: "parth.namrata2027@gmail.com" } };
    }

    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) return { user: data.user };
    } catch {
      /* ignore */
    }

    throw redirect({ to: "/auth" });
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthed = localStorage.getItem("pn_admin_authed") === "true";
    if (!isAuthed) {
      supabase.auth
        .getUser()
        .then(({ data }) => {
          if (!data?.user) {
            navigate({ to: "/auth", replace: true });
          } else {
            setAuthed(true);
          }
        })
        .catch(() => {
          navigate({ to: "/auth", replace: true });
        });
    } else {
      setAuthed(true);
    }
  }, [navigate]);

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-gold-deep">
          <Loader2 className="animate-spin" strokeWidth={1.4} />
        </div>
      </div>
    );
  }

  return <Outlet />;
}
