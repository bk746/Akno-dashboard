"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { NeuCard } from "@/components/ui/neu-card";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function CalendarCard() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <NeuCard className="flex h-full flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-neu-muted">
            Calendrier
          </p>
          <h2 className="mt-1 text-lg font-semibold capitalize text-neu-text">
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="neu-btn flex h-9 w-9 items-center justify-center rounded-xl text-neu-muted"
            aria-label="Mois précédent"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="neu-btn flex h-9 w-9 items-center justify-center rounded-xl text-neu-muted"
            aria-label="Mois suivant"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-[11px] font-medium text-neu-muted"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const selected = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              type="button"
              className={cn(
                "flex aspect-square items-center justify-center rounded-xl text-sm transition-all",
                !inMonth && "text-neu-muted/40",
                inMonth && !today && !selected && "text-neu-text hover:neu-inset-sm",
                today && "neu-inset-sm font-semibold text-neu-accent-2",
                selected &&
                  !today &&
                  "neu-raised text-neu-accent-1 font-medium",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </NeuCard>
  );
}
