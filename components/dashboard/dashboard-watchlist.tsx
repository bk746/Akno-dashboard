"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatMoney } from "@/lib/finances";
import type { Prospect } from "@/lib/prospects";
import {
  getClientDisplayName,
  quoteStatusLabels,
  quoteStatusStyles,
  type Quote,
} from "@/lib/quotes";
import {
  formatPlannerDate,
  isReminderOverdue,
  sortReminders,
  type Reminder,
} from "@/lib/planner";
import { cn } from "@/lib/utils";

type DashboardWatchlistProps = {
  quotes: Quote[];
  prospects: Prospect[];
  reminders: Reminder[];
};

type WatchItem = {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  value: string;
  trend?: "up" | "down" | "neutral";
};

function buildWatchItems(
  quotes: Quote[],
  prospects: Prospect[],
  reminders: Reminder[],
): WatchItem[] {
  const items: WatchItem[] = [];

  for (const prospect of prospects.filter((p) => p.outcome === "en-cours").slice(0, 2)) {
    items.push({
      id: `prospect-${prospect.id}`,
      href: "/prospects",
      title: prospect.name,
      subtitle: prospect.company || "Prospect actif",
      value: prospect.pipeline === "templates" ? formatMoney(prospect.value) : "En cours",
      trend: "up",
    });
  }

  for (const quote of quotes.slice(0, 4)) {
    items.push({
      id: `quote-${quote.id}`,
      href: "/devis",
      title: getClientDisplayName(quote),
      subtitle: quote.number,
      value: formatMoney(quote.amount),
      trend: quote.status === "accepte" ? "up" : "neutral",
    });
  }

  for (const reminder of sortReminders(reminders).slice(0, 2)) {
    items.push({
      id: `reminder-${reminder.id}`,
      href: "/planning",
      title: reminder.title,
      subtitle: formatPlannerDate(reminder.dueDate),
      value: isReminderOverdue(reminder) ? "Retard" : "À faire",
      trend: isReminderOverdue(reminder) ? "down" : "neutral",
    });
  }

  return items.slice(0, 6);
}

export function DashboardWatchlist({ quotes, prospects, reminders }: DashboardWatchlistProps) {
  const items = buildWatchItems(quotes, prospects, reminders);
  const latestQuote = quotes[0];
  const showLatestQuote = latestQuote && !items.some((i) => i.subtitle === latestQuote.number);

  return (
    <div className="akno-card flex h-full flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-akno-subtle">
            Pipeline
          </p>
          <p className="text-sm font-bold text-akno-text">À suivre</p>
        </div>
        <Link href="/planning" className="text-xs font-semibold text-akno-primary hover:underline">
          Tout voir
        </Link>
      </div>

      {items.length > 0 ? (
        <ul className="divide-y divide-akno-border">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-akno-primary"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-akno-text">{item.title}</p>
                  <p className="truncate text-xs text-akno-subtle">{item.subtitle}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-right">
                  <span className="text-xs font-semibold text-akno-text">{item.value}</span>
                  {item.trend === "up" && (
                    <ArrowUpRight size={12} className="text-[var(--akno-success)]" />
                  )}
                  {item.trend === "down" && (
                    <ArrowDownRight size={12} className="text-[var(--akno-danger)]" />
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-akno-border px-3 py-8 text-center text-xs text-akno-subtle">
          Aucune activité récente.
        </p>
      )}

      {showLatestQuote && latestQuote && (
        <div className="mt-auto border-t border-akno-border pt-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-akno-subtle">
            Dernier devis
          </p>
          <Link href="/devis" className="block rounded-lg bg-akno-bg px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-akno-text">
                  {getClientDisplayName(latestQuote)}
                </p>
                <p className="text-xs text-akno-subtle">{latestQuote.number}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold">{formatMoney(latestQuote.amount)}</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    quoteStatusStyles[latestQuote.status],
                  )}
                >
                  {quoteStatusLabels[latestQuote.status]}
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
