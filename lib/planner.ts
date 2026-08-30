export type Reminder = {
  id: number;
  title: string;
  dueDate: string;
  done: boolean;
};

export type ScheduleCategory = "client" | "projet" | "admin" | "perso" | "autre";

export type ScheduleItem = {
  id: number;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  notes?: string;
  category: ScheduleCategory;
  done: boolean;
};

export type ScheduleItemInput = {
  title: string;
  date: string;
  time: string;
  endTime?: string;
  notes?: string;
  category: ScheduleCategory;
};

export type PlannerData = {
  reminders: Reminder[];
  schedule: ScheduleItem[];
};

import { AKNO_STORAGE_KEYS, readStorage, writeStorage } from "@/lib/persistence";

export const PLANNER_STORAGE_KEY = AKNO_STORAGE_KEYS.planner;

export const scheduleCategoryLabels: Record<ScheduleCategory, string> = {
  client: "Client",
  projet: "Projet",
  admin: "Administratif",
  perso: "Perso",
  autre: "Autre",
};

export const scheduleCategoryColors: Record<ScheduleCategory, string> = {
  client: "#635bff",
  projet: "#5851ea",
  admin: "#697386",
  perso: "#df1b41",
  autre: "#0a2540",
};

export const TIMELINE_START_HOUR = 7;
export const TIMELINE_END_HOUR = 21;
export const TIMELINE_HOUR_HEIGHT_PX = 56;
export const TIMELINE_SLOT_MINUTES = 15;

export type LayoutedScheduleEvent = {
  item: ScheduleItem;
  column: number;
  totalColumns: number;
  topPercent: number;
  heightPercent: number;
};

const emptyPlanner = (): PlannerData => ({
  reminders: [],
  schedule: [],
});

export function loadPlannerData(): PlannerData {
  const parsed = readStorage<PlannerData>(PLANNER_STORAGE_KEY, emptyPlanner());
  return {
    reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
    schedule: Array.isArray(parsed.schedule)
      ? parsed.schedule.map((item) => ({
          ...item,
          category: item.category ?? "autre",
        }))
      : [],
  };
}

export function savePlannerData(data: PlannerData) {
  writeStorage(PLANNER_STORAGE_KEY, data);
}

export function createReminder(existing: Reminder[], title: string, dueDate: string): Reminder {
  return {
    id: existing.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    title: title.trim(),
    dueDate,
    done: false,
  };
}

export function createScheduleItem(
  existing: ScheduleItem[],
  input: ScheduleItemInput,
): ScheduleItem {
  return {
    id: existing.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    title: input.title.trim(),
    date: input.date,
    time: input.time,
    endTime: input.endTime,
    notes: input.notes?.trim() || undefined,
    category: input.category,
    done: false,
  };
}

export function updateScheduleItem(
  existing: ScheduleItem[],
  id: number,
  input: ScheduleItemInput,
): ScheduleItem[] {
  return existing.map((item) =>
    item.id === id
      ? {
          ...item,
          title: input.title.trim(),
          date: input.date,
          time: input.time,
          endTime: input.endTime,
          notes: input.notes?.trim() || undefined,
          category: input.category,
        }
      : item,
  );
}

export function updateReminderTitle(
  existing: Reminder[],
  id: number,
  title: string,
  dueDate: string,
) {
  return existing.map((item) =>
    item.id === id ? { ...item, title: title.trim(), dueDate } : item,
  );
}

export function toggleReminderDone(existing: Reminder[], id: number) {
  return existing.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item,
  );
}

export function toggleScheduleDone(existing: ScheduleItem[], id: number) {
  return existing.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item,
  );
}

export function deleteReminder(existing: Reminder[], id: number) {
  return existing.filter((item) => item.id !== id);
}

export function deleteScheduleItem(existing: ScheduleItem[], id: number) {
  return existing.filter((item) => item.id !== id);
}

export function getTodayDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function dateKeyFromDate(date: Date) {
  return getTodayDateKey(date);
}

