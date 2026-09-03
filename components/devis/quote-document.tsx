"use client";

import { formatMoney } from "@/lib/finances";
import {
  companyInfo,
  formatQuoteDate,
  getCompanyFullAddress,
  getQuoteAmounts,
  getQuoteOptionalItems,
  getQuoteSections,
  getQuoteTitle,
  getSectionSubtotal,
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

function pad(index: number) {
  return String(index + 1).padStart(2, "0");
}

function formatQty(item: QuoteLineItem) {
  const qty = Number.isInteger(item.quantity)
    ? String(item.quantity)
    : item.quantity.toFixed(2).replace(/\.?0+$/, "");
  const unit = item.unit ? quoteUnitShort[item.unit] : "";
  return unit ? `${qty} ${unit}` : qty;
}

function LegalItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="akno-pdf-block">
      <p className="akno-pdf-label">{title}</p>
      <p className="akno-pdf-legal-text">{text}</p>
    </div>
  );
}

export function QuoteDocument({ quote, className }: QuoteDocumentProps) {
  const amounts = getQuoteAmounts(quote);
  const sections = getQuoteSections(quote);
  const optionalItems = getQuoteOptionalItems(quote);
  const subscription = quote.subscription?.enabled ? quote.subscription : undefined;
  const subscriptionTTC = getSubscriptionMonthlyTTC(subscription, quote.tvaRate);
  const isConsumer = quote.clientType === "consumer";
  const isTvaExempt = quote.tvaRate === 0;
  const title = getQuoteTitle(quote);
  const hasAddress = getCompanyFullAddress() !== "À compléter";
  const balancePercent = 100 - amounts.depositPercent;
  const priceHeader = isTvaExempt ? "P.U." : "P.U. HT";
  const totalHeader = isTvaExempt ? "Total" : "Total HT";

  return (
    <article id="quote-document" className={cn("akno-pdf-document", className)}>
      {quote.status === "brouillon" && (
        <div className="akno-pdf-watermark" aria-hidden="true">
          BROUILLON
        </div>
      )}

      <header className="pdf-avoid-break akno-pdf-block akno-pdf-header">
        <div className="akno-pdf-header-left">
          <img
            src="/logo-akno-plus.png"
            alt="AKNO"
            width={140}
            height={52}
            className="akno-pdf-header-logo"
            crossOrigin="anonymous"
          />
          <p className="akno-pdf-party-name" style={{ marginTop: 10, fontSize: 11 }}>
            {companyInfo.legalName}
          </p>
          <p className="akno-pdf-muted" style={{ fontSize: 10, margin: "2px 0 0" }}>
            {companyInfo.tagline}
          </p>
        </div>
        <div className="akno-pdf-header-right">
          <p className="akno-pdf-header-title">DEVIS</p>
          <p className="akno-pdf-header-number">{quote.number || "DEV-XXXX-XXX"}</p>
        </div>
      </header>

      <div className="akno-pdf-meta pdf-avoid-break akno-pdf-block">
        <div className="akno-pdf-meta-cell">
          <p className="akno-pdf-label">Émis le</p>
          <p className="akno-pdf-meta-value">{formatQuoteDate(quote.date)}</p>
        </div>
        <div className="akno-pdf-meta-cell">
          <p className="akno-pdf-label">Valable jusqu&apos;au</p>
          <p className="akno-pdf-meta-value">{formatQuoteDate(quote.validUntil)}</p>
        </div>
        <div className="akno-pdf-meta-cell akno-pdf-meta-cell-right">
          <p className="akno-pdf-label">Montant total</p>
          <p className="akno-pdf-meta-total">{formatMoney(amounts.totalTTC)}</p>
        </div>
      </div>

      <section className="pdf-avoid-break akno-pdf-block">
        <p className="akno-pdf-label-accent">Proposition commerciale</p>
        <h1 className="akno-pdf-project-title">{title}</h1>
        {quote.title && quote.object && quote.object !== quote.title && (
          <p className="akno-pdf-project-sub">{quote.object}</p>
        )}
      </section>

      <section className="pdf-avoid-break akno-pdf-block akno-pdf-parties">
        <div className="akno-pdf-party">
          <p className="akno-pdf-label">De</p>
          <p className="akno-pdf-party-name">{companyInfo.name}</p>
          <p style={{ fontSize: 11, fontWeight: 500, margin: "2px 0 0" }}>{companyInfo.legalName}</p>
          <p className="akno-pdf-muted" style={{ fontSize: 10.5, margin: "2px 0 0" }}>
            {companyInfo.legalForm}
          </p>
          <div className="akno-pdf-party-lines">
            {hasAddress && <p>{getCompanyFullAddress()}</p>}
            <p>{companyInfo.email}</p>
            <p>{companyInfo.phone}</p>
            <p style={{ paddingTop: 4 }}>
              SIRET {companyInfo.siret} · APE {companyInfo.ape}
            </p>
          </div>
        </div>

        <div className="akno-pdf-party akno-pdf-party-client">
          <p className="akno-pdf-label-accent">
            Pour {isConsumer ? "(particulier)" : "(professionnel)"}
          </p>
          <p className="akno-pdf-party-name">{quote.client.company || quote.client.name || "—"}</p>
          {quote.client.name && quote.client.company && (
            <p style={{ fontSize: 11, fontWeight: 500, margin: "2px 0 0" }}>{quote.client.name}</p>
          )}
          <div className="akno-pdf-party-lines">
            {quote.client.address && <p style={{ whiteSpace: "pre-line" }}>{quote.client.address}</p>}
            {quote.client.email && <p>{quote.client.email}</p>}
            {quote.client.phone && <p>{quote.client.phone}</p>}
            {(quote.client.siret || quote.client.tvaNumber) && (
              <p style={{ paddingTop: 4 }}>
                {[
                  quote.client.siret && `SIRET ${quote.client.siret}`,
                  quote.client.tvaNumber && `TVA ${quote.client.tvaNumber}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>
      </section>

      {quote.introduction && (
        <section className="pdf-avoid-break akno-pdf-block">
          <p className="akno-pdf-label">Contexte &amp; objectifs</p>
          <p className="akno-pdf-intro">{quote.introduction}</p>
        </section>
      )}

      <section>
        <div className="akno-pdf-section-head">
          <div className="akno-pdf-section-head-table">
            <span className="akno-pdf-label" style={{ margin: 0 }}>
              Détail des prestations
            </span>
            <span>
              Prix en euros{isTvaExempt ? " — TVA non applicable" : " HT"}
            </span>
          </div>
        </div>

        {sections.length === 0 && (
          <p className="akno-pdf-muted" style={{ textAlign: "center", padding: "32px 0" }}>
            Aucune prestation renseignée.
          </p>
        )}

        {sections.map((section, index) => {
          const included = section.items.filter((item) => !item.optional);
          if (included.length === 0) return null;
          const subtotal = getSectionSubtotal(section);

          return (
            <div key={section.id} className="akno-pdf-block akno-pdf-phase">
              <div className="akno-pdf-phase-title-row">
                <span className="akno-pdf-phase-num">{pad(index)}</span>
                <div className="akno-pdf-phase-text">
                  <h2 className="akno-pdf-phase-name">{section.title || `Lot ${pad(index)}`}</h2>
                  {section.description && (
                    <p className="akno-pdf-phase-desc">{section.description}</p>
                  )}
                </div>
              </div>

              <table className="akno-pdf-table">
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th className="col-qty">Qté</th>
                    <th className="col-price">{priceHeader}</th>
                    <th className="col-total">{totalHeader}</th>
                  </tr>
                </thead>
                <tbody>
                  {included.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <p className="akno-pdf-line-title">{item.description}</p>
                        {item.details && <p className="akno-pdf-line-detail">{item.details}</p>}
                      </td>
                      <td className="col-qty">{formatQty(item)}</td>
                      <td className="col-price">{formatMoney(item.unitPrice)}</td>
                      <td className="col-total">{formatMoney(lineTotal(item))}</td>
                    </tr>
                  ))}
                </tbody>
                {sections.length > 1 && (
                  <tfoot>
                    <tr className="akno-pdf-subtotal-row">
                      <td colSpan={3} style={{ textAlign: "right", paddingRight: 8 }}>
                        Sous-total {section.title || `lot ${pad(index)}`}
                      </td>
                      <td className="col-total">{formatMoney(subtotal)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          );
        })}
      </section>

      {optionalItems.length > 0 && (
        <section className="pdf-avoid-break akno-pdf-block akno-pdf-options">
          <div className="akno-pdf-section-head-table" style={{ marginBottom: 8 }}>
            <span className="akno-pdf-label" style={{ margin: 0 }}>
              Options proposées
            </span>
            <span style={{ fontSize: 9.5, color: "#697386" }}>
              Non incluses dans le total — sur demande
            </span>
          </div>
          <table className="akno-pdf-table">
            <tbody>
              {optionalItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <p className="akno-pdf-line-title">{item.description}</p>
                    {item.details && <p className="akno-pdf-line-detail">{item.details}</p>}
                  </td>
                  <td className="col-qty">{formatQty(item)}</td>
                  <td className="col-price">{formatMoney(item.unitPrice)}</td>
                  <td className="col-total">+ {formatMoney(lineTotal(item))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="pdf-avoid-break akno-pdf-block akno-pdf-summary-row">
        <div className="akno-pdf-schedule">
          <p className="akno-pdf-label">Échéancier de paiement</p>

          <div className="akno-pdf-pay-row">
            <div className="akno-pdf-pay-label">
              <p className="akno-pdf-pay-title">
                Acompte — {amounts.depositPercent} % à la signature
              </p>
              <p className="akno-pdf-pay-sub">Déclenche le démarrage du projet.</p>
            </div>
            <div className="akno-pdf-pay-amount">{formatMoney(amounts.depositAmount)}</div>
          </div>

          {balancePercent > 0 && (
            <div className="akno-pdf-pay-row">
              <div className="akno-pdf-pay-label">
                <p className="akno-pdf-pay-title">
                  Solde — {balancePercent} % à la livraison
                </p>
                <p className="akno-pdf-pay-sub">
                  Mise en ligne et remise des accès après encaissement.
                </p>
              </div>
              <div className="akno-pdf-pay-amount">{formatMoney(amounts.balanceAmount)}</div>
            </div>
          )}

          {subscription && subscription.monthlyPriceHT > 0 && (
            <div className="akno-pdf-subscription">
              <p className="akno-pdf-label-accent">Puis, chaque mois</p>
              <div className="akno-pdf-pay-row" style={{ marginBottom: 0 }}>
                <div className="akno-pdf-pay-label">
                  <p style={{ fontSize: 10.5, lineHeight: 1.45, margin: "4px 0 0" }}>
                    {subscription.label}
                    {subscription.commitmentMonths ? (
                      <span className="akno-pdf-muted">
                        {" "}
                        · engagement {subscription.commitmentMonths} mois
                      </span>
                    ) : (
                      <span className="akno-pdf-muted"> · sans engagement</span>
                    )}
                  </p>
                </div>
                <div className="akno-pdf-pay-amount akno-pdf-accent">
                  {formatMoney(subscriptionTTC)}
                  <span style={{ fontSize: 9, fontWeight: 500, color: "#697386" }}> / mois</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="akno-pdf-recap-box">
          <p className="akno-pdf-label" style={{ color: "rgba(255,255,255,0.6)" }}>
            Récapitulatif
          </p>

          <div className="akno-pdf-recap-line akno-pdf-white-muted">
            <span>Sous-total</span>
            <span>{formatMoney(amounts.subtotalHT)}</span>
          </div>

          {amounts.discountAmount > 0 && (
            <div className="akno-pdf-recap-line" style={{ color: "#86efac" }}>
              <span>
                Remise
                {quote.discount?.type === "percent" ? ` (${quote.discount.value} %)` : ""}
                {quote.discount?.label ? ` — ${quote.discount.label}` : ""}
              </span>
              <span>− {formatMoney(amounts.discountAmount)}</span>
            </div>
          )}

          {isTvaExempt ? (
            <div className="akno-pdf-recap-line">
              <span className="akno-pdf-white-muted">TVA</span>
              <span className="akno-pdf-recap-tva-note">Non applicable (art. 293 B)</span>
            </div>
          ) : (
            <div className="akno-pdf-recap-line akno-pdf-white-muted">
              <span>TVA ({quote.tvaRate} %)</span>
              <span>{formatMoney(amounts.tvaAmount)}</span>
            </div>
          )}

          <div className="akno-pdf-recap-divider">
            <p className="akno-pdf-recap-total-label">
              Total {isTvaExempt ? "net" : "TTC"}
            </p>
            <p className="akno-pdf-recap-total-value">{formatMoney(amounts.totalTTC)}</p>
          </div>
        </div>
      </section>

      <section className="akno-pdf-conditions">
        <div className="akno-pdf-condition-cell akno-pdf-block">
          <p className="akno-pdf-label">Délai &amp; planning</p>
          <p className="akno-pdf-body-text">{quote.deliveryDelay}</p>
          <p className="akno-pdf-legal-text" style={{ marginTop: 8 }}>
            {legalMentions.clientObligations}
          </p>
        </div>
        <div className="akno-pdf-condition-cell akno-pdf-block">
          <p className="akno-pdf-label">Conditions de paiement</p>
          <p className="akno-pdf-body-text">{quote.paymentTerms}</p>
        </div>
        {quote.notes && (
          <div className="akno-pdf-condition-full akno-pdf-block">
            <p className="akno-pdf-label">Périmètre &amp; exclusions</p>
            <p className="akno-pdf-body-text">{quote.notes}</p>
          </div>
        )}
      </section>

      <section className="akno-pdf-block" style={{ marginTop: 28, borderTop: "1px solid rgba(10,37,64,0.1)", paddingTop: 16 }}>
        <p className="akno-pdf-label">Conditions générales</p>
        <div className="akno-pdf-legal-grid">
          <div className="akno-pdf-legal-row">
            <div className="akno-pdf-legal-cell"><LegalItem title="Validité" text={legalMentions.validity} /></div>
            <div className="akno-pdf-legal-cell"><LegalItem title="Retours & modifications" text={legalMentions.revisions} /></div>
          </div>
          <div className="akno-pdf-legal-row">
            <div className="akno-pdf-legal-cell"><LegalItem title="Règlement" text={legalMentions.paymentDeadline} /></div>
            <div className="akno-pdf-legal-cell"><LegalItem title="Retard de paiement" text={legalMentions.latePayment} /></div>
          </div>
          <div className="akno-pdf-legal-row">
            <div className="akno-pdf-legal-cell"><LegalItem title="Propriété intellectuelle" text={legalMentions.intellectualProperty} /></div>
            <div className="akno-pdf-legal-cell"><LegalItem title="Hébergement & tiers" text={legalMentions.hosting} /></div>
          </div>
          <div className="akno-pdf-legal-row">
            <div className="akno-pdf-legal-cell"><LegalItem title="Données personnelles" text={legalMentions.rgpd} /></div>
            {isTvaExempt ? (
              <div className="akno-pdf-legal-cell"><LegalItem title="Régime fiscal" text={legalMentions.tvaExempt} /></div>
            ) : isConsumer ? (
              <div className="akno-pdf-legal-cell"><LegalItem title="Droit de rétractation" text={legalMentions.withdrawal} /></div>
            ) : (
              <div className="akno-pdf-legal-cell"><LegalItem title="Litiges" text={legalMentions.dispute} /></div>
            )}
          </div>
          {isConsumer && (
            <div className="akno-pdf-legal-row">
              <div className="akno-pdf-legal-cell">
                <LegalItem
                  title="Médiation"
                  text={`${legalMentions.mediation}${companyInfo.mediator.name ? ` ${companyInfo.mediator.name} — ${companyInfo.mediator.url}` : ""}`}
                />
              </div>
              <div className="akno-pdf-legal-cell" />
            </div>
          )}
        </div>
      </section>

      <section className="pdf-avoid-break akno-pdf-block akno-pdf-signature">
        <div className="akno-pdf-signature-top">
          <div className="akno-pdf-signature-intro">
            <p className="akno-pdf-label-accent">Bon pour accord</p>
            <p className="akno-pdf-body-text">{legalMentions.acceptance}</p>
          </div>
          <div className="akno-pdf-signature-amount">
            <p className="akno-pdf-label">Montant accepté</p>
            <p style={{ fontSize: 16, fontWeight: 700, margin: "4px 0 0" }}>
              {formatMoney(amounts.totalTTC)}
            </p>
          </div>
        </div>

        <div className="akno-pdf-signature-fields">
          <div className="akno-pdf-signature-field">
            <p className="akno-pdf-muted" style={{ fontSize: 9.5 }}>Fait à</p>
            <div className="akno-pdf-signature-line" />
          </div>
          <div className="akno-pdf-signature-field">
            <p className="akno-pdf-muted" style={{ fontSize: 9.5 }}>Le</p>
            <div className="akno-pdf-signature-line" />
          </div>
          <div className="akno-pdf-signature-field">
            <p className="akno-pdf-muted" style={{ fontSize: 9.5 }}>Nom &amp; qualité du signataire</p>
            <div className="akno-pdf-signature-line" />
          </div>
        </div>

        <div className="akno-pdf-signature-boxes">
          <div className="akno-pdf-signature-box-cell">
            <p className="akno-pdf-muted" style={{ fontSize: 9.5 }}>
              Signature du client, précédée de « Bon pour accord »
            </p>
            <div className="akno-pdf-signature-box" />
          </div>
          <div className="akno-pdf-signature-box-cell">
            <p className="akno-pdf-muted" style={{ fontSize: 9.5 }}>Pour {companyInfo.name}</p>
            <div className="akno-pdf-signature-box" style={{ display: "table" }}>
              <span style={{ display: "table-cell", verticalAlign: "bottom", fontSize: 10, color: "#697386" }}>
                {companyInfo.legalName}
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer className="akno-pdf-footer">
        <div className="akno-pdf-footer-left">
          {companyInfo.legalName} · {companyInfo.legalForm} · SIRET {companyInfo.siret} · APE{" "}
          {companyInfo.ape}
          {companyInfo.vatExempt ? " · TVA non applicable, art. 293 B du CGI" : ""}
        </div>
        <div className="akno-pdf-footer-right">{quote.number || "DEV-XXXX-XXX"}</div>
      </footer>
    </article>
  );
}
