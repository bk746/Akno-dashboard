"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "Rechercher…",
  className,
}: SearchInputProps) {
  return (
    <div
      className={cn(
        "neu-inset-sm flex items-center gap-2 rounded-[1.25rem] px-4 py-3",
        className,
      )}
    >
      <Search size={16} className="shrink-0 text-neu-muted" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-neu-text outline-none placeholder:text-neu-muted"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="shrink-0 text-neu-muted hover:text-neu-text"
          aria-label="Effacer la recherche"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