export function shiftWeekDateKey(dateKey: string, deltaWeeks: number) {
  return shiftDateKey(dateKey, deltaWeeks * 7);
}

export function dateKeyFromParts(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getDatesWithEvents(items: ScheduleItem[]) {
  return new Set(items.map((item) => item.date));
}

export function formatPlannerTimeRange(item: ScheduleItem) {
  if (item.endTime) return `${item.time} – ${item.endTime}`;
  return item.time;
}

export function formatWeekRangeLabel(anchorDateKey: string) {
  const keys = getWeekDateKeys(anchorDateKey);
  const start = parseDateKey(keys[0]);
  const end = parseDateKey(keys[6]);
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();

  const startLabel = start.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: sameMonth ? "long" : "short",
  });
  const endLabel = end.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: sameYear ? "numeric" : undefined,
  });

  if (sameYear && sameMonth) {
    return `${start.getDate()} – ${endLabel}`;
  }
  if (sameYear) {
    return `${startLabel} – ${endLabel}`;
  }
  return `${start.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })} – ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;
}

export function snapMinutesToGrid(totalMinutes: number, slot = TIMELINE_SLOT_MINUTES) {
  const snapped = Math.round(totalMinutes / slot) * slot;
  const min = TIMELINE_START_HOUR * 60;
  const max = TIMELINE_END_HOUR * 60 - slot;
  return Math.max(min, Math.min(max, snapped));
}

export function minutesFromTimelineClick(
  clickY: number,
  containerHeight: number,
  slot = TIMELINE_SLOT_MINUTES,
) {
  const totalMinutes = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60;
  const raw = (clickY / containerHeight) * totalMinutes + TIMELINE_START_HOUR * 60;
  return snapMinutesToGrid(raw, slot);
}

export function getCurrentTimePercent(now = new Date()) {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  if (hours < TIMELINE_START_HOUR || hours >= TIMELINE_END_HOUR) return null;
  return getTimelinePosition(
    `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
  );
}

function layoutEventCluster(cluster: ScheduleItem[]): LayoutedScheduleEvent[] {
  const sorted = [...cluster].sort((a, b) => a.time.localeCompare(b.time));
  const columns: ScheduleItem[][] = [];

  for (const event of sorted) {
    const start = timeToMinutes(event.time);
    let placed = false;

    for (const column of columns) {
      const last = column[column.length - 1];
      const lastEnd = timeToMinutes(last.time) + getEventDurationMinutes(last);
      if (start >= lastEnd) {
        column.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) columns.push([event]);
  }

  const totalColumns = columns.length;
  const layouted: LayoutedScheduleEvent[] = [];

  columns.forEach((column, columnIndex) => {
    for (const item of column) {
      layouted.push({
        item,
        column: columnIndex,
        totalColumns,
        topPercent: getTimelinePosition(item.time),
        heightPercent: Math.max(getTimelineHeightPercent(item), 3.5),
      });
    }
  });

  return layouted;
}

export function layoutDayEvents(items: ScheduleItem[], dateKey: string): LayoutedScheduleEvent[] {
  const events = getScheduleForDate(items, dateKey);
  if (events.length === 0) return [];

  const sorted = [...events].sort((a, b) => a.time.localeCompare(b.time));
  const layouted: LayoutedScheduleEvent[] = [];
  let cluster: ScheduleItem[] = [];
  let clusterEnd = 0;

  for (const event of sorted) {
    const start = timeToMinutes(event.time);
    const end = start + getEventDurationMinutes(event);

    if (cluster.length === 0 || start < clusterEnd) {
      cluster.push(event);
      clusterEnd = Math.max(clusterEnd, end);
    } else {
      layouted.push(...layoutEventCluster(cluster));
      cluster = [event];
      clusterEnd = end;
    }
  }

  if (cluster.length > 0) {
    layouted.push(...layoutEventCluster(cluster));
  }

  return layouted;
}

export function getAgendaGroups(items: ScheduleItem[], fromDateKey = getTodayDateKey(), days = 14) {
  const groups: { dateKey: string; items: ScheduleItem[] }[] = [];

  for (let index = 0; index < days; index += 1) {
    const dateKey = shiftDateKey(fromDateKey, index);
    const dayItems = getScheduleForDate(items, dateKey).filter((item) => !item.done);
    if (dayItems.length > 0) {
      groups.push({ dateKey, items: dayItems });
    }
  }

  return groups;
}

export function shiftDateKey(dateKey: string, deltaDays: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const next = new Date(year, month - 1, day + deltaDays);
  return getTodayDateKey(next);
}

export function getWeekDateKeys(anchorDateKey: string) {
  const [year, month, day] = anchorDateKey.split("-").map(Number);
  const anchor = new Date(year, month - 1, day);
  const weekday = anchor.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const monday = new Date(year, month - 1, day + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return getTodayDateKey(date);
  });
}

