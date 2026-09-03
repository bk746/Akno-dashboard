"use client";

import { Download, Eye, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { QuoteDocument } from "@/components/devis/quote-document";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { NeuCard } from "@/components/ui/neu-card";
import {
  NeuButton,
  NeuFieldGroup,
  NeuInput,
  NeuLabel,
  NeuSelect,
} from "@/components/ui/neu-form";
import { loadStoredClients, type Client } from "@/lib/clients";
import { downloadQuotePdf } from "@/lib/download-quote-pdf";
import { formatMoney } from "@/lib/finances";
import {
  addDaysToDate,
  applyQuoteTemplate,
  buildQuoteDraft,
  calculateQuoteTotals,
  createEmptyLineItem,
  createQuoteFromDraft,
  defaultDeliveryDelay,
  defaultPaymentTerms,
  defaultQuoteNotes,
  defaultQuoteObject,
  defaultQuoteSubscriptionLabel,
  defaultTvaRate,
  getSubscriptionMonthlyTTC,
  legalMentions,
  lineTotal,
  quoteTemplates,
  type Quote,
  type QuoteStatus,
  type QuoteSubscription,
  type QuoteTemplateId,
} from "@/lib/quotes";
import { cn } from "@/lib/utils";

type QuoteBuilderProps = {
  existingQuotes: Quote[];
  onSave: (quote: Quote) => void;
  onCancel: () => void;
};

type FormState = {
  clientId: string;
  clientCompany: string;
  clientName: string;
  clientEmail: string;
  object: string;
  items: ReturnType<typeof createEmptyLineItem>[];
  date: string;
  validityDays: number;
  tvaRate: number;
  subscriptionEnabled: boolean;
  subscriptionLabel: string;
  subscriptionMonthlyPriceHT: number;
};

const today = new Date().toISOString().slice(0, 10);

const initialForm: FormState = {
  clientId: "",
  clientCompany: "",
  clientName: "",
  clientEmail: "",
  object: "",
  items: [createEmptyLineItem()],
  date: today,
  validityDays: 30,
  tvaRate: defaultTvaRate,
  subscriptionEnabled: false,
  subscriptionLabel: defaultQuoteSubscriptionLabel,
  subscriptionMonthlyPriceHT: 0,
};

export function QuoteBuilder({
  existingQuotes,
  onSave,
  onCancel,
}: QuoteBuilderProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [clientList, setClientList] = useState<Client[]>([]);

  useEffect(() => {
    setClientList(loadStoredClients());
  }, []);

  const totals = calculateQuoteTotals(form.items, form.tvaRate);
  const subscriptionTTC = getSubscriptionMonthlyTTC(
    form.subscriptionEnabled
      ? {
          enabled: true,
          label: form.subscriptionLabel,
          monthlyPriceHT: form.subscriptionMonthlyPriceHT,
        }
      : undefined,
    form.tvaRate,
  );

  const subscriptionInput = useMemo((): QuoteSubscription | undefined => {
    if (!form.subscriptionEnabled) return undefined;
    return {
      enabled: true,
      label: form.subscriptionLabel.trim() || defaultQuoteSubscriptionLabel,
      monthlyPriceHT: Math.max(0, form.subscriptionMonthlyPriceHT),
    };
  }, [
    form.subscriptionEnabled,
    form.subscriptionLabel,
    form.subscriptionMonthlyPriceHT,
  ]);

  const previewQuote = useMemo(() => {
    const draft = buildQuoteDraft({
      clientCompany: form.clientCompany,
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      object: form.object,
      items: form.items.filter((i) => i.description.trim() || i.unitPrice > 0),
      date: form.date,
      validityDays: form.validityDays,
      tvaRate: form.tvaRate,
      subscription: subscriptionInput,
    });

    const base = draft ?? {
      client: {
        name: form.clientName,
        company: form.clientCompany,
        email: form.clientEmail,
        address: "",
      },
      items: form.items.filter((i) => i.description.trim() || i.unitPrice > 0),
      tvaRate: form.tvaRate,
      status: "brouillon" as QuoteStatus,
      date: form.date,
      validUntil: addDaysToDate(form.date, form.validityDays),
      object: form.object.trim() || defaultQuoteObject,
      deliveryDelay: defaultDeliveryDelay,
      clientType: "professional" as const,
      notes: defaultQuoteNotes,
      paymentTerms: defaultPaymentTerms,
      subscription: subscriptionInput,
    };

    return {
      ...base,
      number: generatePreviewNumber(existingQuotes),
      status: "brouillon" as QuoteStatus,
    };
  }, [form, existingQuotes, subscriptionInput]);

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
    patchForm({
      clientId,
      clientName: client.name,
      clientCompany: client.company,
      clientEmail: client.email,
      ...(client.monthlySubscription && client.monthlySubscription > 0
        ? {
            subscriptionEnabled: true,
            subscriptionMonthlyPriceHT: client.monthlySubscription,
          }
        : {}),
    });
  }

  function updateLine(id: string, field: "description" | "quantity" | "unitPrice", value: string) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item) => {
        if (item.id !== id) return item;
        if (field === "description") return { ...item, description: value };
        if (field === "quantity") {
          return { ...item, quantity: Math.max(1, Number(value) || 1) };
        }
        return { ...item, unitPrice: Math.max(0, Number(value) || 0) };
      }),
    }));
    setError(null);
  }

  function addLine() {
    setForm((current) => ({
      ...current,
      items: [...current.items, createEmptyLineItem()],
    }));
  }

  function removeLine(id: string) {
    setForm((current) => ({
      ...current,
      items:
        current.items.length > 1
          ? current.items.filter((item) => item.id !== id)
          : current.items,
    }));
  }

  function useTemplate(templateId: QuoteTemplateId) {
    const template = applyQuoteTemplate(templateId);
    patchForm({
      object: template.object,
      items: template.items,
    });
  }

  async function handleDownloadPdf() {
    setExportingPdf(true);
    try {
      await downloadQuotePdf(`Devis-${previewQuote.number}`);
    } catch {
      setError("Impossible de générer le PDF. Réessayez.");
    } finally {
      setExportingPdf(false);
    }
  }

  function handleSave(status: QuoteStatus) {
    const draft = buildQuoteDraft({
      clientCompany: form.clientCompany,
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      object: form.object,
      items: form.items,
      date: form.date,
      validityDays: form.validityDays,
      tvaRate: form.tvaRate,
      subscription: subscriptionInput,
    });

    if (!draft) {
      setError(
        "Renseignez le client et au moins une prestation ou un abonnement avec un prix.",
      );
      return;
    }

    onSave(
      createQuoteFromDraft(existingQuotes, {
        ...draft,
        status,
      }),
    );
  }

  return (
    <>
      <NeuCard className="overflow-hidden p-0">
        {/* Modèles rapides */}
        <div className="border-b border-neu-text/5 px-5 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neu-muted">
            Modèle rapide
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(quoteTemplates) as QuoteTemplateId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => useTemplate(id)}
                className="neu-btn rounded-full px-4 py-2 text-xs font-semibold text-neu-text/70 hover:text-neu-accent-2"
              >
                {quoteTemplates[id].label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5 p-5">
          {/* Client + dates — une seule zone */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <NeuFieldGroup className="lg:col-span-4">
              <NeuLabel>Client</NeuLabel>
              <NeuSelect
                value={form.clientId}
                onChange={(e) => handleClientSelect(e.target.value)}
              >
                <option value="">Nouveau client…</option>
                {clientList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company}
                  </option>
                ))}
              </NeuSelect>
            </NeuFieldGroup>
            <NeuFieldGroup className="lg:col-span-3">
              <NeuLabel>Entreprise</NeuLabel>
              <NeuInput
                value={form.clientCompany}
                onChange={(e) => patchForm({ clientCompany: e.target.value })}
                placeholder="Dupont Électricité"
              />
            </NeuFieldGroup>
            <NeuFieldGroup className="lg:col-span-3">
              <NeuLabel>Email</NeuLabel>
              <NeuInput
                type="email"
                value={form.clientEmail}
                onChange={(e) => patchForm({ clientEmail: e.target.value })}
                placeholder="contact@entreprise.fr"
              />
            </NeuFieldGroup>
            <NeuFieldGroup className="lg:col-span-2">
              <NeuLabel>Contact</NeuLabel>
              <NeuInput
                value={form.clientName}
                onChange={(e) => patchForm({ clientName: e.target.value })}
                placeholder="Jean Dupont"
              />
            </NeuFieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <NeuFieldGroup>
              <NeuLabel>Date</NeuLabel>
              <NeuInput
                type="date"
                value={form.date}
                onChange={(e) => patchForm({ date: e.target.value })}
              />
            </NeuFieldGroup>
            <NeuFieldGroup>
              <NeuLabel>Validité</NeuLabel>
              <NeuSelect
                value={form.validityDays}
                onChange={(e) =>
                  patchForm({ validityDays: Number(e.target.value) })
                }
              >
                <option value={15}>15 jours</option>
                <option value={30}>30 jours</option>
                <option value={60}>60 jours</option>
              </NeuSelect>
            </NeuFieldGroup>
            <NeuFieldGroup>
              <NeuLabel>Régime fiscal</NeuLabel>
              <div className="neu-inset flex min-h-[46px] items-center rounded-[1.25rem] px-3 text-xs leading-relaxed text-neu-muted">
                {legalMentions.tvaExempt}
              </div>
            </NeuFieldGroup>
            <NeuFieldGroup>
              <NeuLabel>Expire le</NeuLabel>
              <div className="neu-inset flex h-[46px] items-center rounded-[1.25rem] px-3 text-sm text-neu-muted">
                {addDaysToDate(form.date, form.validityDays)}
              </div>
            </NeuFieldGroup>
          </div>

          <NeuFieldGroup>
            <NeuLabel>Objet (optionnel)</NeuLabel>
            <NeuInput
              value={form.object}
              onChange={(e) => patchForm({ object: e.target.value })}
              placeholder="Ex. Création site vitrine sur mesure"
            />
          </NeuFieldGroup>

          {/* Lignes — tableau comme Freebe / Henrri */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-bold text-neu-text">Prestations</p>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-1 text-xs font-semibold text-neu-accent-2 hover:underline"
              >
                <Plus size={14} />
                Ajouter une ligne
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neu-text/5">
              <table className="w-full min-w-[540px] text-sm">
                <thead className="bg-neu-text/[0.03] text-left text-[10px] uppercase tracking-wide text-neu-muted">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Description</th>
                    <th className="w-16 px-2 py-2.5 font-semibold">Qté</th>
                    <th className="w-28 px-2 py-2.5 font-semibold">Prix HT</th>
                    <th className="w-28 px-2 py-2.5 text-right font-semibold">Total</th>
                    <th className="w-10 px-2 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item) => (
                    <tr key={item.id} className="border-t border-neu-text/5">
                      <td className="px-2 py-2">
                        <input
                          value={item.description}
                          onChange={(e) =>
                            updateLine(item.id, "description", e.target.value)
                          }
                          placeholder="Description de la prestation"
                          className="w-full rounded-xl bg-transparent px-2 py-2 text-sm outline-none placeholder:text-neu-muted/50 focus:bg-neu-text/[0.03]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateLine(item.id, "quantity", e.target.value)
                          }
                          className="w-full rounded-xl bg-transparent px-2 py-2 text-center text-sm outline-none focus:bg-neu-text/[0.03]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={item.unitPrice || ""}
                          onChange={(e) =>
                            updateLine(item.id, "unitPrice", e.target.value)
                          }
                          placeholder="0"
                          className="w-full rounded-xl bg-transparent px-2 py-2 text-right text-sm outline-none focus:bg-neu-text/[0.03]"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-neu-text">
                        {formatMoney(lineTotal(item))}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(item.id)}
                          className="text-neu-muted hover:text-red-500"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Abonnement mensuel optionnel */}
          <div className="rounded-2xl border border-neu-accent-2/15 bg-neu-accent-2/[0.03] p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={form.subscriptionEnabled}
                onChange={(e) =>
                  patchForm({ subscriptionEnabled: e.target.checked })
                }
                className="mt-1 h-4 w-4 rounded border-neu-text/20 accent-neu-accent-2"
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-neu-text">
                  Ajouter un abonnement mensuel
                </p>
                <p className="mt-0.5 text-xs text-neu-muted">
                  Facturation récurrente en plus de la prestation ponctuelle — vous
                  fixez le prix HT mensuel.
                </p>
              </div>
            </label>

            {form.subscriptionEnabled && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12">
                <NeuFieldGroup className="sm:col-span-8">
                  <NeuLabel>Libellé de l&apos;abonnement</NeuLabel>
                  <NeuInput
                    value={form.subscriptionLabel}
                    onChange={(e) =>
                      patchForm({ subscriptionLabel: e.target.value })
                    }
                    placeholder={defaultQuoteSubscriptionLabel}
                  />
                </NeuFieldGroup>
                <NeuFieldGroup className="sm:col-span-4">
                  <NeuLabel>Prix mensuel HT (€)</NeuLabel>
                  <NeuInput
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.subscriptionMonthlyPriceHT || ""}
                    onChange={(e) =>
                      patchForm({
                        subscriptionMonthlyPriceHT: Math.max(
                          0,
                          Number(e.target.value) || 0,
                        ),
                      })
                    }
                    placeholder="150"
                  />
                </NeuFieldGroup>
                {form.subscriptionMonthlyPriceHT > 0 && (
                  <p className="sm:col-span-12 text-xs text-neu-muted">
                    Soit{" "}
                    <span className="font-semibold text-neu-accent-2">
                      {formatMoney(subscriptionTTC)} net / mois
                    </span>{" "}
                    ({legalMentions.tvaExempt})
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Totaux */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between text-neu-muted">
                <span>Total</span>
                <span>{formatMoney(totals.subtotalHT)}</span>
              </div>
              <div className="flex justify-between text-neu-muted">
                <span>TVA</span>
                <span className="max-w-[12rem] text-right text-xs">
                  {legalMentions.tvaExempt}
                </span>
              </div>
              <div className="flex justify-between border-t border-neu-text/10 pt-2 text-lg font-bold text-neu-text">
                <span>Total net</span>
                <span className="text-neu-accent-2">
                  {formatMoney(totals.totalTTC)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-neu-muted">
            Les mentions légales (paiement, pénalités, RGPD, bon pour accord…) sont
            ajoutées automatiquement sur le PDF.
          </p>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Barre d'actions fixe en bas de la card */}
        <div className="flex flex-col gap-3 border-t border-neu-text/5 bg-neu-text/[0.02] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neu-muted">
            Total prestation :{" "}
            <span className="text-lg font-bold text-neu-accent-2">
              {formatMoney(totals.totalTTC)}
            </span>{" "}
            TTC
            {form.subscriptionEnabled && form.subscriptionMonthlyPriceHT > 0 && (
              <>
                {" "}
                · Abonnement :{" "}
                <span className="font-bold text-neu-accent-2">
                  {formatMoney(subscriptionTTC)} TTC / mois
                </span>
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <NeuButton type="button" variant="secondary" onClick={onCancel}>
              Annuler
            </NeuButton>
            <NeuButton
              type="button"
              variant="secondary"
              className="gap-1.5"
              onClick={() => setShowPreview(true)}
            >
              <Eye size={15} />
              Aperçu
            </NeuButton>
            <NeuButton
              type="button"
              variant="secondary"
              onClick={() => handleSave("brouillon")}
            >
              Brouillon
            </NeuButton>
            <NeuButton
              type="button"
              variant="primary"
              onClick={() => handleSave("envoye")}
            >
              Créer le devis
            </NeuButton>
          </div>
        </div>
      </NeuCard>

      {/* Modal aperçu */}
      <ModalOverlay
        open={showPreview}
        onClose={() => setShowPreview(false)}
        panelClassName="max-w-3xl"
      >
        <NeuCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold text-neu-text">Aperçu du devis</p>
              <div className="flex gap-2">
                <NeuButton
                  type="button"
                  variant="secondary"
                  className="!px-3 !py-2 text-xs"
                  disabled={exportingPdf}
                  onClick={handleDownloadPdf}
                >
                  <Download size={14} />
                  {exportingPdf ? "Génération…" : "Enregistrer en PDF"}
                </NeuButton>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="neu-flat flex h-9 w-9 items-center justify-center rounded-xl"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          <QuoteDocument quote={previewQuote} />
        </NeuCard>
      </ModalOverlay>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #quote-document,
          #quote-document * {
            visibility: visible;
          }
          #quote-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 24px;
          }
        }
      `}</style>
    </>
  );
}

function generatePreviewNumber(existing: Quote[]) {
  const year = new Date().getFullYear();
  const count = existing.filter((q) => q.number.includes(String(year))).length;
  return `DEV-${year}-${String(count + 1).padStart(3, "0")}`;
}
