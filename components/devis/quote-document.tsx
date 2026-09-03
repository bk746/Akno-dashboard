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
      <p className="text-[9.5px] font-bold uppercase tracking-wider text-neu-text/70">{title}</p>
      <p className="mt-1 text-[10px] leading-relaxed text-neu-text/75">{text}</p>
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
    <article
      id="quote-document"
      className={cn(
        "akno-pdf-document relative bg-white p-6 text-neu-text sm:p-10",
        className,
      )}
    >
      {quote.status === "brouillon" && (
        <div className="akno-pdf-watermark" aria-hidden="true">
          BROUILLON
        </div>
      )}

      {/* ── Bandeau ── */}
      <header className="pdf-avoid-break akno-pdf-block flex items-start justify-between gap-8">
        <div className="flex items-center gap-4">
          <img
            src="/logo-akno-plus.png"
            alt="AKNO"
            width={140}
            height={52}
            className="h-9 w-auto shrink-0 object-contain"
            crossOrigin="anonymous"
          />
          <div className="hidden h-8 w-px bg-neu-text/10 sm:block" />
          <div className="hidden sm:block">
            <p className="text-[11px] font-semibold text-neu-text">{companyInfo.legalName}</p>
            <p className="text-[10px] text-neu-muted">{companyInfo.tagline}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[28px] font-bold leading-none tracking-tight text-neu-text">
            DEVIS
          </p>
          <p className="mt-1.5 font-mono text-xs font-semibold text-neu-accent-2">
            {quote.number || "DEV-XXXX-XXX"}
          </p>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-neu-text/[0.03] px-5 py-3.5 text-[10.5px]">
        <div>
          <p className="font-semibold uppercase tracking-wider text-neu-muted">Émis le</p>
          <p className="mt-0.5 font-medium text-neu-text">{formatQuoteDate(quote.date)}</p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wider text-neu-muted">Valable jusqu&apos;au</p>
          <p className="mt-0.5 font-medium text-neu-text">{formatQuoteDate(quote.validUntil)}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold uppercase tracking-wider text-neu-muted">Montant total</p>
          <p className="mt-0.5 text-sm font-bold text-neu-accent-2">
            {formatMoney(amounts.totalTTC)}
          </p>
        </div>
      </div>

      {/* ── Titre projet ── */}
      <section className="pdf-avoid-break akno-pdf-block mt-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neu-accent-2">
          Proposition commerciale
        </p>
        <h1 className="mt-2 text-[22px] font-bold leading-tight tracking-tight text-neu-text">
          {title}
        </h1>
        {quote.title && quote.object && quote.object !== quote.title && (
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-neu-muted">{quote.object}</p>
        )}
      </section>

      {/* ── Parties ── */}
      <section className="pdf-avoid-break akno-pdf-block mt-7 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-neu-text/8 p-4">
          <p className="text-[9.5px] font-bold uppercase tracking-wider text-neu-muted">De</p>
          <p className="mt-2 text-sm font-bold text-neu-text">{companyInfo.name}</p>
          <p className="text-[11px] font-medium text-neu-text">{companyInfo.legalName}</p>
          <p className="text-[10.5px] text-neu-muted">{companyInfo.legalForm}</p>
          <div className="mt-2.5 space-y-0.5 text-[10.5px] leading-relaxed text-neu-muted">
            {hasAddress && <p>{getCompanyFullAddress()}</p>}
            <p>{companyInfo.email}</p>
            <p>{companyInfo.phone}</p>
            <p className="pt-1">SIRET {companyInfo.siret} · APE {companyInfo.ape}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-neu-accent-2/25 bg-neu-accent-2/[0.04] p-4">
          <p className="text-[9.5px] font-bold uppercase tracking-wider text-neu-accent-2">
            Pour {isConsumer ? "(particulier)" : "(professionnel)"}
          </p>
          <p className="mt-2 text-sm font-bold text-neu-text">
            {quote.client.company || quote.client.name || "—"}
          </p>
          {quote.client.name && quote.client.company && (
            <p className="text-[11px] font-medium text-neu-text">{quote.client.name}</p>
          )}
          <div className="mt-2.5 space-y-0.5 text-[10.5px] leading-relaxed text-neu-muted">
            {quote.client.address && <p className="whitespace-pre-line">{quote.client.address}</p>}
            {quote.client.email && <p>{quote.client.email}</p>}
            {quote.client.phone && <p>{quote.client.phone}</p>}
            {(quote.client.siret || quote.client.tvaNumber) && (
              <p className="pt-1">
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

      {/* ── Introduction ── */}
      {quote.introduction && (
        <section className="pdf-avoid-break akno-pdf-block mt-7">
          <p className="text-[9.5px] font-bold uppercase tracking-wider text-neu-muted">
            Contexte & objectifs
          </p>
          <p className="mt-2 whitespace-pre-line text-[11.5px] leading-relaxed text-neu-text/85">
            {quote.introduction}
          </p>
        </section>
      )}

      {/* ── Prestations par phase ── */}
      <section className="mt-8">
        <div className="flex items-end justify-between border-b-2 border-neu-text pb-2">
          <p className="text-[9.5px] font-bold uppercase tracking-wider text-neu-muted">
            Détail des prestations
          </p>
          <p className="text-[9.5px] text-neu-muted">
            Prix en euros{isTvaExempt ? " — TVA non applicable" : " HT"}
          </p>
        </div>

        {sections.length === 0 && (
          <p className="py-8 text-center text-xs text-neu-muted">Aucune prestation renseignée.</p>
        )}

        {sections.map((section, index) => {
          const included = section.items.filter((item) => !item.optional);
          if (included.length === 0) return null;
          const subtotal = getSectionSubtotal(section);

          return (
            <div key={section.id} className="akno-pdf-block mt-5">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] font-bold text-neu-accent-2">
                  {pad(index)}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[13px] font-bold tracking-tight text-neu-text">
                    {section.title || `Lot ${pad(index)}`}
                  </h2>
                  {section.description && (
                    <p className="mt-0.5 text-[10.5px] leading-relaxed text-neu-muted">
                      {section.description}
                    </p>
                  )}
                </div>
              </div>

              <table className="mt-2.5 w-full text-[11px]">
                <thead>
                  <tr className="text-[9px] uppercase tracking-wider text-neu-muted">
                    <th className="pb-1.5 pl-7 text-left font-semibold">Désignation</th>
                    <th className="w-16 pb-1.5 text-right font-semibold">Qté</th>
                    <th className="w-24 pb-1.5 text-right font-semibold">{priceHeader}</th>
                    <th className="w-24 pb-1.5 text-right font-semibold">{totalHeader}</th>
                  </tr>
                </thead>
                <tbody>
                  {included.map((item) => (
                    <tr key={item.id} className="border-t border-neu-text/8 align-top">
                      <td className="py-2 pl-7 pr-3">
                        <p className="font-medium leading-snug text-neu-text">{item.description}</p>
                        {item.details && (
                          <p className="mt-0.5 text-[10px] leading-relaxed text-neu-muted">
                            {item.details}
                          </p>
                        )}
                      </td>
                      <td className="py-2 text-right text-neu-muted">{formatQty(item)}</td>
                      <td className="py-2 text-right text-neu-muted">{formatMoney(item.unitPrice)}</td>
                      <td className="py-2 text-right font-semibold text-neu-text">
                        {formatMoney(lineTotal(item))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {sections.length > 1 && (
                  <tfoot>
                    <tr className="border-t border-neu-text/8">
                      <td colSpan={3} className="pt-1.5 text-right text-[10px] font-semibold uppercase tracking-wider text-neu-muted">
                        Sous-total {section.title || `lot ${pad(index)}`}
                      </td>
                      <td className="pt-1.5 text-right text-[11px] font-bold text-neu-text">
                        {formatMoney(subtotal)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          );
        })}
      </section>

      {/* ── Options ── */}
      {optionalItems.length > 0 && (
        <section className="pdf-avoid-break akno-pdf-block mt-7 rounded-2xl border border-dashed border-neu-text/20 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-neu-muted">
              Options proposées
            </p>
            <p className="text-[9.5px] text-neu-muted">Non incluses dans le total — sur demande</p>
          </div>
          <table className="mt-2 w-full text-[11px]">
            <tbody>
              {optionalItems.map((item) => (
                <tr key={item.id} className="border-t border-neu-text/8 align-top first:border-0">
                  <td className="py-2 pr-3">
                    <p className="font-medium leading-snug text-neu-text">{item.description}</p>
                    {item.details && (
                      <p className="mt-0.5 text-[10px] leading-relaxed text-neu-muted">{item.details}</p>
                    )}
                  </td>
                  <td className="w-16 py-2 text-right text-neu-muted">{formatQty(item)}</td>
                  <td className="w-24 py-2 text-right text-neu-muted">{formatMoney(item.unitPrice)}</td>
                  <td className="w-24 py-2 text-right font-semibold text-neu-text">
                    + {formatMoney(lineTotal(item))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ── Récapitulatif + échéancier ── */}
      <section className="pdf-avoid-break akno-pdf-block mt-8 grid grid-cols-5 gap-5">
        <div className="col-span-3 rounded-2xl border border-neu-text/8 p-4">
          <p className="text-[9.5px] font-bold uppercase tracking-wider text-neu-muted">
            Échéancier de paiement
          </p>
          <div className="mt-3 space-y-2.5 text-[11px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-neu-text">
                  Acompte — {amounts.depositPercent} % à la signature
                </p>
                <p className="text-[10px] text-neu-muted">
                  Déclenche le démarrage du projet.
                </p>
              </div>
              <p className="shrink-0 font-bold text-neu-text">{formatMoney(amounts.depositAmount)}</p>
            </div>
            {balancePercent > 0 && (
              <div className="flex items-start justify-between gap-3 border-t border-neu-text/8 pt-2.5">
                <div>
                  <p className="font-semibold text-neu-text">
                    Solde — {balancePercent} % à la livraison
                  </p>
                  <p className="text-[10px] text-neu-muted">
                    Mise en ligne et remise des accès après encaissement.
                  </p>
                </div>
                <p className="shrink-0 font-bold text-neu-text">{formatMoney(amounts.balanceAmount)}</p>
              </div>
            )}
          </div>

          {subscription && subscription.monthlyPriceHT > 0 && (
            <div className="mt-4 rounded-xl bg-neu-accent-2/[0.06] p-3">
              <p className="text-[9.5px] font-bold uppercase tracking-wider text-neu-accent-2">
                Puis, chaque mois
              </p>
              <div className="mt-1.5 flex items-start justify-between gap-3">
                <p className="text-[10.5px] leading-relaxed text-neu-text/85">
                  {subscription.label}
                  {subscription.commitmentMonths ? (
                    <span className="text-neu-muted">
                      {" "}
                      · engagement {subscription.commitmentMonths} mois
                    </span>
                  ) : (
                    <span className="text-neu-muted"> · sans engagement</span>
                  )}
                </p>
                <p className="shrink-0 text-[11px] font-bold text-neu-accent-2">
                  {formatMoney(subscriptionTTC)}
                  <span className="text-[9px] font-medium text-neu-muted"> / mois</span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-2 rounded-2xl bg-neu-text p-4 text-white">
          <p className="text-[9.5px] font-bold uppercase tracking-wider text-white/60">
            Récapitulatif
          </p>
          <div className="mt-3 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-white/80">
              <span>Sous-total</span>
              <span>{formatMoney(amounts.subtotalHT)}</span>
            </div>
            {amounts.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-300">
                <span>
                  Remise
                  {quote.discount?.type === "percent" ? ` (${quote.discount.value} %)` : ""}
                  {quote.discount?.label ? ` — ${quote.discount.label}` : ""}
                </span>
                <span>− {formatMoney(amounts.discountAmount)}</span>
              </div>
            )}
            {isTvaExempt ? (
              <div className="flex justify-between text-white/60">
                <span>TVA</span>
                <span className="text-right text-[9.5px]">Non applicable (art. 293 B)</span>
              </div>
            ) : (
              <div className="flex justify-between text-white/80">
                <span>TVA ({quote.tvaRate} %)</span>
                <span>{formatMoney(amounts.tvaAmount)}</span>
              </div>
            )}
          </div>
          <div className="mt-3 border-t border-white/15 pt-3">
            <p className="text-[9.5px] uppercase tracking-wider text-white/60">
              Total {isTvaExempt ? "net" : "TTC"}
            </p>
            <p className="mt-0.5 text-[22px] font-bold leading-none tracking-tight">
              {formatMoney(amounts.totalTTC)}
            </p>
          </div>
        </div>
      </section>

      {/* ── Conditions du projet ── */}
      <section className="mt-8 grid grid-cols-2 gap-5">
        <div className="akno-pdf-block">
          <p className="text-[9.5px] font-bold uppercase tracking-wider text-neu-muted">
            Délai & planning
          </p>
          <p className="mt-1.5 text-[10.5px] leading-relaxed text-neu-text/85">
            {quote.deliveryDelay}
          </p>
          <p className="mt-1.5 text-[10px] leading-relaxed text-neu-muted">
            {legalMentions.clientObligations}
          </p>
        </div>
        <div className="akno-pdf-block">
          <p className="text-[9.5px] font-bold uppercase tracking-wider text-neu-muted">
            Conditions de paiement
          </p>
          <p className="mt-1.5 whitespace-pre-line text-[10.5px] leading-relaxed text-neu-text/85">
            {quote.paymentTerms}
          </p>
        </div>
        {quote.notes && (
          <div className="akno-pdf-block col-span-2">
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-neu-muted">
              Périmètre & exclusions
            </p>
            <p className="mt-1.5 whitespace-pre-line text-[10.5px] leading-relaxed text-neu-text/85">
              {quote.notes}
            </p>
          </div>
        )}
      </section>

      {/* ── Conditions générales ── */}
      <section className="mt-8 border-t border-neu-text/10 pt-5">
        <p className="text-[9.5px] font-bold uppercase tracking-wider text-neu-muted">
          Conditions générales
        </p>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3.5">
          <LegalItem title="Validité" text={legalMentions.validity} />
          <LegalItem title="Retours & modifications" text={legalMentions.revisions} />
          <LegalItem title="Règlement" text={legalMentions.paymentDeadline} />
          <LegalItem title="Retard de paiement" text={legalMentions.latePayment} />
          <LegalItem title="Propriété intellectuelle" text={legalMentions.intellectualProperty} />
          <LegalItem title="Hébergement & tiers" text={legalMentions.hosting} />
          <LegalItem title="Données personnelles" text={legalMentions.rgpd} />
          {isTvaExempt && <LegalItem title="Régime fiscal" text={legalMentions.tvaExempt} />}
          {isConsumer ? (
            <>
              <LegalItem title="Droit de rétractation" text={legalMentions.withdrawal} />
              <LegalItem
                title="Médiation"
                text={`${legalMentions.mediation}${companyInfo.mediator.name ? ` ${companyInfo.mediator.name} — ${companyInfo.mediator.url}` : ""}`}
              />
            </>
          ) : (
            <LegalItem title="Litiges" text={legalMentions.dispute} />
          )}
        </div>
      </section>

      {/* ── Bon pour accord ── */}
      <section className="pdf-avoid-break akno-pdf-block mt-8 rounded-2xl border-2 border-neu-text/15 p-5">
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-md">
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-neu-accent-2">
              Bon pour accord
            </p>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-neu-text/85">
              {legalMentions.acceptance}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[9.5px] uppercase tracking-wider text-neu-muted">Montant accepté</p>
            <p className="mt-0.5 text-base font-bold text-neu-text">{formatMoney(amounts.totalTTC)}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-5">
          <div>
            <p className="text-[9.5px] text-neu-muted">Fait à</p>
            <div className="mt-7 border-b border-neu-text/30" />
          </div>
          <div>
            <p className="text-[9.5px] text-neu-muted">Le</p>
            <div className="mt-7 border-b border-neu-text/30" />
          </div>
          <div>
            <p className="text-[9.5px] text-neu-muted">Nom & qualité du signataire</p>
            <div className="mt-7 border-b border-neu-text/30" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-5">
          <div>
            <p className="text-[9.5px] text-neu-muted">
              Signature du client, précédée de « Bon pour accord »
            </p>
            <div className="mt-2 h-20 rounded-xl border border-dashed border-neu-text/25" />
          </div>
          <div>
            <p className="text-[9.5px] text-neu-muted">Pour {companyInfo.name}</p>
            <div className="mt-2 flex h-20 items-end rounded-xl border border-dashed border-neu-text/25 p-3">
              <p className="text-[10px] text-neu-muted">{companyInfo.legalName}</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-6 flex items-center justify-between border-t border-neu-text/10 pt-3 text-[9px] text-neu-muted">
        <p>
          {companyInfo.legalName} · {companyInfo.legalForm} · SIRET {companyInfo.siret} · APE{" "}
          {companyInfo.ape}
          {companyInfo.vatExempt ? " · TVA non applicable, art. 293 B du CGI" : ""}
        </p>
        <p className="font-mono">{quote.number || "DEV-XXXX-XXX"}</p>
      </footer>
    </article>
  );
}
