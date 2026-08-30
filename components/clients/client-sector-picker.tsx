"use client";

import { cn } from "@/lib/utils";
import { CLIENT_SECTORS } from "@/lib/client-form";

type ClientSectorPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ClientSectorPicker({ value, onChange }: ClientSectorPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {CLIENT_SECTORS.map((sector) => {
        const selected = value === sector;
        return (
          <button
            key={sector}
            type="button"
            onClick={() => onChange(selected ? "" : sector)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-all",
              selected
                ? "border-akno-primary bg-akno-primary-soft text-akno-primary"
                : "border-akno-border bg-akno-surface text-akno-text hover:border-akno-primary/30 hover:bg-akno-bg",
            )}
          >
            {sector}
          </button>
        );
      })}
    </div>
  );
}
