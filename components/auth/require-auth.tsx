"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const PUBLIC_PATHS = ["/login", "/auth/callback"];
const REDIRECT_TIMEOUT_MS = 8000;

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [redirectTimedOut, setRedirectTimedOut] = useState(false);

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (!isSupabaseConfigured() || isPublic) return;
    if (loading) return;
    if (!user) router.replace("/login");
  }, [user, loading, router, isPublic]);

  useEffect(() => {
    if (loading || user || isPublic || !isSupabaseConfigured()) {
      setRedirectTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => setRedirectTimedOut(true), REDIRECT_TIMEOUT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [loading, user, isPublic]);

  if (!isSupabaseConfigured() || isPublic) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-akno-bg px-6 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-akno-primary border-t-transparent" />
        <p className="text-sm font-medium text-akno-text">Chargement…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-akno-bg px-6 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-akno-primary border-t-transparent" />
        <p className="text-sm font-medium text-akno-text">
          {redirectTimedOut ? "Connexion requise" : "Redirection…"}
        </p>
        {redirectTimedOut && (
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="akno-btn-primary px-4 py-2 text-sm"
          >
            Aller à la connexion
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
