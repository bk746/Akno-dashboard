"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/auth-context";
import { DATA_BUCKET_KEYS } from "@/lib/data/bucket-keys";
import { registerBucketWriter } from "@/lib/sync-bridge";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import {
  ensureUserWorkspace,
  joinWorkspaceByInviteCode,
  type WorkspaceInfo,
} from "@/lib/workspace";

export type DataSyncContextValue = {
  ready: boolean;
  cloudEnabled: boolean;
  workspace: WorkspaceInfo | null;
  setBucket: (key: string, json: string) => Promise<void>;
  joinTeam: (inviteCode: string) => Promise<void>;
  refreshWorkspace: () => Promise<void>;
};

const DataSyncContext = createContext<DataSyncContextValue | null>(null);

const PENDING_INVITE_KEY = "akno-pending-invite-code";

export function DataSyncProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [ready, setReady] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const cloudEnabled = isSupabaseConfigured();

  const loadCloudData = useCallback(async (workspaceId: string) => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from("workspace_data_buckets")
      .select("bucket_key, payload")
      .eq("workspace_id", workspaceId);

    if (error) {
      console.warn("[AKNO] Lecture cloud impossible — mode local.", error.message);
      return;
    }

    const cloudKeys = new Set<string>();

    for (const row of data ?? []) {
      const json =
        typeof row.payload === "string" ? row.payload : JSON.stringify(row.payload);
      localStorage.setItem(row.bucket_key, json);
      cloudKeys.add(row.bucket_key);
    }

    for (const key of DATA_BUCKET_KEYS) {
      if (cloudKeys.has(key)) continue;
      const local = localStorage.getItem(key);
      if (!local) continue;
      try {
        await supabase.from("workspace_data_buckets").upsert({
          workspace_id: workspaceId,
          bucket_key: key,
          payload: JSON.parse(local),
          updated_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error("[AKNO] Migration bucket", key, error);
      }
    }

    window.dispatchEvent(new CustomEvent("akno:backup-imported"));
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!cloudEnabled) {
      setWorkspace(null);
      setReady(true);
      return;
    }

    if (!user) {
      setWorkspace(null);
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 12000);

    (async () => {
      try {
        const pendingInvite = sessionStorage.getItem(PENDING_INVITE_KEY);
        if (pendingInvite) {
          sessionStorage.removeItem(PENDING_INVITE_KEY);
          await joinWorkspaceByInviteCode(user.id, pendingInvite);
        }

        const ws = await ensureUserWorkspace(user.id);
        if (cancelled) return;

        setWorkspace(ws);
        await loadCloudData(ws.id);
      } catch (error) {
        console.error("[AKNO] Sync init", error);
      } finally {
        if (!cancelled) {
          window.clearTimeout(timeoutId);
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [user, authLoading, cloudEnabled, loadCloudData]);

  const setBucket = useCallback(
    async (key: string, json: string) => {
      localStorage.setItem(key, json);
      window.dispatchEvent(new CustomEvent("akno:storage-updated", { detail: { key } }));

      if (!cloudEnabled || !supabase || !workspace) return;

      try {
        const { error } = await supabase.from("workspace_data_buckets").upsert({
          workspace_id: workspace.id,
          bucket_key: key,
          payload: JSON.parse(json),
          updated_at: new Date().toISOString(),
        });
        if (error) {
          console.warn("[AKNO] Sauvegarde cloud impossible:", error.message);
        }
      } catch (error) {
        console.error("[AKNO] Upsert bucket", key, error);
      }
    },
    [cloudEnabled, workspace],
  );

  const joinTeam = useCallback(
    async (inviteCode: string) => {
      if (!user) {
        sessionStorage.setItem(PENDING_INVITE_KEY, inviteCode.trim().toUpperCase());
        return;
      }
      const ws = await joinWorkspaceByInviteCode(user.id, inviteCode);
      setWorkspace(ws);
      await loadCloudData(ws.id);
    },
    [user, loadCloudData],
  );

  const refreshWorkspace = useCallback(async () => {
    if (!user) return;
    const ws = await ensureUserWorkspace(user.id);
    setWorkspace(ws);
  }, [user]);

  const value = useMemo<DataSyncContextValue>(
    () => ({
      ready,
      cloudEnabled,
      workspace,
      setBucket,
      joinTeam,
      refreshWorkspace,
    }),
    [ready, cloudEnabled, workspace, setBucket, joinTeam, refreshWorkspace],
  );

  useEffect(() => {
    registerBucketWriter(setBucket);
    return () => registerBucketWriter(null);
  }, [setBucket]);

  return <DataSyncContext.Provider value={value}>{children}</DataSyncContext.Provider>;
}

export function useDataSync() {
  const ctx = useContext(DataSyncContext);
  if (!ctx) throw new Error("useDataSync doit être utilisé dans DataSyncProvider");
  return ctx;
}

export function useDataSyncOptional() {
  return useContext(DataSyncContext);
}
