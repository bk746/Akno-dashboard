"use client";

import { formatMoney } from "@/lib/finances";
import {
  calculateInvoiceTotals,
  companyInfo,
  formatQuoteDate,
  getCompanyFullAddress,
  invoiceKindLabels,
  invoiceLegalMentions,
  lineTotal,
  type Invoice,
} from "@/lib/invoices";
import { cn } from "@/lib/utils";

type InvoiceDocumentProps = {
  invoice: Invoice;
  className?: string;
};

export function InvoiceDocument({ invoice, className }: InvoiceDocumentProps) {
  const { subtotalHT, tvaAmount, totalTTC } = calculateInvoiceTotals(
    invoice.items,
    invoice.tvaRate,
  );
  const isTvaExempt = invoice.tvaRate === 0;

  return (
    <article
      id="invoice-document"
      className={cn("bg-white p-1 text-neu-text sm:p-2", className)}
    >
      <div className="mb-8 flex flex-col justify-between gap-6 border-b border-neu-text/10 pb-6 sm:flex-row sm:items-start">
        <div className="max-w-md">
          <p className="text-2xl font-bold tracking-tight">{companyInfo.name}</p>
          <p className="mt-0.5 text-sm font-medium text-neu-text">
            {companyInfo.legalName}
          </p>
          <p className="mt-0.5 text-sm text-neu-muted">{companyInfo.legalForm}</p>
          {companyInfo.tagline && (
            <p className="mt-1 text-sm text-neu-muted">{companyInfo.tagline}</p>
          )}
          <div className="mt-4 space-y-0.5 text-[11px] leading-relaxed text-neu-muted">
            {getCompanyFullAddress() !== "À compléter" && (
              <p>{getCompanyFullAddress()}</p>
            )}
            <p>SIRET : {companyInfo.siret}</p>
            <p>SIREN : {companyInfo.siren}</p>
            <p>Code APE : {companyInfo.ape}</p>
            {companyInfo.vatExempt && (
              <p className="font-medium text-neu-text">{invoiceLegalMentions.tvaExempt}</p>
            )}
            {companyInfo.tvaNumber && (
              <p>N° TVA intracommunautaire : {companyInfo.tvaNumber}</p>
            )}
            {companyInfo.rcs && <p>{companyInfo.rcs}</p>}
            {(companyInfo.email || companyInfo.phone) && (
              <p>
                {[companyInfo.email, companyInfo.phone].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-neu-accent-2">
            Facture n° {invoice.number}
          </p>
          <p className="mt-1 text-xs font-semibold text-neu-text">
            {invoiceKindLabels[invoice.kind]}
          </p>
          <p className="mt-2 text-xs text-neu-muted">
            Date d&apos;émission : {formatQuoteDate(invoice.date)}
          </p>
          <p className="text-xs text-neu-muted">
            Échéance : {formatQuoteDate(invoice.dueDate)}
          </p>
          <p className="mt-2 text-xs text-neu-muted">
            Réf. devis : {invoice.quoteNumber}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-neu-text/8 bg-neu-text/[0.02] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neu-muted">
            Prestataire
          </p>
          <p className="mt-2 text-sm font-semibold">{companyInfo.legalName}</p>
          <p className="text-xs text-neu-muted">{companyInfo.legalForm}</p>
          {getCompanyFullAddress() !== "À compléter" && (
            <p className="text-xs text-neu-muted">{getCompanyFullAddress()}</p>
          )}
          <p className="mt-1 text-xs text-neu-muted">SIRET : {companyInfo.siret}</p>
        </div>

        <div className="rounded-2xl border border-neu-text/8 bg-neu-text/[0.02] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neu-muted">
            Client
          </p>
          <p className="mt-2 text-sm font-semibold">
            {invoice.client.company || invoice.client.name || "—"}
          </p>
          {invoice.client.name && invoice.client.company && (
            <p className="text-xs text-neu-muted">Contact : {invoice.client.name}</p>
          )}
          {invoice.client.address && (
            <p className="mt-1 text-xs text-neu-muted">{invoice.client.address}</p>
          )}
          {invoice.client.email && (
            <p className="text-xs text-neu-muted">{invoice.client.email}</p>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-neu-accent-2/20 bg-neu-accent-2/5 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neu-accent-2">
          Objet
        </p>
        <p className="mt-2 text-sm leading-relaxed">{invoice.object}</p>
      </div>

      <div className="pdf-avoid-break overflow-hidden rounded-2xl border border-neu-text/8">
        <table className="w-full text-sm">
          <thead className="bg-neu-text/[0.04] text-left text-[10px] uppercase tracking-wider text-neu-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Désignation</th>
              <th className="px-4 py-3 font-semibold text-center">Qté</th>
              <th className="px-4 py-3 font-semibold text-right">
                {isTvaExempt ? "P.U." : "P.U. HT"}
              </th>
              <th className="px-4 py-3 font-semibold text-right">
                {isTvaExempt ? "Total" : "Total HT"}
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-t border-neu-text/5">
                <td className="px-4 py-3 leading-relaxed">{item.description}</td>
                <td className="px-4 py-3 text-center text-neu-muted">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-neu-muted">
                  {formatMoney(item.unitPrice)}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatMoney(lineTotal(item))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-sm space-y-2 text-sm">
          <div className="flex justify-between text-neu-muted">
            <span>{isTvaExempt ? "Total" : "Total HT"}</span>
            <span>{formatMoney(subtotalHT)}</span>
          </div>
          {isTvaExempt ? (
            <div className="flex justify-between text-neu-muted">
              <span>TVA</span>
              <span className="text-right text-xs">{invoiceLegalMentions.tvaExempt}</span>
            </div>
          ) : (
            <div className="flex justify-between text-neu-muted">
              <span>TVA ({invoice.tvaRate} %)</span>
              <span>{formatMoney(tvaAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-neu-text/10 pt-2 text-base font-bold">
            <span>Total {isTvaExempt ? "net" : "TTC"}</span>
            <span className="text-neu-accent-2">{formatMoney(totalTTC)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4 border-t border-neu-text/10 pt-6 text-[11px] leading-relaxed text-neu-text/85">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neu-muted">
            Conditions de paiement
          </p>
          <p className="mt-1.5">{invoiceLegalMentions.paymentDeadline}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neu-muted">
            Mention
          </p>
          <p className="mt-1.5">
            {invoice.kind === "acompte"
              ? invoiceLegalMentions.depositNote
              : invoiceLegalMentions.balanceNote}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neu-muted">
            Pénalités de retard
          </p>
          <p className="mt-1.5">{invoiceLegalMentions.latePayment}</p>
        </div>
        {invoice.kind === "solde" && (
          <div className="rounded-xl border border-neu-accent-3/25 bg-neu-accent-3/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neu-accent-3">
              Mise en ligne du site
            </p>
            <p className="mt-1.5">{invoiceLegalMentions.siteUnlock}</p>
          </div>
        )}
      </div>
    </article>
  );
}
