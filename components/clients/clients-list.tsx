"use client";

import Link from "next/link";
import {
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DeleteButton } from "@/components/ui/delete-button";
import { KpiCard } from "@/components/ui/kpi-card";
import { NeuCard } from "@/components/ui/neu-card";
import { NeuButton } from "@/components/ui/neu-form";
import { MotionFilterButton } from "@/components/ui/motion-primitives";
import {
  formatClientRevenue,
  getActiveMonthlySubscriptionsTotal,
  getActiveSubscriptionsCount,
  loadStoredClients,
  saveStoredClients,
  statusLabels,
  statusStyles,
  type Client,
  type ClientStatus,
} from "@/lib/clients";
import { cn } from "@/lib/utils";

const filters: { id: ClientStatus | "all"; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "active", label: "Actifs" },
  { id: "pending", label: "En attente" },
  { id: "prospect", label: "Prospects" },
];

function ClientAvatar({ initials }: { initials: string }) {
  return (
    <div className="neu-flat flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-neu-text/70">
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

function ClientRow({
  client,
  onDelete,
}: {
  client: Client;
  onDelete: (id: number) => void;
}) {
  return (
    <tr className="group border-b border-neu-text/5 last:border-0 hover:bg-neu-text/[0.02]">
      <td className="py-4 pl-6 pr-4">
        <div className="flex items-center gap-3">
          <ClientAvatar initials={client.initials} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-neu-text">{client.name}</p>
            <p className="truncate text-xs text-neu-muted md:hidden">
              {client.company}
            </p>
          </div>
        </div>
      </td>
      <td className="hidden py-4 pr-4 md:table-cell">
        <div className="flex items-center gap-1.5 text-sm text-neu-text">
          <Building2 size={14} className="shrink-0 text-neu-muted" />
          <span className="truncate">{client.company}</span>
        </div>
      </td>
      <td className="hidden py-4 pr-4 lg:table-cell">
        <a
          href={`mailto:${client.email}`}
          className="flex items-center gap-1.5 truncate text-sm text-neu-muted hover:text-neu-accent-2"
        >
          <Mail size={14} className="shrink-0" />
          {client.email}
        </a>
      </td>
      <td className="hidden py-4 pr-4 xl:table-cell">
        <span className="flex items-center gap-1.5 text-sm text-neu-muted">
          <Phone size={14} className="shrink-0" />
          {client.phone}
        </span>
      </td>
      <td className="hidden py-4 pr-4 sm:table-cell">
        <span className="flex items-center gap-1.5 text-xs text-neu-muted">
          <MapPin size={13} className="shrink-0" />
          {client.city ?? "—"}
        </span>
      </td>
      <td className="py-4 pr-4 text-right">
        <span className="text-sm font-bold text-neu-text">
          {formatClientRevenue(client.revenue)}
        </span>
      </td>
      <td className="py-4 pr-2">
        <StatusBadge status={client.status} />
      </td>
      <td className="py-4 pr-6 pl-2 text-right">
        <div className="inline-flex items-center gap-1">
          <Link
            href={`/clients/${client.id}`}
            className="neu-flat inline-flex h-8 w-8 items-center justify-center rounded-xl text-neu-muted hover:text-neu-accent-2"
            aria-label={`Modifier ${client.name}`}
          >
            <Pencil size={14} />
          </Link>
          <DeleteButton
            label={`${client.name} (${client.company})`}
            onConfirm={() => onDelete(client.id)}
          />
        </div>
      </td>
    </tr>
  );
}

function ClientMobileCard({
  client,
  onDelete,
}: {
  client: Client;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="neu-flat rounded-[1.25rem] p-4 md:hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ClientAvatar initials={client.initials} />
          <div>
            <p className="font-semibold text-neu-text">{client.name}</p>
            <p className="text-sm text-neu-muted">{client.company}</p>
          </div>
        </div>
        <StatusBadge status={client.status} />
        <div className="flex items-center gap-1">
          <Link
            href={`/clients/${client.id}`}
            className="neu-flat inline-flex h-8 w-8 items-center justify-center rounded-xl text-neu-muted hover:text-neu-accent-2"
            aria-label={`Modifier ${client.name}`}
          >
            <Pencil size={14} />
          </Link>
          <DeleteButton
            label={`${client.name} (${client.company})`}
            onConfirm={() => onDelete(client.id)}
          />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="mb-0.5 font-medium uppercase tracking-wide text-neu-muted">
            CA
          </p>
          <p className="font-bold text-neu-text">
            {formatClientRevenue(client.revenue)}
          </p>
        </div>
        <div>
          <p className="mb-0.5 font-medium uppercase tracking-wide text-neu-muted">
            Ville
          </p>
          <p className="text-neu-text">{client.city ?? "—"}</p>
        </div>
        <div className="col-span-2">
          <p className="mb-0.5 font-medium uppercase tracking-wide text-neu-muted">
            Email
          </p>
          <p className="truncate text-neu-text">{client.email}</p>
        </div>
      </div>
    </div>
  );
}

export function ClientsList() {
  const [clientList, setClientList] = useState<Client[]>([]);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ClientStatus | "all">("all");

  useEffect(() => {
    setClientList(loadStoredClients());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveStoredClients(clientList);
  }, [clientList, ready]);

  function handleDelete(id: number) {
    setClientList((current) => current.filter((client) => client.id !== id));
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return clientList.filter((client) => {
      const matchesFilter = filter === "all" || client.status === filter;
      const matchesSearch =
        !query ||
        client.name.toLowerCase().includes(query) ||
        client.company.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.city?.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [search, filter, clientList]);

  const stats = useMemo(
    () => ({
      total: clientList.length,
      active: clientList.filter((c) => c.status === "active").length,
      subscriptions: getActiveSubscriptionsCount(clientList),
      subscriptionsMrr: getActiveMonthlySubscriptionsTotal(clientList),
      revenue: clientList.reduce((sum, c) => sum + c.revenue, 0),
    }),
    [clientList],
  );

  const filterCounts = useMemo(
    () => ({
      all: clientList.length,
      active: clientList.filter((c) => c.status === "active").length,
      pending: clientList.filter((c) => c.status === "pending").length,
      prospect: clientList.filter((c) => c.status === "prospect").length,
    }),
    [clientList],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total clients"
          value={String(stats.total)}
          icon={<Users size={18} />}
        />
        <KpiCard
          label="Clients actifs"
          value={String(stats.active)}
          icon={<Building2 size={18} />}
        />
        <KpiCard
          label="Abonnements actifs"
          value={String(stats.subscriptions)}
          subValue={`${formatClientRevenue(stats.subscriptionsMrr)} / mois`}
          icon={<RefreshCw size={18} />}
        />
        <KpiCard
          label="CA total"
          value={formatClientRevenue(stats.revenue)}
          icon={<span className="text-sm font-bold">€</span>}
        />
      </div>

      <NeuCard className="!p-0 overflow-hidden">
        <div className="border-b border-neu-text/5 p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="neu-inset-sm flex flex-1 items-center gap-2 rounded-[1.25rem] px-4 py-3 lg:max-w-sm">
              <Search size={16} className="shrink-0 text-neu-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, entreprise, email, ville..."
                className="w-full bg-transparent text-sm text-neu-text outline-none placeholder:text-neu-muted"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {filters.map(({ id, label }) => (
                <MotionFilterButton
                  key={id}
                  active={filter === id}
                  onClick={() => setFilter(id)}
                >
                  {label} ({filterCounts[id]})
                </MotionFilterButton>
              ))}
            </div>
          </div>

          <p className="mt-4 text-xs text-neu-muted">
            {filtered.length} client{filtered.length !== 1 ? "s" : ""} affiché
            {filtered.length !== 1 ? "s" : ""}
            {filter !== "all" &&
              ` · filtre « ${statusLabels[filter as ClientStatus]} »`}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-neu-text">Aucun client trouvé</p>
            <p className="mt-1 text-xs text-neu-muted">
              Modifiez votre recherche ou ajoutez un nouveau client.
            </p>
            <Link href="/clients/nouveau" className="mt-5 inline-block">
              <NeuButton variant="primary" className="gap-2">
                <Plus size={16} />
                Ajouter un client
              </NeuButton>
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-neu-text/8 bg-neu-text/[0.02]">
                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-neu-muted">
                      Client
                    </th>
                    <th className="hidden px-0 py-3 pr-4 text-[11px] font-semibold uppercase tracking-wider text-neu-muted md:table-cell">
                      Entreprise
                    </th>
                    <th className="hidden px-0 py-3 pr-4 text-[11px] font-semibold uppercase tracking-wider text-neu-muted lg:table-cell">
                      Email
                    </th>
                    <th className="hidden px-0 py-3 pr-4 text-[11px] font-semibold uppercase tracking-wider text-neu-muted xl:table-cell">
                      Téléphone
                    </th>
                    <th className="hidden px-0 py-3 pr-4 text-[11px] font-semibold uppercase tracking-wider text-neu-muted sm:table-cell">
                      Ville
                    </th>
                    <th className="px-0 py-3 pr-4 text-right text-[11px] font-semibold uppercase tracking-wider text-neu-muted">
                      CA
                    </th>
                    <th className="px-0 py-3 pr-4 text-[11px] font-semibold uppercase tracking-wider text-neu-muted">
                      Statut
                    </th>
                    <th className="w-12 py-3 pr-6 text-right text-[11px] font-semibold uppercase tracking-wider text-neu-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="px-6">
                  {filtered.map((client) => (
                    <ClientRow
                      key={client.id}
                      client={client}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {filtered.map((client) => (
                <ClientMobileCard
                  key={client.id}
                  client={client}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </NeuCard>
    </div>
  );
}
