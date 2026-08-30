"use client";

import { Check, Copy, Users } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { NeuButton, NeuFieldGroup, NeuInput, NeuLabel } from "@/components/ui/neu-form";
import { NeuCard } from "@/components/ui/neu-card";
import { useAuth } from "@/context/auth-context";
import { useDataSync } from "@/context/data-sync-context";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function EquipePage() {
  const { user } = useAuth();
  const { workspace, joinTeam, cloudEnabled } = useDataSync();
  const [inviteInput, setInviteInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function copyInviteCode() {
    if (!workspace?.inviteCode) return;
    await navigator.clipboard.writeText(workspace.inviteCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function handleJoinTeam(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);
    try {
      await joinTeam(inviteInput);
      setMessage("Vous avez rejoint l'équipe avec succès.");
      setInviteInput("");
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : "Code invalide");
    } finally {
      setPending(false);
    }
  }

  if (!cloudEnabled) {
    return (
      <>
        <PageHeader
          title="Équipe"
          description="Configurez Supabase pour partager vos données"
        />
        <NeuCard className="p-6">
          <p className="text-sm text-akno-muted">
            Ajoutez les clés Supabase dans <code>.env.local</code> pour activer le
            partage entre vous et votre collaboratrice.
          </p>
        </NeuCard>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Équipe"
        description="Partagez les mêmes clients, devis et planning avec votre collaboratrice"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NeuCard className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-akno-primary-soft text-akno-primary">
              <Users size={20} />
            </div>
            <div>
              <p className="font-bold text-akno-text">
                {workspace?.name ?? "Mon équipe"}
              </p>
              <p className="text-xs text-akno-muted">
                Connecté · {user?.email}
              </p>
            </div>
          </div>

          {workspace && (
            <div className="rounded-xl border border-akno-border bg-akno-bg p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-akno-subtle">
                Code d&apos;invitation
              </p>
              <div className="mt-2 flex items-center gap-3">
                <p className="font-mono text-2xl font-bold tracking-[0.2em] text-akno-primary">
                  {workspace.inviteCode}
                </p>
                <button
                  type="button"
                  onClick={copyInviteCode}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-akno-border hover:bg-akno-surface"
                  aria-label="Copier le code"
                >
                  {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-akno-muted">
                Envoyez ce code à votre collaboratrice. Elle crée un compte sur{" "}
                <strong>/login</strong> et le saisit dans « Code équipe » — elle
                verra exactement les mêmes données que vous.
              </p>
            </div>
          )}
        </NeuCard>

        <NeuCard className="p-6">
          <h2 className="mb-1 text-sm font-bold text-akno-text">
            Rejoindre une autre équipe
          </h2>
          <p className="mb-4 text-xs text-akno-muted">
            Si quelqu&apos;un vous a partagé un code, saisissez-le ici.
          </p>
          <form onSubmit={handleJoinTeam} className="space-y-4">
            <NeuFieldGroup>
              <NeuLabel htmlFor="join-code">Code équipe</NeuLabel>
              <NeuInput
                id="join-code"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
                placeholder="XXXXXXXX"
                className="font-mono uppercase tracking-widest"
              />
            </NeuFieldGroup>
            {message && <p className="text-sm text-emerald-600">{message}</p>}
            {error && <p className="text-sm text-akno-danger">{error}</p>}
            <NeuButton type="submit" variant="primary" disabled={pending || !inviteInput.trim()}>
              Rejoindre l&apos;équipe
            </NeuButton>
          </form>
        </NeuCard>
      </div>
    </>
  );
}
