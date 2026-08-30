"use client";

import Link from "next/link";
import { RefreshCw, TrendingUp, Wallet } from "lucide-react";
import { formatMoney } from "@/lib/finances";

type DashboardStatCardsProps = {
  paidThisMonth: number;
  expenses: number;
  activeSubscriptionsMrr: number;
  moisBenefice: number;
};

export function DashboardStatCards({
  paidThisMonth,
  expenses,
  activeSubscriptionsMrr,
  moisBenefice,
}: DashboardStatCardsProps) {
  const stats = [
    {
      label: "Encaissé ce mois",
      value: formatMoney(paidThisMonth),
      href: "/factures",
      icon: TrendingUp,
    },
    {
      label: "Dépenses",
      value: formatMoney(expenses),
      href: "/finances",
      icon: Wallet,
    },
    {
      label: "Bénéfice net",
      value: formatMoney(moisBenefice),
      href: "/finances",
      icon: TrendingUp,
    },
    {
      label: "Abonnements actifs",
      value: formatMoney(activeSubscriptionsMrr),
      href: "/clients",
      icon: RefreshCw,
      hint: "MRR fixe / mois",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ label, value, href, icon: Icon, hint }) => (
        <Link
          key={label}
          href={href}
          className="akno-card-flat group p-4 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <Icon size={16} className="text-akno-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-akno-subtle group-hover:text-akno-primary">
              →
            </span>
          </div>
          <p className="mt-3 text-xs text-akno-subtle">{label}</p>
          <p className="mt-0.5 text-xl font-bold tracking-tight text-akno-text">{value}</p>
          {hint && (
            <p className="mt-0.5 text-[10px] text-akno-subtle">{hint}</p>
          )}
        </Link>
      ))}
    </div>
  );
}
