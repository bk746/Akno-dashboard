"use client";

import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type DeleteButtonProps = {
  label: string;
  onConfirm: () => void;
  className?: string;
};

export function DeleteButton({ label, onConfirm, className }: DeleteButtonProps) {
  return (
    <button
      type="button"
      aria-label={`Supprimer ${label}`}
      title="Supprimer"
      onClick={() => {
        if (
          window.confirm(
            `Supprimer ${label} ? Cette action est irréversible.`,
          )
        ) {
          onConfirm();
        }
      }}
      className={cn(
        "neu-flat inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neu-muted transition-colors hover:text-neu-accent-3",
        className,
      )}
    >
      <Trash2 size={14} />
    </button>
  );
}
