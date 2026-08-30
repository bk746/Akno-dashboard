"use client";

import { LayoutGrid, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardHeroChart } from "@/components/dashboard/dashboard-hero-chart";
import type { ChartPeriod } from "@/components/dashboard/dashboard-studio-types";
import { DashboardStatCards } from "@/components/dashboard/dashboard-stat-cards";
import { DashboardWatchlist } from "@/components/dashboard/dashboard-watchlist";
import {
  buildFinanceChartByPeriod,
  formatMoney,
  getMonthOverMonthGrowth,
  type Transaction,
} from "@/lib/finances";
import { formatGoalProgress } from "@/lib/goals";
import type { Goal } from "@/lib/goals";
import type { Prospect } from "@/lib/prospects";
import type { Quote } from "@/lib/quotes";
import type { Reminder } from "@/lib/planner";
import { cn } from "@/lib/utils";

type DashboardStudioProps = {
  transactions: Transaction[];
  paidThisMonth: number;
  moisDepenses: number;
  moisBenefice: number;
  activeSubscriptionsMrr: number;
  monthGoals: Goal[];
  quotes: Quote[];
  prospects: Prospect[];
  reminders: Reminder[];
  onCustomize?: () => void;
};

export function DashboardStudio({
  transactions,
  paidThisMonth,
  moisDepenses,
  moisBenefice,
  activeSubscriptionsMrr,
  monthGoals,
  quotes,
  prospects,
  reminders,
  onCustomize,
}: DashboardStudioProps) {
  const [period, setPeriod] = useState<ChartPeriod>("month");

  const chartData = useMemo(
    () => buildFinanceChartByPeriod(transactions, period),
    [transactions, period],
  );

  const growth = useMemo(() => getMonthOverMonthGrowth(transactions), [transactions]);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-akno-primary">
            Tableau de bord
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-akno-text sm:text-3xl">
            Vue d&apos;ensemble
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {onCustomize && (
            <button
              type="button"
              onClick={onCustomize}
              className="akno-btn-secondary hidden items-center gap-1.5 px-3 py-2 text-xs sm:flex"
            >
              <LayoutGrid size={14} />
              Personnaliser
            </button>
          )}
          <div className="flex items-center gap-2 rounded-full border border-akno-border bg-akno-surface py-1 pl-1 pr-3 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-akno-primary text-[10px] font-bold text-white">
              K
            </div>
            <span className="text-xs font-medium text-akno-muted">AKNO</span>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-akno-muted">Bénéfice net · ce mois</p>
          <p className="text-3xl font-bold tracking-tight text-akno-text sm:text-4xl">
            {formatMoney(moisBenefice)}
          </p>
        </div>
        {growth && (
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
              growth.percent >= 0
                ? "bg-[var(--akno-success-soft)] text-[var(--akno-success)]"
                : "bg-[var(--akno-danger-soft)] text-[var(--akno-danger)]",
            )}
          >
            {growth.percent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {growth.percent >= 0 ? "+" : ""}
            {growth.percent.toFixed(1)}% vs mois dernier
          </div>
        )}
      </div>

      <DashboardStatCards
        paidThisMonth={paidThisMonth}
        expenses={moisDepenses}
        activeSubscriptionsMrr={activeSubscriptionsMrr}
        moisBenefice={moisBenefice}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <DashboardHeroChart data={chartData} period={period} onPeriodChange={setPeriod} />

        <DashboardWatchlist quotes={quotes} prospects={prospects} reminders={reminders} />
      </div>

      {monthGoals.length > 0 && (
        <div className="akno-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-akno-subtle">
                Objectifs
              </p>
              <p className="text-sm font-bold text-akno-text">Progression du mois</p>
            </div>
            <Link href="/objectifs" className="text-xs font-semibold text-akno-primary hover:underline">
              Gérer les objectifs →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {monthGoals.slice(0, 3).map((goal) => {
              const pct = Math.min(
                100,
                Math.round((goal.current / Math.max(goal.target, 1)) * 100),
              );
              return (
                <div key={goal.id} className="rounded-lg border border-akno-border bg-akno-bg p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-akno-text">{goal.label}</p>
                    <span className="text-xs font-bold text-akno-primary">{pct}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-akno-border">
                    <div
                      className="h-full rounded-full bg-akno-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-akno-subtle">
                    {formatGoalProgress(goal.current, goal.target, goal.unit)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
