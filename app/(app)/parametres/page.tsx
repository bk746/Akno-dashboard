"use client";

import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { AppDataTools } from "@/components/layout/app-data-tools";
import { PageHeader } from "@/components/ui/page-header";
import { NeuButton } from "@/components/ui/neu-form";
import { NeuCard } from "@/components/ui/neu-card";
import { useAuth } from "@/context/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function ParametresPage() {
  const { user, signOut } = useAuth();
  const cloud = isSupabaseConfigured();

  return (
    <>
      <PageHeader
        title="Paramètres"
        description="Compte, sauvegarde et synchronisation de vos données"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {cloud && user && (
          <NeuCard className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-akno-primary-soft text-akno-primary">
                <UserRound size={20} />
              </div>
              <div>
                <p className="font-bold text-akno-text">Mon compte</p>
                <p className="text-xs text-akno-muted">Connecté au cloud AKNO</p>
              </div>
            </div>

            <p className="mb-4 truncate rounded-lg border border-akno-border bg-akno-bg px-3 py-2 text-sm text-akno-text">
              {user.email}
            </p>

            <NeuButton
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => signOut()}
            >
              <LogOut size={16} />
              Déconnexion
            </NeuButton>
          </NeuCard>
        )}

        <NeuCard className="p-6 lg:col-span-2">
          <div className="mb-4">
            <p className="font-bold text-akno-text">Sauvegarde & sync</p>
            <p className="text-sm text-akno-muted">
              Statut cloud, export et import de vos données
            </p>
          </div>

          <AppDataTools variant="page" />

          {cloud && (
            <p className="mt-4 text-xs text-akno-subtle">
              Gérez votre équipe depuis la page{" "}
              <Link href="/equipe" className="font-semibold text-akno-primary hover:underline">
                Équipe
              </Link>
              .
            </p>
          )}
        </NeuCard>
      </div>
    </>
  );
}
