"use client";

import { Download, Eye, Plus, Receipt, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { QuoteDocument } from "@/components/devis/quote-document";
import { DeleteButton } from "@/components/ui/delete-button";
import { MonthFilter } from "@/components/ui/month-filter";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { NeuButton, NeuLinkButton } from "@/components/ui/neu-form";
import { NeuCard } from "@/components/ui/neu-card";
import { formatMoney } from "@/lib/finances";
import { downloadQuotePdf } from "@/lib/download-quote-pdf";
import {
  buildMonthOptions,
  formatMonthLabel,
  getCurrentMonthKey,
  isInMonth,
} from "@/lib/month-filter";
import {
  applyQuoteSubscriptionToClient,
  loadStoredClients,
  saveStoredClients,
} from "@/lib/clients";
import {
  getClientDisplayName,
  loadStoredQuotes,
  quoteStatusLabels,
  quoteStatusStyles,
  saveStoredQuotes,
  type Quote,
} from "@/lib/quotes";
import {
  getSiteStatus,
  loadStoredInvoices,
  removeInvoicesForQuote,
  saveStoredInvoices,
  siteStatusLabels,
  siteStatusStyles,
} from "@/lib/invoices";
import { matchesQuoteSearch } from "@/lib/search";
import { cn } from "@/lib/utils";

export default function DevisPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [ready, setReady] = useState(false);
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [invoices, setInvoices] = useState(() =>
    typeof window === "undefined" ? [] : loadStoredInvoices(),
  );
  const [monthFilter, setMonthFilter] = useState(getCurrentMonthKey);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setQuotes(loadStoredQuotes());
    setInvoices(loadStoredInvoices());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveStoredQuotes(quotes);
  }, [quotes, ready]);

  const monthOptions = useMemo(
    () => buildMonthOptions(quotes.map((quote) => quote.date)),
    [quotes],
  );

  const filteredQuotes = useMemo(
    () =>
      quotes.filter(
        (quote) =>
          isInMonth(quote.date, monthFilter) && matchesQuoteSearch(quote, search),
      ),
    [quotes, monthFilter, search],
  );

  const total = filteredQuotes.reduce((sum, quote) => sum + quote.amount, 0);
  const accepted = filteredQuotes.filter((quote) => quote.status === "accepte").length;

  async function handleDownloadPdf() {
    if (!previewQuote) return;
    setExportingPdf(true);
    try {
      await downloadQuotePdf(`Devis-${previewQuote.number}`);
    } finally {
      setExportingPdf(false);
    }
  }

  function markAsAccepted() {
    if (!previewQuote) return;

    const acceptedQuote = { ...previewQuote, status: "accepte" as const };
    setQuotes((current) =>
      current.map((quote) =>
        quote.id === previewQuote.id ? acceptedQuote : quote,
      ),
    );
    setPreviewQuote(acceptedQuote);

    if (
      acceptedQuote.subscription?.enabled &&
      acceptedQuote.subscription.monthlyPriceHT > 0
    ) {
      const clients = loadStoredClients();
      saveStoredClients(applyQuoteSubscriptionToClient(clients, acceptedQuote));
    }
  }

  function deleteQuote(id: number) {
    const quote = quotes.find((item) => item.id === id);
    if (!quote) return;

    setQuotes((current) => current.filter((item) => item.id !== id));
    const nextInvoices = removeInvoicesForQuote(invoices, id);
    setInvoices(nextInvoices);
    saveStoredInvoices(nextInvoices);

    if (previewQuote?.id === id) {
      setPreviewQuote(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Devis"
        description="Créez et suivez vos propositions commerciales"
        action={
          <NeuLinkButton href="/devis/nouveau" variant="primary" className="gap-2">
            <Plus size={16} />
            Nouveau devis
          </NeuLinkButton>
        }
      />

      <NeuCard className="mb-6 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Nom client, n° devis, entreprise…"
            className="w-full lg:max-w-sm"
          />
          <div className="w-full lg:flex-1 lg:flex lg:justify-end">
            <MonthFilter
              value={monthFilter}
              options={monthOptions}
              onChange={setMonthFilter}
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-neu-muted">
          {filteredQuotes.length} devis
          {monthFilter !== "all" ? ` en ${formatMonthLabel(monthFilter).toLowerCase()}` : ""}
          {search.trim() ? ` · « ${search.trim()} »` : ""}
        </p>
      </NeuCard>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NeuCard className="py-4 text-center">
          <p className="text-xs font-semibold uppercase text-neu-muted">
            Devis {monthFilter !== "all" ? "du mois" : "total"}
          </p>
          <p className="mt-1 text-2xl font-bold text-neu-text">{filteredQuotes.length}</p>
        </NeuCard>
        <NeuCard className="py-4 text-center">
          <p className="text-xs font-semibold uppercase text-neu-muted">
            Montant {monthFilter !== "all" ? "du mois" : "total"}
          </p>
          <p className="mt-1 text-2xl font-bold text-neu-accent-2">
            {formatMoney(total)}
          </p>
        </NeuCard>
        <NeuCard className="py-4 text-center">
          <p className="text-xs font-semibold uppercase text-neu-muted">
            Acceptés {monthFilter !== "all" ? "ce mois" : ""}
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{accepted}</p>
        </NeuCard>
      </div>

      <NeuCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neu-text/10 text-xs uppercase tracking-wider text-neu-muted">
                <th className="pb-3 pr-4 font-semibold">N° Devis</th>
                <th className="pb-3 pr-4 font-semibold">Client</th>
                <th className="pb-3 pr-4 font-semibold">Date</th>
                <th className="pb-3 pr-4 font-semibold">Validité</th>
                <th className="pb-3 pr-4 font-semibold">Statut</th>
                <th className="pb-3 pr-4 font-semibold">Site</th>
                <th className="pb-3 pr-4 text-right font-semibold">Montant</th>
                <th className="pb-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-neu-muted">
                    Aucun devis.{" "}
                    <Link href="/devis/nouveau" className="font-semibold text-neu-accent-2 hover:underline">
                      Créer le premier
                    </Link>
                  </td>
                </tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-neu-muted">
                    {search.trim()
                      ? "Aucun devis ne correspond à votre recherche."
                      : "Aucun devis pour cette période."}
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="group border-b border-neu-text/5 transition-colors hover:bg-neu-text/[0.02]"
                >
                  <td className="py-4 pr-4 font-mono text-xs font-semibold text-neu-accent-2">
                    {quote.number}
                  </td>
                  <td className="py-4 pr-4 font-medium text-neu-text">
                    {getClientDisplayName(quote)}
                  </td>
                  <td className="py-4 pr-4 text-neu-muted">{quote.date}</td>
                  <td className="py-4 pr-4 text-neu-muted">{quote.validUntil}</td>
                  <td className="py-4 pr-4">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                        quoteStatusStyles[quote.status],
                      )}
                    >
                      {quoteStatusLabels[quote.status]}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    {quote.status === "accepte" ? (
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                          siteStatusStyles[getSiteStatus(invoices, quote.id)],
                        )}
                      >
                        {siteStatusLabels[getSiteStatus(invoices, quote.id)]}
                      </span>
                    ) : (
                      <span className="text-xs text-neu-muted">—</span>
                    )}
                  </td>
                  <td className="py-4 pr-4 text-right font-bold text-neu-text">
                    {formatMoney(quote.amount)}
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewQuote(quote)}
                        className="neu-flat inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-neu-muted hover:text-neu-accent-2"
                      >
                        <Eye size={14} />
                        Voir
                      </button>
                      <DeleteButton
                        label={`le devis ${quote.number}`}
                        onConfirm={() => deleteQuote(quote.id)}
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

      {previewQuote && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-neu-text/20 backdrop-blur-[2px]"
            onClick={() => setPreviewQuote(null)}
            aria-label="Fermer"
          />
          <NeuCard className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold text-neu-text">Devis {previewQuote.number}</p>
              <div className="flex items-center gap-2">
                <DeleteButton
                  label={`le devis ${previewQuote.number}`}
                  onConfirm={() => deleteQuote(previewQuote.id)}
                />
                <button
                type="button"
                onClick={() => setPreviewQuote(null)}
                className="neu-flat flex h-9 w-9 items-center justify-center rounded-xl text-neu-muted"
              >
                <X size={18} />
              </button>
              </div>
            </div>
            <QuoteDocument quote={previewQuote} />
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {previewQuote.status !== "accepte" && (
                <NeuButton variant="secondary" onClick={markAsAccepted}>
                  Marquer accepté
                </NeuButton>
              )}
              {previewQuote.status === "accepte" && (
                <Link
                  href="/factures"
                  className="neu-flat inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-neu-muted hover:text-neu-accent-2"
                >
                  <Receipt size={16} />
                  Facturer
                </Link>
              )}
              <NeuButton
                variant="secondary"
                className="gap-2"
                disabled={exportingPdf}
                onClick={handleDownloadPdf}
              >
                <Download size={16} />
                {exportingPdf ? "Génération…" : "Enregistrer en PDF"}
              </NeuButton>
            </div>
          </NeuCard>
        </div>
      )}
    </>
  );
}
