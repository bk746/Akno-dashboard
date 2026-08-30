"use client";

import { Cloud, CloudOff, Download, HardDrive, Loader2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDataSyncOptional } from "@/context/data-sync-context";
import { useSaveStatus } from "@/hooks/use-persistence";
import { downloadAknoBackup, importAknoBackup, type AknoBackup } from "@/lib/persistence";
import { cn } from "@/lib/utils";

export function SaveStatusIndicator() {
  const { status, label } = useSaveStatus();
  const sync = useDataSyncOptional();
  const cloudEnabled = sync?.cloudEnabled ?? false;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-medium",
        status === "saved" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "saving" && "border-akno-border bg-akno-bg text-akno-muted",
        status === "error" && "border-red-200 bg-red-50 text-red-700",
        status === "idle" && "border-akno-border bg-akno-bg text-akno-subtle",
      )}
    >
      {status === "saving" && <Loader2 size={13} className="animate-spin" />}
      {status === "saved" && <Cloud size={13} />}
      {status === "error" && <CloudOff size={13} />}
      {status === "idle" && <HardDrive size={13} />}
      <span>
        {status === "saving" && "Sauvegarde…"}
        {status === "saved" && `Sauvegardé · ${label}`}
        {status === "error" && "Erreur de sauvegarde"}
        {status === "idle" && (cloudEnabled ? "Cloud équipe prêt" : "Auto-save activé")}
      </span>
    </div>
  );
}

export function AppDataTools({ variant = "sidebar" }: { variant?: "sidebar" | "page" }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [installReady, setInstallReady] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const sync = useDataSyncOptional();
  const cloudEnabled = sync?.cloudEnabled ?? false;

  useEffect(() => {
    function handleInstall(event: Event) {
      event.preventDefault();
      deferredPrompt.current = event as BeforeInstallPromptEvent;
      setInstallReady(true);
    }

    window.addEventListener("beforeinstallprompt", handleInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleInstall);
  }, []);

  async function handleInstall() {
    const prompt = deferredPrompt.current;
    if (!prompt) return;
    await prompt.prompt();
    deferredPrompt.current = null;
    setInstallReady(false);
  }

  function handleImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(String(reader.result)) as AknoBackup;
        if (backup.version !== 1 || !backup.data) {
          window.alert("Fichier de sauvegarde AKNO invalide.");
          return;
        }
        const replace = window.confirm(
          "Restaurer cette sauvegarde ? Vos données actuelles seront remplacées.",
        );
        if (!replace) return;
        importAknoBackup(backup, "replace");
        window.alert("Sauvegarde restaurée. Rechargement…");
        window.location.reload();
      } catch {
        window.alert("Impossible de lire ce fichier.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div
      className={cn(
        "space-y-3",
        variant === "sidebar" && "border-t border-akno-border pt-4",
      )}
    >
      <SaveStatusIndicator />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={downloadAknoBackup}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-akno-border bg-akno-surface px-2 py-2 text-[11px] font-semibold text-akno-text hover:bg-akno-bg"
        >
          <Download size={13} />
          Exporter
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-akno-border bg-akno-surface px-2 py-2 text-[11px] font-semibold text-akno-text hover:bg-akno-bg"
        >
          <Upload size={13} />
          Importer
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleImport(file);
          event.target.value = "";
        }}
      />

      {installReady && (
        <button
          type="button"
          onClick={handleInstall}
          className="w-full rounded-lg bg-akno-primary px-3 py-2 text-[11px] font-bold text-white hover:bg-akno-primary-hover"
        >
          Installer l&apos;application
        </button>
      )}

      <p className="text-[10px] leading-relaxed text-akno-subtle">
        {cloudEnabled
          ? "Données synchronisées avec votre équipe via le cloud. Exportez pour une copie locale."
          : "Vos données sont sauvegardées automatiquement dans ce navigateur. Exportez régulièrement pour une copie de sécurité."}
      </p>
    </div>
  );
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};
