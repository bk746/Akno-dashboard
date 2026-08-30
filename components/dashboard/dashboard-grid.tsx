"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardCardShell } from "@/components/dashboard/dashboard-card-shell";
import {
  dashboardCardMap,
  getDashboardCardColClass,
  getDashboardCardColClassInRow,
  groupDashboardLayout,
  packWidgetRows,
  type DashboardCardId,
} from "@/lib/dashboard";
import { appleSpring } from "@/lib/motion";
import { cn } from "@/lib/utils";

type DashboardGridProps = {
  layout: DashboardCardId[];
  onLayoutChange: (layout: DashboardCardId[]) => void;
  onRemove: (id: DashboardCardId) => void;
  renderCard: (id: DashboardCardId) => React.ReactNode;
};

type SortableCardProps = {
  id: DashboardCardId;
  className?: string;
  onRemove: () => void;
  children: React.ReactNode;
  isOverlay?: boolean;
  subtle?: boolean;
};

function SortableCard({
  id,
  className,
  onRemove,
  children,
  isOverlay = false,
  subtle = false,
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isOverlay });

  const style = isOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition: transition ?? undefined,
      };

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={cn(
        className,
        !isOverlay && isDragging && "z-0 opacity-30",
        !isOverlay && "touch-none",
      )}
    >
      <DashboardCardShell
        onRemove={onRemove}
        isDragging={isOverlay || isDragging}
        dragHandleProps={isOverlay ? undefined : { ...attributes, ...listeners }}
        subtle={subtle}
      >
        {children}
      </DashboardCardShell>
    </div>
  );
}

function DragOverlayCard({
  id,
  className,
  children,
  subtle = false,
}: {
  id: DashboardCardId;
  className?: string;
  children: React.ReactNode;
  subtle?: boolean;
}) {
  return (
    <motion.div
      initial={{ scale: 1, rotate: 0 }}
      animate={{ scale: subtle ? 1.02 : 1.04, rotate: subtle ? 0 : -0.5 }}
      transition={appleSpring}
      className={cn(
        className,
        "cursor-grabbing rounded-[1.75rem] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.28)]",
        !subtle && "ring-2 ring-neu-accent-2/30",
      )}
    >
      <DashboardCardShell isDragging showRemove={false} subtle={subtle}>
        <div className="pointer-events-none">{children}</div>
      </DashboardCardShell>
    </motion.div>
  );
}

export function DashboardGrid({
  layout,
  onLayoutChange,
  onRemove,
  renderCard,
}: DashboardGridProps) {
  const [activeId, setActiveId] = useState<DashboardCardId | null>(null);

  const groups = useMemo(() => groupDashboardLayout(layout), [layout]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as DashboardCardId);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = layout.indexOf(active.id as DashboardCardId);
    const newIndex = layout.indexOf(over.id as DashboardCardId);

    if (oldIndex === -1 || newIndex === -1) return;

    onLayoutChange(arrayMove(layout, oldIndex, newIndex));
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  const activeDefinition = activeId ? dashboardCardMap[activeId] : null;
  const activeIsKpi = activeDefinition?.kind === "kpi";

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={layout} strategy={rectSortingStrategy}>
        <div className="space-y-4">
          {groups.map((group, groupIndex) => {
            if (group.kind === "widget") {
              const rows = packWidgetRows(group.ids);

              return rows.map((row, rowIndex) => (
                <div
                  key={`widget-${groupIndex}-${rowIndex}`}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12 xl:gap-4"
                >
                  {row.map((id) => (
                    <SortableCard
                      key={id}
                      id={id}
                      className={getDashboardCardColClassInRow(id, row)}
                      onRemove={() => onRemove(id)}
                    >
                      {renderCard(id)}
                    </SortableCard>
                  ))}
                </div>
              ));
            }

            return (
              <div
                key={`${group.kind}-${groupIndex}`}
                className={cn(
                  "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12 xl:gap-4",
                  "rounded-[1.5rem] border border-neu-text/[0.04] bg-neu-bg/50 p-2 sm:p-3",
                )}
              >
                {group.ids.map((id) => {
                  const definition = dashboardCardMap[id];
                  return (
                    <SortableCard
                      key={id}
                      id={id}
                      className={getDashboardCardColClass(definition)}
                      onRemove={() => onRemove(id)}
                      subtle
                    >
                      {renderCard(id)}
                    </SortableCard>
                  );
                })}
              </div>
            );
          })}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 250, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
        {activeId && activeDefinition ? (
          <DragOverlayCard
            id={activeId}
            className={getDashboardCardColClass(activeDefinition)}
            subtle={activeIsKpi}
          >
            {renderCard(activeId)}
          </DragOverlayCard>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export function DashboardDragHint({ cardCount }: { cardCount?: number }) {
  return (
    <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-neu-muted">
      <GripVertical size={12} className="opacity-60" />
      Glissez pour réorganiser · × pour retirer
      {cardCount !== undefined && (
        <span className="text-neu-text/30">·</span>
      )}
      {cardCount !== undefined && (
        <span>
          {cardCount} carte{cardCount !== 1 ? "s" : ""}
        </span>
      )}
    </p>
  );
}
