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
import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { NeuCard } from "@/components/ui/neu-card";
import { formatMoney, type RevenueChartPoint } from "@/lib/finances";

type RevenueCardProps = {
  revenueData: RevenueChartPoint[];
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="neu-inset-sm rounded-[1rem] px-3 py-2 text-xs">
      <p className="font-medium text-neu-muted">{label}</p>
      <p className="mt-0.5 font-semibold text-neu-accent-2">
        {formatMoney(payload[0].value)}
      </p>
    </div>
  );
}

export function RevenueCard({ revenueData }: RevenueCardProps) {
  const yearTotal = revenueData.reduce((sum, point) => sum + point.ca, 0);
  const monthsWithRevenue = revenueData.filter((point) => point.ca > 0);
  const lastMonth = revenueData.at(-1)?.ca ?? 0;
  const prevMonth = revenueData.at(-2)?.ca ?? 0;
  const growth =
    prevMonth > 0 ? (((lastMonth - prevMonth) / prevMonth) * 100).toFixed(1) : null;
  const hasData = monthsWithRevenue.length > 0;

  return (
    <NeuCard size="sm" className="flex h-full flex-col">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neu-muted">
            Chiffre d&apos;affaires
          </p>
          <p className="mt-0.5 text-xl font-bold text-neu-text">{formatMoney(yearTotal)}</p>
          <p className="mt-0.5 text-[11px] text-neu-muted">Factures payées · 8 mois</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {growth !== null && (
            <div className="neu-inset-sm flex items-center gap-1 rounded-full px-2.5 py-1">
              {Number(growth) >= 0 ? (
                <TrendingUp size={12} className="text-neu-accent-2" />
              ) : (
                <TrendingDown size={12} className="text-neu-accent-3" />
              )}
              <span
                className={`text-[11px] font-semibold ${
                  Number(growth) >= 0 ? "text-neu-accent-2" : "text-neu-accent-3"
                }`}
              >
                {Number(growth) >= 0 ? "+" : ""}
                {growth}%
              </span>
            </div>
          )}
          <Link
            href="/factures"
            className="text-[11px] font-semibold text-neu-accent-2 hover:underline"
          >
            Factures →
          </Link>
        </div>
      </div>

      {hasData ? (
        <div className="neu-inset-md min-h-[150px] flex-1 rounded-xl p-2 pt-3">
          <ResponsiveContainer width="100%" height="100%" minHeight={150}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="caGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6B92E5" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#7B81BE" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8b95a8", fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8b95a8", fontSize: 10 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="ca"
                stroke="#6B92E5"
                strokeWidth={2}
                fill="url(#caGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#6B92E5",
                  stroke: "#ECF0F3",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-neu-text/10 px-4 py-10 text-center text-sm text-neu-muted">
          Marquez des factures comme payées pour voir l&apos;évolution du CA.
        </p>
      )}
    </NeuCard>
  );
}
