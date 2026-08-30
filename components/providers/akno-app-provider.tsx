"use client";

import { useEffect } from "react";
import { flushAllPendingWrites } from "@/lib/persistence";

export function AknoAppProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
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
