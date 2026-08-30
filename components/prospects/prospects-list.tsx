"use client";

import { Globe, Mail, Phone } from "lucide-react";
import { NeuCard } from "@/components/ui/neu-card";
import { formatMoney } from "@/lib/finances";
import {
  getContactStatus,
  getProspectionLabel,
  getProspectsByPipeline,
  isContacted,
  pipelineConfig,
  prospectPipelines,
  type Prospect,
  type ProspectPipeline,
} from "@/lib/prospects";
import { cn } from "@/lib/utils";

const statusStyles = {
  pending: "bg-slate-200/80 text-slate-600",
  active: "bg-neu-accent-2/15 text-neu-accent-2",
  success: "bg-emerald-100 text-emerald-700",
  lost: "bg-neu-accent-3/15 text-neu-accent-3",
};

function sortProspects(items: Prospect[]) {
  return [...items].sort((a, b) => {
    const order = { "en-cours": 0, gagne: 1, perdu: 2 };
    const outcomeDiff = order[a.outcome] - order[b.outcome];
    if (outcomeDiff !== 0) return outcomeDiff;

    const contactedDiff = Number(isContacted(a)) - Number(isContacted(b));
    if (contactedDiff !== 0) return contactedDiff;

    return a.name.localeCompare(b.name, "fr");
  });
}