export function sortReminders(items: Reminder[]) {
  const today = getTodayDateKey();

  return [...items]
    .filter((item) => !item.done)
    .sort((a, b) => {
      const aOverdue = a.dueDate < today;
      const bOverdue = b.dueDate < today;
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      return a.dueDate.localeCompare(b.dueDate);
    });
}

export function getDoneReminders(items: Reminder[]) {
  return [...items]
    .filter((item) => item.done)
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
}

export function getScheduleForDate(items: ScheduleItem[], dateKey: string) {
  return [...items]
    .filter((item) => item.date === dateKey)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function getTodaySchedule(items: ScheduleItem[], date = getTodayDateKey()) {
  return getScheduleForDate(items, date);
}

export function formatPlannerDate(date: string) {
  const today = getTodayDateKey();
  const tomorrow = shiftDateKey(today, 1);

  if (date === today) return "Aujourd'hui";
  if (date === tomorrow) return "Demain";

  return new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function formatPlannerFullDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const label = new Date(year, month - 1, day).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatPlannerWeekday(dateKey: string, short = false) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR", {
    weekday: short ? "short" : "long",
  });
}

export function isReminderOverdue(reminder: Reminder, today = getTodayDateKey()) {
  return !reminder.done && reminder.dueDate < today;
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function getEventDurationMinutes(item: ScheduleItem) {
  const start = timeToMinutes(item.time);
  const end = item.endTime ? timeToMinutes(item.endTime) : start + 60;
  return Math.max(30, end - start);
}

export function getTimelinePosition(time: string) {
  const startMinutes = TIMELINE_START_HOUR * 60;
  const totalMinutes = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60;
  const current = timeToMinutes(time) - startMinutes;
  return Math.max(0, Math.min(100, (current / totalMinutes) * 100));
}

export function getTimelineHeightPercent(item: ScheduleItem) {
  const totalMinutes = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60;
  return Math.min(100, (getEventDurationMinutes(item) / totalMinutes) * 100);
}

export function getPlannerStats(data: PlannerData, dateKey = getTodayDateKey()) {
  const weekKeys = getWeekDateKeys(dateKey);
  const pendingReminders = sortReminders(data.reminders);
  const overdueReminders = pendingReminders.filter((item) => isReminderOverdue(item, dateKey));

  return {
    todayEvents: getScheduleForDate(data.schedule, dateKey).filter((item) => !item.done).length,
    weekEvents: data.schedule.filter(
      (item) => weekKeys.includes(item.date) && !item.done,
    ).length,
    pendingReminders: pendingReminders.length,
    overdueReminders: overdueReminders.length,
  };
}

/** @deprecated Préférer createScheduleItem avec ScheduleItemInput */
export function createScheduleItemLegacy(
  existing: ScheduleItem[],
  title: string,
  date: string,
  time: string,
) {
  return createScheduleItem(existing, {
    title,
    date,
    time,
    category: "autre",
  });
}
