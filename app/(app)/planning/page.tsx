"use client";

import {
  AlertCircle,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutGrid,
  List,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AgendaView } from "@/components/planning/agenda-view";
import { DayTimelineView } from "@/components/planning/day-timeline-view";
import { PlannerMiniCalendar } from "@/components/planning/planner-mini-calendar";
import { ScheduleEventModal } from "@/components/planning/schedule-event-modal";
import { WeekTimeGridView } from "@/components/planning/week-time-grid-view";
import { DeleteButton } from "@/components/ui/delete-button";
import { KpiCard } from "@/components/ui/kpi-card";
import { MotionFilterButton } from "@/components/ui/motion-primitives";
import { PageHeader } from "@/components/ui/page-header";
import { NeuButton, NeuInput } from "@/components/ui/neu-form";
import { NeuCard } from "@/components/ui/neu-card";
import {
  createReminder,
  deleteReminder,
  formatPlannerFullDate,
  formatPlannerTimeRange,
  formatWeekRangeLabel,
  getDoneReminders,
  getPlannerStats,
  getTodayDateKey,
  isReminderOverdue,
  loadPlannerData,
  savePlannerData,
  scheduleCategoryColors,
  scheduleCategoryLabels,
  shiftDateKey,
  shiftWeekDateKey,
  sortReminders,
  toggleReminderDone,
  toggleScheduleDone,
  type PlannerData,
  type Reminder,
  type ScheduleCategory,
  type ScheduleItem,
} from "@/lib/planner";
import { cn } from "@/lib/utils";

type PlannerTab = "schedule" | "reminders";
type PlannerView = "week" | "day" | "agenda";
type ReminderFilter = "pending" | "overdue" | "done";

