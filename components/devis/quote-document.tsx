"use client";

import { Fragment } from "react";
import { formatMoney } from "@/lib/finances";
import {
  companyInfo,
  formatQuoteDate,
  getCompanyFullAddress,
  getQuoteAmounts,
  getQuoteSections,
  getSubscriptionMonthlyTTC,
  legalMentions,
  lineTotal,
  quoteUnitShort,
  type Quote,
  type QuoteLineItem,
} from "@/lib/quotes";
import { cn } from "@/lib/utils";

type QuoteDocumentQuote = Omit<Quote, "id" | "amount"> & Partial<Pick<Quote, "id" | "amount">>;

type QuoteDocumentProps = {
  quote: QuoteDocumentQuote;
  className?: string;
};

function formatQtyUnit(item: QuoteLineItem) {
  const qty = Number.isInteger(item.quantity)
    ? String(item.quantity)
    : item.quantity.toFixed(2).replace(/\.?0+$/, "");
  const unit = item.unit ? quoteUnitShort[item.unit] : "";
  return unit && unit !== "forf." ? `${qty} ${unit}` : qty;
}

function paymentSummary(depositPercent: number) {
  const balance = 100 - depositPercent;
  if (depositPercent >= 100) return "Paiement comptant à la signature.";
  if (depositPercent <= 0) return "Paiement à la livraison.";
  return `${depositPercent} % à la signature, solde (${balance} %) à la livraison.`;
}

