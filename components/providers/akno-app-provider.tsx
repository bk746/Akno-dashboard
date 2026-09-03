"use client";

import { useEffect, useLayoutEffect } from "react";
import { clearAllAppData } from "@/lib/demo-seed";
import { useDataSyncOptional } from "@/context/data-sync-context";
import { flushAllPendingWrites } from "@/lib/persistence";

const RESET_MIGRATION_KEY = "akno-reset-no-demo-v1";

export function AknoAppProvider({ children }: { children: React.ReactNode }) {
  const sync = useDataSyncOptional();

  useLayoutEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline optionnel */
      });
    }

    function handleBeforeUnload() {
      flushAllPendingWrites();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (sync && !sync.ready) return;
    if (localStorage.getItem(RESET_MIGRATION_KEY)) return;

    void clearAllAppData().then(() => {
      localStorage.setItem(RESET_MIGRATION_KEY, "1");
    });
  }, [sync?.ready]);

  return children;
}
