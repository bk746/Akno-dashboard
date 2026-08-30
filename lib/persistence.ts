import { hasBucketWriter, writeBucket } from "@/lib/sync-bridge";

export const AKNO_STORAGE_KEYS = {
  clients: "akno-clients-v2",
  quotes: "akno-quotes-v2",
  invoices: "akno-invoices-v2",
  finances: "akno-finances-v2",
  goals: "akno-goals-v2",
  prospects: "akno-prospects-v2",
  planner: "akno-planner-v2",
  dashboardLayout: "akno-dashboard-layout-v2",
  projects: "akno-projects-v2",
} as const;

export type AknoStorageKey = (typeof AKNO_STORAGE_KEYS)[keyof typeof AKNO_STORAGE_KEYS];

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type AknoBackup = {
  version: 1;
  exportedAt: string;
  data: Partial<Record<AknoStorageKey, unknown>>;
};

type SaveStatusListener = (status: SaveStatus, savedAt: Date | null) => void;

const DEBOUNCE_MS = 350;
const pendingWrites = new Map<string, number>();
const pendingValues = new Map<string, unknown>();
const listeners = new Set<SaveStatusListener>();

let lastSavedAt: Date | null = null;
let currentStatus: SaveStatus = "idle";

function notifyListeners() {
  for (const listener of listeners) {
    listener(currentStatus, lastSavedAt);
  }
}

function setStatus(status: SaveStatus) {
  currentStatus = status;
  if (status === "saved") {
    lastSavedAt = new Date();
  }
  notifyListeners();
}

export function subscribeSaveStatus(listener: SaveStatusListener) {
  listeners.add(listener);
  listener(currentStatus, lastSavedAt);
  return () => {
    listeners.delete(listener);
  };
}

export function getSaveStatus() {
  return { status: currentStatus, savedAt: lastSavedAt };
}

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T, options?: { immediate?: boolean }) {
  if (typeof window === "undefined") return;

  pendingValues.set(key, value);

  const flush = () => {
    try {
      const latest = pendingValues.get(key);
      if (latest === undefined) return;
      const json = JSON.stringify(latest);
      pendingValues.delete(key);

      if (hasBucketWriter()) {
        void writeBucket(key, json).then(() => setStatus("saved")).catch(() => setStatus("error"));
        return;
      }

      window.localStorage.setItem(key, json);
      setStatus("saved");
      window.dispatchEvent(
        new CustomEvent("akno:storage-updated", { detail: { key } }),
      );
    } catch {
      setStatus("error");
    }
  };

  setStatus("saving");

  if (options?.immediate) {
    const pending = pendingWrites.get(key);
    if (pending) window.clearTimeout(pending);
    pendingWrites.delete(key);
    flush();
    return;
  }

  const existing = pendingWrites.get(key);
  if (existing) window.clearTimeout(existing);

  pendingWrites.set(
    key,
    window.setTimeout(() => {
      pendingWrites.delete(key);
      flush();
    }, DEBOUNCE_MS),
  );
}

export function flushAllPendingWrites() {
  for (const timeoutId of pendingWrites.values()) {
    window.clearTimeout(timeoutId);
  }
  pendingWrites.clear();

  for (const [key, value] of pendingValues.entries()) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      setStatus("error");
      return;
    }
  }

  pendingValues.clear();
  setStatus("saved");
}

export function exportAknoBackup(): AknoBackup {
  if (typeof window === "undefined") {
    return { version: 1, exportedAt: new Date().toISOString(), data: {} };
  }

  const data: Partial<Record<AknoStorageKey, unknown>> = {};
  for (const key of Object.values(AKNO_STORAGE_KEYS)) {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      try {
        data[key] = JSON.parse(raw);
      } catch {
        data[key] = raw;
      }
    }
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function importAknoBackup(backup: AknoBackup, mode: "merge" | "replace" = "replace") {
  if (typeof window === "undefined") return;

  for (const [key, value] of Object.entries(backup.data)) {
    if (!Object.values(AKNO_STORAGE_KEYS).includes(key as AknoStorageKey)) continue;

    if (mode === "merge" && Array.isArray(value)) {
      const existing = readStorage<unknown[]>(key, []);
      const merged = [...existing];
      for (const item of value) {
        const itemId = (item as { id?: number })?.id;
        if (itemId == null) {
          merged.push(item);
          continue;
        }
        const index = merged.findIndex(
          (entry) => (entry as { id?: number })?.id === itemId,
        );
        if (index >= 0) merged[index] = item;
        else merged.push(item);
      }
      writeStorage(key, merged, { immediate: true });
    } else {
      writeStorage(key, value, { immediate: true });
    }
  }

  window.dispatchEvent(new CustomEvent("akno:backup-imported"));
}

export function downloadAknoBackup() {
  const backup = exportAknoBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `akno-backup-${backup.exportedAt.slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function formatLastSaved(date: Date | null) {
  if (!date) return "Pas encore sauvegardé";
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 5000) return "À l'instant";
  if (diffMs < 60_000) return `Il y a ${Math.floor(diffMs / 1000)} s`;
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
