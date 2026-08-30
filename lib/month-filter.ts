export const ALL_MONTHS = "all";

export function getCurrentMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getMonthKeyFromDate(date: string) {
  return date.slice(0, 7);
}

export function isInMonth(date: string, monthKey: string) {
  if (monthKey === ALL_MONTHS) return true;
  return getMonthKeyFromDate(date) === monthKey;
}

export function formatMonthLabel(monthKey: string) {
  if (monthKey === ALL_MONTHS) return "Tous les mois";

  const [year, month] = monthKey.split("-").map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function collectMonthKeys(dates: string[]) {
  const keys = new Set<string>();

  for (const date of dates) {
    if (date) keys.add(getMonthKeyFromDate(date));
  }

  return Array.from(keys).sort((a, b) => b.localeCompare(a));
}

export function buildMonthOptions(dates: string[], includeAll = true) {
  const fromData = collectMonthKeys(dates);
  const current = getCurrentMonthKey();
  const keys = fromData.includes(current) ? fromData : [current, ...fromData];

  const unique = Array.from(new Set(keys)).sort((a, b) => b.localeCompare(a));

  if (includeAll) {
    return [ALL_MONTHS, ...unique];
  }

  return unique;
}

export function shiftMonthKey(monthKey: string, delta: number) {
  if (monthKey === ALL_MONTHS) {
    return getCurrentMonthKey();
  }

  const [year, month] = monthKey.split("-").map(Number);
  const next = new Date(year, month - 1 + delta, 1);
  return getCurrentMonthKey(next);
}

export function formatShortMonth(monthKey: string) {
  if (monthKey === ALL_MONTHS) return "Tous";

  const [year, month] = monthKey.split("-").map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString("fr-FR", {
    month: "short",
    year: "numeric",
  });

  return label.charAt(0).toUpperCase() + label.slice(1);
}
