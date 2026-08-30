"use client";

import { motion } from "framer-motion";
import { GripVertical, X } from "lucide-react";
import { appleSpringSnappy } from "@/lib/motion";
import { cn } from "@/lib/utils";

type DashboardCardShellProps = {
  onRemove?: () => void;
  className?: string;
  children: React.ReactNode;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  showRemove?: boolean;
  /** Style discret pour les KPI — pas de scale au survol */
  subtle?: boolean;
};

export function DashboardCardShell({
  onRemove,
  className,
  children,
  isDragging = false,
  dragHandleProps,
  showRemove = true,
  subtle = false,
}: DashboardCardShellProps) {
  const isDraggable = Boolean(dragHandleProps);

  return (
    <div
      className={cn(
        "group relative h-full",
        isDraggable && "cursor-grab active:cursor-grabbing",
        isDragging && "cursor-grabbing",
        className,
      )}
    >
      {isDraggable && (
        <div
          {...dragHandleProps}
          data-dragging={isDragging}
          className={cn(
            "absolute z-30 flex cursor-grab items-center justify-center rounded-lg bg-neu-bg/90 text-neu-muted opacity-0 shadow-sm transition-all active:cursor-grabbing group-hover:opacity-100 data-[dragging=true]:opacity-100",
            subtle
              ? "left-2 top-2 h-6 w-6"
              : "left-3 top-3 h-8 w-8",
          )}
          aria-label="Déplacer cette carte"
          title="Glisser pour déplacer"
        >
          <GripVertical size={subtle ? 12 : 14} />
        </div>
      )}

      {!subtle && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[5] rounded-[1.75rem] ring-2 ring-neu-accent-2/0 transition-[ring-color] duration-200 group-hover:ring-neu-accent-2/25"
          animate={
            isDragging
              ? { boxShadow: "0 20px 40px -12px rgba(0,0,0,0.2)" }
              : { boxShadow: "0 0 0 rgba(0,0,0,0)" }
          }
          transition={appleSpringSnappy}
        />
      )}

      {showRemove && onRemove && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          onPointerDown={(event) => event.stopPropagation()}
          className={cn(
            "absolute z-20 flex items-center justify-center rounded-lg bg-neu-bg/90 text-neu-muted opacity-0 shadow-sm transition-all hover:text-neu-accent-3 group-hover:opacity-100",
            subtle ? "right-2 top-2 h-6 w-6" : "right-3 top-3 h-7 w-7",
          )}
          aria-label="Retirer cette carte"
          title="Retirer du dashboard"
        >
          <X size={subtle ? 12 : 14} />
        </button>
      )}

      <div
        className={cn(
          "relative h-full",
          !subtle &&
            "transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.012] group-hover:-translate-y-0.5",
          isDragging && !subtle && "select-none scale-[1.012]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
