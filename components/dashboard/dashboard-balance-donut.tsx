"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Link from "next/link";
import { formatMoney, type ExpenseCategoryPoint } from "@/lib/finances";

type DashboardBalanceDonutProps = {
  categories: ExpenseCategoryPoint[];
  totalExpenses: number;
  totalRevenue: number;
};

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: ExpenseCategoryPoint }[];
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="neu-inset-sm rounded-xl px-3 py-2 text-xs">
      <p className="font-medium text-neu-muted">{payload[0].name}</p>
      <p className="font-semibold text-neu-text">{formatMoney(payload[0].value)}</p>
    </div>
  );
}

export function DashboardBalanceDonut({
  categories,
  totalExpenses,
  totalRevenue,
}: DashboardBalanceDonutProps) {
  const hasData = categories.length > 0;
  const buyingPower = Math.max(0, totalRevenue - totalExpenses);

  const fallback = [
    { name: "Revenus", value: totalRevenue, color: "#6B92E5" },
    { name: "Dépenses", value: totalExpenses, color: "#555baa" },
  ].filter((item) => item.value > 0);

  const chartData = hasData ? categories : fallback;

  return (
    <div className="neu-inset-sm flex h-full flex-col rounded-[1.5rem] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold text-neu-text">Répartition dépenses</p>
        <Link href="/finances" className="text-[10px] font-semibold text-neu-accent-2">
          Finances →
        </Link>
      </div>

      <div className="relative mx-auto h-[140px] w-full max-w-[180px] flex-1">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="62%"
                outerRadius="88%"
                paddingAngle={3}
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={entry.color ?? "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neu-muted">
            Aucune dépense
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-lg font-bold text-neu-text">{formatMoney(buyingPower)}</p>
          <p className="text-[10px] text-neu-muted">Marge nette</p>
        </div>
      </div>

      {hasData && (
        <ul className="mt-3 space-y-1.5">
          {categories.slice(0, 3).map((cat) => (
            <li key={cat.name} className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5 text-neu-muted">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </span>
              <span className="font-semibold text-neu-text">{formatMoney(cat.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
