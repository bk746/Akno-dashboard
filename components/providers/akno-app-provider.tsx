"use client";

import { useLayoutEffect } from "react";
import { isAppDataEmpty, seedDemoData } from "@/lib/demo-seed";
import { flushAllPendingWrites } from "@/lib/persistence";

export function AknoAppProvider({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    if (isAppDataEmpty()) {
      seedDemoData();
      window.dispatchEvent(new CustomEvent("akno:backup-imported"));
    }

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

  return children;
}
