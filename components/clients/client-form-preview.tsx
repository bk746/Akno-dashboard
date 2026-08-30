"use client";

import { Building2, Globe, Mail, MapPin, Phone, User } from "lucide-react";
import { formatFormMoney, type ClientFormData } from "@/lib/client-form";
import { statusLabels } from "@/lib/clients";
import { cn } from "@/lib/utils";

type ClientFormPreviewProps = {
  form: ClientFormData;
  initials: string;
  compact?: boolean;
};

export function ClientFormPreview({ form, initials, compact = false }: ClientFormPreviewProps) {
  const fullName = `${form.firstName} ${form.lastName}`.trim() || "Nom du contact";
  const mrr = formatFormMoney(form.monthlySubscription);
  const revenue = formatFormMoney(form.estimatedRevenue);

  return (
    <div className="overflow-hidden rounded-xl border border-akno-border bg-akno-surface">
      <div className="bg-gradient-to-br from-akno-primary to-[#5851ea] px-5 py-6 text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold backdrop-blur-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold">{fullName}</p>
            {form.jobTitle && (
              <p className="truncate text-sm text-white/80">{form.jobTitle}</p>
            )}
            <p className="mt-1 truncate text-sm font-medium text-white/90">
              {form.company || "Entreprise"}
            </p>
          </div>
        </div>
      </div>

      <div className={cn("space-y-3 p-4", compact && "p-3")}>
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
              form.status === "active" && "bg-emerald-50 text-emerald-700",
              form.status === "pending" && "bg-amber-50 text-amber-700",
              form.status === "prospect" && "bg-violet-50 text-violet-700",
            )}
          >
            {statusLabels[form.status]}
          </span>
          {form.sector && (
            <span className="rounded-full bg-akno-bg px-2.5 py-1 text-[10px] font-semibold text-akno-muted">
              {form.sector}
            </span>
          )}
          {form.source && (
            <span className="rounded-full bg-akno-primary-soft px-2.5 py-1 text-[10px] font-semibold text-akno-primary">
              {form.source}
            </span>
          )}
        </div>

        <ul className="space-y-2 text-xs text-akno-muted">
          {form.email && (
            <li className="flex items-center gap-2 truncate">
              <Mail size={13} className="shrink-0 text-akno-subtle" />
              {form.email}
            </li>
          )}
          {form.phone && (
            <li className="flex items-center gap-2">
              <Phone size={13} className="shrink-0 text-akno-subtle" />
              {form.phone}
            </li>
          )}
          {(form.city || form.country) && (
            <li className="flex items-center gap-2 truncate">
              <MapPin size={13} className="shrink-0 text-akno-subtle" />
              {[form.city, form.country].filter(Boolean).join(", ")}
            </li>
          )}
          {form.website && (
            <li className="flex items-center gap-2 truncate">
              <Globe size={13} className="shrink-0 text-akno-subtle" />
              {form.website.replace(/^https?:\/\//, "")}
            </li>
          )}
          {form.siret && (
            <li className="flex items-center gap-2 truncate">
              <Building2 size={13} className="shrink-0 text-akno-subtle" />
              SIRET {form.siret}
            </li>
          )}
        </ul>

        {(mrr || revenue) && (
          <div className="grid grid-cols-2 gap-2 border-t border-akno-border pt-3">
            {mrr && (
              <div className="rounded-lg bg-akno-primary-soft px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-akno-subtle">
                  MRR
                </p>
                <p className="text-sm font-bold text-akno-primary">{mrr}/mois</p>
              </div>
            )}
            {revenue && (
              <div className="rounded-lg bg-akno-bg px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-akno-subtle">
                  CA estimé
                </p>
                <p className="text-sm font-bold text-akno-text">{revenue}</p>
              </div>
            )}
          </div>
        )}

        {form.notes && !compact && (
          <div className="rounded-lg bg-akno-bg px-3 py-2">
            <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-akno-subtle">
              <User size={11} />
              Notes internes
            </p>
            <p className="line-clamp-3 text-xs leading-relaxed text-akno-muted">{form.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
