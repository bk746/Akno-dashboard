import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AknoRootProviders } from "@/components/providers/akno-root-providers";
import { IntroBoot } from "@/components/intro/intro-boot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AKNO — Cockpit entreprise",
  description:
    "Pilotez votre activité : clients, devis, factures, finances et objectifs en un seul espace.",
  applicationName: "AKNO",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AKNO",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#635bff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-akno-bg text-akno-text antialiased" suppressHydrationWarning>
        <IntroBoot />
        <AknoRootProviders>{children}</AknoRootProviders>
      </body>
    </html>
  );
}
