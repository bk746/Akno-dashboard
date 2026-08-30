"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { NeuCard } from "@/components/ui/neu-card";
import {
  formatClientRevenue,
  loadStoredClients,
  statusLabels,
  statusStyles,
  type Client,
} from "@/lib/clients";
import { cn } from "@/lib/utils";

export function ActiveClientsCard() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setClients(loadStoredClients());
  }, []);

  const activeClients = clients.filter((c) => c.status === "active").slice(0, 4);

  return (
    <NeuCard className="flex h-full flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-neu-muted">
            Clients actifs
          </p>
          <h2 className="mt-1 text-lg font-semibold text-neu-text">
            {clients.filter((c) => c.status === "active").length} clients
          </h2>
        </div>
        <Link
          href="/clients/nouveau"
          className="neu-btn flex h-10 w-10 items-center justify-center rounded-full text-neu-accent-2 transition-colors hover:text-neu-accent-1"
          aria-label="Nouveau client"
        >
          <Plus size={18} />
        </Link>
      </div>

      {activeClients.length > 0 ? (
        <ul className="flex flex-1 flex-col gap-3">
          {activeClients.map((client) => (
            <li key={client.id}>
              <Link
                href="/clients"
                className="neu-cell group flex items-center gap-3 rounded-[1.25rem] px-4 py-3 transition-all"
              >
                <div className="neu-inset-sm flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-neu-text/70">
                  {client.initials}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neu-text">
                    {client.name}
                  </p>
                  <p className="truncate text-xs text-neu-muted">{client.company}</p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-xs font-semibold text-neu-text">
                    {formatClientRevenue(client.revenue)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      statusStyles[client.status],
                    )}
                  >
                    {statusLabels[client.status]}
                  </span>
                </div>

                <ArrowUpRight
                  size={14}
                  className="shrink-0 text-neu-muted opacity-0 transition-opacity group-hover:opacity-100"
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-neu-text/10 px-4 py-8 text-center text-sm text-neu-muted">
          Ajoutez votre premier client.
        </p>
      )}

      <Link
        href="/clients"
        className="neu-btn mt-4 block rounded-2xl py-2.5 text-center text-xs font-semibold text-neu-muted transition-colors hover:text-neu-accent-2"
      >
        Voir tous les clients
      </Link>
    </NeuCard>
  );
}
