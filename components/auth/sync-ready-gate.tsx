"use client";

import { useDataSyncOptional } from "@/context/data-sync-context";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function SyncReadyGate({ children }: { children: React.ReactNode }) {
  const sync = useDataSyncOptional();
  const cloud = isSupabaseConfigured();

  if (!cloud || !sync) {
    return <>{children}</>;
  }

  if (!sync.ready) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-akno-bg px-6 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-akno-primary border-t-transparent" />
        <p className="text-sm font-medium text-akno-text">Chargement de vos données…</p>
        <p className="max-w-sm text-xs text-akno-muted">
          Synchronisation avec le cloud équipe
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
