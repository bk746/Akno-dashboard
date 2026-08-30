"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/finances";
import { cn } from "@/lib/utils";
import type { ChartPeriod, ChartPoint } from "@/components/dashboard/dashboard-studio-types";

export type { ChartPeriod, ChartPoint };

type DashboardHeroChartProps = {
  data: ChartPoint[];
  period: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
};

const PERIODS: { id: ChartPeriod; label: string }[] = [
  { id: "day", label: "Jour" },
  { id: "week", label: "Semaine" },
  { id: "month", label: "Mois" },
  { id: "total", label: "Total" },
];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-akno-border bg-akno-surface px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-akno-subtle">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-semibold" style={{ color: entry.color }}>
          {entry.name} · {formatMoney(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function DashboardHeroChart({ data, period, onPeriodChange }: DashboardHeroChartProps) {
  const hasData = data.some((point) => point.revenus > 0 || point.depenses > 0);

  return (
    <div className="akno-card p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-akno-subtle">
            Performance
          </p>
          <p className="text-sm font-bold text-akno-text">Revenus vs dépenses</p>
        </div>
        <div className="inline-flex rounded-lg border border-akno-border bg-akno-bg p-0.5">
          {PERIODS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onPeriodChange(id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                period === id
                  ? "bg-akno-surface text-akno-primary shadow-sm"
                  : "text-akno-subtle hover:text-akno-text",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[220px] sm:h-[240px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="stripeRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#635bff" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#635bff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="stripeExpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#80e9ff" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#80e9ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e8ee" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#697386", fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#697386", fontSize: 11 }}
                tickFormatter={(value) => `${Math.round(value / 1000)}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="revenus"
                name="Revenus"
                stroke="#635bff"
                strokeWidth={2}
                fill="url(#stripeRevGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#635bff", stroke: "#fff", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="depenses"
                name="Dépenses"
                stroke="#80e9ff"
                strokeWidth={2}
                fill="url(#stripeExpGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#80e9ff", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-akno-border text-sm text-akno-subtle">
            Vos données financières apparaîtront ici.
          </div>
        )}
      </div>
    </div>
  );
}
