"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PlannerEventBlock } from "@/components/planning/planner-event-block";
import {
  formatPlannerWeekday,
  getCurrentTimePercent,
  getTodayDateKey,
  getWeekDateKeys,
  layoutDayEvents,
  minutesFromTimelineClick,
  minutesToTime,
  parseDateKey,
  TIMELINE_END_HOUR,
  TIMELINE_HOUR_HEIGHT_PX,
  TIMELINE_START_HOUR,
  type ScheduleItem,
} from "@/lib/planner";
import { cn } from "@/lib/utils";

type WeekTimeGridViewProps = {
  anchorDateKey: string;
  schedule: ScheduleItem[];
  selectedDateKey: string;
  onSelectDate: (dateKey: string) => void;
  onEdit: (item: ScheduleItem) => void;
  onCreateSlot: (dateKey: string, time: string) => void;
};

const hours = Array.from(
  { length: TIMELINE_END_HOUR - TIMELINE_START_HOUR },
  (_, index) => TIMELINE_START_HOUR + index,
);

const gridHeight = hours.length * TIMELINE_HOUR_HEIGHT_PX;

export function WeekTimeGridView({
  anchorDateKey,
  schedule,
  selectedDateKey,
  onSelectDate,
  onEdit,
  onCreateSlot,
}: WeekTimeGridViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nowPercent, setNowPercent] = useState<number | null>(() =>
    getCurrentTimePercent(),
  );
  const weekKeys = getWeekDateKeys(anchorDateKey);
  const todayKey = getTodayDateKey();

  const layoutsByDay = useMemo(
    () =>
      Object.fromEntries(
        weekKeys.map((dateKey) => [dateKey, layoutDayEvents(schedule, dateKey)]),
      ),
    [schedule, weekKeys],
  );

  useEffect(() => {
    const tick = () => setNowPercent(getCurrentTimePercent());
    tick();
    const interval = window.setInterval(tick, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const now = getCurrentTimePercent();
    if (now == null) return;

    const targetScroll = (now / 100) * gridHeight - container.clientHeight / 3;
    container.scrollTop = Math.max(0, targetScroll);
  }, [anchorDateKey]);

  function handleColumnClick(dateKey: string, event: React.MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const minutes = minutesFromTimelineClick(event.clientY - rect.top, rect.height);
    onCreateSlot(dateKey, minutesToTime(minutes));
  }

  return (
    <div className="akno-card overflow-hidden">
      <div className="sticky top-0 z-30 border-b border-akno-border bg-akno-surface">
        <div className="grid grid-cols-[52px_repeat(7,minmax(0,1fr))]">
          <div className="border-r border-akno-border" />
          {weekKeys.map((dateKey) => {
            const [, , dayNum] = dateKey.split("-");
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDateKey;
            const weekday = formatPlannerWeekday(dateKey, true).slice(0, 3);

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => onSelectDate(dateKey)}
                className={cn(
                  "border-r border-akno-border px-2 py-3 text-center last:border-r-0 transition-colors",
                  isSelected && "bg-akno-primary-soft",
                  !isSelected && "hover:bg-akno-bg",
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wide",
                    isToday ? "text-akno-primary" : "text-akno-subtle",
                  )}
                >
                  {weekday}
                </p>
                <p
                  className={cn(
                    "mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                    isToday && "bg-akno-primary text-white",
                    !isToday && isSelected && "text-akno-primary",
                    !isToday && !isSelected && "text-akno-text",
                  )}
                >
                  {dayNum}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={scrollRef} className="max-h-[min(72vh,840px)] overflow-y-auto overflow-x-auto">
        <div
          className="grid min-w-[720px] grid-cols-[52px_repeat(7,minmax(0,1fr))]"
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

          {weekKeys.map((dateKey) => {
            const isToday = dateKey === todayKey;
            const dayLabel = parseDateKey(dateKey).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            });

            return (
              <div
                key={dateKey}
                className={cn(
                  "relative border-r border-akno-border last:border-r-0",
                  isToday && "bg-akno-primary/[0.02]",
                )}
                onClick={(event) => handleColumnClick(dateKey, event)}
                role="button"
                tabIndex={0}
                aria-label={`Créer un créneau le ${dayLabel}`}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    onCreateSlot(dateKey, "09:00");
                  }
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
                    </div>
                  </div>
                )}

                {layoutsByDay[dateKey]?.map((layout) => (
                  <PlannerEventBlock
                    key={layout.item.id}
                    layout={layout}
                    onEdit={onEdit}
                    style={{
                      top: `${layout.topPercent}%`,
                      height: `${layout.heightPercent}%`,
                      left: layout.totalColumns > 1 ? undefined : "4px",
                      right: layout.totalColumns > 1 ? undefined : "4px",
                      width:
                        layout.totalColumns > 1
                          ? undefined
                          : "calc(100% - 8px)",
                    }}
                    compact={layout.heightPercent < 6}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
