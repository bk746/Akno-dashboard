"use client";

import { useState } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { MobileTopBar, Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-dvh w-full bg-akno-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-h-dvh min-w-0 flex-1 bg-akno-bg px-4 py-5 sm:px-6 lg:px-8">
        <MobileTopBar onMenuOpen={() => setSidebarOpen(true)} />
        <div className="mx-auto w-full max-w-[1200px]">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}
