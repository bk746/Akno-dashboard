"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (!isSupabaseConfigured() || isPublic) return;
    if (loading) return;
    if (!user) router.replace("/login");
  }, [user, loading, router, isPublic]);

  if (!isSupabaseConfigured() || isPublic) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-akno-bg px-6 text-center">
        <p className="text-sm font-medium text-akno-text">Chargement…</p>
        <p className="max-w-sm text-xs text-akno-muted">
          Si cet écran reste bloqué, vérifiez la connexion Supabase dans{" "}
          <code className="font-mono text-akno-text">.env.local</code>.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-akno-bg text-akno-muted">
        <p className="text-sm">Redirection…</p>
      </div>
    );
  }

  return <>{children}</>;
}
