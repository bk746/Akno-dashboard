"use client";

import { useEffect, useState } from "react";
import {
  formatLastSaved,
  subscribeSaveStatus,
  type SaveStatus,
} from "@/lib/persistence";

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
