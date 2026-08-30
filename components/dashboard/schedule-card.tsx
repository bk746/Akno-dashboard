"use client";

import { Clock, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NeuCard } from "@/components/ui/neu-card";
import { NeuInput } from "@/components/ui/neu-form";
import {
  createScheduleItem,
  getTodayDateKey,
  getTodaySchedule,
  loadPlannerData,
  savePlannerData,
  toggleScheduleDone,
  type ScheduleItem,
} from "@/lib/planner";
import { cn } from "@/lib/utils";

export function ScheduleCard() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");

  const today = getTodayDateKey();
  const todayItems = getTodaySchedule(schedule, today);
  const nowLabel = new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    setSchedule(loadPlannerData().schedule);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const data = loadPlannerData();
    savePlannerData({ ...data, schedule });
  }, [schedule, ready]);

  useEffect(() => {
    function refresh() {
      setSchedule(loadPlannerData().schedule);
    }

    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    setSchedule((current) => [
      ...current,
      createScheduleItem(current, {
        title,
        date: today,
        time,
        endTime: undefined,
        category: "autre",
      }),
    ]);
    setTitle("");
  }

  return (
    <NeuCard size="sm" className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-neu-muted">
            Emploi du temps
          </p>
          <h2 className="mt-1 text-lg font-semibold text-neu-text">Aujourd&apos;hui</h2>
        </div>
        <div className="neu-inset-sm flex items-center gap-1.5 rounded-full px-3 py-1.5">
          <Clock size={13} className="text-neu-muted" />
          <span className="text-xs font-medium text-neu-text">{nowLabel}</span>
        </div>
      </div>

      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <NeuInput
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
          className="w-28 shrink-0 text-sm"
        />
        <NeuInput
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Créneau rapide…"
          className="min-w-0 flex-1 text-sm"
        />
        <button
          type="submit"
          className="neu-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-neu-accent-2"
          aria-label="Ajouter"
        >
          <Plus size={16} />
        </button>
      </form>

      {todayItems.length > 0 ? (
        <ul className="max-h-40 space-y-2 overflow-y-auto">
          {todayItems.slice(0, 4).map((item) => (
            <li
              key={item.id}
              className={cn(
                "neu-cell flex items-center gap-3 rounded-[1.25rem] px-3 py-2.5",
                item.done && "opacity-60",
              )}
            >
              <span className="w-12 shrink-0 text-xs font-bold text-neu-accent-2">
                {item.time}
              </span>
              <input
                type="checkbox"
                checked={item.done}
                onChange={() =>
                  setSchedule((current) => toggleScheduleDone(current, item.id))
                }
                className="h-4 w-4 rounded accent-neu-accent-2"
              />
              <p
                className={cn(
                  "min-w-0 flex-1 truncate text-xs font-medium text-neu-text",
                  item.done && "line-through",
                )}
              >
                {item.title}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-neu-text/10 px-4 py-6 text-center text-sm text-neu-muted">
          Rien de prévu aujourd&apos;hui.
        </p>
      )}

      <Link
        href="/planning"
        className="neu-btn mt-4 block rounded-2xl py-2.5 text-center text-xs font-semibold text-neu-accent-2"
      >
        Ouvrir le planning complet →
      </Link>
    </NeuCard>
  );
}
