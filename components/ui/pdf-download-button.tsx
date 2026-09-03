"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { NeuButton } from "@/components/ui/neu-form";
import { cn } from "@/lib/utils";

type PdfDownloadButtonProps = {
  onDownload: () => Promise<void>;
  label?: string;
  loadingLabel?: string;
  variant?: "primary" | "secondary";
  className?: string;
};

export function PdfDownloadButton({
  onDownload,
  label = "Télécharger le PDF",
  loadingLabel = "Génération du PDF…",
  variant = "primary",
  className,
}: PdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      await onDownload();
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Impossible de générer le PDF.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <NeuButton
        type="button"
        variant={variant}
        className="gap-2"
        disabled={loading}
        onClick={handleClick}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        {loading ? loadingLabel : label}
      </NeuButton>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
