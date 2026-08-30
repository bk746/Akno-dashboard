"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  Receipt,
  Settings,
  Target,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { appleSpringSnappy } from "@/lib/motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/planning", label: "Planning", icon: CalendarDays },
  { href: "/finances", label: "Finances", icon: Wallet },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/prospects", label: "Prospects", icon: UserPlus },
  { href: "/devis", label: "Devis", icon: FileText },
  { href: "/factures", label: "Factures", icon: Receipt },
  { href: "/objectifs", label: "Objectifs", icon: Target },
  { href: "/equipe", label: "Équipe", icon: UsersRound },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-akno-primary/10 text-akno-primary"
          : "text-akno-muted hover:bg-akno-bg hover:text-akno-text",
      )}
    >
      <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
      {label}
    </Link>
  );
}

export function Sidebar({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const content = (
    <>
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" onClick={onClose} className="flex items-center gap-2.5 outline-none">
          <BrandMark size={32} />
          <div>
            <p className="text-sm font-bold tracking-tight text-akno-text">AKNO</p>
            <p className="text-[11px] text-akno-subtle">Espace pro</p>
          </div>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-akno-subtle hover:bg-akno-bg lg:hidden"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map(({ href, label, icon }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            active={isActive(href)}
            onClick={onClose}
          />
        ))}
      </nav>
    </>
  );

  return (
    <>
      <aside className="sticky top-0 z-30 hidden h-dvh w-56 shrink-0 flex-col border-r border-akno-border bg-akno-surface lg:flex">
        <div className="flex h-full flex-col overflow-y-auto px-4 py-6">{content}</div>
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-akno-text/20 backdrop-blur-sm lg:hidden"
              onClick={onClose}
              aria-label="Fermer"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={appleSpringSnappy}
              className="fixed left-0 top-0 z-[60] flex h-dvh w-72 flex-col overflow-y-auto border-r border-akno-border bg-akno-surface p-5 lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function MobileTopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between border-b border-akno-border pb-4 lg:hidden">
      <button
        type="button"
        onClick={onMenuOpen}
        className="rounded-lg border border-akno-border p-2 text-akno-text"
        aria-label="Menu"
      >
        <LayoutDashboard size={18} />
      </button>
      <p className="text-sm font-bold text-akno-text">AKNO</p>
      <BrandMark size={32} className="rounded-full" />
    </div>
  );
}
