"use client";

import { ExternalLink, Mail, Pencil, Phone } from "lucide-react";
import { ProspectFollowUpIndicator } from "@/components/prospects/prospect-follow-up-indicator";
import { ProspectIaNote, ProspectSeverityBadge } from "@/components/prospects/prospect-severity-badge";
import { websiteHost } from "@/components/prospects/prospects-utils";
import { NeuCard } from "@/components/ui/neu-card";
import { formatMoney } from "@/lib/finances";
import {
  boardConfig,
  compareProspectFollowUp,
  getProspectFollowUp,
  getProspectionLabel,
  getWebsiteScoreLabel,
  type Prospect,
  type ProspectBoard,
} from "@/lib/prospects";
import { cn } from "@/lib/utils";

function sortProspects(items: Prospect[]) {
  return [...items].sort(compareProspectFollowUp);
}

function ProspectRow({
  prospect,
  showValue,
  showIaColumns,
  onEdit,
}: {
  prospect: Prospect;
  showValue: boolean;
  showIaColumns: boolean;
  onEdit: (prospect: Prospect) => void;
}) {
  const followUp = getProspectFollowUp(prospect);
  const prospection = getProspectionLabel(prospect);
  const config = boardConfig[prospect.board];

  return (
    <tr className="border-b border-neu-text/5 last:border-0">
      <td className="py-3.5 pr-3">
        <div className="flex items-start gap-2.5">
          <ProspectFollowUpIndicator prospect={prospect} className="mt-1.5" />
          <div className="min-w-0">
            <p className="font-semibold text-neu-text">{prospect.company}</p>
            {prospect.name && prospect.name !== prospect.company && (
              <p className="text-xs text-neu-muted">{prospect.name}</p>
            )}
            {(prospect.city || prospect.address) && (
              <p className="mt-0.5 text-[11px] text-neu-muted">
                {[prospect.address, prospect.city].filter(Boolean).join(", ")}
              </p>
            )}
            <p className="mt-1 text-[10px] font-medium text-neu-muted">{followUp.hint ?? followUp.label}</p>
            {showIaColumns && <ProspectIaNote prospect={prospect} />}
          </div>
        </div>
      </td>

      <td className="py-3.5 pr-3">
        {prospect.website ? (
          <a
            href={prospect.website}
            target="_blank"
            rel="noopener noreferrer"
            className="neu-flat inline-flex max-w-[160px] items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-neu-accent-2 hover:text-neu-accent-2/80"
            title={prospect.website}
          >
            <ExternalLink size={13} className="shrink-0" />
            <span className="truncate">{websiteHost(prospect.website)}</span>
          </a>
        ) : (
          <span className="text-xs text-neu-muted">—</span>
        )}
      </td>

      {showIaColumns && (
        <td className="py-3.5 pr-3 align-top">
          <ProspectSeverityBadge severity={prospect.severity} />
          {prospect.websiteScore !== undefined && (
            <p className="mt-1 text-[10px] font-semibold text-neu-muted">
              {prospect.websiteScore}/100 · {getWebsiteScoreLabel(prospect.websiteScore)}
            </p>
          )}
        </td>
      )}

      <td className="py-3.5 pr-3">
        <p className="text-sm font-medium text-neu-text">{prospection}</p>
        {prospect.lastContact && (
          <p className="mt-0.5 text-[11px] text-neu-muted">
            Dernier contact : {prospect.lastContact}
            {followUp.daysSinceContact !== undefined ? ` · J+${followUp.daysSinceContact}` : ""}
          </p>
        )}
      </td>

      {showValue && (
        <td className="hidden py-3.5 pr-3 md:table-cell">
          <p className={cn("text-sm font-bold", config.accentClass)}>
            {formatMoney(prospect.value)}
          </p>
        </td>
      )}

      <td className="py-3.5">
        <div className="flex items-center justify-end gap-1.5">
          {prospect.website ? (
            <a
              href={prospect.website}
              target="_blank"
              rel="noopener noreferrer"
              className="neu-flat flex h-8 w-8 items-center justify-center rounded-xl text-neu-accent-2 hover:bg-neu-accent-2/10"
              aria-label={`Ouvrir le site de ${prospect.company}`}
            >
              <ExternalLink size={14} />
            </a>
          ) : null}
          {prospect.email ? (
            <a
              href={`mailto:${prospect.email}`}
              className="neu-flat flex h-8 w-8 items-center justify-center rounded-xl text-neu-muted hover:text-neu-accent-2"
              aria-label={`Envoyer un mail à ${prospect.company}`}
            >
              <Mail size={14} />
            </a>
          ) : null}
          {prospect.phone ? (
            <a
              href={`tel:${prospect.phone}`}
              className="neu-flat flex h-8 w-8 items-center justify-center rounded-xl text-neu-muted hover:text-neu-accent-1"
              aria-label={`Appeler ${prospect.company}`}
            >
              <Phone size={14} />
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => onEdit(prospect)}
            className="neu-flat flex h-8 w-8 items-center justify-center rounded-xl text-neu-muted hover:text-neu-accent-2"
            aria-label={`Modifier ${prospect.company}`}
          >
            <Pencil size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function countByTone(prospects: Prospect[], tone: "yellow" | "green" | "red") {
  return prospects.filter((p) => p.outcome === "en-cours" && getProspectFollowUp(p).tone === tone)
    .length;
}

export function ProspectsBoard({
  board,
  prospects,
  onEdit,
}: {
  board: ProspectBoard;
  prospects: Prospect[];
  onEdit: (prospect: Prospect) => void;
}) {
  const config = boardConfig[board];
  const items = sortProspects(prospects);
  const showValue = config.showValue;
  const showIaColumns = board === "ia";
  const yellow = countByTone(items, "yellow");
  const red = countByTone(items, "red");
  const green = countByTone(items, "green");
  const won = items.filter((p) => p.outcome === "gagne").length;

  if (items.length === 0) {
    return (
      <NeuCard className="py-16 text-center">
        <p className="text-sm font-medium text-neu-text">Aucun prospect sur cette page</p>
        <p className="mt-2 text-sm text-neu-muted">{config.subtitle}</p>
      </NeuCard>
    );
  }

  return (
    <NeuCard className="p-4 lg:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
              config.badgeClass,
            )}
          >
            {config.label}
          </span>
          <h2 className="mt-2 text-base font-bold text-neu-text">{config.subtitle}</h2>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-neu-muted">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-1 text-amber-800">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            {yellow} à contacter
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2 py-1 text-red-800">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {red} relance
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-1 text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {green} en attente
          </span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="neu-inset-sm rounded-xl px-2 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase text-neu-muted">Total</p>
          <p className="mt-0.5 text-lg font-bold text-neu-text">{items.length}</p>
        </div>
        <div className="neu-inset-sm rounded-xl px-2 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase text-amber-700">Jaune</p>
          <p className="mt-0.5 text-lg font-bold text-amber-600">{yellow}</p>
        </div>
        <div className="neu-inset-sm rounded-xl px-2 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase text-red-700">Rouge</p>
          <p className="mt-0.5 text-lg font-bold text-red-600">{red}</p>
        </div>
        <div className="neu-inset-sm rounded-xl px-2 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase text-emerald-700">Gagnés</p>
          <p className="mt-0.5 text-lg font-bold text-emerald-600">{won}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px]">
          <thead>
            <tr className="border-b border-neu-text/5 text-left text-[10px] font-bold uppercase tracking-wide text-neu-muted">
              <th className="pb-2 pr-3">Prospect</th>
              <th className="pb-2 pr-3">Site web</th>
              {showIaColumns && <th className="pb-2 pr-3">Gravité</th>}
              <th className="pb-2 pr-3">Suivi</th>
              {showValue && <th className="hidden pb-2 pr-3 md:table-cell">Montant</th>}
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((prospect) => (
              <ProspectRow
                key={prospect.id}
                prospect={prospect}
                showValue={showValue}
                showIaColumns={showIaColumns}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
      </div>
    </NeuCard>
  );
}
