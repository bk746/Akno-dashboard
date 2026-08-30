"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Euro,
  FileText,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ActiveClientsCard } from "@/components/dashboard/active-clients-card";
import { CalendarCard } from "@/components/dashboard/calendar-card";
import { RemindersCard } from "@/components/dashboard/reminders-card";
import { RevenueCard } from "@/components/dashboard/revenue-card";
import { ScheduleCard } from "@/components/dashboard/schedule-card";
import { KpiCard } from "@/components/ui/kpi-card";
import { ProgressBar, ProgressRing } from "@/components/ui/progress-ring";
import { NeuCard } from "@/components/ui/neu-card";
import type { DashboardCardId } from "@/lib/dashboard";
import { formatMoney, type MonthlyFinancePoint, type RevenueChartPoint, type Transaction } from "@/lib/finances";
import type { Goal } from "@/lib/goals";
import { formatGoalProgress } from "@/lib/goals";
import type { Prospect } from "@/lib/prospects";
import {
  getClientDisplayName,
  quoteStatusLabels,
  quoteStatusStyles,
  type Quote,
} from "@/lib/quotes";
import { cn } from "@/lib/utils";

const quickLinks = [
  { href: "/planning", label: "Planning" },
  { href: "/finances", label: "Finances" },
  { href: "/clients/nouveau", label: "Nouveau client" },
  { href: "/prospects", label: "Prospects" },
  { href: "/devis/nouveau", label: "Créer un devis" },
  { href: "/objectifs", label: "Objectifs" },
];

export type DashboardData = {
  paidThisMonth: number;
  moisDepenses: number;
  moisBenefice: number;
  activeClients: number;
  quotesCount: number;
  activeProspects: number;
  monthGoals: Goal[];
  monthlyFinance: MonthlyFinancePoint[];
  revenueChart: RevenueChartPoint[];
  recentTransactions: Transaction[];
  quotes: Quote[];
  prospects: Prospect[];
};

function EmptyBlock({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-neu-text/10 px-4 py-8 text-center text-sm text-neu-muted">
      {message}
    </p>
  );
}

