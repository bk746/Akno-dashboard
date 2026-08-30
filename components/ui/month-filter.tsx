"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import {
  ALL_MONTHS,
  formatMonthLabel,
  shiftMonthKey,
} from "@/lib/month-filter";
import { cn } from "@/lib/utils";

type MonthFilterProps = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
};

export function MonthFilter({
  value,
  options,
  onChange,
  className,
}: MonthFilterProps) {
  const canGoPrev =
    value !== ALL_MONTHS &&
    options.some((option) => option !== ALL_MONTHS && option < value);
  const canGoNext =
    value !== ALL_MONTHS &&
    options.some((option) => option !== ALL_MONTHS && option > value);

  function goPrev() {
    if (value === ALL_MONTHS) return;
    const previous = shiftMonthKey(value, -1);
    onChange(options.includes(previous) ? previous : value);
  }

  function goNext() {
    if (value === ALL_MONTHS) return;
    const next = shiftMonthKey(value, 1);
    onChange(options.includes(next) ? next : value);
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="flex items-center gap-2 text-sm font-semibold text-neu-text">
        <CalendarDays size={16} className="text-neu-accent-2" />
        <span>Période</span>
      </div>

      <div className="neu-inset-sm flex items-center rounded-[1.25rem] p-1">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          className="neu-flat flex h-8 w-8 items-center justify-center rounded-xl text-neu-muted disabled:opacity-30"
          aria-label="Mois précédent"
        >
          <ChevronLeft size={16} />
        </button>

        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mx-1 min-w-[9rem] bg-transparent px-2 py-1.5 text-sm font-semibold text-neu-text outline-none"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {formatMonthLabel(option)}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          className="neu-flat flex h-8 w-8 items-center justify-center rounded-xl text-neu-muted disabled:opacity-30"
          aria-label="Mois suivant"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
