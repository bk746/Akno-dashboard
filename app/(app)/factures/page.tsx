"use client";

import { Eye, Plus, Receipt, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { InvoiceDocument } from "@/components/factures/invoice-document";
import { DeleteButton } from "@/components/ui/delete-button";
import { PdfDownloadButton } from "@/components/ui/pdf-download-button";
import { MonthFilter } from "@/components/ui/month-filter";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { NeuCard } from "@/components/ui/neu-card";
import { NeuButton } from "@/components/ui/neu-form";
import { PageHeader } from "@/components/ui/page-header";
import { downloadDocumentPdf } from "@/lib/download-pdf";
import { formatMoney } from "@/lib/finances";
import {
  buildMonthOptions,
  formatMonthLabel,
  getCurrentMonthKey,
  isInMonth,
} from "@/lib/month-filter";
import {
  canCreateInvoiceKind,
  createInvoiceFromQuote,
  getInvoiceClientName,
  getSiteStatus,
  invoiceKindLabels,
  invoiceStatusLabels,
  invoiceStatusStyles,
  loadStoredInvoices,
  saveStoredInvoices,
  siteStatusLabels,
  siteStatusStyles,
  type Invoice,
  type InvoiceKind,
} from "@/lib/invoices";
import { loadStoredQuotes, getClientDisplayName, type Quote } from "@/lib/quotes";
import { cn } from "@/lib/utils";

export default function FacturesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [ready, setReady] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState("");
  const [selectedKind, setSelectedKind] = useState<InvoiceKind>("acompte");
  const [createError, setCreateError] = useState<string | null>(null);
  const [unlockNotice, setUnlockNotice] = useState<string | null>(null);
  const [monthFilter, setMonthFilter] = useState(getCurrentMonthKey);

  useEffect(() => {
    setInvoices(loadStoredInvoices());
    setQuotes(loadStoredQuotes());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveStoredInvoices(invoices);
  }, [invoices, ready]);

  const acceptedQuotes = quotes.filter((quote) => quote.status === "accepte");
  const selectedQuote = acceptedQuotes.find(
    (quote) => String(quote.id) === selectedQuoteId,
  );
  const kindCheck = selectedQuote
    ? canCreateInvoiceKind(invoices, selectedQuote.id, selectedKind)
    : null;

  const monthOptions = useMemo(
    () => buildMonthOptions(invoices.map((invoice) => invoice.date)),
    [invoices],
  );

  const filteredInvoices = useMemo(
    () => invoices.filter((invoice) => isInMonth(invoice.date, monthFilter)),
    [invoices, monthFilter],
  );

  const total = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paid = filteredInvoices.filter((invoice) => invoice.status === "payee");
  const overdue = filteredInvoices.filter((invoice) => invoice.status === "en_retard");
  const paidAmount = paid.reduce((sum, invoice) => sum + invoice.amount, 0);

  function handleCreateInvoice() {
    if (!selectedQuote) {
      setCreateError("Sélectionnez un devis accepté.");
      return;
    }

    const check = canCreateInvoiceKind(invoices, selectedQuote.id, selectedKind);
    if (!check.ok) {
      setCreateError(check.reason ?? "Impossible de créer cette facture.");
      return;
    }

    const invoice = createInvoiceFromQuote(invoices, selectedQuote, selectedKind);
    if (!invoice) {
      setCreateError("Impossible de créer la facture.");
      return;
    }

    setInvoices((current) => [invoice, ...current]);
    setShowCreateModal(false);
    setCreateError(null);
    setSelectedQuoteId("");
    setSelectedKind("acompte");
    setPreviewInvoice(invoice);
  }

  function markAsPaid(id: number) {
    const invoice = invoices.find((item) => item.id === id);
    const paidDate = new Date().toISOString().slice(0, 10);

    setInvoices((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "payee", paidDate } : item,
      ),
    );
    setPreviewInvoice((current) =>
      current?.id === id
        ? { ...current, status: "payee", paidDate }
        : current,
    );
    if (invoice?.kind === "acompte") {
      setUnlockNotice(null);
    }
    if (invoice?.kind === "solde") {
      setUnlockNotice(
        `Solde payé — le site de ${getInvoiceClientName(invoice)} est débloqué. Vous pouvez mettre en ligne et remettre les accès.`,
      );
    }
  }

  function deleteInvoice(id: number) {
    setInvoices((current) => current.filter((invoice) => invoice.id !== id));
    if (previewInvoice?.id === id) {
      setPreviewInvoice(null);
    }
    setUnlockNotice(null);
  }

  return (
    <>
      <PageHeader
        title="Factures"
        description="Acompte pour démarrer · solde pour débloquer le site"
        action={
          <NeuButton
            variant="primary"
            className="flex items-center gap-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            Nouvelle facture
          </NeuButton>
        }
      />

      <NeuCard className="mb-8 border-neu-accent-2/20 bg-neu-accent-2/5 p-4">
        <p className="text-sm font-semibold text-neu-text">Comment ça marche ?</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-neu-muted">
          <li>Le client signe le devis</li>
          <li>
            Vous envoyez la <strong className="text-neu-text">facture d&apos;acompte (40 %)</strong>
          </li>
          <li>Le client paie l&apos;acompte → vous démarrez le projet (site encore verrouillé)</li>
          <li>
            Site terminé → vous envoyez la{" "}
            <strong className="text-neu-text">facture de solde (60 %)</strong>
          </li>
          <li>
            Client paie le solde →{" "}
            <strong className="text-neu-text">site débloqué et mis en ligne</strong>
          </li>
        </ol>
      </NeuCard>

      {unlockNotice && (
        <NeuCard className="mb-8 border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">{unlockNotice}</p>
        </NeuCard>
      )}

      {acceptedQuotes.length > 0 && (
        <NeuCard className="mb-8">
          <p className="mb-4 text-sm font-bold text-neu-text">Statut des sites clients</p>
          <div className="space-y-2">
            {acceptedQuotes.map((quote) => {
              const status = getSiteStatus(invoices, quote.id);
              return (
                <div
                  key={quote.id}
                  className="flex flex-col gap-2 rounded-xl border border-neu-text/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-neu-text">
                      {getClientDisplayName(quote)}
                    </p>
                    <p className="text-xs text-neu-muted">{quote.number}</p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold",
                      siteStatusStyles[status],
                    )}
                  >
                    {siteStatusLabels[status]}
                  </span>
                </div>
              );
            })}
          </div>
        </NeuCard>
      )}

      <NeuCard className="mb-6 p-4">
        <MonthFilter
          value={monthFilter}
          options={monthOptions}
          onChange={setMonthFilter}
        />
        <p className="mt-3 text-xs text-neu-muted">
          {filteredInvoices.length} facture{filteredInvoices.length !== 1 ? "s" : ""}
          {monthFilter !== "all" ? ` en ${formatMonthLabel(monthFilter).toLowerCase()}` : ""}
          {paidAmount > 0 && (
            <> · {formatMoney(paidAmount)} encaissé{paid.length !== 1 ? "s" : ""}</>
          )}
        </p>
      </NeuCard>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <NeuCard className="py-4 text-center">
          <p className="text-xs font-semibold uppercase text-neu-muted">
            Factures {monthFilter !== "all" ? "du mois" : "total"}
          </p>
          <p className="mt-1 text-2xl font-bold text-neu-text">{filteredInvoices.length}</p>
        </NeuCard>
        <NeuCard className="py-4 text-center">
          <p className="text-xs font-semibold uppercase text-neu-muted">
            Montant {monthFilter !== "all" ? "du mois" : "total"}
          </p>
          <p className="mt-1 text-2xl font-bold text-neu-accent-2">{formatMoney(total)}</p>
        </NeuCard>
        <NeuCard className="py-4 text-center">
          <p className="text-xs font-semibold uppercase text-neu-muted">
            Payées {monthFilter !== "all" ? "ce mois" : ""}
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{paid.length}</p>
        </NeuCard>
        <NeuCard className="py-4 text-center">
          <p className="text-xs font-semibold uppercase text-neu-muted">
            En retard {monthFilter !== "all" ? "ce mois" : ""}
          </p>
          <p className="mt-1 text-2xl font-bold text-neu-accent-3">{overdue.length}</p>
        </NeuCard>
      </div>

      <NeuCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neu-text/10 text-xs uppercase tracking-wider text-neu-muted">
                <th className="pb-3 pr-4 font-semibold">N° Facture</th>
                <th className="pb-3 pr-4 font-semibold">Type</th>
                <th className="pb-3 pr-4 font-semibold">Client</th>
                <th className="pb-3 pr-4 font-semibold">Devis</th>
                <th className="pb-3 pr-4 font-semibold">Date</th>
                <th className="pb-3 pr-4 font-semibold">Statut</th>
                <th className="pb-3 pr-4 text-right font-semibold">Montant</th>
                <th className="pb-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-neu-muted">
                    Aucune facture. Créez un devis accepté puis facturez depuis cette page.
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-neu-muted">
                    Aucune facture pour cette période.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-neu-text/5 transition-colors hover:bg-neu-text/[0.02]"
                >
                  <td className="py-4 pr-4 font-mono text-xs font-semibold text-neu-accent-2">
                    {invoice.number}
                  </td>
                  <td className="py-4 pr-4 text-xs text-neu-muted">
                    {invoice.kind === "acompte" ? "Acompte 40 %" : "Solde 60 %"}
                  </td>
                  <td className="py-4 pr-4 font-medium text-neu-text">
                    {getInvoiceClientName(invoice)}
                  </td>
                  <td className="py-4 pr-4 font-mono text-xs text-neu-muted">
                    {invoice.quoteNumber}
                  </td>
                  <td className="py-4 pr-4 text-neu-muted">{invoice.date}</td>
                  <td className="py-4 pr-4">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                        invoiceStatusStyles[invoice.status],
                      )}
                    >
                      {invoiceStatusLabels[invoice.status]}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-right font-bold text-neu-text">
                    {formatMoney(invoice.amount)}
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewInvoice(invoice)}
                        className="neu-flat inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-neu-muted hover:text-neu-accent-2"
                      >
                        <Eye size={14} />
                        Voir
                      </button>
                      <DeleteButton
                        label={`la facture ${invoice.number}`}
                        onConfirm={() => deleteInvoice(invoice.id)}
                      />
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </NeuCard>

      {previewInvoice && (
        <ModalOverlay
          open={Boolean(previewInvoice)}
          onClose={() => setPreviewInvoice(null)}
          panelClassName="max-w-4xl"
        >
          <NeuCard className="p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-neu-text">
                  {previewInvoice.number} — {invoiceKindLabels[previewInvoice.kind]}
                </p>
                <p className="mt-0.5 text-xs text-neu-muted">Aperçu prêt à l&apos;export — format A4</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DeleteButton
                  label={`la facture ${previewInvoice.number}`}
                  onConfirm={() => deleteInvoice(previewInvoice.id)}
                />
                <PdfDownloadButton
                  onDownload={() =>
                    downloadDocumentPdf(
                      `Facture-${previewInvoice.number}`,
                      "invoice-document",
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() => setPreviewInvoice(null)}
                  className="neu-flat flex h-9 w-9 items-center justify-center rounded-xl text-neu-muted"
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="akno-pdf-preview-frame overflow-hidden rounded-2xl border border-akno-border bg-white shadow-[0_8px_30px_rgba(10,37,64,0.06)]">
              <div className="max-h-[min(72vh,900px)] overflow-y-auto overscroll-contain bg-[#f8fafc] p-3 sm:p-5">
                <InvoiceDocument invoice={previewInvoice} />
              </div>
            </div>

            {previewInvoice.kind === "solde" && previewInvoice.status !== "payee" && (
              <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Le site reste verrouillé tant que cette facture de solde n&apos;est pas payée.
              </p>
            )}
            {previewInvoice.kind === "solde" && previewInvoice.status === "payee" && (
              <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                Solde payé — site débloqué, mise en ligne autorisée.
              </p>
            )}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {previewInvoice.status !== "payee" && (
                <NeuButton
                  variant="secondary"
                  onClick={() => markAsPaid(previewInvoice.id)}
                >
                  {previewInvoice.kind === "solde"
                    ? "Marquer payée · débloquer le site"
                    : "Marquer comme payée"}
                </NeuButton>
              )}
              {previewInvoice.status === "payee" && (
                <p className="w-full rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800 sm:w-auto">
                  Encaissement comptabilisé dans Finances et le dashboard.
                </p>
              )}
            </div>
          </NeuCard>
        </ModalOverlay>
      )}

      <ModalOverlay
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateError(null);
        }}
        panelClassName="max-w-md"
      >
        <NeuCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-neu-accent-2" />
                <p className="font-bold text-neu-text">Nouvelle facture</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError(null);
                }}
                className="neu-flat flex h-9 w-9 items-center justify-center rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            {acceptedQuotes.length === 0 ? (
              <p className="text-sm text-neu-muted">
                Aucun devis accepté. Marquez un devis comme « Accepté » avant de facturer.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-neu-muted">
                    Devis accepté
                  </label>
                  <select
                    value={selectedQuoteId}
                    onChange={(event) => {
                      setSelectedQuoteId(event.target.value);
                      setCreateError(null);
                    }}
                    className="neu-inset w-full rounded-xl px-3 py-2.5 text-sm"
                  >
                    <option value="">Choisir un devis…</option>
                    {acceptedQuotes.map((quote) => (
                      <option key={quote.id} value={quote.id}>
                        {quote.number} — {quote.client.company || quote.client.name} (
                        {formatMoney(quote.amount)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-neu-muted">
                    Type de facture
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["acompte", "solde"] as InvoiceKind[]).map((kind) => (
                      <button
                        key={kind}
                        type="button"
                        onClick={() => {
                          setSelectedKind(kind);
                          setCreateError(null);
                        }}
                        className={cn(
                          "rounded-xl px-3 py-3 text-left text-xs font-semibold transition-colors",
                          selectedKind === kind
                            ? "bg-neu-accent-2 text-white"
                            : "neu-flat text-neu-muted hover:text-neu-text",
                        )}
                      >
                        {kind === "acompte" ? "Acompte 40 %" : "Solde 60 %"}
                        <span className="mt-1 block font-normal opacity-80">
                          {kind === "acompte"
                            ? "Démarre le projet · site verrouillé"
                            : "Site prêt · débloqué après paiement"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedQuote && kindCheck && !kindCheck.ok && (
                  <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    {kindCheck.reason}
                  </p>
                )}

                {createError && (
                  <p className="rounded-xl bg-neu-accent-3/10 px-3 py-2 text-xs text-neu-accent-3">
                    {createError}
                  </p>
                )}

                <NeuButton
                  variant="primary"
                  className="w-full"
                  disabled={!selectedQuote || !kindCheck?.ok}
                  onClick={handleCreateInvoice}
                >
                  Créer et voir la facture
                </NeuButton>
              </div>
            )}
        </NeuCard>
      </ModalOverlay>
    </>
  );
}
