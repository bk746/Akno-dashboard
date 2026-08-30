"use client";

import { CalendarDays, ChevronRight } from "lucide-react";
import {
  formatPlannerFullDate,
  formatPlannerTimeRange,
  getAgendaGroups,
  getTodayDateKey,
  scheduleCategoryColors,
  scheduleCategoryLabels,
  type ScheduleItem,
} from "@/lib/planner";
import { cn } from "@/lib/utils";

type AgendaViewProps = {
  schedule: ScheduleItem[];
  onEdit: (item: ScheduleItem) => void;
  onSelectDate: (dateKey: string) => void;
};

export function AgendaView({ schedule, onEdit, onSelectDate }: AgendaViewProps) {
  const groups = getAgendaGroups(schedule, getTodayDateKey(), 21);
  const todayKey = getTodayDateKey();

  if (groups.length === 0) {
    return (
      <div className="akno-card flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-akno-primary-soft text-akno-primary">
          <CalendarDays size={28} />
        </div>
        <p className="text-base font-semibold text-akno-text">Agenda libre</p>
        <p className="mt-2 max-w-sm text-sm text-akno-muted">
          Aucun créneau à venir sur les 3 prochaines semaines. Cliquez sur la grille
          ou créez un créneau pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map(({ dateKey, items }) => {
        const isToday = dateKey === todayKey;

        return (
          <section key={dateKey} className="akno-card overflow-hidden">
            <button
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className="flex w-full items-center justify-between border-b border-akno-border bg-akno-bg/40 px-5 py-3 text-left hover:bg-akno-bg"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-akno-subtle">
                  {isToday ? "Aujourd'hui" : formatPlannerFullDate(dateKey)}
                </p>
                <p className="text-sm font-medium text-akno-muted">
                  {items.length} créneau{items.length > 1 ? "x" : ""}
                </p>
              </div>
              <ChevronRight size={16} className="text-akno-subtle" />
            </button>

            <ul className="divide-y divide-akno-border">
              {items.map((item) => {
                const color = scheduleCategoryColors[item.category];

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-akno-bg/60"
                    >
                      <div className="w-24 shrink-0">
                        <p className="text-sm font-bold text-akno-primary">
                          {item.time}
                        </p>
                        {item.endTime && (
                          <p className="text-[11px] text-akno-subtle">{item.endTime}</p>
                        )}
                      </div>
                      <div
                        className="mt-1 h-full w-1 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-akno-text">{item.title}</p>
                        <p className="mt-0.5 text-xs text-akno-muted">
                          {formatPlannerTimeRange(item)}
                        </p>
                        {item.notes && (
                          <p className="mt-1 line-clamp-2 text-xs text-akno-subtle">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
                        )}
                        style={{ color, backgroundColor: `${color}18` }}
                      >
                        {scheduleCategoryLabels[item.category]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
