"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  IA_PROSPECT_PURGE_ON_LOAD,
  IA_PROSPECT_QUEUE_VERSION,
  iaProspectQueue,
} from "@/lib/ia-prospect-queue";
import {
  createProspect,
  createProspectsFromIa,
  loadStoredProspects,
  saveStoredProspects,
  updateProspect,
  type NewProspectInput,
  type Prospect,
} from "@/lib/prospects";

const IA_QUEUE_STORAGE_KEY = "akno-ia-queue-version";
const IA_PURGE_DONE_KEY = "akno-ia-purge-done";

type ProspectsContextValue = {
  prospects: Prospect[];
  ready: boolean;
  addProspect: (input: NewProspectInput) => Prospect;
  saveProspect: (prospect: Prospect) => void;
  removeProspect: (id: number) => void;
};

const ProspectsContext = createContext<ProspectsContextValue | null>(null);

function mergeIaProspectQueue(items: Prospect[]) {
  if (iaProspectQueue.length === 0) return { items, imported: [] as Prospect[] };

  const imported = createProspectsFromIa(items, iaProspectQueue);
  if (imported.length === 0) return { items, imported };

  return { items: [...imported, ...items], imported };
}

export function ProspectsProvider({ children }: { children: ReactNode }) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let items = loadStoredProspects();
    const targetVersion = String(IA_PROSPECT_QUEUE_VERSION);
    const appliedVersion = localStorage.getItem(IA_QUEUE_STORAGE_KEY);
    const iaCount = items.filter((p) => p.board === "ia").length;

    const versionMismatch = appliedVersion !== targetVersion;
    const missingIaImport =
      iaProspectQueue.length > 0 && iaCount === 0 && appliedVersion === targetVersion;

    if (IA_PROSPECT_PURGE_ON_LOAD && !localStorage.getItem(IA_PURGE_DONE_KEY)) {
      items = items.filter((p) => p.board !== "ia");
      saveStoredProspects(items, { immediate: true });
      localStorage.setItem(IA_PURGE_DONE_KEY, "1");
      localStorage.setItem(IA_QUEUE_STORAGE_KEY, targetVersion);
    } else if (iaProspectQueue.length > 0 && (versionMismatch || missingIaImport)) {
      const merged = mergeIaProspectQueue(items);
      items = merged.items;

      if (merged.imported.length > 0) {
        saveStoredProspects(items, { immediate: true });
      }

      if (versionMismatch || merged.imported.length > 0) {
        localStorage.setItem(IA_QUEUE_STORAGE_KEY, targetVersion);
      }
    }

    setProspects(items);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveStoredProspects(prospects);
  }, [prospects, ready]);

  const addProspect = useCallback((input: NewProspectInput) => {
    let created!: Prospect;
    setProspects((current) => {
      created = createProspect(current, input);
      return [created, ...current];
    });
    return created;
  }, []);

  const saveProspect = useCallback((prospect: Prospect) => {
    setProspects((current) =>
      current.map((item) => (item.id === prospect.id ? prospect : item)),
    );
  }, []);

  const removeProspect = useCallback((id: number) => {
    setProspects((current) => current.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      prospects,
      ready,
      addProspect,
      saveProspect,
      removeProspect,
    }),
    [prospects, ready, addProspect, saveProspect, removeProspect],
  );

  return <ProspectsContext.Provider value={value}>{children}</ProspectsContext.Provider>;
}

export function useProspects() {
  const context = useContext(ProspectsContext);
  if (!context) {
    throw new Error("useProspects must be used within ProspectsProvider");
  }
  return context;
}
