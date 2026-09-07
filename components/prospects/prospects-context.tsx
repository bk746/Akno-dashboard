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

type ProspectsContextValue = {
  prospects: Prospect[];
  ready: boolean;
  addProspect: (input: NewProspectInput) => Prospect;
  saveProspect: (prospect: Prospect) => void;
  removeProspect: (id: number) => void;
};

const ProspectsContext = createContext<ProspectsContextValue | null>(null);

export function ProspectsProvider({ children }: { children: ReactNode }) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let items = loadStoredProspects();

    const appliedVersion = localStorage.getItem(IA_QUEUE_STORAGE_KEY);
    if (
      iaProspectQueue.length > 0 &&
      appliedVersion !== String(IA_PROSPECT_QUEUE_VERSION)
    ) {
      const imported = createProspectsFromIa(items, iaProspectQueue);
      if (imported.length > 0) {
        items = [...imported, ...items];
        localStorage.setItem(IA_QUEUE_STORAGE_KEY, String(IA_PROSPECT_QUEUE_VERSION));
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
