"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { NeuButton, NeuFieldGroup, NeuInput, NeuLabel } from "@/components/ui/neu-form";
import { NeuCard } from "@/components/ui/neu-card";
import { useAuth } from "@/context/auth-context";
import { useDataSyncOptional } from "@/context/data-sync-context";
import { isSupabaseConfigured } from "@/lib/supabase/client";

function formatAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Mot de passe incorrect pour cet email. Utilisez « Mot de passe oublié ? » ci-dessous, ou réinitialisez-le dans Supabase → Authentication → Users.";
  }
  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("load failed")
  ) {
    return "Impossible de joindre Supabase. Vérifiez votre connexion et les clés dans .env.local, puis redémarrez npm run dev.";
  }
  return message;
}

const EMAIL_CONFIRMATION_HELP =
  "Votre email n'est pas encore confirmé. Ouvrez le mail Supabase et cliquez sur le lien de confirmation, puis reconnectez-vous. En développement, vous pouvez aussi désactiver « Confirm email » dans Supabase → Authentication → Providers → Email.";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, resetPassword } = useAuth();
  const sync = useDataSyncOptional();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-akno-bg px-4 py-16">
        <NeuCard className="max-w-lg p-8">
          <BrandMark size={48} className="mb-4" />
          <h1 className="text-xl font-bold text-akno-text">Connexion</h1>
          <p className="mt-2 text-sm leading-relaxed text-akno-muted">
            Supabase n&apos;est pas configuré. Copiez le fichier{" "}
            <code className="text-xs">.env.local</code> depuis{" "}
            <strong className="font-medium text-akno-text">dashboard-keryan</strong> (même
            projet Supabase), ou ajoutez{" "}
            <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
            <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dans{" "}
            <code className="text-xs">.env.local</code>.
          </p>
          <p className="mt-3 text-sm text-akno-subtle">
            Puis exécutez{" "}
            <code className="text-xs">supabase/migrations/001_workspaces_and_buckets.sql</code>{" "}
            dans Supabase → SQL Editor (tables équipe, compatibles avec FinPilot).
          </p>
          <Link href="/" className="mt-6 inline-block">
            <NeuButton variant="primary">Continuer en local</NeuButton>
          </Link>
        </NeuCard>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setPending(true);

    if (inviteCode.trim() && mode === "signup") {
      sessionStorage.setItem("akno-pending-invite-code", inviteCode.trim().toUpperCase());
    }

    if (mode === "signin") {
      const { error: signInError, needsEmailConfirmation } = await signIn(
        email.trim(),
        password,
      );
      if (needsEmailConfirmation) {
        setPending(false);
        setInfo(EMAIL_CONFIRMATION_HELP);
        return;
      }
      if (signInError) {
        setPending(false);
        setError(formatAuthError(signInError.message));
        return;
      }
      window.location.href = "/";
      return;
    }

    const { error: signUpError, needsEmailConfirmation } = await signUp(
      email.trim(),
      password,
    );
    setPending(false);

    if (signUpError) {
      setError(formatAuthError(signUpError.message));
      return;
    }

    if (needsEmailConfirmation) {
      setInfo(EMAIL_CONFIRMATION_HELP);
      return;
    }

    if (inviteCode.trim() && sync) {
      try {
        await sync.joinTeam(inviteCode);
      } catch (joinError) {
        setError(
          joinError instanceof Error ? joinError.message : "Code équipe invalide",
        );
        return;
      }
    }

    window.location.href = "/";
  }

  async function handleForgotPassword() {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Saisissez votre email pour recevoir un lien de réinitialisation.");
      return;
    }
    setError(null);
    setInfo(null);
    setPending(true);
    const { error: resetError, sent } = await resetPassword(trimmed);
    setPending(false);
    if (resetError) {
      setError(formatAuthError(resetError.message));
      return;
    }
    if (sent) {
      setInfo(
        "Email de réinitialisation envoyé. Ouvrez le lien reçu, choisissez un nouveau mot de passe, puis reconnectez-vous ici.",
      );
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-akno-bg px-4 py-12 md:py-20">
      <NeuCard className="w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <BrandMark size={40} />
          <div>
            <h1 className="text-xl font-bold text-akno-text">AKNO</h1>
            <p className="text-xs text-akno-muted">
              {mode === "signin"
                ? "Connectez-vous pour synchroniser vos données dans le cloud."
                : "Créez un compte — vos données seront partagées avec votre équipe."}
            </p>
          </div>
        </div>

        <div className="mb-6 flex gap-2 rounded-xl bg-akno-bg p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              mode === "signin"
                ? "bg-akno-primary/10 text-akno-primary"
                : "text-akno-muted hover:bg-akno-surface/60"
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              mode === "signup"
                ? "bg-akno-primary/10 text-akno-primary"
                : "text-akno-muted hover:bg-akno-surface/60"
            }`}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <NeuFieldGroup>
            <NeuLabel htmlFor="email">Email</NeuLabel>
            <NeuInput
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </NeuFieldGroup>

          <NeuFieldGroup>
            <div className="mb-2 flex items-center justify-between gap-2">
              <NeuLabel htmlFor="password" className="mb-0">
                Mot de passe
              </NeuLabel>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-semibold text-akno-primary hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              )}
            </div>
            <NeuInput
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </NeuFieldGroup>

          <NeuFieldGroup>
            <NeuLabel htmlFor="invite">Code équipe (optionnel)</NeuLabel>
            <NeuInput
              id="invite"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Ex. AKNO2X2X"
              className="font-mono uppercase tracking-widest"
            />
            <p className="mt-1.5 text-[11px] text-akno-subtle">
              Pour rejoindre l&apos;espace de votre collaboratrice — code disponible sur la
              page Équipe.
            </p>
          </NeuFieldGroup>

          {info && <p className="text-sm text-emerald-600">{info}</p>}
          {error && <p className="text-sm text-akno-danger">{error}</p>}

          <NeuButton type="submit" variant="primary" className="w-full" disabled={pending}>
            {pending
              ? "Patientez…"
              : mode === "signin"
                ? "Se connecter"
                : "Créer le compte"}
          </NeuButton>
        </form>
      </NeuCard>
    </div>
  );
}
