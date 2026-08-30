"use client";

import { Bell, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NeuCard } from "@/components/ui/neu-card";
import { NeuInput } from "@/components/ui/neu-form";
import {
  createReminder,
  deleteReminder,
  formatPlannerDate,
  getTodayDateKey,
  isReminderOverdue,
  loadPlannerData,
  savePlannerData,
  sortReminders,
  toggleReminderDone,
  type Reminder,
} from "@/lib/planner";
import { cn } from "@/lib/utils";

export function RemindersCard() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(getTodayDateKey());

  useEffect(() => {
    setReminders(loadPlannerData().reminders);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const data = loadPlannerData();
    savePlannerData({ ...data, reminders });
  }, [reminders, ready]);

  useEffect(() => {
    function refresh() {
      setReminders(loadPlannerData().reminders);
    }

    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const pending = sortReminders(reminders);

  function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    setReminders((current) => [createReminder(current, title, dueDate), ...current]);
    setTitle("");
    setDueDate(getTodayDateKey());
  }

  return (
    <NeuCard size="sm" className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-neu-muted">
            Rappels
          </p>
          <h2 className="mt-1 text-lg font-semibold text-neu-text">
            {pending.length} en attente
          </h2>
        </div>
        <div className="neu-inset-sm flex h-10 w-10 items-center justify-center rounded-full">
          <Bell size={18} className="text-neu-accent-2" />
        </div>
      </div>

      <form onSubmit={handleAdd} className="mb-4 space-y-2">
        <NeuInput
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ex. Relancer client, envoyer devis…"
          className="text-sm"
        />
        <div className="flex gap-2">
          <NeuInput
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="flex-1 text-sm"
          />
          <button
            type="submit"
            className="neu-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-neu-accent-2"
            aria-label="Ajouter un rappel"
          >
            <Plus size={16} />
          </button>
        </div>
      </form>

      {pending.length > 0 ? (
        <ul className="max-h-56 space-y-2 overflow-y-auto">
          {pending.slice(0, 6).map((reminder) => (
            <li
              key={reminder.id}
              className={cn(
                "neu-cell flex items-center gap-3 rounded-[1.25rem] px-3 py-2.5",
                isReminderOverdue(reminder) && "ring-1 ring-neu-accent-3/20",
              )}
            >
              <input
                type="checkbox"
                checked={reminder.done}
                onChange={() =>
                  setReminders((current) => toggleReminderDone(current, reminder.id))
                }
                className="h-4 w-4 rounded accent-neu-accent-2"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-neu-text">{reminder.title}</p>
                <p
                  className={cn(
                    "text-[10px]",
                    isReminderOverdue(reminder) ? "text-neu-accent-3" : "text-neu-muted",
                  )}
                >
                  {formatPlannerDate(reminder.dueDate)}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setReminders((current) => deleteReminder(current, reminder.id))
                }
                className="text-xs text-neu-muted hover:text-neu-accent-3"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-neu-text/10 px-4 py-8 text-center text-sm text-neu-muted">
          Aucun rappel — ajoutez une tâche ci-dessus.
        </p>
      )}

      <Link
        href="/planning"
        className="neu-btn mt-4 block rounded-2xl py-2.5 text-center text-xs font-semibold text-neu-accent-2"
      >
        Gérer tous les rappels →
      </Link>
    </NeuCard>
  );
}
