"use client";

import { ExternalLink, Mail, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ProspectFollowUpIndicator } from "@/components/prospects/prospect-follow-up-indicator";
import { websiteHost } from "@/components/prospects/prospects-utils";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { NeuCard } from "@/components/ui/neu-card";
import {
  NeuButton,
  NeuFieldGroup,
  NeuInput,
  NeuLabel,
  NeuSelect,
  NeuTextarea,
} from "@/components/ui/neu-form";
import {
  assignProspectBoard,
  boardConfig,
  bumpProspectMail,
  contactStepOptions,
  followUpGraceDays,
  getProspectFollowUp,
  getWebsiteScoreLabel,
  normalizeWebsite,
  prospectBoards,
  updateProspect,
  type ContactStep,
  type Prospect,
  type ProspectBoard,
  type ProspectOutcome,
  type ProspectSeverity,
} from "@/lib/prospects";
import { severityConfig } from "@/lib/prospect-severity";
import { cn } from "@/lib/utils";

type EditProspectModalProps = {
  open: boolean;
  prospect: Prospect | null;
  onClose: () => void;
  onSave: (prospect: Prospect) => void;
  onDelete?: (id: number) => void;
};

type FormState = {
  board: ProspectBoard;
  firstName: string;
  lastName: string;
  company: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  trade: string;
  sector: string;
  contactStep: ContactStep;
  outcome: ProspectOutcome;
  notes: string;
  googleRating: string;
  googleReviewCount: string;
  websiteScore: string;
  websiteIssues: string;
  severity: ProspectSeverity | "";
  severityNote: string;
};

function contactStepFromProspect(prospect: Prospect): ContactStep {
  const match = contactStepOptions.find(
    (option) =>
      option.mailsSent === prospect.mailsSent && option.callsMade === prospect.callsMade,
  );
  return match?.value ?? "none";
}

function buildForm(prospect: Prospect): FormState {
  return {
    board: prospect.board,
    firstName: prospect.firstName,
    lastName: prospect.lastName,
    company: prospect.company,
    website: prospect.website ?? "",
    email: prospect.email,
    phone: prospect.phone,
    address: prospect.address ?? "",
    city: prospect.city ?? "",
    trade: prospect.trade ?? "",
    sector: prospect.sector,
    contactStep: contactStepFromProspect(prospect),
    outcome: prospect.outcome,
    notes: prospect.notes ?? "",
    googleRating: prospect.googleRating?.toString() ?? "",
    googleReviewCount: prospect.googleReviewCount?.toString() ?? "",
    websiteScore: prospect.websiteScore?.toString() ?? "",
    websiteIssues: prospect.websiteIssues?.join("\n") ?? "",
    severity: prospect.severity ?? "",
    severityNote: prospect.severityNote ?? "",
  };
}

