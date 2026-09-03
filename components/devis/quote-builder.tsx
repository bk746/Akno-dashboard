"use client";

import {
  Building2,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Layers,
  Percent,
  Plus,
  Repeat,
  ScrollText,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { QuotePdfPanel } from "@/components/devis/quote-pdf-panel";
import { useStoredList } from "@/hooks/use-persistence";
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
import { CLIENTS_STORAGE_KEY, loadStoredClients, type Client } from "@/lib/clients";
import { formatMoney } from "@/lib/finances";
import {
  addDaysToDate,
  applyDraftToQuote,
  applyQuoteTemplate,
  buildQuoteDraft,
  createEmptyLineItem,
  createEmptySection,
  createQuoteFromDraft,
  defaultDeliveryDelay,
  defaultDepositPercent,
  defaultPaymentTerms,
  defaultQuoteIntroduction,
  defaultQuoteNotes,
  defaultQuoteSubscriptionLabel,
  defaultTvaRate,
  generateQuoteNumber,
  getQuoteAmounts,
  getQuoteSections,
  getSectionSubtotal,
  getSubscriptionMonthlyTTC,
  legalMentions,
  lineTotal,
  quoteTemplates,
  quoteUnitLabels,
  type Quote,
  type QuoteBuilderInput,
  type QuoteClientType,
  type QuoteDiscount,
  type QuoteLineItem,
  type QuoteSection,
  type QuoteStatus,
  type QuoteTemplateId,
  type QuoteUnit,
} from "@/lib/quotes";
import { cn } from "@/lib/utils";

type QuoteBuilderProps = {
  existingQuotes: Quote[];
  /** Devis à modifier — si absent, création */
  initialQuote?: Quote;
  onSave: (quote: Quote) => void;
  onCancel: () => void;
};

type FormState = {
  clientId: string;
  clientType: QuoteClientType;
  clientCompany: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientSiret: string;
  clientTva: string;
  title: string;
  object: string;
  introduction: string;
  sections: QuoteSection[];
  discountEnabled: boolean;
  discountType: QuoteDiscount["type"];
  discountValue: number;
  discountLabel: string;
  depositPercent: number;
  date: string;
  validityDays: number;
  tvaRate: number;
  deliveryDelay: string;
  paymentTerms: string;
  notes: string;
  internalNotes: string;
  subscriptionEnabled: boolean;
  subscriptionLabel: string;
  subscriptionMonthlyPriceHT: number;
  subscriptionCommitmentMonths: number;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

function daysBetween(from: string, to: string) {
  const diff =
    (new Date(`${to}T12:00:00`).getTime() - new Date(`${from}T12:00:00`).getTime()) /
    86_400_000;
  return Math.max(1, Math.round(diff));
}

function buildInitialForm(quote?: Quote): FormState {
  if (!quote) {
    return {
      clientId: "",
      clientType: "professional",
      clientCompany: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      clientSiret: "",
      clientTva: "",
      title: "",
      object: "",
      introduction: defaultQuoteIntroduction,
      sections: [createEmptySection({ title: "Prestations" })],
      discountEnabled: false,
      discountType: "percent",
      discountValue: 0,
      discountLabel: "",
      depositPercent: defaultDepositPercent,
      date: todayIso(),
      validityDays: 30,
      tvaRate: defaultTvaRate,
      deliveryDelay: defaultDeliveryDelay,
      paymentTerms: defaultPaymentTerms,
      notes: defaultQuoteNotes,
      internalNotes: "",
      subscriptionEnabled: false,
      subscriptionLabel: defaultQuoteSubscriptionLabel,
      subscriptionMonthlyPriceHT: 0,
      subscriptionCommitmentMonths: 12,
    };
  }

  return {
    clientId: quote.clientId ? String(quote.clientId) : "",
    clientType: quote.clientType,
    clientCompany: quote.client.company,
    clientName: quote.client.name,
    clientEmail: quote.client.email,
    clientPhone: quote.client.phone ?? "",
    clientAddress: quote.client.address,
    clientSiret: quote.client.siret ?? "",
    clientTva: quote.client.tvaNumber ?? "",
    title: quote.title ?? "",
    object: quote.object,
    introduction: quote.introduction ?? "",
    sections: getQuoteSections(quote).map((s) => ({
      ...s,
      items: s.items.map((item) => ({ ...item, details: item.details ?? "" })),
    })),
    discountEnabled: Boolean(quote.discount && quote.discount.value > 0),
    discountType: quote.discount?.type ?? "percent",
    discountValue: quote.discount?.value ?? 0,
    discountLabel: quote.discount?.label ?? "",
    depositPercent: quote.depositPercent ?? defaultDepositPercent,
    date: quote.date,
    validityDays: daysBetween(quote.date, quote.validUntil),
    tvaRate: quote.tvaRate,
    deliveryDelay: quote.deliveryDelay,
    paymentTerms: quote.paymentTerms ?? defaultPaymentTerms,
    notes: quote.notes ?? "",
    internalNotes: quote.internalNotes ?? "",
    subscriptionEnabled: Boolean(quote.subscription?.enabled),
    subscriptionLabel: quote.subscription?.label ?? defaultQuoteSubscriptionLabel,
    subscriptionMonthlyPriceHT: quote.subscription?.monthlyPriceHT ?? 0,
    subscriptionCommitmentMonths: quote.subscription?.commitmentMonths ?? 12,
  };
}

function toBuilderInput(form: FormState): QuoteBuilderInput {
  return {
    clientId: form.clientId ? Number(form.clientId) : undefined,
    client: {
      name: form.clientName,
      company: form.clientCompany,
      email: form.clientEmail,
      address: form.clientAddress,
      phone: form.clientPhone,
      siret: form.clientSiret,
      tvaNumber: form.clientTva,
    },
    clientType: form.clientType,
    title: form.title,
    object: form.object,
    introduction: form.introduction,
    sections: form.sections,
    discount: form.discountEnabled
      ? { type: form.discountType, value: form.discountValue, label: form.discountLabel }
      : undefined,
    depositPercent: form.depositPercent,
    date: form.date,
    validityDays: form.validityDays,
    tvaRate: form.tvaRate,
    deliveryDelay: form.deliveryDelay,
    paymentTerms: form.paymentTerms,
    notes: form.notes,
    internalNotes: form.internalNotes,
    subscription: form.subscriptionEnabled
      ? {
          enabled: true,
          label: form.subscriptionLabel,
          monthlyPriceHT: form.subscriptionMonthlyPriceHT,
          commitmentMonths: form.subscriptionCommitmentMonths,
        }
      : undefined,
  };
}

function SectionCard({
  icon,
  step,
  title,
  description,
  children,
  aside,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <NeuCard className="p-0">
      <div className="flex items-start justify-between gap-3 border-b border-neu-text/5 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="neu-inset-sm flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neu-accent-2">
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neu-muted">
              Étape {step}
            </p>
            <h2 className="text-sm font-bold text-neu-text">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-neu-muted">{description}</p>}
          </div>
        </div>
        {aside}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </NeuCard>
  );
}

const numberInputClass =
  "neu-inset-sm w-full rounded-xl bg-transparent px-2.5 py-2 text-right text-sm text-neu-text outline-none focus:ring-2 focus:ring-neu-accent-2/30";

export function QuoteBuilder({
  existingQuotes,
  initialQuote,
  onSave,
  onCancel,
}: QuoteBuilderProps) {
  const isEdit = Boolean(initialQuote);
  const [form, setForm] = useState<FormState>(() => buildInitialForm(initialQuote));
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const clientList = useStoredList<Client>(CLIENTS_STORAGE_KEY, loadStoredClients);
  const [showInternal, setShowInternal] = useState(Boolean(initialQuote?.internalNotes));

  const builderInput = useMemo(() => toBuilderInput(form), [form]);

  const amounts = useMemo(
    () =>
      getQuoteAmounts({
        sections: form.sections,
        items: [],
        tvaRate: form.tvaRate,
        discount: builderInput.discount,
        depositPercent: form.depositPercent,
      }),
    [form.sections, form.tvaRate, form.depositPercent, builderInput.discount],
  );

  const subscriptionTTC = getSubscriptionMonthlyTTC(builderInput.subscription, form.tvaRate);
  const includedCount = form.sections.reduce(
    (sum, s) => sum + s.items.filter((i) => !i.optional && i.description.trim() && i.unitPrice > 0).length,
    0,
  );
  const optionalCount = form.sections.reduce(
    (sum, s) => sum + s.items.filter((i) => i.optional && i.description.trim() && i.unitPrice > 0).length,
    0,
  );
  const hasClient = Boolean(form.clientCompany.trim() || form.clientName.trim());

  const previewQuote = useMemo(() => {
    const validation = buildQuoteDraft(builderInput);
    const number = initialQuote?.number ?? generateQuoteNumber(existingQuotes);

    if (validation.ok) {
      return { ...validation.draft, number, status: "brouillon" as QuoteStatus };
    }

    return {
      ...builderInput,
      client: builderInput.client,
      items: [],
      status: "brouillon" as QuoteStatus,
      validUntil: addDaysToDate(form.date, form.validityDays),
      object: form.object.trim() || form.title.trim() || "Devis",
      number,
    };
  }, [builderInput, existingQuotes, initialQuote?.number, form.date, form.validityDays, form.object, form.title]);

  function patchForm(patch: Partial<FormState>) {
    setForm((current) => ({ ...current, ...patch }));
    setError(null);
  }

  function handleClientSelect(clientId: string) {
    const client = clientList.find((c) => String(c.id) === clientId);
    if (!client) {
      patchForm({ clientId: "" });
      return;
    }
    const address = [
      client.address,
      [client.postalCode, client.city].filter(Boolean).join(" "),
      client.country && client.country !== "France" ? client.country : "",
    ]
      .filter(Boolean)
      .join("\n");

    patchForm({
      clientId,
      clientName: client.name,
      clientCompany: client.company,
      clientEmail: client.email,
      clientPhone: client.phone ?? "",
      clientAddress: address,
      clientSiret: client.siret ?? "",
      ...(client.monthlySubscription && client.monthlySubscription > 0
        ? {
            subscriptionEnabled: true,
            subscriptionMonthlyPriceHT: client.monthlySubscription,
          }
        : {}),
    });
  }

  /* ── Sections & lignes ── */

  function patchSection(sectionId: string, patch: Partial<QuoteSection>) {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)),
    }));
    setError(null);
  }

  function addSection() {
    setForm((current) => ({
      ...current,
      sections: [...current.sections, createEmptySection()],
    }));
  }

  function removeSection(sectionId: string) {
    setForm((current) => {
      if (current.sections.length <= 1) {
        return { ...current, sections: [createEmptySection({ title: "Prestations" })] };
      }
      return { ...current, sections: current.sections.filter((s) => s.id !== sectionId) };
    });
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    setForm((current) => {
      const index = current.sections.findIndex((s) => s.id === sectionId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.sections.length) return current;
      const next = [...current.sections];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...current, sections: next };
    });
  }

  function updateLine(sectionId: string, lineId: string, patch: Partial<QuoteLineItem>) {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, items: s.items.map((item) => (item.id === lineId ? { ...item, ...patch } : item)) },
      ),
    }));
    setError(null);
  }

  function addLine(sectionId: string, optional = false) {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((s) =>
        s.id !== sectionId ? s : { ...s, items: [...s.items, createEmptyLineItem({ optional })] },
      ),
    }));
  }

  function removeLine(sectionId: string, lineId: string) {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const items = s.items.filter((item) => item.id !== lineId);
        return { ...s, items: items.length > 0 ? items : [createEmptyLineItem()] };
      }),
    }));
  }

  function applyTemplate(templateId: QuoteTemplateId) {
    const hasContent = form.sections.some((s) =>
      s.items.some((i) => i.description.trim() || i.unitPrice > 0),
    );
    if (
      hasContent &&
      !window.confirm("Remplacer les prestations actuelles par celles du modèle ?")
    ) {
      return;
    }
    const template = applyQuoteTemplate(templateId);
    patchForm({
      title: template.title,
      object: template.object,
      introduction: template.introduction,
      deliveryDelay: template.deliveryDelay,
      sections: template.sections,
      ...(template.subscription
        ? {
            subscriptionEnabled: true,
            subscriptionLabel: template.subscription.label,
            subscriptionMonthlyPriceHT: template.subscription.monthlyPriceHT,
            subscriptionCommitmentMonths: template.subscription.commitmentMonths ?? 12,
          }
        : {}),
    });
  }

  function handleSave(status: QuoteStatus) {
    const validation = buildQuoteDraft(builderInput);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    const draft = { ...validation.draft, status };
    if (initialQuote) {
      onSave(applyDraftToQuote(initialQuote, draft));
    } else {
      onSave(createQuoteFromDraft(existingQuotes, draft));
    }
  }

  const primaryStatus: QuoteStatus =
    initialQuote && initialQuote.status !== "brouillon" && initialQuote.status !== "expire"
      ? initialQuote.status
      : "envoye";

  const primaryLabel = isEdit
    ? primaryStatus === "envoye"
      ? "Enregistrer & marquer envoyé"
      : "Enregistrer les modifications"
    : "Créer le devis";

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        {/* ────────── Colonne formulaire ────────── */}
        <div className="space-y-5">
          {/* Modèles */}
          <NeuCard className="p-5">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-neu-accent-2" />
              <p className="text-xs font-bold uppercase tracking-wider text-neu-muted">
                Partir d&apos;un modèle agence
              </p>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {(Object.keys(quoteTemplates) as QuoteTemplateId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => applyTemplate(id)}
                  className="neu-btn flex flex-col items-start rounded-2xl px-4 py-3 text-left transition-colors hover:text-neu-accent-2"
                >
                  <span className="text-sm font-semibold text-neu-text">
                    {quoteTemplates[id].label}
                  </span>
                  <span className="mt-0.5 text-[11px] text-neu-muted">{quoteTemplates[id].hint}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-neu-muted">
              Chaque modèle pré-remplit le titre, l&apos;introduction, les phases chiffrées et
              l&apos;abonnement. Vous ajustez ensuite chaque prix librement.
            </p>
          </NeuCard>

          {/* Client */}
          <SectionCard
            icon={<Building2 size={16} />}
            step="1"
            title="Client"
            description="Les coordonnées apparaissent dans le bloc « Pour » du devis."
            aside={
              <div className="neu-inset flex rounded-full p-1 text-[11px] font-semibold">
                {(["professional", "consumer"] as QuoteClientType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => patchForm({ clientType: type })}
                    className={cn(
                      "rounded-full px-3 py-1.5 transition-colors",
                      form.clientType === type
                        ? "bg-neu-accent-2 text-white"
                        : "text-neu-muted hover:text-neu-text",
                    )}
                  >
                    {type === "professional" ? "Pro" : "Particulier"}
                  </button>
                ))}
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <NeuFieldGroup className="md:col-span-4">
                <NeuLabel>Client existant</NeuLabel>
                <NeuSelect value={form.clientId} onChange={(e) => handleClientSelect(e.target.value)}>
                  <option value="">Nouveau client…</option>
                  {clientList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company || c.name}
                    </option>
                  ))}
                </NeuSelect>
              </NeuFieldGroup>
              <NeuFieldGroup className="md:col-span-4">
                <NeuLabel required>{form.clientType === "professional" ? "Entreprise" : "Nom complet"}</NeuLabel>
                <NeuInput
                  value={form.clientCompany}
                  onChange={(e) => patchForm({ clientCompany: e.target.value })}
                  placeholder={form.clientType === "professional" ? "Dupont Électricité" : "Jean Dupont"}
                />
              </NeuFieldGroup>
              <NeuFieldGroup className="md:col-span-4">
                <NeuLabel>{form.clientType === "professional" ? "Contact" : "Contact (optionnel)"}</NeuLabel>
                <NeuInput
                  value={form.clientName}
                  onChange={(e) => patchForm({ clientName: e.target.value })}
                  placeholder="Jean Dupont"
                />
              </NeuFieldGroup>
              <NeuFieldGroup className="md:col-span-4">
                <NeuLabel>Email</NeuLabel>
                <NeuInput
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => patchForm({ clientEmail: e.target.value })}
                  placeholder="contact@entreprise.fr"
                />
              </NeuFieldGroup>
              <NeuFieldGroup className="md:col-span-3">
                <NeuLabel>Téléphone</NeuLabel>
                <NeuInput
                  value={form.clientPhone}
                  onChange={(e) => patchForm({ clientPhone: e.target.value })}
                  placeholder="06 12 34 56 78"
                />
              </NeuFieldGroup>
              <NeuFieldGroup className="md:col-span-5">
                <NeuLabel>Adresse</NeuLabel>
                <NeuTextarea
                  rows={2}
                  value={form.clientAddress}
                  onChange={(e) => patchForm({ clientAddress: e.target.value })}
                  placeholder={"12 rue des Artisans\n69002 Lyon"}
                />
              </NeuFieldGroup>
              {form.clientType === "professional" && (
                <>
                  <NeuFieldGroup className="md:col-span-6">
                    <NeuLabel>SIRET</NeuLabel>
                    <NeuInput
                      value={form.clientSiret}
                      onChange={(e) => patchForm({ clientSiret: e.target.value })}
                      placeholder="123 456 789 00012"
                    />
                  </NeuFieldGroup>
                  <NeuFieldGroup className="md:col-span-6">
                    <NeuLabel>N° TVA intracommunautaire</NeuLabel>
                    <NeuInput
                      value={form.clientTva}
                      onChange={(e) => patchForm({ clientTva: e.target.value })}
                      placeholder="FR 12 345678900"
                    />
                  </NeuFieldGroup>
                </>
              )}
            </div>
          </SectionCard>

          {/* Projet */}
          <SectionCard
            icon={<FileText size={16} />}
            step="2"
            title="Projet"
            description="Titre, résumé et contexte — c'est la première chose que lit votre client."
          >
            <NeuFieldGroup>
              <NeuLabel>Titre du projet</NeuLabel>
              <NeuInput
                value={form.title}
                onChange={(e) => patchForm({ title: e.target.value })}
                placeholder="Ex. Création du site vitrine de Dupont Électricité"
              />
            </NeuFieldGroup>
            <NeuFieldGroup>
              <NeuLabel>Objet (résumé en une phrase)</NeuLabel>
              <NeuTextarea
                rows={2}
                value={form.object}
                onChange={(e) => patchForm({ object: e.target.value })}
                placeholder="Conception, design, développement et mise en ligne d'un site vitrine…"
              />
            </NeuFieldGroup>
            <NeuFieldGroup>
              <div className="flex items-center justify-between">
                <NeuLabel>Contexte & objectifs</NeuLabel>
                <button
                  type="button"
                  onClick={() => patchForm({ introduction: defaultQuoteIntroduction })}
                  className="mb-2 text-[11px] font-semibold text-neu-accent-2 hover:underline"
                >
                  Texte par défaut
                </button>
              </div>
              <NeuTextarea
                rows={4}
                value={form.introduction}
                onChange={(e) => patchForm({ introduction: e.target.value })}
                placeholder="Suite à nos échanges, vous trouverez ci-dessous notre proposition…"
              />
            </NeuFieldGroup>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <NeuFieldGroup>
                <NeuLabel>Date d&apos;émission</NeuLabel>
                <NeuInput type="date" value={form.date} onChange={(e) => patchForm({ date: e.target.value })} />
              </NeuFieldGroup>
              <NeuFieldGroup>
                <NeuLabel>Validité</NeuLabel>
                <NeuSelect
                  value={form.validityDays}
                  onChange={(e) => patchForm({ validityDays: Number(e.target.value) })}
                >
                  <option value={15}>15 jours</option>
                  <option value={30}>30 jours</option>
                  <option value={45}>45 jours</option>
                  <option value={60}>60 jours</option>
                  <option value={90}>90 jours</option>
                </NeuSelect>
              </NeuFieldGroup>
              <NeuFieldGroup className="col-span-2 sm:col-span-1">
                <NeuLabel>Expire le</NeuLabel>
                <div className="neu-inset flex h-[46px] items-center rounded-[1.25rem] px-4 text-sm text-neu-muted">
                  {addDaysToDate(form.date, form.validityDays)}
                </div>
              </NeuFieldGroup>
            </div>
          </SectionCard>

          {/* Prestations */}
          <SectionCard
            icon={<Layers size={16} />}
            step="3"
            title="Prestations & prix"
            description="Organisez par phases ou lots. Cochez « Option » pour proposer sans inclure au total."
            aside={
              <button
                type="button"
                onClick={addSection}
                className="neu-btn flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-neu-text/80 hover:text-neu-accent-2"
              >
                <Plus size={14} />
                Phase / lot
              </button>
            }
          >
            {form.sections.map((section, sectionIndex) => (
              <div
                key={section.id}
                className="rounded-2xl border border-neu-text/8 bg-neu-text/[0.015]"
              >
                <div className="flex flex-col gap-2 border-b border-neu-text/5 p-3 sm:flex-row sm:items-center">
                  <span className="hidden font-mono text-xs font-bold text-neu-accent-2 sm:block">
                    {String(sectionIndex + 1).padStart(2, "0")}
                  </span>
                  <input
                    value={section.title}
                    onChange={(e) => patchSection(section.id, { title: e.target.value })}
                    placeholder={`Titre de la phase ${sectionIndex + 1} (ex. Design UI/UX)`}
                    className="min-w-0 flex-1 rounded-xl bg-transparent px-2 py-1.5 text-sm font-bold text-neu-text outline-none placeholder:font-medium placeholder:text-neu-muted/60 focus:bg-white/60"
                  />
                  <input
                    value={section.description ?? ""}
                    onChange={(e) => patchSection(section.id, { description: e.target.value })}
                    placeholder="Sous-titre / objectif de la phase (optionnel)"
                    className="min-w-0 flex-[1.4] rounded-xl bg-transparent px-2 py-1.5 text-xs text-neu-text outline-none placeholder:text-neu-muted/60 focus:bg-white/60"
                  />
                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => moveSection(section.id, -1)}
                      disabled={sectionIndex === 0}
                      className="neu-flat flex h-7 w-7 items-center justify-center rounded-lg text-neu-muted disabled:opacity-30"
                      aria-label="Monter"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(section.id, 1)}
                      disabled={sectionIndex === form.sections.length - 1}
                      className="neu-flat flex h-7 w-7 items-center justify-center rounded-lg text-neu-muted disabled:opacity-30"
                      aria-label="Descendre"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="neu-flat flex h-7 w-7 items-center justify-center rounded-lg text-neu-muted hover:text-red-500"
                      aria-label="Supprimer la phase"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-neu-text/5">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "grid grid-cols-12 gap-2 p-3",
                        item.optional && "bg-amber-50/40",
                      )}
                    >
                      <div className="col-span-12 space-y-1.5 lg:col-span-6">
                        <input
                          value={item.description}
                          onChange={(e) => updateLine(section.id, item.id, { description: e.target.value })}
                          placeholder="Désignation de la prestation"
                          className="w-full rounded-xl bg-white/70 px-3 py-2 text-sm font-medium text-neu-text outline-none placeholder:text-neu-muted/60 focus:ring-2 focus:ring-neu-accent-2/30"
                        />
                        <textarea
                          rows={1}
                          value={item.details ?? ""}
                          onChange={(e) => updateLine(section.id, item.id, { details: e.target.value })}
                          placeholder="Détails / livrables (optionnel) — s'affiche sous la désignation"
                          className="w-full resize-none rounded-xl bg-transparent px-3 py-1.5 text-xs text-neu-text outline-none placeholder:text-neu-muted/50 focus:bg-white/70"
                        />
                      </div>
                      <div className="col-span-4 lg:col-span-1">
                        <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wider text-neu-muted lg:hidden">
                          Qté
                        </label>
                        <input
                          type="number"
                          min={0.25}
                          step={0.25}
                          value={item.quantity}
                          onChange={(e) =>
                            updateLine(section.id, item.id, {
                              quantity: Math.max(0.25, Number(e.target.value) || 1),
                            })
                          }
                          className={numberInputClass}
                          aria-label="Quantité"
                        />
                      </div>
                      <div className="col-span-4 lg:col-span-2">
                        <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wider text-neu-muted lg:hidden">
                          Unité
                        </label>
                        <select
                          value={item.unit ?? "forfait"}
                          onChange={(e) => updateLine(section.id, item.id, { unit: e.target.value as QuoteUnit })}
                          className="neu-inset-sm w-full appearance-none rounded-xl bg-transparent px-2.5 py-2 text-sm text-neu-text outline-none"
                          aria-label="Unité"
                        >
                          {(Object.keys(quoteUnitLabels) as QuoteUnit[]).map((unit) => (
                            <option key={unit} value={unit}>
                              {quoteUnitLabels[unit]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-4 lg:col-span-2">
                        <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wider text-neu-muted lg:hidden">
                          Prix unitaire
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={10}
                          value={item.unitPrice || ""}
                          onChange={(e) =>
                            updateLine(section.id, item.id, {
                              unitPrice: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                          placeholder="0 €"
                          className={numberInputClass}
                          aria-label="Prix unitaire"
                        />
                      </div>
                      <div className="col-span-12 flex items-center justify-between gap-2 lg:col-span-1 lg:flex-col lg:items-end lg:justify-start">
                        <p className="text-sm font-bold text-neu-text lg:pt-2">{formatMoney(lineTotal(item))}</p>
                        <div className="flex items-center gap-2">
                          <label
                            className={cn(
                              "flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold",
                              item.optional
                                ? "bg-amber-100 text-amber-700"
                                : "text-neu-muted hover:text-neu-text",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(item.optional)}
                              onChange={(e) => updateLine(section.id, item.id, { optional: e.target.checked })}
                              className="h-3 w-3 accent-amber-500"
                            />
                            Option
                          </label>
                          <button
                            type="button"
                            onClick={() => removeLine(section.id, item.id)}
                            className="text-neu-muted hover:text-red-500"
                            aria-label="Supprimer la ligne"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neu-text/5 px-3 py-2.5">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => addLine(section.id)}
                      className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-neu-accent-2 hover:bg-neu-accent-2/10"
                    >
                      <Plus size={13} />
                      Ligne
                    </button>
                    <button
                      type="button"
                      onClick={() => addLine(section.id, true)}
                      className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-100/60"
                    >
                      <Plus size={13} />
                      Option
                    </button>
                  </div>
                  <p className="text-xs text-neu-muted">
                    Sous-total :{" "}
                    <span className="font-bold text-neu-text">{formatMoney(getSectionSubtotal(section))}</span>
                  </p>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addSection}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-neu-text/15 py-3 text-xs font-semibold text-neu-muted transition-colors hover:border-neu-accent-2/40 hover:text-neu-accent-2"
            >
              <Plus size={14} />
              Ajouter une phase / un lot
            </button>
          </SectionCard>

          {/* Remise & acompte */}
          <SectionCard
            icon={<Percent size={16} />}
            step="4"
            title="Remise & échéancier"
            description="Le devis affiche automatiquement acompte et solde."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-neu-text/8 p-4">
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <span className="text-sm font-bold text-neu-text">Remise commerciale</span>
                  <input
                    type="checkbox"
                    checked={form.discountEnabled}
                    onChange={(e) => patchForm({ discountEnabled: e.target.checked })}
                    className="h-4 w-4 accent-neu-accent-2"
                  />
                </label>
                {form.discountEnabled && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    <NeuSelect
                      className="col-span-2 px-3 py-2.5 text-xs"
                      value={form.discountType}
                      onChange={(e) => patchForm({ discountType: e.target.value as QuoteDiscount["type"] })}
                    >
                      <option value="percent">%</option>
                      <option value="amount">€</option>
                    </NeuSelect>
                    <NeuInput
                      className="col-span-3 px-3 py-2.5 text-right"
                      type="number"
                      min={0}
                      step={form.discountType === "percent" ? 1 : 10}
                      value={form.discountValue || ""}
                      onChange={(e) => patchForm({ discountValue: Math.max(0, Number(e.target.value) || 0) })}
                      placeholder={form.discountType === "percent" ? "10" : "200"}
                    />
                    <NeuInput
                      className="col-span-5 px-3 py-2.5 text-xs"
                      value={form.discountLabel}
                      onChange={(e) => patchForm({ discountLabel: e.target.value })}
                      placeholder="Motif (ex. offre de lancement)"
                    />
                    {amounts.discountAmount > 0 && (
                      <p className="col-span-5 text-xs text-emerald-600">
                        − {formatMoney(amounts.discountAmount)} sur le total
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-neu-text/8 p-4">
                <p className="text-sm font-bold text-neu-text">Acompte à la signature</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[30, 40, 50, 100].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => patchForm({ depositPercent: value })}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                        form.depositPercent === value
                          ? "bg-neu-accent-2 text-white"
                          : "neu-flat text-neu-muted hover:text-neu-text",
                      )}
                    >
                      {value === 100 ? "Comptant" : `${value} %`}
                    </button>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.depositPercent}
                      onChange={(e) =>
                        patchForm({ depositPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })
                      }
                      className="neu-inset-sm w-16 rounded-full bg-transparent px-2 py-1.5 text-center text-xs outline-none"
                      aria-label="Acompte personnalisé"
                    />
                    <span className="text-xs text-neu-muted">%</span>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-xs text-neu-muted">
                  <p>
                    Acompte : <span className="font-bold text-neu-text">{formatMoney(amounts.depositAmount)}</span>
                  </p>
                  {amounts.depositPercent < 100 && (
                    <p>
                      Solde ({100 - amounts.depositPercent} %) :{" "}
                      <span className="font-bold text-neu-text">{formatMoney(amounts.balanceAmount)}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Abonnement */}
          <SectionCard
            icon={<Repeat size={16} />}
            step="5"
            title="Abonnement mensuel"
            description="Maintenance, hébergement… facturé chaque mois en plus du projet."
            aside={
              <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-neu-muted">
                <input
                  type="checkbox"
                  checked={form.subscriptionEnabled}
                  onChange={(e) => patchForm({ subscriptionEnabled: e.target.checked })}
                  className="h-4 w-4 accent-neu-accent-2"
                />
                {form.subscriptionEnabled ? "Activé" : "Désactivé"}
              </label>
            }
          >
            {form.subscriptionEnabled ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                <NeuFieldGroup className="sm:col-span-12">
                  <NeuLabel>Libellé</NeuLabel>
                  <NeuInput
                    value={form.subscriptionLabel}
                    onChange={(e) => patchForm({ subscriptionLabel: e.target.value })}
                    placeholder={defaultQuoteSubscriptionLabel}
                  />
                </NeuFieldGroup>
                <NeuFieldGroup className="sm:col-span-6">
                  <NeuLabel>Prix mensuel (€)</NeuLabel>
                  <NeuInput
                    type="number"
                    min={0}
                    step={1}
                    value={form.subscriptionMonthlyPriceHT || ""}
                    onChange={(e) =>
                      patchForm({ subscriptionMonthlyPriceHT: Math.max(0, Number(e.target.value) || 0) })
                    }
                    placeholder="89"
                  />
                </NeuFieldGroup>
                <NeuFieldGroup className="sm:col-span-6">
                  <NeuLabel>Engagement</NeuLabel>
                  <NeuSelect
                    value={form.subscriptionCommitmentMonths}
                    onChange={(e) => patchForm({ subscriptionCommitmentMonths: Number(e.target.value) })}
                  >
                    <option value={0}>Sans engagement</option>
                    <option value={6}>6 mois</option>
                    <option value={12}>12 mois</option>
                    <option value={24}>24 mois</option>
                  </NeuSelect>
                </NeuFieldGroup>
                {form.subscriptionMonthlyPriceHT > 0 && (
                  <p className="sm:col-span-12 text-xs text-neu-muted">
                    Soit{" "}
                    <span className="font-semibold text-neu-accent-2">{formatMoney(subscriptionTTC)} / mois</span>
                    {form.subscriptionCommitmentMonths > 0 && (
                      <>
                        {" "}
                        · {formatMoney(subscriptionTTC * form.subscriptionCommitmentMonths)} sur{" "}
                        {form.subscriptionCommitmentMonths} mois
                      </>
                    )}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-neu-muted">
                Activez pour proposer un forfait récurrent (le client apparaîtra ensuite dans votre MRR).
              </p>
            )}
          </SectionCard>

          {/* Conditions */}
          <SectionCard
            icon={<ScrollText size={16} />}
            step="6"
            title="Conditions & mentions"
            description="Pré-remplies selon vos standards, modifiables devis par devis."
          >
            <NeuFieldGroup>
              <div className="flex items-center justify-between">
                <NeuLabel>Délai & planning</NeuLabel>
                <button
                  type="button"
                  onClick={() => patchForm({ deliveryDelay: defaultDeliveryDelay })}
                  className="mb-2 text-[11px] font-semibold text-neu-accent-2 hover:underline"
                >
                  Par défaut
                </button>
              </div>
              <NeuTextarea
                rows={2}
                value={form.deliveryDelay}
                onChange={(e) => patchForm({ deliveryDelay: e.target.value })}
              />
            </NeuFieldGroup>
            <NeuFieldGroup>
              <div className="flex items-center justify-between">
                <NeuLabel>Conditions de paiement</NeuLabel>
                <button
                  type="button"
                  onClick={() => patchForm({ paymentTerms: defaultPaymentTerms })}
                  className="mb-2 text-[11px] font-semibold text-neu-accent-2 hover:underline"
                >
                  Par défaut
                </button>
              </div>
              <NeuTextarea
                rows={5}
                value={form.paymentTerms}
                onChange={(e) => patchForm({ paymentTerms: e.target.value })}
              />
            </NeuFieldGroup>
            <NeuFieldGroup>
              <div className="flex items-center justify-between">
                <NeuLabel>Périmètre & exclusions</NeuLabel>
                <button
                  type="button"
                  onClick={() => patchForm({ notes: defaultQuoteNotes })}
                  className="mb-2 text-[11px] font-semibold text-neu-accent-2 hover:underline"
                >
                  Par défaut
                </button>
              </div>
              <NeuTextarea
                rows={3}
                value={form.notes}
                onChange={(e) => patchForm({ notes: e.target.value })}
                placeholder="Ce qui n'est pas inclus, les prérequis côté client…"
              />
            </NeuFieldGroup>

            <div>
              <button
                type="button"
                onClick={() => setShowInternal((v) => !v)}
                className="text-xs font-semibold text-neu-muted hover:text-neu-text"
              >
                {showInternal ? "Masquer" : "Ajouter"} des notes internes (jamais imprimées)
              </button>
              {showInternal && (
                <NeuTextarea
                  className="mt-2"
                  rows={2}
                  value={form.internalNotes}
                  onChange={(e) => patchForm({ internalNotes: e.target.value })}
                  placeholder="Marge, points de négociation, historique…"
                />
              )}
            </div>

            <p className="text-[11px] text-neu-muted">
              Les conditions générales (validité, propriété intellectuelle, pénalités, RGPD,
              {form.clientType === "consumer" ? " rétractation, médiation" : " litiges"}) et le
              bon pour accord sont ajoutés automatiquement.
            </p>
          </SectionCard>
        </div>

        {/* ────────── Colonne récapitulatif ────────── */}
        <aside className="space-y-4 lg:sticky lg:top-6">
          <NeuCard className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neu-muted">
              {isEdit ? `Devis ${initialQuote?.number}` : "Nouveau devis"}
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-neu-text">
              {formatMoney(amounts.totalTTC)}
            </p>
            <p className="text-xs text-neu-muted">{legalMentions.tvaExempt}</p>

            <div className="mt-4 space-y-1.5 border-t border-neu-text/8 pt-4 text-sm">
              <div className="flex justify-between text-neu-muted">
                <span>Sous-total</span>
                <span>{formatMoney(amounts.subtotalHT)}</span>
              </div>
              {amounts.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Remise</span>
                  <span>− {formatMoney(amounts.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neu-muted">
                <span>Acompte {amounts.depositPercent} %</span>
                <span className="font-semibold text-neu-text">{formatMoney(amounts.depositAmount)}</span>
              </div>
              {amounts.depositPercent < 100 && (
                <div className="flex justify-between text-neu-muted">
                  <span>Solde {100 - amounts.depositPercent} %</span>
                  <span className="font-semibold text-neu-text">{formatMoney(amounts.balanceAmount)}</span>
                </div>
              )}
              {form.subscriptionEnabled && form.subscriptionMonthlyPriceHT > 0 && (
                <div className="flex justify-between border-t border-neu-text/8 pt-1.5 text-neu-muted">
                  <span>Abonnement</span>
                  <span className="font-semibold text-neu-accent-2">{formatMoney(subscriptionTTC)} / mois</span>
                </div>
              )}
              {amounts.optionalTotal > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Options proposées</span>
                  <span>+ {formatMoney(amounts.optionalTotal)}</span>
                </div>
              )}
            </div>

            <ul className="mt-4 space-y-1.5 border-t border-neu-text/8 pt-4 text-xs">
              <li className={cn("flex items-center gap-2", hasClient ? "text-emerald-600" : "text-neu-muted")}>
                <span className={cn("h-1.5 w-1.5 rounded-full", hasClient ? "bg-emerald-500" : "bg-neu-text/20")} />
                {hasClient ? "Client renseigné" : "Client à renseigner"}
              </li>
              <li className={cn("flex items-center gap-2", includedCount > 0 ? "text-emerald-600" : "text-neu-muted")}>
                <span className={cn("h-1.5 w-1.5 rounded-full", includedCount > 0 ? "bg-emerald-500" : "bg-neu-text/20")} />
                {includedCount > 0
                  ? `${includedCount} prestation${includedCount > 1 ? "s" : ""} incluse${includedCount > 1 ? "s" : ""}`
                  : "Aucune prestation chiffrée"}
                {optionalCount > 0 && ` · ${optionalCount} option${optionalCount > 1 ? "s" : ""}`}
              </li>
              <li className={cn("flex items-center gap-2", form.title.trim() ? "text-emerald-600" : "text-neu-muted")}>
                <span className={cn("h-1.5 w-1.5 rounded-full", form.title.trim() ? "bg-emerald-500" : "bg-neu-text/20")} />
                {form.title.trim() ? "Titre du projet" : "Titre du projet (recommandé)"}
              </li>
            </ul>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600">{error}</p>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <NeuButton type="button" variant="primary" className="w-full" onClick={() => handleSave(primaryStatus)}>
                {primaryLabel}
              </NeuButton>
              <div className="grid grid-cols-2 gap-2">
                <NeuButton type="button" variant="secondary" className="w-full gap-1.5" onClick={() => setShowPreview(true)}>
                  <Eye size={15} />
                  Aperçu
                </NeuButton>
                <NeuButton type="button" variant="secondary" className="w-full" onClick={() => handleSave("brouillon")}>
                  Brouillon
                </NeuButton>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="mt-1 text-xs font-semibold text-neu-muted hover:text-neu-text"
              >
                Annuler
              </button>
            </div>
          </NeuCard>
        </aside>
      </div>

      {/* Barre mobile */}
      <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 px-3 lg:hidden">
        <div className="neu-raised mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neu-muted">Total</p>
            <p className="text-base font-bold text-neu-text">{formatMoney(amounts.totalTTC)}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="neu-flat flex h-10 w-10 items-center justify-center rounded-xl text-neu-muted"
              aria-label="Aperçu"
            >
              <Eye size={16} />
            </button>
            <NeuButton type="button" variant="primary" className="px-4" onClick={() => handleSave(primaryStatus)}>
              {isEdit ? "Enregistrer" : "Créer"}
            </NeuButton>
          </div>
        </div>
      </div>
      <div className="h-20 lg:hidden" aria-hidden="true" />

      {/* Modal aperçu */}
      <ModalOverlay open={showPreview} onClose={() => setShowPreview(false)} panelClassName="max-w-4xl">
        <NeuCard className="p-6">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="neu-flat flex h-9 w-9 items-center justify-center rounded-xl"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
          <QuotePdfPanel quote={previewQuote} title="Aperçu du devis" />
        </NeuCard>
      </ModalOverlay>
    </>
  );
}
