"use client";

import { cn } from "@/lib/utils";
import { CLIENT_SOURCES } from "@/lib/client-form";

type ClientSourcePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ClientSourcePicker({ value, onChange }: ClientSourcePickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CLIENT_SOURCES.map((source) => {
        const selected = value === source;
        return (
          <button
            key={source}
            type="button"
            onClick={() => onChange(selected ? "" : source)}
            className={cn(
              "rounded-full border px-3.5 py-2 text-xs font-semibold transition-all",
              selected
                ? "border-akno-primary bg-akno-primary text-white"
                : "border-akno-border bg-akno-surface text-akno-text hover:border-akno-primary/40 hover:bg-akno-bg",
            )}
          >
            {source}
          </button>
        );
      })}
    </div>
  );
}