export function EditProspectModal({
  open,
  prospect,
  onClose,
  onSave,
  onDelete,
}: EditProspectModalProps) {
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !prospect) return;
    setForm(buildForm(prospect));
    setError(null);
  }, [open, prospect]);

  if (!prospect || !form) return null;

  function patch(patch: Partial<FormState>) {
    setForm((current) => (current ? { ...current, ...patch } : current));
    setError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!prospect || !form) return;
    if (!form.company.trim()) {
      setError("Le nom de l'entreprise est obligatoire.");
      return;
    }

    const step = contactStepOptions.find((option) => option.value === form.contactStep);
    const contacted = (step?.mailsSent ?? 0) > 0 || (step?.callsMade ?? 0) > 0;
    const today = new Date().toISOString().slice(0, 10);
    const stepChanged =
      (step?.mailsSent ?? 0) !== prospect.mailsSent ||
      (step?.callsMade ?? 0) !== prospect.callsMade;

    let next = updateProspect(prospect, {
      board: form.board,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      company: form.company.trim(),
      website: form.website ? normalizeWebsite(form.website) : undefined,
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      trade: form.trade.trim() || undefined,
      sector: form.sector.trim() || form.trade.trim(),
      outcome: form.outcome,
      mailsSent: step?.mailsSent ?? 0,
      callsMade: step?.callsMade ?? 0,
      lastContact: contacted ? (stepChanged ? today : prospect.lastContact ?? today) : undefined,
      notes: form.notes.trim() || undefined,
      googleRating: form.googleRating ? Number(form.googleRating) : undefined,
      googleReviewCount: form.googleReviewCount ? Number(form.googleReviewCount) : undefined,
      websiteScore: form.websiteScore ? Number(form.websiteScore) : undefined,
      websiteIssues: form.websiteIssues
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      severity: form.severity || undefined,
      severityNote: form.severityNote.trim() || undefined,
    });

    next = assignProspectBoard(next, form.board);
    onSave(next);
    onClose();
  }

  const followUp = getProspectFollowUp(prospect);

  function handleMailSent() {
    if (!prospect) return;
    const updated = bumpProspectMail(prospect);
    onSave(updated);
    setForm(buildForm(updated));
  }

  function handleMarkFailure() {
    if (!prospect) return;
    const today = new Date().toISOString().slice(0, 10);
    const updated = updateProspect(prospect, { outcome: "perdu", lastContact: today });
    onSave(updated);
    onClose();
  }

  return (
    <ModalOverlay open={open} onClose={onClose} panelClassName="max-w-2xl">
      <NeuCard className="max-h-[90vh] overflow-y-auto p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-neu-text">Modifier le prospect</h2>
            <p className="mt-1 text-sm text-neu-muted">
              Toutes les infos IA + bascule vers Keryan ou Louise.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="neu-flat flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neu-muted"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neu-text/8 bg-neu-text/[0.02] p-4">
          <ProspectFollowUpIndicator prospect={prospect} showLabel />
          <p className="text-xs text-neu-muted">{followUp.hint}</p>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {form.website ? (
            <a
              href={normalizeWebsite(form.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="neu-btn inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-neu-accent-2"
            >
              <ExternalLink size={14} />
              {websiteHost(form.website)}
            </a>
          ) : null}
          {prospect.mailsSent < 3 && prospect.outcome === "en-cours" && (
            <NeuButton type="button" variant="secondary" className="gap-2 text-xs" onClick={handleMailSent}>
              <Mail size={14} />
              Mail {prospect.mailsSent + 1} envoyé → vert
            </NeuButton>
          )}
          {followUp.suggestFailure && (
            <NeuButton type="button" variant="secondary" className="text-xs text-red-600" onClick={handleMarkFailure}>
              Passer en échec
            </NeuButton>
          )}
        </div>

        <p className="mb-4 text-[11px] text-neu-muted">
          Relances auto : J+{followUpGraceDays[1]} après le 1er mail · J+{followUpGraceDays[2]} après le 2e · J+
          {followUpGraceDays[3]} après le 3e, puis échec.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <NeuFieldGroup>
            <NeuLabel required>Assigner à</NeuLabel>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {prospectBoards.map((board) => {
                const config = boardConfig[board];
                const selected = form.board === board;
                return (
                  <button
                    key={board}
                    type="button"
                    onClick={() => patch({ board })}
                    className={cn(
                      "rounded-2xl border-2 p-3 text-left transition-all",
                      selected
                        ? board === "ia"
                          ? "border-violet-500 bg-violet-50"
                          : "border-neu-accent-2 bg-neu-accent-2/10"
                        : "neu-cell border-transparent",
                    )}
                  >
                    <p className="text-sm font-bold text-neu-text">{config.label}</p>
                    <p className="mt-0.5 text-[11px] text-neu-muted">{config.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </NeuFieldGroup>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NeuFieldGroup>
              <NeuLabel>Prénom contact</NeuLabel>
              <NeuInput
                value={form.firstName}
                onChange={(e) => patch({ firstName: e.target.value })}
                placeholder="Jean"
              />
            </NeuFieldGroup>
            <NeuFieldGroup>
              <NeuLabel>Nom contact</NeuLabel>
              <NeuInput
                value={form.lastName}
                onChange={(e) => patch({ lastName: e.target.value })}
                placeholder="Dupont"
              />
            </NeuFieldGroup>
          </div>

          <NeuFieldGroup>
            <NeuLabel required>Entreprise</NeuLabel>
            <NeuInput
              value={form.company}
              onChange={(e) => patch({ company: e.target.value })}
            />
          </NeuFieldGroup>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NeuFieldGroup>
              <NeuLabel>Email</NeuLabel>
              <NeuInput
                type="email"
                value={form.email}
                onChange={(e) => patch({ email: e.target.value })}
              />
            </NeuFieldGroup>
            <NeuFieldGroup>
              <NeuLabel>Téléphone</NeuLabel>
              <NeuInput
                value={form.phone}
                onChange={(e) => patch({ phone: e.target.value })}
              />
            </NeuFieldGroup>
          </div>

          <NeuFieldGroup>
            <NeuLabel>Site web</NeuLabel>
            <NeuInput
              value={form.website}
              onChange={(e) => patch({ website: e.target.value })}
              placeholder="https://"
            />
          </NeuFieldGroup>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NeuFieldGroup>
              <NeuLabel>Adresse</NeuLabel>
              <NeuInput
                value={form.address}
                onChange={(e) => patch({ address: e.target.value })}
              />
            </NeuFieldGroup>
            <NeuFieldGroup>
              <NeuLabel>Ville</NeuLabel>
              <NeuInput value={form.city} onChange={(e) => patch({ city: e.target.value })} />
            </NeuFieldGroup>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <NeuFieldGroup>
              <NeuLabel>Métier / secteur</NeuLabel>
              <NeuInput
                value={form.trade || form.sector}
                onChange={(e) => patch({ trade: e.target.value, sector: e.target.value })}
              />
            </NeuFieldGroup>
            <NeuFieldGroup>
              <NeuLabel>Note Google</NeuLabel>
              <NeuInput
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={form.googleRating}
                onChange={(e) => patch({ googleRating: e.target.value })}
              />
            </NeuFieldGroup>
            <NeuFieldGroup>
              <NeuLabel>Avis Google</NeuLabel>
              <NeuInput
                type="number"
                min={0}
                value={form.googleReviewCount}
                onChange={(e) => patch({ googleReviewCount: e.target.value })}
              />
            </NeuFieldGroup>
          </div>

          <div className="rounded-2xl border border-neu-text/8 bg-neu-text/[0.02] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-neu-muted">
              Audit site web
            </p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NeuFieldGroup>
                <NeuLabel>Score /100</NeuLabel>
                <NeuInput
                  type="number"
                  min={0}
                  max={100}
                  value={form.websiteScore}
                  onChange={(e) => patch({ websiteScore: e.target.value })}
                />
                <p className="mt-1 text-[11px] text-neu-muted">
                  {getWebsiteScoreLabel(form.websiteScore ? Number(form.websiteScore) : undefined)}
                </p>
              </NeuFieldGroup>
              <NeuFieldGroup className="sm:col-span-1">
                <NeuLabel>Problèmes détectés</NeuLabel>
                <NeuTextarea
                  rows={3}
                  value={form.websiteIssues}
                  onChange={(e) => patch({ websiteIssues: e.target.value })}
                  placeholder={"Pas de HTTPS\nSite Wix\nPas mobile"}
                />
              </NeuFieldGroup>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NeuFieldGroup>
                <NeuLabel>Gravité image web</NeuLabel>
                <NeuSelect
                  value={form.severity}
                  onChange={(e) =>
                    patch({ severity: e.target.value as ProspectSeverity | "" })
                  }
                >
                  <option value="">—</option>
                  {(Object.keys(severityConfig) as ProspectSeverity[]).map((key) => (
                    <option key={key} value={key}>
                      {severityConfig[key].shortLabel}
                    </option>
                  ))}
                </NeuSelect>
              </NeuFieldGroup>
              <NeuFieldGroup className="sm:col-span-2">
                <NeuLabel>Note IA (gravité)</NeuLabel>
                <NeuTextarea
                  rows={2}
                  value={form.severityNote}
                  onChange={(e) => patch({ severityNote: e.target.value })}
                  placeholder="Ex. Site Wix daté, pas de devis en ligne — refonte vitrine recommandée."
                />
              </NeuFieldGroup>
            </div>
            {prospect.iaSearchLabel && (
              <p className="mt-3 text-[11px] text-neu-muted">
                Recherche IA : {prospect.iaSearchLabel}
                {prospect.iaImportedAt ? ` · importé le ${prospect.iaImportedAt}` : ""}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NeuFieldGroup>
              <NeuLabel>Étape de contact</NeuLabel>
              <NeuSelect
                value={form.contactStep}
                onChange={(e) => patch({ contactStep: e.target.value as ContactStep })}
              >
                {contactStepOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NeuSelect>
            </NeuFieldGroup>
            <NeuFieldGroup>
              <NeuLabel>Statut</NeuLabel>
              <NeuSelect
                value={form.outcome}
                onChange={(e) => patch({ outcome: e.target.value as ProspectOutcome })}
              >
                <option value="en-cours">En cours</option>
                <option value="gagne">Gagné</option>
                <option value="perdu">Perdu</option>
              </NeuSelect>
            </NeuFieldGroup>
          </div>

          <NeuFieldGroup>
            <NeuLabel>Notes</NeuLabel>
            <NeuTextarea
              rows={3}
              value={form.notes}
              onChange={(e) => patch({ notes: e.target.value })}
            />
          </NeuFieldGroup>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-neu-text/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
            {onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Supprimer ce prospect ?")) {
                    onDelete(prospect.id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-600"
              >
                <Trash2 size={15} />
                Supprimer
              </button>
            ) : (
              <span />
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <NeuButton type="button" variant="secondary" onClick={onClose}>
                Annuler
              </NeuButton>
              <NeuButton type="submit" variant="primary">
                Enregistrer
              </NeuButton>
            </div>
          </div>
        </form>
      </NeuCard>
    </ModalOverlay>
  );
}
