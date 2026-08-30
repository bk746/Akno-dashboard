"use client";

import {
  formatPlannerTimeRange,
  scheduleCategoryColors,
  scheduleCategoryLabels,
  type LayoutedScheduleEvent,
  type ScheduleItem,
} from "@/lib/planner";
import { cn } from "@/lib/utils";

type PlannerEventBlockProps = {
  layout?: LayoutedScheduleEvent;
  item?: ScheduleItem;
  compact?: boolean;
  onEdit: (item: ScheduleItem) => void;
  onToggleDone?: (id: number) => void;
  className?: string;
  style?: React.CSSProperties;
};

export function PlannerEventBlock({
  layout,
  item: itemProp,
  compact = false,
  onEdit,
  onToggleDone,
  className,
  style,
}: PlannerEventBlockProps) {
  const item = layout?.item ?? itemProp;
  if (!item) return null;

  const color = scheduleCategoryColors[item.category];
  const widthPercent =
    layout && layout.totalColumns > 1
      ? 100 / layout.totalColumns - 1
      : undefined;
  const leftPercent =
    layout && layout.totalColumns > 1
      ? (layout.column / layout.totalColumns) * 100 + 0.5
      : undefined;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onEdit(item);
      }}
      className={cn(
        "group absolute overflow-hidden rounded-lg border text-left shadow-sm transition-all",
        "hover:z-20 hover:shadow-md hover:ring-2 hover:ring-akno-primary/25",
        item.done && "opacity-55",
        compact ? "px-2 py-1" : "px-2.5 py-2",
        className,
      )}
      style={{
        ...style,
        ...(widthPercent != null && leftPercent != null
          ? {
              width: `calc(${widthPercent}% - 4px)`,
              left: `calc(${leftPercent}% + 2px)`,
            }
          : {}),
        borderColor: `${color}40`,
        backgroundColor: `${color}14`,
      }}
    >
      <div
        className="absolute inset-y-0 left-0 w-1 rounded-l-lg"
        style={{ backgroundColor: color }}
      />
      <div className={cn("relative min-w-0 pl-2", compact && "pl-1.5")}>
        <div className="flex items-start justify-between gap-1">
          <p
            className={cn(
              "truncate font-semibold text-akno-text",
              compact ? "text-[10px] leading-tight" : "text-xs",
              item.done && "line-through",
            )}
          >
            {item.title}
          </p>
          {onToggleDone && !compact && (
            <input
              type="checkbox"
              checked={item.done}
              onClick={(event) => event.stopPropagation()}
              onChange={() => onToggleDone(item.id)}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded accent-akno-primary"
            />
          )}
        </div>
        {!compact && (
          <>
            <p className="mt-0.5 text-[10px] font-medium text-akno-muted">
              {formatPlannerTimeRange(item)}
            </p>
            <span
              className="mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
              style={{ color, backgroundColor: `${color}20` }}
            >
              {scheduleCategoryLabels[item.category]}
            </span>
          </>
        )}
        {compact && (
          <p className="truncate text-[9px] text-akno-muted">{item.time}</p>
        )}
      </div>
    </button>
  );
}