export function QuoteDocument({ quote, className }: QuoteDocumentProps) {
  const amounts = getQuoteAmounts(quote);
  const sections = getQuoteSections(quote);
  const subscription = quote.subscription?.enabled ? quote.subscription : undefined;
  const subscriptionTTC = getSubscriptionMonthlyTTC(subscription, quote.tvaRate);
  const isTvaExempt = quote.tvaRate === 0;
  const hasAddress = getCompanyFullAddress() !== "À compléter";
  const showPhases = sections.length > 1;

  const clientLines = [
    quote.client.company || quote.client.name,
    quote.client.name && quote.client.company ? quote.client.name : null,
    quote.client.address?.replace(/\n/g, ", "),
    quote.client.email,
    quote.client.phone,
  ].filter(Boolean);

  const fromLines = [
    hasAddress ? getCompanyFullAddress() : null,
    companyInfo.phone ? `Tél. : ${companyInfo.phone}` : null,
    companyInfo.email,
    `SIRET ${companyInfo.siret}`,
  ].filter(Boolean);

  return (
    <article id="quote-document" className={cn("akno-pdf-document", className)}>
      {quote.status === "brouillon" && (
        <div className="akno-pdf-watermark" aria-hidden="true">
          BROUILLON
        </div>
      )}

      <div className="akno-pdf-inner">
        {/* Titre + n° + date */}
        <table className="akno-pdf-title-row">
          <tbody>
            <tr>
              <td>
                <p className="akno-pdf-doc-title">Devis</p>
              </td>
              <td className="akno-pdf-doc-meta">
                <strong>{quote.number || "DEV-XXXX-XXX"}</strong>
                Émis le {formatQuoteDate(quote.date)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* De / Pour */}
        <table className="akno-pdf-parties">
          <tbody>
            <tr>
              <td>
                <img
                  src="/logo-akno-plus.png"
                  alt="AKNO"
                  width={120}
                  height={40}
                  className="akno-pdf-logo"
                  crossOrigin="anonymous"
                />
                <p className="akno-pdf-from-name">{companyInfo.name}</p>
                <p className="akno-pdf-from-lines">
                  {fromLines.map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </p>
              </td>
              <td>
                <div className="akno-pdf-to-box">
                  <p className="akno-pdf-to-name">
                    {quote.client.company || quote.client.name || "—"}
                  </p>
                  <p className="akno-pdf-to-lines">
                    {clientLines.slice(1).map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Lignes */}
        <table className="akno-pdf-lines">
          <thead>
            <tr>
              <th style={{ width: "40%" }}>Description</th>
              <th className="num" style={{ width: "14%" }}>
                {isTvaExempt ? "Prix unit." : "Prix unit. HT"}
              </th>
              <th className="num" style={{ width: "12%" }}>
                Qté / Unité
              </th>
              <th className="num" style={{ width: "14%" }}>
                {isTvaExempt ? "Total" : "Total HT"}
              </th>
              {!isTvaExempt && (
                <th className="num" style={{ width: "10%" }}>
                  TVA
                </th>
              )}
              <th className="num" style={{ width: "14%" }}>
                {isTvaExempt ? "Total" : "Total TTC"}
              </th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => {
              const lines = section.items.filter((i) => !i.optional && i.description.trim());
              if (lines.length === 0) return null;

              return (
                <Fragment key={section.id}>
                  {showPhases && section.title && (
                    <tr className="phase-row">
                      <td colSpan={isTvaExempt ? 5 : 6}>{section.title}</td>
                    </tr>
                  )}
                  {lines.map((item) => {
                    const ht = lineTotal(item);
                    const tva = ht * (quote.tvaRate / 100);
                    const ttc = ht + tva;
                    return (
                      <tr key={item.id}>
                        <td className="desc">{item.description}</td>
                        <td className="num">{formatMoney(item.unitPrice)}</td>
                        <td className="num">{formatQtyUnit(item)}</td>
                        <td className="num">{formatMoney(ht)}</td>
                        {!isTvaExempt && (
                          <td className="num">
                            {quote.tvaRate} %
                            <br />
                            <span className="akno-pdf-muted" style={{ fontSize: 9 }}>
                              {formatMoney(tva)}
                            </span>
                          </td>
                        )}
                        <td className="num">
                          <strong>{formatMoney(isTvaExempt ? ht : ttc)}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Pied : conditions + totaux + signature */}
        <table className="akno-pdf-footer-row">
          <tbody>
            <tr>
              <td>
                <p className="akno-pdf-foot-label">Conditions de paiement</p>
                <p className="akno-pdf-foot-text">
                  {paymentSummary(amounts.depositPercent)}
                  {"\n"}
                  {quote.paymentTerms?.split("\n").slice(-3).join("\n") || `IBAN : ${companyInfo.iban}`}
                </p>

                <p className="akno-pdf-foot-label">Mention</p>
                <p className="akno-pdf-foot-text">
                  Bon pour accord — signature du client, date et mention manuscrite ou
                  électronique « Bon pour accord ».
                </p>

                {isTvaExempt && (
                  <>
                    <p className="akno-pdf-foot-label">Régime fiscal</p>
                    <p className="akno-pdf-foot-text">{legalMentions.tvaExempt}</p>
                  </>
                )}
              </td>

              <td>
                <table className="akno-pdf-totals">
                  <tbody>
                    <tr>
                      <td>{isTvaExempt ? "Total" : "Total HT"}</td>
                      <td>{formatMoney(amounts.netHT)}</td>
                    </tr>
                    {!isTvaExempt && (
                      <tr>
                        <td>TVA ({quote.tvaRate} %)</td>
                        <td>{formatMoney(amounts.tvaAmount)}</td>
                      </tr>
                    )}
                    {amounts.discountAmount > 0 && (
                      <tr>
                        <td>Remise</td>
                        <td>− {formatMoney(amounts.discountAmount)}</td>
                      </tr>
                    )}
                    <tr className="grand-total">
                      <td>{isTvaExempt ? "Total net" : "Total TTC"}</td>
                      <td>{formatMoney(amounts.totalTTC)}</td>
                    </tr>
                  </tbody>
                </table>

                <p className="akno-pdf-validity">
                  Valide jusqu&apos;au {formatQuoteDate(quote.validUntil)}
                </p>

                <p className="akno-pdf-sign-label">
                  Signature, date et mention « Bon pour accord et acceptation des CGV ».
                </p>
                <div className="akno-pdf-sign-box" />
              </td>
            </tr>
          </tbody>
        </table>

        {subscription && subscription.monthlyPriceHT > 0 && (
          <p className="akno-pdf-sub-note">
            + Abonnement : {subscription.label} — {formatMoney(subscriptionTTC)} / mois
          </p>
        )}

        <p className="akno-pdf-legal-footer">
          {companyInfo.legalName} · {companyInfo.legalForm} · SIRET {companyInfo.siret} · APE{" "}
          {companyInfo.ape}
        </p>
      </div>
    </article>
  );
}
