"use client";

import { usePathname } from "next/navigation";
import { IntroProvider } from "@/components/intro/intro-provider";
import { SiteIntro } from "@/components/intro/site-intro";
import { AuthProvider } from "@/context/auth-context";
import { DataSyncProvider } from "@/context/data-sync-context";
import { AknoAppProvider } from "@/components/providers/akno-app-provider";

const PUBLIC_AUTH_PATHS = ["/login", "/auth/callback"];
const INTRO_SKIP_PATHS = ["/login", "/auth/callback"];

export function AknoRootProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicAuth = PUBLIC_AUTH_PATHS.some((path) => pathname.startsWith(path));
  const skipIntro = INTRO_SKIP_PATHS.some((path) => pathname.startsWith(path));

  const content = isPublicAuth ? (
    <div className="min-h-dvh bg-akno-bg">{children}</div>
  ) : (
    children
  );

  if (skipIntro) {
    return (
      <AuthProvider>
        <DataSyncProvider>
          <AknoAppProvider>{content}</AknoAppProvider>
        </DataSyncProvider>
      </AuthProvider>
    );
  }

  return (
    <IntroProvider>
      <div className="akno-intro-curtain" aria-hidden="true" />
      <SiteIntro />
      <AuthProvider>
        <DataSyncProvider>
          <AknoAppProvider>
            <div className="akno-app-shell">{content}</div>
          </AknoAppProvider>
        </DataSyncProvider>
      </AuthProvider>
    </IntroProvider>
  );
}
