"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  LayoutGrid,
  Users,
  Wallet,
} from "lucide-react";
import { appleSpringSnappy } from "@/lib/motion";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/", label: "Accueil", icon: LayoutDashboard },
  { href: "/planning", label: "Planning", icon: CalendarDays },
  { href: "/finances", label: "Finances", icon: Wallet },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/devis", label: "Devis", icon: FileText },
] as const;

const moreRoutes = [
  "/prospects",
  "/factures",
  "/objectifs",
  "/equipe",
  "/parametres",
  "/projets",
];

function isRouteActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isMoreActive(pathname: string) {
  return moreRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2"
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <motion.span
          layoutId="mobile-nav-active"
          transition={appleSpringSnappy}
          className="absolute inset-x-0.5 inset-y-1 rounded-full bg-white/14"
        />
      )}
      <Icon
        size={20}
        strokeWidth={active ? 2.2 : 1.75}
        className={cn(
          "relative z-10 shrink-0 transition-colors",
          active ? "text-white" : "text-white/55",
        )}
      />
      <span
        className={cn(
          "relative z-10 max-w-full truncate text-[10px] font-medium leading-tight",
          active ? "text-white" : "text-white/55",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

export function MobileBottomNav({ onMoreOpen }: { onMoreOpen: () => void }) {
  const pathname = usePathname();
  const moreActive = isMoreActive(pathname);

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
      aria-label="Navigation principale"
    >
      <div className="pointer-events-auto mx-auto flex max-w-lg items-stretch rounded-full bg-akno-text px-1 py-1 shadow-[0_8px_32px_rgba(10,37,64,0.28)] ring-1 ring-white/8">
        {mobileNavItems.map(({ href, label, icon }) => (
          <NavItem
            key={href}
            href={href}
            label={label}
            icon={icon}
            active={isRouteActive(pathname, href)}
          />
        ))}

        <button
          type="button"
          onClick={onMoreOpen}
          className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2"
          aria-label="Plus d'options"
          aria-expanded={moreActive}
        >
          {moreActive && (
            <motion.span
              layoutId="mobile-nav-active"
              transition={appleSpringSnappy}
              className="absolute inset-x-0.5 inset-y-1 rounded-full bg-white/14"
            />
          )}
          <LayoutGrid
            size={20}
            strokeWidth={moreActive ? 2.2 : 1.75}
            className={cn(
              "relative z-10 shrink-0 transition-colors",
              moreActive ? "text-white" : "text-white/55",
            )}
          />
          <span
            className={cn(
              "relative z-10 max-w-full truncate text-[10px] font-medium leading-tight",
              moreActive ? "text-white" : "text-white/55",
            )}
          >
            Plus
          </span>
        </button>
      </div>
    </nav>
  );
}
