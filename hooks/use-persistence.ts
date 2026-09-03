"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  formatLastSaved,
  subscribeSaveStatus,
  type SaveStatus,
} from "@/lib/persistence";

const EMPTY_LIST: never[] = [];

function subscribeToStorage(onChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (!event.key || event.key.startsWith("akno-")) onChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener("akno:storage-updated", onChange);
  window.addEventListener("akno:backup-imported", onChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("akno:storage-updated", onChange);
    window.removeEventListener("akno:backup-imported", onChange);
  };
}

/**
 * Lit une liste persistée (localStorage) de façon réactive, sans setState dans un effet.
 * Le snapshot n'est recalculé que si la valeur brute stockée change.
 */
export function useStoredList<T>(storageKey: string, loader: () => T[]): T[] {
  const cache = useRef<{ raw: string | null | undefined; value: T[] }>({
    raw: undefined,
    value: EMPTY_LIST,
  });

  return useSyncExternalStore(
    subscribeToStorage,
    () => {
      let raw: string | null = null;
      try {
        raw = window.localStorage.getItem(storageKey);
      } catch {
        raw = null;
      }
      if (raw !== cache.current.raw) {
        cache.current = { raw, value: loader() };
      }
      return cache.current.value;
    },
    () => EMPTY_LIST,
  );
}

export function useSaveStatus() {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => subscribeSaveStatus((next, at) => {
    setStatus(next);
    setSavedAt(at);
  }), []);

  return { status, savedAt, label: formatLastSaved(savedAt) };
}

export function useStorageSync(onSync: () => void) {
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key?.startsWith("akno-")) onSync();
    }

    function handleCustom() {
      onSync();
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("akno:storage-updated", handleCustom);
    window.addEventListener("akno:backup-imported", handleCustom);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("akno:storage-updated", handleCustom);
      window.removeEventListener("akno:backup-imported", handleCustom);
    };
  }, [onSync]);
}