export default function PlanningPage() {
  const [data, setData] = useState<PlannerData>({ reminders: [], schedule: [] });
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<PlannerTab>("schedule");
  const [view, setView] = useState<PlannerView>("week");
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey());
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleItem | null>(null);
  const [defaultSlotTime, setDefaultSlotTime] = useState("09:00");
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDate, setReminderDate] = useState(getTodayDateKey());
  const [reminderFilter, setReminderFilter] = useState<ReminderFilter>("pending");

  useEffect(() => {
    setData(loadPlannerData());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    savePlannerData(data);
  }, [data, ready]);

  const stats = useMemo(() => getPlannerStats(data, selectedDate), [data, selectedDate]);

  const filteredReminders = useMemo(() => {
    if (reminderFilter === "done") return getDoneReminders(data.reminders);
    if (reminderFilter === "overdue") {
      return sortReminders(data.reminders).filter((item) => isReminderOverdue(item));
    }
    return sortReminders(data.reminders);
  }, [data.reminders, reminderFilter]);

  const upcomingSchedule = useMemo(() => {
    return [...data.schedule]
      .filter((item) => !item.done && item.date >= getTodayDateKey())
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
      .slice(0, 6);
  }, [data.schedule]);

  function openCreateEvent(dateKey = selectedDate, time = "09:00") {
    setEditingEvent(null);
    setDefaultSlotTime(time);
    setSelectedDate(dateKey);
    setEventModalOpen(true);
  }

  function openEditEvent(item: ScheduleItem) {
    setEditingEvent(item);
    setSelectedDate(item.date);
    setDefaultSlotTime(item.time);
    setEventModalOpen(true);
  }

  function handleAddReminder(event: React.FormEvent) {
    event.preventDefault();
    if (!reminderTitle.trim()) return;

    setData((current) => ({
      ...current,
      reminders: [
        createReminder(current.reminders, reminderTitle, reminderDate),
        ...current.reminders,
      ],
    }));
    setReminderTitle("");
    setReminderDate(getTodayDateKey());
  }

  function navigatePeriod(delta: number) {
    if (view === "week") {
      setSelectedDate((current) => shiftWeekDateKey(current, delta));
      return;
    }
    setSelectedDate((current) => shiftDateKey(current, delta));
  }

  const periodLabel =
    view === "week"
      ? formatWeekRangeLabel(selectedDate)
      : formatPlannerFullDate(selectedDate);

  return (
    <>
      <PageHeader
        title="Planning"
        description="Emploi du temps professionnel — semaine, jour et agenda"
        action={
          <NeuButton
            variant="primary"
            className="gap-2"
            onClick={() => openCreateEvent()}
          >
            <Plus size={16} />
            Nouveau créneau
          </NeuButton>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label="Aujourd'hui"
          value={String(stats.todayEvents)}
          icon={<Clock size={18} />}
        />
        <KpiCard
          label="Cette semaine"
          value={String(stats.weekEvents)}
          icon={<CalendarDays size={18} />}
        />
        <KpiCard
          label="Rappels"
          value={String(stats.pendingReminders)}
          icon={<Bell size={18} />}
        />
        <KpiCard
          label="En retard"
          value={String(stats.overdueReminders)}
          icon={<AlertCircle size={18} />}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <MotionFilterButton active={tab === "schedule"} onClick={() => setTab("schedule")}>
          Emploi du temps
        </MotionFilterButton>
        <MotionFilterButton active={tab === "reminders"} onClick={() => setTab("reminders")}>
          Rappels ({stats.pendingReminders})
        </MotionFilterButton>
      </div>

      {tab === "schedule" ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <aside className="space-y-4 xl:col-span-3">
            <PlannerMiniCalendar
              selectedDateKey={selectedDate}
              schedule={data.schedule}
              onSelectDate={(dateKey) => {
                setSelectedDate(dateKey);
                if (view === "week") setView("day");
              }}
            />

            <NeuCard className="p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-akno-subtle">
                Légende
              </p>
              <ul className="space-y-2">
                {(Object.keys(scheduleCategoryLabels) as ScheduleCategory[]).map(
                  (category) => (
                    <li key={category} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: scheduleCategoryColors[category] }}
                      />
                      <span className="text-akno-text">{scheduleCategoryLabels[category]}</span>
                    </li>
                  ),
                )}
              </ul>
            </NeuCard>

            <NeuCard className="p-4">
              <p className="mb-3 text-sm font-bold text-akno-text">Prochains créneaux</p>
              {upcomingSchedule.length > 0 ? (
                <ul className="space-y-2">
                  {upcomingSchedule.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => openEditEvent(item)}
                        className="w-full rounded-xl border border-akno-border px-3 py-2.5 text-left transition-colors hover:bg-akno-bg"
                      >
                        <p className="truncate text-xs font-semibold text-akno-text">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-[10px] text-akno-muted">
                          {item.date === getTodayDateKey() ? "Aujourd'hui" : item.date} ·{" "}
                          {formatPlannerTimeRange(item)}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-akno-muted">Rien de planifié prochainement.</p>
              )}
            </NeuCard>
          </aside>

          <div className="space-y-4 xl:col-span-9">
            <NeuCard className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigatePeriod(-1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-akno-border text-akno-muted hover:bg-akno-bg"
                    aria-label="Période précédente"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="min-w-[200px] text-center">
                    <p className="text-sm font-bold capitalize text-akno-text">
                      {periodLabel}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigatePeriod(1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-akno-border text-akno-muted hover:bg-akno-bg"
                    aria-label="Période suivante"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <NeuButton
                    variant="secondary"
                    onClick={() => setSelectedDate(getTodayDateKey())}
                  >
                    Aujourd&apos;hui
                  </NeuButton>
                  <MotionFilterButton
                    active={view === "week"}
                    onClick={() => setView("week")}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <LayoutGrid size={14} />
                      Semaine
                    </span>
                  </MotionFilterButton>
                  <MotionFilterButton active={view === "day"} onClick={() => setView("day")}>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} />
                      Jour
                    </span>
                  </MotionFilterButton>
                  <MotionFilterButton
                    active={view === "agenda"}
                    onClick={() => setView("agenda")}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <List size={14} />
                      Agenda
                    </span>
                  </MotionFilterButton>
                </div>
              </div>
            </NeuCard>

            {view === "week" && (
              <WeekTimeGridView
                anchorDateKey={selectedDate}
                schedule={data.schedule}
                selectedDateKey={selectedDate}
                onSelectDate={(dateKey) => {
                  setSelectedDate(dateKey);
                  setView("day");
                }}
                onEdit={openEditEvent}
                onCreateSlot={openCreateEvent}
              />
            )}

            {view === "day" && (
              <DayTimelineView
                dateKey={selectedDate}
                schedule={data.schedule}
                onEdit={openEditEvent}
                onToggleDone={(id) =>
                  setData((current) => ({
                    ...current,
                    schedule: toggleScheduleDone(current.schedule, id),
                  }))
                }
                onCreateSlot={openCreateEvent}
              />
            )}

            {view === "agenda" && (
              <AgendaView
                schedule={data.schedule}
                onEdit={openEditEvent}
                onSelectDate={(dateKey) => {
                  setSelectedDate(dateKey);
                  setView("day");
                }}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <NeuCard className="p-5 xl:col-span-5">
            <p className="mb-4 text-sm font-bold text-neu-text">Nouveau rappel</p>
            <form onSubmit={handleAddReminder} className="space-y-3">
              <NeuInput
                value={reminderTitle}
                onChange={(event) => setReminderTitle(event.target.value)}
                placeholder="Ex. Relancer devis, Payer hébergement…"
              />
              <NeuInput
                type="date"
                value={reminderDate}
                onChange={(event) => setReminderDate(event.target.value)}
              />
              <NeuButton type="submit" variant="primary" className="w-full gap-2">
                <Plus size={16} />
                Ajouter le rappel
              </NeuButton>
            </form>
          </NeuCard>

          <NeuCard className="p-5 xl:col-span-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-neu-text">Vos rappels</p>
              <div className="flex flex-wrap gap-2">
                <MotionFilterButton
                  active={reminderFilter === "pending"}
                  onClick={() => setReminderFilter("pending")}
                >
                  En attente
                </MotionFilterButton>
                <MotionFilterButton
                  active={reminderFilter === "overdue"}
                  onClick={() => setReminderFilter("overdue")}
                >
                  En retard
                </MotionFilterButton>
                <MotionFilterButton
                  active={reminderFilter === "done"}
                  onClick={() => setReminderFilter("done")}
                >
                  Terminés
                </MotionFilterButton>
              </div>
            </div>

            {filteredReminders.length > 0 ? (
              <ul className="space-y-2">
                {filteredReminders.map((reminder: Reminder) => (
                  <li
                    key={reminder.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border border-akno-border px-4 py-3",
                      isReminderOverdue(reminder) &&
                        reminderFilter !== "done" &&
                        "border-akno-danger/30 bg-akno-danger-soft/40",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={reminder.done}
                      onChange={() =>
                        setData((current) => ({
                          ...current,
                          reminders: toggleReminderDone(current.reminders, reminder.id),
                        }))
                      }
                      className="h-4 w-4 rounded accent-akno-primary"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm font-medium text-neu-text",
                          reminder.done && "line-through opacity-60",
                        )}
                      >
                        {reminder.title}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          isReminderOverdue(reminder) && !reminder.done
                            ? "text-akno-danger"
                            : "text-neu-muted",
                        )}
                      >
                        {reminder.dueDate}
                      </p>
                    </div>
                    <DeleteButton
                      label={reminder.title}
                      onConfirm={() =>
                        setData((current) => ({
                          ...current,
                          reminders: deleteReminder(current.reminders, reminder.id),
                        }))
                      }
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-neu-text/10 px-4 py-12 text-center text-sm text-neu-muted">
                Aucun rappel dans cette catégorie.
              </p>
            )}
          </NeuCard>
        </div>
      )}

      <ScheduleEventModal
        open={eventModalOpen}
        onClose={() => {
          setEventModalOpen(false);
          setEditingEvent(null);
        }}
        schedule={data.schedule}
        defaultDate={selectedDate}
        defaultTime={defaultSlotTime}
        editingItem={editingEvent}
        onSave={(schedule) => setData((current) => ({ ...current, schedule }))}
      />
    </>
  );
}
