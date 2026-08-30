import { RequireAuth } from "@/components/auth/require-auth";
import { SyncReadyGate } from "@/components/auth/sync-ready-gate";
import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <SyncReadyGate>
        <AppShell>{children}</AppShell>
      </SyncReadyGate>
    </RequireAuth>
  );
}
