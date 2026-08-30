"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

/**
 * Retour après clic sur le lien de confirmation d'email (Supabase).
 * Doit rester hors RequireAuth pour que la session puisse être lue depuis l'URL.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Confirmation du compte…");

  useEffect(() => {
    const client = supabase;
    if (!client) {
      router.replace("/login");
      return;
    }

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
        router.replace("/");
      }
    });

    void client.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/");
    });

    const timeout = window.setTimeout(() => {
      void client.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setStatus(
            "Impossible de confirmer automatiquement. Vérifie que l'URL de redirection est autorisée dans Supabase (Authentication → URL Configuration → http://localhost:3000/auth/callback), puis réessaie le lien depuis l'email ou connecte-toi ci-dessous.",
          );
        }
      });
    }, 10000);

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-akno-bg px-4 text-center">
      <p className="max-w-md text-sm text-akno-muted">{status}</p>
      <Link href="/login" className="text-sm font-semibold text-akno-primary hover:underline">
        Aller à la connexion
      </Link>
    </div>
  );
}
