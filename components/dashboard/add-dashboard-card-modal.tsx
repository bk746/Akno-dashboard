"use client";

import { LayoutGrid, X } from "lucide-react";
import { useEffect } from "react";
import { NeuCard } from "@/components/ui/neu-card";
import { NeuButton } from "@/components/ui/neu-form";
import {
  type DashboardCardDefinition,
  type DashboardCardId,
} from "@/lib/dashboard";
import { cn } from "@/lib/utils";

type AddDashboardCardModalProps = {
  open: boolean;
  onClose: () => void;
  availableCards: DashboardCardDefinition[];
  onAdd: (id: DashboardCardId) => void;
};

export function AddDashboardCardModal({
  open,
  onClose,
  availableCards,
  onAdd,
}: AddDashboardCardModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-neu-text/20 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Fermer"
      />
      <NeuCard className="relative z-10 max-h-[85vh] w-full max-w-2xl overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-neu-accent-2" />
            <p className="font-bold text-neu-text">Ajouter une carte</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="neu-flat flex h-9 w-9 items-center justify-center rounded-xl"
          >
            <X size={18} />
          </button>
        </div>

        {availableCards.length === 0 ? (
          <p className="py-8 text-center text-sm text-neu-muted">
            Toutes les cartes sont déjà affichées sur votre dashboard.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {availableCards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  onAdd(card.id);
                  onClose();
                }}
                className="rounded-2xl border border-neu-text/8 p-4 text-left transition-colors hover:border-neu-accent-2/30 hover:bg-neu-accent-2/5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-neu-text">{card.label}</p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      card.kind === "kpi"
                        ? "bg-neu-accent-2/15 text-neu-accent-2"
                        : "bg-neu-text/8 text-neu-muted",
                    )}
                  >
                    {card.kind === "kpi" ? "KPI" : "Widget"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neu-muted">{card.description}</p>
              </button>
            ))}
          </div>
        )}

        <NeuButton variant="secondary" className="mt-6 w-full" onClick={onClose}>
          Fermer
        </NeuButton>
      </NeuCard>
    </div>
  );
}