export function renderDashboardCard(id: DashboardCardId, data: DashboardData) {
  switch (id) {
    case "kpi-paid-month":
      return (
        <KpiCard
          variant="compact"
          label="Encaissé ce mois"
          value={formatMoney(data.paidThisMonth)}
          icon={<TrendingUp size={17} />}
        />
      );
    case "kpi-expenses":
      return (
        <KpiCard
          variant="compact"
          label="Dépenses (mois)"
          value={formatMoney(data.moisDepenses)}
          icon={<Wallet size={17} />}
        />
      );
    case "kpi-profit":
      return (
        <KpiCard
          variant="compact"
          label="Bénéfice (mois)"
          value={formatMoney(data.moisBenefice)}
          icon={<Euro size={17} />}
        />
      );
    case "kpi-active-clients":
      return (
        <KpiCard
          variant="compact"
          label="Clients actifs"
          value={String(data.activeClients)}
          icon={<Users size={17} />}
        />
      );
    case "kpi-quotes":
      return (
        <KpiCard
          variant="compact"
          label="Devis"
          value={String(data.quotesCount)}
          icon={<FileText size={17} />}
        />
      );
    case "kpi-prospects":
      return (
        <KpiCard
          variant="compact"
          label="Prospects actifs"
          value={String(data.activeProspects)}
          icon={<UserPlus size={17} />}
        />
      );
    case "widget-finance-chart":
      return (
        <NeuCard size="sm" className="flex h-full flex-col">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neu-muted">
                Revenus vs dépenses
              </p>
              <p className="mt-0.5 text-base font-bold text-neu-text">Évolution</p>
            </div>
            <Link
              href="/finances"
              className="shrink-0 text-xs font-semibold text-neu-accent-2 hover:underline"
            >
              Voir tout →
            </Link>
          </div>
          {data.monthlyFinance.length > 0 ? (
            <div className="h-44 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyFinance}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b72c4" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3b72c4" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d44a7a" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#d44a7a" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip formatter={(v) => formatMoney(Number(v))} />
                  <Area type="monotone" dataKey="revenus" stroke="#3b72c4" fill="url(#revGrad)" strokeWidth={2} name="Revenus" />
                  <Area type="monotone" dataKey="depenses" stroke="#d44a7a" fill="url(#expGrad)" strokeWidth={2} name="Dépenses" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyBlock message="Les factures payées et dépenses apparaîtront ici." />
          )}
        </NeuCard>
      );
    case "widget-goals": {
      const monthGoals = data.monthGoals;

      return (
        <NeuCard size="sm" className="flex h-full flex-col">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Target size={15} className="text-neu-accent-2" />
              <p className="text-sm font-bold text-neu-text">Objectifs du mois</p>
            </div>
            {monthGoals.length > 0 && (
              <span className="neu-inset-sm rounded-full px-2.5 py-1 text-[10px] font-bold text-neu-accent-2">
                {monthGoals.length}
              </span>
            )}
          </div>

          {monthGoals.length > 0 ? (
            <div className="flex-1 space-y-4">
              {monthGoals.length === 1 ? (
                <div className="flex justify-center py-2">
                  <ProgressRing
                    value={monthGoals[0].current}
                    max={monthGoals[0].target}
                    size={100}
                    label={monthGoals[0].label}
                    sublabel={formatGoalProgress(
                      monthGoals[0].current,
                      monthGoals[0].target,
                      monthGoals[0].unit,
                    )}
                  />
                </div>
              ) : monthGoals.length <= 4 ? (
                <div className="grid grid-cols-2 gap-4">
                  {monthGoals.map((goal) => (
                    <ProgressRing
                      key={goal.id}
                      value={goal.current}
                      max={goal.target}
                      size={76}
                      stroke={6}
                      label={goal.label}
                      sublabel={formatGoalProgress(
                        goal.current,
                        goal.target,
                        goal.unit,
                      )}
                    />
                  ))}
                </div>
              ) : (
                monthGoals.map((goal) => (
                  <ProgressBar
                    key={goal.id}
                    label={goal.label}
                    current={goal.current}
                    target={goal.target}
                    unit={goal.unit}
                  />
                ))
              )}
            </div>
          ) : (
            <EmptyBlock message="Créez un objectif avec la période « Mois » dans Objectifs pour le voir ici." />
          )}

          <Link
            href="/objectifs"
            className="neu-btn mt-4 block rounded-xl py-2 text-center text-xs font-semibold text-neu-accent-2"
          >
            Tous les objectifs
          </Link>
        </NeuCard>
      );
    }
    case "widget-activity":
      return (
        <NeuCard size="sm" className="h-full">
          <p className="mb-3 text-sm font-bold text-neu-text">Activité récente</p>
          {data.recentTransactions.length > 0 ? (
            <ul className="space-y-3">
              {data.recentTransactions.slice(0, 5).map((tx) => (
                <li
                  key={tx.id}
                  className="neu-cell flex items-center justify-between rounded-[1.25rem] px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-neu-text">{tx.label}</p>
                    <p className="text-[10px] text-neu-muted">{tx.date}</p>
                  </div>
                  <span
                    className={cn(
                      "ml-2 flex shrink-0 items-center gap-0.5 text-xs font-bold",
                      tx.type === "income" ? "text-neu-accent-2" : "text-neu-accent-3",
                    )}
                  >
                    {tx.type === "income" ? (
                      <ArrowUpRight size={12} />
                    ) : (
                      <ArrowDownRight size={12} />
                    )}
                    {formatMoney(Math.abs(tx.amount))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyBlock message="Factures payées et dépenses visibles ici." />
          )}
        </NeuCard>
      );
    case "widget-quotes":
      return (
        <NeuCard size="sm" className="h-full">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-neu-text">Devis récents</p>
            <Link href="/devis" className="text-xs font-semibold text-neu-accent-2">
              Voir →
            </Link>
          </div>
          {data.quotes.length > 0 ? (
            <ul className="space-y-2">
              {data.quotes.slice(0, 4).map((q) => (
                <li
                  key={q.id}
                  className="flex items-center justify-between rounded-xl px-2 py-2"
                >
                  <div>
                    <p className="text-xs font-medium text-neu-text">{getClientDisplayName(q)}</p>
                    <p className="text-[10px] text-neu-muted">{q.number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-neu-text">{formatMoney(q.amount)}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-semibold",
                        quoteStatusStyles[q.status],
                      )}
                    >
                      {quoteStatusLabels[q.status]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyBlock message="Créez votre premier devis." />
          )}
        </NeuCard>
      );
    case "widget-prospects":
      return (
        <NeuCard size="sm" className="h-full">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-neu-text">Prospects actifs</p>
            <span className="neu-inset-sm rounded-full px-2.5 py-1 text-[10px] font-bold text-neu-accent-2">
              {data.activeProspects}
            </span>
          </div>
          {data.activeProspects > 0 ? (
            <ul className="space-y-2">
              {data.prospects
                .filter((p) => p.outcome === "en-cours")
                .slice(0, 4)
                .map((p) => (
                  <li key={p.id} className="neu-cell rounded-[1.25rem] px-4 py-3">
                    <p className="text-xs font-semibold text-neu-text">{p.name}</p>
                    <p className="text-[10px] text-neu-muted">{p.company}</p>
                    {p.pipeline === "templates" && (
                      <p className="mt-1 text-xs font-bold text-neu-accent-1">
                        {formatMoney(p.value)}
                      </p>
                    )}
                  </li>
                ))}
            </ul>
          ) : (
            <EmptyBlock message="Ajoutez vos premiers prospects." />
          )}
          <Link
            href="/prospects"
            className="mt-4 block text-center text-xs font-semibold text-neu-accent-2"
          >
            Pipeline complet →
          </Link>
        </NeuCard>
      );
    case "widget-clients":
      return <ActiveClientsCard />;
    case "widget-reminders":
      return <RemindersCard />;
    case "widget-schedule":
      return <ScheduleCard />;
    case "widget-revenue":
      return <RevenueCard revenueData={data.revenueChart} />;
    case "widget-calendar":
      return <CalendarCard />;
    case "widget-quick-links":
      return (
        <NeuCard>
          <p className="mb-4 text-sm font-bold text-neu-text">Raccourcis</p>
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="neu-btn rounded-full px-4 py-2 text-xs font-semibold text-neu-text/70 hover:text-neu-accent-2"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </NeuCard>
      );
    default:
      return null;
  }
}
