"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PlannerEventBlock } from "@/components/planning/planner-event-block";
import {
  formatPlannerFullDate,
  getCurrentTimePercent,
  getScheduleForDate,
  getTodayDateKey,
  layoutDayEvents,
  minutesFromTimelineClick,
  minutesToTime,
  TIMELINE_END_HOUR,
  TIMELINE_HOUR_HEIGHT_PX,
  TIMELINE_START_HOUR,
  type ScheduleItem,
} from "@/lib/planner";
import { cn } from "@/lib/utils";

type DayTimelineViewProps = {
  dateKey: string;
  schedule: ScheduleItem[];
  onEdit: (item: ScheduleItem) => void;
  onToggleDone: (id: number) => void;
  onCreateSlot: (dateKey: string, time: string) => void;
};

const hours = Array.from(
  { length: TIMELINE_END_HOUR - TIMELINE_START_HOUR },
  (_, index) => TIMELINE_START_HOUR + index,
);

const gridHeight = hours.length * TIMELINE_HOUR_HEIGHT_PX;

export function DayTimelineView({
  dateKey,
  schedule,
  onEdit,
  onToggleDone,
  onCreateSlot,
}: DayTimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nowPercent, setNowPercent] = useState<number | null>(() =>
    getCurrentTimePercent(),
  );
  const isToday = dateKey === getTodayDateKey();
  const events = getScheduleForDate(schedule, dateKey);
  const layoutedEvents = useMemo(
    () => layoutDayEvents(schedule, dateKey),
    [schedule, dateKey],
  );

  useEffect(() => {
    const tick = () => setNowPercent(getCurrentTimePercent());
    tick();
    const interval = window.setInterval(tick, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isToday) return;
    const container = scrollRef.current;
    if (!container) return;

    const now = getCurrentTimePercent();
    if (now == null) return;

    const targetScroll = (now / 100) * gridHeight - container.clientHeight / 3;
    container.scrollTop = Math.max(0, targetScroll);
  }, [dateKey, isToday]);

  function handleGridClick(event: React.MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const minutes = minutesFromTimelineClick(event.clientY - rect.top, rect.height);
    onCreateSlot(dateKey, minutesToTime(minutes));
  }

  return (
    <div className="akno-card overflow-hidden">
      <div className="border-b border-akno-border px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-akno-subtle">
          Vue jour
        </p>
        <p className="mt-0.5 text-lg font-bold text-akno-text">
          {formatPlannerFullDate(dateKey)}
        </p>
        <p className="mt-1 text-xs text-akno-muted">
          {events.length} créneau{events.length !== 1 ? "x" : ""} · Cliquez sur un
          horaire pour planifier
        </p>
      </div>

      <div ref={scrollRef} className="max-h-[min(72vh,840px)] overflow-y-auto">
        <div
          className="grid grid-cols-[52px_1fr]"
          style={{ height: gridHeight }}
        >
          <div className="relative border-r border-akno-border bg-akno-bg/50">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex items-start justify-end border-b border-dashed border-akno-border/70 pr-2 pt-1"
                style={{ height: TIMELINE_HOUR_HEIGHT_PX }}
              >
                <span className="text-[10px] font-medium text-akno-subtle">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          <div
            className={cn("relative", isToday && "bg-akno-primary/[0.02]")}
            onClick={handleGridClick}
            role="button"
            tabIndex={0}
            aria-label="Créer un créneau à cet horaire"
            onKeyDown={(event) => {
              if (event.key === "Enter") onCreateSlot(dateKey, "09:00");
            }}
          >
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b border-dashed border-akno-border/60"
                style={{ height: TIMELINE_HOUR_HEIGHT_PX }}
              />
            ))}

            {isToday && nowPercent != null && (
              <div
                className="pointer-events-none absolute left-0 right-0 z-10"
                style={{ top: `${nowPercent}%` }}
              >
                <div className="relative flex items-center">
                  <span className="absolute -left-1 h-2.5 w-2.5 rounded-full bg-akno-danger" />
                  <div className="h-px flex-1 bg-akno-danger" />
                  <span className="ml-2 rounded-full bg-akno-danger px-2 py-0.5 text-[9px] font-bold text-white">
                    Maintenant
                  </span>
                </div>
              </div>
            )}

            {layoutedEvents.length === 0 ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8 text-center">
                <p className="max-w-xs text-sm text-akno-muted">
                  Journée libre — cliquez sur la timeline pour ajouter votre
                  premier créneau.
                </p>
              </div>
            ) : (
              layoutedEvents.map((layout) => (
                <PlannerEventBlock
                  key={layout.item.id}
                  layout={layout}
                  onEdit={onEdit}
                  onToggleDone={onToggleDone}
                  style={{
                    top: `${layout.topPercent}%`,
                    height: `${layout.heightPercent}%`,
                    left: layout.totalColumns > 1 ? undefined : "8px",
                    right: layout.totalColumns > 1 ? undefined : "8px",
                    width:
                      layout.totalColumns > 1
                        ? undefined
                        : "calc(100% - 16px)",
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
