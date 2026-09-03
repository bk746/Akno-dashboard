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

function LegalCell({ title, text }: { title: string; text: string }) {
  return (
    <td>
      <p className="akno-pdf-label" style={{ marginBottom: 4 }}>{title}</p>
      <p className="akno-pdf-legal-text">{text}</p>
    </td>
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

      <div className="akno-pdf-inner">
        {/* En-tête */}
        <table className="akno-pdf-layout-table akno-pdf-block pdf-avoid-break">
          <tbody>
            <tr>
              <td>
                <img
                  src="/logo-akno-plus.png"
                  alt="AKNO"
                  width={140}
                  height={52}
                  className="akno-pdf-header-logo"
                  crossOrigin="anonymous"
                />
                <p style={{ fontSize: 11, fontWeight: 600, margin: "8px 0 0" }}>{companyInfo.legalName}</p>
                <p className="akno-pdf-muted" style={{ fontSize: 10, margin: "2px 0 0" }}>{companyInfo.tagline}</p>
              </td>
              <td style={{ width: 180 }}>
                <p className="akno-pdf-header-title">DEVIS</p>
                <p className="akno-pdf-header-number">{quote.number || "DEV-XXXX-XXX"}</p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Dates */}
        <table className="akno-pdf-meta akno-pdf-layout-table akno-pdf-block pdf-avoid-break">
          <tbody>
            <tr>
              <td style={{ width: "33%" }}>
                <p className="akno-pdf-label">Émis le</p>
                <p className="akno-pdf-meta-value">{formatQuoteDate(quote.date)}</p>
              </td>
              <td style={{ width: "33%" }}>
                <p className="akno-pdf-label">Valable jusqu&apos;au</p>
                <p className="akno-pdf-meta-value">{formatQuoteDate(quote.validUntil)}</p>
              </td>
              <td style={{ width: "34%", textAlign: "right" }}>
                <p className="akno-pdf-label">Montant total</p>
                <p className="akno-pdf-meta-total">{formatMoney(amounts.totalTTC)}</p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Titre */}
        <div className="akno-pdf-block pdf-avoid-break">
          <p className="akno-pdf-label-accent">Proposition commerciale</p>
          <h1 className="akno-pdf-project-title">{title}</h1>
          {quote.title && quote.object && quote.object !== quote.title && (
            <p className="akno-pdf-project-sub">{quote.object}</p>
          )}
        </div>

        <div className="akno-pdf-spacer" />

        {/* De / Pour */}
        <table className="akno-pdf-layout-table akno-pdf-block pdf-avoid-break">
          <tbody>
            <tr>
              <td style={{ width: "50%" }}>
                <div className="akno-pdf-card">
                  <p className="akno-pdf-label">De</p>
                  <p className="akno-pdf-party-name">{companyInfo.name}</p>
                  <p style={{ fontSize: 11, fontWeight: 500, margin: "2px 0 0" }}>{companyInfo.legalName}</p>
                  <p className="akno-pdf-muted" style={{ fontSize: 10.5, margin: "2px 0 0" }}>{companyInfo.legalForm}</p>
                  <div className="akno-pdf-party-lines">
                    {hasAddress && <p>{getCompanyFullAddress()}</p>}
                    <p>{companyInfo.email}</p>
                    <p>{companyInfo.phone}</p>
                    <p style={{ marginTop: 4 }}>SIRET {companyInfo.siret} · APE {companyInfo.ape}</p>
                  </div>
                </div>
              </td>
              <td className="akno-pdf-gap-col" />
              <td style={{ width: "50%" }}>
                <div className="akno-pdf-card akno-pdf-card-client">
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
                      <p style={{ marginTop: 4 }}>
                        {[quote.client.siret && `SIRET ${quote.client.siret}`, quote.client.tvaNumber && `TVA ${quote.client.tvaNumber}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {quote.introduction && (
          <>
            <div className="akno-pdf-spacer" />
            <div className="akno-pdf-block pdf-avoid-break">
              <p className="akno-pdf-label">Contexte &amp; objectifs</p>
              <p className="akno-pdf-body-text">{quote.introduction}</p>
            </div>
          </>
        )}

        {/* Prestations */}
        <div className="akno-pdf-section-head">
          <table className="akno-pdf-layout-table">
            <tbody>
              <tr>
                <td><p className="akno-pdf-label" style={{ margin: 0 }}>Détail des prestations</p></td>
                <td style={{ textAlign: "right", fontSize: 9.5, color: "#697386" }}>
                  Prix en euros{isTvaExempt ? " — TVA non applicable" : " HT"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {sections.map((section, index) => {
          const included = section.items.filter((item) => !item.optional);
          if (included.length === 0) return null;
          const subtotal = getSectionSubtotal(section);

          return (
            <div key={section.id} className="akno-pdf-phase akno-pdf-block">
              <table className="akno-pdf-layout-table">
                <tbody>
                  <tr>
                    <td className="akno-pdf-phase-num">{pad(index)}</td>
                    <td>
                      <p className="akno-pdf-phase-name">{section.title || `Lot ${pad(index)}`}</p>
                      {section.description && <p className="akno-pdf-phase-desc">{section.description}</p>}
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="akno-pdf-items-table">
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th className="c-qty">Qté</th>
                    <th className="c-price">{priceHeader}</th>
                    <th className="c-total">{totalHeader}</th>
                  </tr>
                </thead>
                <tbody>
                  {included.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <p className="akno-pdf-line-title">{item.description}</p>
                        {item.details && <p className="akno-pdf-line-detail">{item.details}</p>}
                      </td>
                      <td className="c-qty">{formatQty(item)}</td>
                      <td className="c-price">{formatMoney(item.unitPrice)}</td>
                      <td className="c-total">{formatMoney(lineTotal(item))}</td>
                    </tr>
                  ))}
                  {sections.length > 1 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "right", fontSize: 10, fontWeight: 600, color: "#697386", paddingTop: 6 }}>
                        Sous-total {section.title || `lot ${pad(index)}`}
                      </td>
                      <td className="c-total">{formatMoney(subtotal)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })}

        {optionalItems.length > 0 && (
          <div className="akno-pdf-options akno-pdf-block pdf-avoid-break">
            <table className="akno-pdf-layout-table" style={{ marginBottom: 8 }}>
              <tbody>
                <tr>
                  <td><p className="akno-pdf-label" style={{ margin: 0 }}>Options proposées</p></td>
                  <td style={{ textAlign: "right", fontSize: 9.5, color: "#697386" }}>Non incluses — sur demande</td>
                </tr>
              </tbody>
            </table>
            <table className="akno-pdf-items-table">
              <tbody>
                {optionalItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <p className="akno-pdf-line-title">{item.description}</p>
                      {item.details && <p className="akno-pdf-line-detail">{item.details}</p>}
                    </td>
                    <td className="c-qty">{formatQty(item)}</td>
                    <td className="c-price">{formatMoney(item.unitPrice)}</td>
                    <td className="c-total">+ {formatMoney(lineTotal(item))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="akno-pdf-spacer" />

        {/* Échéancier + récap */}
        <table className="akno-pdf-layout-table akno-pdf-block pdf-avoid-break">
          <tbody>
            <tr>
              <td style={{ width: "58%" }}>
                <div className="akno-pdf-schedule">
                  <p className="akno-pdf-label">Échéancier de paiement</p>
                  <table className="akno-pdf-pay-table">
                    <tbody>
                      <tr>
                        <td>
                          <p className="akno-pdf-pay-title">Acompte — {amounts.depositPercent} % à la signature</p>
                          <p className="akno-pdf-pay-sub">Déclenche le démarrage du projet.</p>
                        </td>
                        <td className="akno-pdf-pay-amt">{formatMoney(amounts.depositAmount)}</td>
                      </tr>
                      {balancePercent > 0 && (
                        <tr>
                          <td>
                            <p className="akno-pdf-pay-title">Solde — {balancePercent} % à la livraison</p>
                            <p className="akno-pdf-pay-sub">Mise en ligne après encaissement.</p>
                          </td>
                          <td className="akno-pdf-pay-amt">{formatMoney(amounts.balanceAmount)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {subscription && subscription.monthlyPriceHT > 0 && (
                    <div className="akno-pdf-subscription">
                      <p className="akno-pdf-label-accent">Puis, chaque mois</p>
                      <table className="akno-pdf-layout-table">
                        <tbody>
                          <tr>
                            <td>
                              <p style={{ fontSize: 10.5, lineHeight: 1.45, margin: "4px 0 0" }}>
                                {subscription.label}
                                <span className="akno-pdf-muted">
                                  {subscription.commitmentMonths
                                    ? ` · engagement ${subscription.commitmentMonths} mois`
                                    : " · sans engagement"}
                                </span>
                              </p>
                            </td>
                            <td className="akno-pdf-pay-amt akno-pdf-accent">
                              {formatMoney(subscriptionTTC)}<span style={{ fontSize: 9, color: "#697386" }}> /mois</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </td>
              <td className="akno-pdf-gap-col-lg" />
              <td style={{ width: "42%" }}>
                <div className="akno-pdf-recap-box">
                  <p className="akno-pdf-label">Récapitulatif</p>
                  <table className="akno-pdf-recap-table">
                    <tbody>
                      <tr><td>Sous-total</td><td>{formatMoney(amounts.subtotalHT)}</td></tr>
                      {amounts.discountAmount > 0 && (
                        <tr><td style={{ color: "#09825d" }}>Remise</td><td style={{ color: "#09825d" }}>− {formatMoney(amounts.discountAmount)}</td></tr>
                      )}
                      {isTvaExempt ? (
                        <tr>
                          <td>TVA</td>
                          <td><span className="akno-pdf-recap-tva">Non applicable (art. 293 B)</span></td>
                        </tr>
                      ) : (
                        <tr><td>TVA ({quote.tvaRate} %)</td><td>{formatMoney(amounts.tvaAmount)}</td></tr>
                      )}
                    </tbody>
                  </table>
                  <div className="akno-pdf-recap-divider">
                    <p className="akno-pdf-recap-total-label">Total {isTvaExempt ? "net" : "TTC"}</p>
                    <p className="akno-pdf-recap-total-value">{formatMoney(amounts.totalTTC)}</p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="akno-pdf-spacer" />

        {/* Conditions — vraies tables, périmètre en bloc séparé */}
        <table className="akno-pdf-layout-table akno-pdf-block pdf-avoid-break">
          <tbody>
            <tr className="akno-pdf-info-row">
              <td>
                <p className="akno-pdf-label">Délai &amp; planning</p>
                <p className="akno-pdf-body-text">{quote.deliveryDelay}</p>
                <p className="akno-pdf-legal-text" style={{ marginTop: 8 }}>{legalMentions.clientObligations}</p>
              </td>
              <td>
                <p className="akno-pdf-label">Conditions de paiement</p>
                <p className="akno-pdf-body-text">{quote.paymentTerms}</p>
              </td>
            </tr>
          </tbody>
        </table>

        {quote.notes && (
          <div className="akno-pdf-info-block akno-pdf-block pdf-avoid-break">
            <p className="akno-pdf-label">Périmètre &amp; exclusions</p>
            <p className="akno-pdf-body-text">{quote.notes}</p>
          </div>
        )}

        {/* CGV */}
        <div className="akno-pdf-block" style={{ marginTop: 24, borderTop: "1px solid #e3e8ee", paddingTop: 16 }}>
          <p className="akno-pdf-label">Conditions générales</p>
          <table className="akno-pdf-legal-table">
            <tbody>
              <tr>
                <LegalCell title="Validité" text={legalMentions.validity} />
                <LegalCell title="Retours & modifications" text={legalMentions.revisions} />
              </tr>
              <tr>
                <LegalCell title="Règlement" text={legalMentions.paymentDeadline} />
                <LegalCell title="Retard de paiement" text={legalMentions.latePayment} />
              </tr>
              <tr>
                <LegalCell title="Propriété intellectuelle" text={legalMentions.intellectualProperty} />
                <LegalCell title="Hébergement & tiers" text={legalMentions.hosting} />
              </tr>
              <tr>
                <LegalCell title="Données personnelles" text={legalMentions.rgpd} />
                {isTvaExempt ? (
                  <LegalCell title="Régime fiscal" text={legalMentions.tvaExempt} />
                ) : isConsumer ? (
                  <LegalCell title="Droit de rétractation" text={legalMentions.withdrawal} />
                ) : (
                  <LegalCell title="Litiges" text={legalMentions.dispute} />
                )}
              </tr>
              {isConsumer && (
                <tr>
                  <LegalCell
                    title="Médiation"
                    text={`${legalMentions.mediation}${companyInfo.mediator.name ? ` ${companyInfo.mediator.name} — ${companyInfo.mediator.url}` : ""}`}
                  />
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bon pour accord — page dédiée, fond blanc */}
        <div className="akno-pdf-signature akno-pdf-no-break">
          <table className="akno-pdf-layout-table" style={{ marginBottom: 16 }}>
            <tbody>
              <tr>
                <td>
                  <p className="akno-pdf-label-accent">Bon pour accord</p>
                  <p className="akno-pdf-body-text">{legalMentions.acceptance}</p>
                </td>
                <td style={{ width: 140, textAlign: "right", verticalAlign: "top" }}>
                  <p className="akno-pdf-label">Montant accepté</p>
                  <p style={{ fontSize: 16, fontWeight: 700, margin: "4px 0 0" }}>{formatMoney(amounts.totalTTC)}</p>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="akno-pdf-layout-table" style={{ marginBottom: 14 }}>
            <tbody>
              <tr>
                <td><p className="akno-pdf-muted" style={{ fontSize: 9.5 }}>Fait à</p><div className="akno-pdf-signature-line" /></td>
                <td className="akno-pdf-gap-col" />
                <td><p className="akno-pdf-muted" style={{ fontSize: 9.5 }}>Le</p><div className="akno-pdf-signature-line" /></td>
                <td className="akno-pdf-gap-col" />
                <td><p className="akno-pdf-muted" style={{ fontSize: 9.5 }}>Nom &amp; qualité</p><div className="akno-pdf-signature-line" /></td>
              </tr>
            </tbody>
          </table>

          <table className="akno-pdf-layout-table">
            <tbody>
              <tr>
                <td style={{ width: "50%" }}>
                  <p className="akno-pdf-muted" style={{ fontSize: 9.5 }}>Signature client · « Bon pour accord »</p>
                  <div className="akno-pdf-signature-box" />
                </td>
                <td className="akno-pdf-gap-col" />
                <td style={{ width: "50%" }}>
                  <p className="akno-pdf-muted" style={{ fontSize: 9.5 }}>Pour {companyInfo.name}</p>
                  <div className="akno-pdf-signature-box" style={{ padding: "10px 10px 8px" }}>
                    <span style={{ fontSize: 10, color: "#697386" }}>{companyInfo.legalName}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <table className="akno-pdf-footer">
          <tbody>
            <tr>
              <td>
                {companyInfo.legalName} · {companyInfo.legalForm} · SIRET {companyInfo.siret} · APE {companyInfo.ape}
                {companyInfo.vatExempt ? " · TVA non applicable, art. 293 B du CGI" : ""}
              </td>
              <td>{quote.number || "DEV-XXXX-XXX"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}
