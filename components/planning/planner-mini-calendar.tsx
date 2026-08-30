"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  getDatesWithEvents,
  getTodayDateKey,
  parseDateKey,
  type ScheduleItem,
} from "@/lib/planner";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

type PlannerMiniCalendarProps = {
  selectedDateKey: string;
  schedule: ScheduleItem[];
  onSelectDate: (dateKey: string) => void;
};

export function PlannerMiniCalendar({
  selectedDateKey,
  schedule,
  onSelectDate,
}: PlannerMiniCalendarProps) {
  const selectedDate = parseDateKey(selectedDateKey);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  const eventDates = useMemo(() => getDatesWithEvents(schedule), [schedule]);
  const todayKey = getTodayDateKey();

  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="akno-card-flat p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold capitalize text-akno-text">
          {format(visibleMonth, "MMMM yyyy", { locale: fr })}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setVisibleMonth(subMonths(visibleMonth, 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-akno-border text-akno-muted hover:bg-akno-bg"
            aria-label="Mois précédent"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-akno-border text-akno-muted hover:bg-akno-bg"
            aria-label="Mois suivant"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="py-1 text-center text-[10px] font-semibold uppercase text-akno-subtle"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, visibleMonth);
          const selected = dateKey === selectedDateKey;
          const today = isToday(day);
          const hasEvents = eventDates.has(dateKey);

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-colors",
                !inMonth && "text-akno-subtle/40",
                inMonth && !selected && !today && "text-akno-text hover:bg-akno-bg",
                today && !selected && "font-semibold text-akno-primary",
                selected && "bg-akno-primary font-semibold text-white shadow-sm",
              )}
            >
              {format(day, "d")}
              {hasEvents && (
                <span
                  className={cn(
                    "absolute bottom-1 h-1 w-1 rounded-full",
                    selected ? "bg-white/90" : "bg-akno-primary",
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onSelectDate(todayKey)}
        className="mt-3 w-full rounded-full border border-akno-border py-2 text-xs font-semibold text-akno-text hover:bg-akno-bg"
      >
        Aujourd&apos;hui
      </button>
    </div>
  );
}
