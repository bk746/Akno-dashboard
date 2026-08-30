export type GoalPeriod = "week" | "month" | "year";

export type Goal = {
  id: number;
  label: string;
  current: number;
  target: number;
  unit: string;
  period: GoalPeriod;
};

export type GoalInput = {
  label: string;
  current: number;
  target: number;
  unit: string;
  period: GoalPeriod;
};

import { AKNO_STORAGE_KEYS, readStorage, writeStorage } from "@/lib/persistence";

export const GOALS_STORAGE_KEY = AKNO_STORAGE_KEYS.goals;

export const goalPeriodLabels: Record<GoalPeriod, string> = {
  week: "Semaine",
  month: "Mois",
  year: "Année",
};

export const goalUnitOptions = [
  { value: "€", label: "Euros (€)" },
  { value: "", label: "Nombre" },
  { value: "%", label: "Pourcentage (%)" },
];

export const initialGoals: Goal[] = [];

/** @deprecated Préférer loadStoredGoals() côté client */
export const goals = initialGoals;

export function loadStoredGoals(): Goal[] {
  const parsed = readStorage<Goal[]>(GOALS_STORAGE_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveStoredGoals(goals: Goal[]) {
  writeStorage(GOALS_STORAGE_KEY, goals);
}

export function getGoalsByPeriod(items: Goal[], period: GoalPeriod) {
  return items.filter((goal) => goal.period === period);
}

export function createGoal(existing: Goal[], input: GoalInput): Goal {
  return {
    id: existing.reduce((max, goal) => Math.max(max, goal.id), 0) + 1,
    label: input.label.trim(),
    current: Math.max(0, input.current),
    target: Math.max(1, input.target),
    unit: input.unit,
    period: input.period,
  };
}

export function updateGoal(existing: Goal[], id: number, input: GoalInput): Goal[] {
  return existing.map((goal) =>
    goal.id === id
      ? {
          ...goal,
          label: input.label.trim(),
          current: Math.max(0, input.current),
          target: Math.max(1, input.target),
          unit: input.unit,
          period: input.period,
        }
      : goal,
  );
}

export function updateGoalCurrent(
  existing: Goal[],
  id: number,
  current: number,
): Goal[] {
  return existing.map((goal) =>
    goal.id === id ? { ...goal, current: Math.max(0, current) } : goal,
  );
}

export function formatGoalValue(value: number, unit: string) {
  if (unit === "€") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (unit === "%") {
    return `${value.toLocaleString("fr-FR")} %`;
  }

  return value.toLocaleString("fr-FR");
}

export function formatGoalProgress(current: number, target: number, unit: string) {
  return `${formatGoalValue(current, unit)} / ${formatGoalValue(target, unit)}`;
}

export function getGoalProgressPercent(current: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}
