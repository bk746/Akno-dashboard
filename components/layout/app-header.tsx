import Link from "next/link";
import { Bell, Home, Search, Settings, Users } from "lucide-react";
import { NeuIconButton } from "@/components/ui/neu-card";
import { cn } from "@/lib/utils";

type NavItem = "home" | "clients" | "settings";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  activeNav?: NavItem;
};

const navLinks: { id: NavItem; href: string; icon: typeof Home; label: string }[] =
  [
    { id: "home", href: "/", icon: Home, label: "Accueil" },
    {
      id: "clients",
      href: "/clients",
      icon: Users,
      label: "Mes clients",
    },
    { id: "settings", href: "#", icon: Settings, label: "Paramètres" },
  ];

export function AppHeader({ title, subtitle, activeNav = "home" }: AppHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        {subtitle && <p className="text-sm text-neu-muted">{subtitle}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-neu-text">
          {title}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="neu-inset flex min-w-0 flex-1 items-center gap-2 rounded-2xl px-4 py-2.5 sm:min-w-56 lg:min-w-64">
          <Search size={16} className="shrink-0 text-neu-muted" />
          <input
            type="search"
            placeholder="Rechercher..."
            className="w-full min-w-0 bg-transparent text-sm text-neu-text outline-none placeholder:text-neu-muted"
          />
        </div>

        {navLinks.map(({ id, href, icon: Icon, label }) => (
          <Link key={id} href={href} aria-label={label}>
            <NeuIconButton active={activeNav === id}>
              <Icon size={18} />
            </NeuIconButton>
          </Link>
        ))}

        <NeuIconButton>
          <Bell size={18} />
        </NeuIconButton>

        <div className="neu-raised flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neu-accent-2 to-neu-accent-1 text-xs font-bold text-white">
          K
        </div>
      </div>
    </header>
  );
}

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-full bg-neu-bg px-4 py-8 sm:px-8 lg:px-12",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}
