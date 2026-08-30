"use client";

import { Check } from "lucide-react";
import type { ClientStatus } from "@/lib/clients";
import { statusLabels } from "@/lib/clients";
import { cn } from "@/lib/utils";

const statusOptions: {
  value: ClientStatus;
  label: string;
  hint: string;
}[] = [
  { value: "prospect", label: statusLabels.prospect, hint: "Lead en qualification" },
  { value: "pending", label: statusLabels.pending, hint: "Devis ou contrat en cours" },
  { value: "active", label: statusLabels.active, hint: "Client facturé & actif" },
];

type ClientStatusPickerProps = {
  value: ClientStatus;
  onChange: (value: ClientStatus) => void;
};

export function ClientStatusPicker({ value, onChange }: ClientStatusPickerProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {statusOptions.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative rounded-xl border px-4 py-4 text-left transition-all",
              selected
                ? "border-akno-primary bg-akno-primary-soft ring-2 ring-akno-primary/20"
                : "border-akno-border bg-akno-surface hover:border-akno-primary/40 hover:bg-akno-bg",
            )}
          >
            {selected && (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-akno-primary text-white">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
            <p className="text-sm font-bold text-akno-text">{option.label}</p>
            <p className="mt-1 text-xs text-akno-muted">{option.hint}</p>
          </button>
        );
      })}
    </div>
  );
}