function ProspectRow({
  prospect,
  showValue,
}: {
  prospect: Prospect;
  showValue: boolean;
}) {
  const status = getContactStatus(prospect);
  const prospection = getProspectionLabel(prospect);
  const config = pipelineConfig[prospect.pipeline];

  return (
    <tr className="border-b border-neu-text/5 last:border-0">
      <td className="py-3.5 pr-3">
        <p className="font-semibold text-neu-text">{prospect.name}</p>
        <p className="text-xs text-neu-muted">{prospect.company}</p>
        {prospect.website && (
          <a
            href={prospect.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-neu-accent-2 hover:underline"
          >
            <Globe size={11} />
            Site web
          </a>
        )}
      </td>
      <td className="hidden py-3.5 pr-3 sm:table-cell">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
            statusStyles[status.tone],
          )}
        >
          {status.label}
        </span>
      </td>
      <td className="py-3.5 pr-3">
        <p className="text-sm font-medium text-neu-text">{prospection}</p>
        {prospect.lastContact && (
          <p className="mt-0.5 text-[11px] text-neu-muted">
            Dernier contact : {prospect.lastContact}
          </p>
        )}
        <span
          className={cn(
            "mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold sm:hidden",
            statusStyles[status.tone],
          )}
        >
          {status.label}
        </span>
      </td>
      {showValue && (
        <td className="hidden py-3.5 pr-3 md:table-cell">
          <p className={cn("text-sm font-bold", config.accentClass)}>
            {formatMoney(prospect.value)}
          </p>
        </td>
      )}
      <td className="py-3.5">
        <div className="flex items-center justify-end gap-2">
          {prospect.email ? (
            <a
              href={`mailto:${prospect.email}`}
              className="neu-flat flex h-8 w-8 items-center justify-center rounded-xl text-neu-muted hover:text-neu-accent-2"
              aria-label={`Envoyer un mail à ${prospect.name}`}
            >
              <Mail size={14} />
            </a>
          ) : null}
          {prospect.phone ? (
            <a
              href={`tel:${prospect.phone}`}
              className="neu-flat flex h-8 w-8 items-center justify-center rounded-xl text-neu-muted hover:text-neu-accent-1"
              aria-label={`Appeler ${prospect.name}`}
            >
              <Phone size={14} />
            </a>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

function ProspectCard({
  prospect,
  showValue,
}: {
  prospect: Prospect;
  showValue: boolean;
}) {
  const config = pipelineConfig[prospect.pipeline];
  const status = getContactStatus(prospect);
  const prospection = getProspectionLabel(prospect);

  return (
    <div className="neu-cell rounded-[1.25rem] p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-neu-text">{prospect.name}</p>
          <p className="text-xs text-neu-muted">{prospect.company}</p>
          {prospect.website && (
            <a
              href={prospect.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-neu-accent-2 hover:underline"
            >
              <Globe size={11} />
              Site web
            </a>
          )}
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
            statusStyles[status.tone],
          )}
        >
          {status.label}
        </span>
      </div>

      <p className="mt-3 text-sm font-medium text-neu-text">{prospection}</p>
      {prospect.lastContact && (
        <p className="mt-1 text-[11px] text-neu-muted">
          Dernier contact : {prospect.lastContact}
        </p>
      )}

      <div
        className={cn(
          "mt-3 flex items-center gap-2",
          showValue ? "justify-between" : "justify-end",
        )}
      >
        {showValue && (
          <p className={cn("text-sm font-bold", config.accentClass)}>
            {formatMoney(prospect.value)}
          </p>
        )}
        <div className="flex gap-2">
          {prospect.email ? (
            <a
              href={`mailto:${prospect.email}`}
              className="neu-flat flex h-8 w-8 items-center justify-center rounded-xl text-neu-muted"
            >
              <Mail size={14} />
            </a>
          ) : null}
          {prospect.phone ? (
            <a
              href={`tel:${prospect.phone}`}
              className="neu-flat flex h-8 w-8 items-center justify-center rounded-xl text-neu-muted"
            >
              <Phone size={14} />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PipelineColumn({
  pipeline,
  prospects,
}: {
  pipeline: ProspectPipeline;
  prospects: Prospect[];
}) {
  const config = pipelineConfig[pipeline];
  const showValue = config.showValue;
  const items = sortProspects(getProspectsByPipeline(prospects, pipeline));
  const notContacted = items.filter(
    (p) => p.outcome === "en-cours" && !isContacted(p),
  ).length;
  const inProgress = items.filter(
    (p) => p.outcome === "en-cours" && isContacted(p),
  ).length;
  const won = items.filter((p) => p.outcome === "gagne").length;

  return (
    <NeuCard className="p-4 lg:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
              config.badgeClass,
            )}
          >
            {config.owner}
          </span>
          <h2 className="mt-2 text-base font-bold text-neu-text">
            {config.label}
          </h2>
          <p className="text-sm text-neu-muted">{config.subtitle}</p>
        </div>
        <span className="text-xs font-semibold text-neu-muted">
          {items.length} prospects
        </span>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="neu-inset-sm rounded-xl px-2 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase text-neu-muted">
            À contacter
          </p>
          <p className="mt-0.5 text-lg font-bold text-slate-600">
            {notContacted}
          </p>
        </div>
        <div className="neu-inset-sm rounded-xl px-2 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase text-neu-muted">
            En cours
          </p>
          <p className={cn("mt-0.5 text-lg font-bold", config.accentClass)}>
            {inProgress}
          </p>
        </div>
        <div className="neu-inset-sm rounded-xl px-2 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase text-neu-muted">
            Gagnés
          </p>
          <p className="mt-0.5 text-lg font-bold text-emerald-600">{won}</p>
        </div>
      </div>

      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neu-text/5 text-left text-[10px] font-bold uppercase tracking-wide text-neu-muted">
              <th className="pb-2 pr-3">Prospect</th>
              <th className="hidden pb-2 pr-3 sm:table-cell">Statut</th>
              <th className="pb-2 pr-3">Prospection</th>
              {showValue && (
                <th className="hidden pb-2 pr-3 md:table-cell">Montant</th>
              )}
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((prospect) => (
              <ProspectRow
                key={prospect.id}
                prospect={prospect}
                showValue={showValue}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((prospect) => (
          <ProspectCard
            key={prospect.id}
            prospect={prospect}
            showValue={showValue}
          />
        ))}
      </div>
    </NeuCard>
  );
}

export function ProspectsList({ prospects }: { prospects: Prospect[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {prospectPipelines.map((pipeline) => (
        <PipelineColumn key={pipeline} pipeline={pipeline} prospects={prospects} />
      ))}
    </div>
  );
}
