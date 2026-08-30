"use client";

import { formatMoney } from "@/lib/finances";
import {
  calculateQuoteTotals,
  companyInfo,
  formatQuoteDate,
  getCompanyFullAddress,
  getSubscriptionMonthlyTTC,
  legalMentions,
  lineTotal,
  type Quote,
  type QuoteClientType,
} from "@/lib/quotes";
import { cn } from "@/lib/utils";

type QuoteDocumentProps = {
  quote: Pick<
    Quote,
    | "number"
    | "client"
    | "items"
    | "tvaRate"
    | "date"
    | "validUntil"
    | "object"
    | "deliveryDelay"
    | "clientType"
    | "notes"
    | "paymentTerms"
    | "subscription"
    | "status"
  > & {
    object?: string;
    deliveryDelay?: string;
    clientType?: QuoteClientType;
  };
  className?: string;
};

function LegalBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-neu-muted">
        {title}
      </p>
      <div className="mt-1.5 text-[11px] leading-relaxed text-neu-text/85">
        {children}
      </div>
    </div>
  );
}

export function QuoteDocument({ quote, className }: QuoteDocumentProps) {
  const { subtotalHT, tvaAmount, totalTTC } = calculateQuoteTotals(
    quote.items,
    quote.tvaRate,
  );
  const subscription = quote.subscription?.enabled ? quote.subscription : undefined;
  const subscriptionTTC = getSubscriptionMonthlyTTC(subscription, quote.tvaRate);
  const subscriptionTva =
    subscription && subscription.monthlyPriceHT > 0
      ? subscriptionTTC - subscription.monthlyPriceHT
      : 0;
  const isConsumer = quote.clientType === "consumer";
  const isTvaExempt = quote.tvaRate === 0;

  return (
    <article
      id="quote-document"
      className={cn("bg-white p-1 text-neu-text sm:p-2", className)}
    >
      {/* En-tête */}
      <div className="mb-8 flex flex-col justify-between gap-6 border-b border-neu-text/10 pb-6 sm:flex-row sm:items-start">
        <div className="max-w-md">
          <p className="text-2xl font-bold tracking-tight">{companyInfo.name}</p>
          <p className="mt-0.5 text-sm font-medium text-neu-muted">
            {companyInfo.legalName}
          </p>
          <p className="mt-1 text-sm text-neu-muted">{companyInfo.tagline}</p>
          <div className="mt-4 space-y-0.5 text-[11px] leading-relaxed text-neu-muted">
            <p>{getCompanyFullAddress()}</p>
            <p>SIRET : {companyInfo.siret}</p>
            <p>{companyInfo.rcs}</p>
            <p>N° TVA intracommunautaire : {companyInfo.tvaNumber}</p>
            <p>Code APE : {companyInfo.ape}</p>
            <p>{companyInfo.email} · {companyInfo.phone}</p>
            <p>{companyInfo.website}</p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-neu-accent-2">
            Devis n° {quote.number || "DEV-XXXX-XXX"}
          </p>
          <p className="mt-2 text-xs text-neu-muted">
            Date d&apos;émission : {formatQuoteDate(quote.date)}
          </p>
          <p className="text-xs text-neu-muted">
            Valable jusqu&apos;au : {formatQuoteDate(quote.validUntil)}
          </p>
          <p className="mt-2 text-[11px] italic text-neu-muted">
            {legalMentions.freeQuote}
          </p>
        </div>
      </div>

      {/* Émetteur / Client */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-neu-text/8 bg-neu-text/[0.02] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neu-muted">
            Prestataire
          </p>
          <p className="mt-2 text-sm font-semibold">{companyInfo.legalName}</p>
          <p className="text-xs text-neu-muted">{getCompanyFullAddress()}</p>
          <p className="mt-1 text-xs text-neu-muted">SIRET : {companyInfo.siret}</p>
        </div>

        <div className="rounded-2xl border border-neu-text/8 bg-neu-text/[0.02] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neu-muted">
            Client {isConsumer ? "(consommateur)" : "(professionnel)"}
          </p>
          <p className="mt-2 text-sm font-semibold">
            {quote.client.company || quote.client.name || "—"}
          </p>
          {quote.client.name && quote.client.company && (
            <p className="text-xs text-neu-muted">Contact : {quote.client.name}</p>
          )}
          {quote.client.address && (
            <p className="mt-1 text-xs text-neu-muted">{quote.client.address}</p>
          )}
          {quote.client.email && (
            <p className="text-xs text-neu-muted">{quote.client.email}</p>
          )}
          {quote.client.siret && (
            <p className="text-xs text-neu-muted">SIRET : {quote.client.siret}</p>
          )}
          {quote.client.tvaNumber && (
            <p className="text-xs text-neu-muted">TVA : {quote.client.tvaNumber}</p>
          )}
        </div>
      </div>

      {/* Objet */}
      {quote.object && (
        <div className="mb-6 rounded-2xl border border-neu-accent-2/20 bg-neu-accent-2/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neu-accent-2">
            Objet du devis
          </p>
          <p className="mt-2 text-sm leading-relaxed">{quote.object}</p>
        </div>
      )}

      {/* Prestations */}
      <div className="pdf-avoid-break overflow-hidden rounded-2xl border border-neu-text/8">
        <table className="w-full text-sm">
          <thead className="bg-neu-text/[0.04] text-left text-[10px] uppercase tracking-wider text-neu-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Désignation des prestations</th>
              <th className="px-4 py-3 font-semibold text-center">Qté</th>
              <th className="px-4 py-3 font-semibold text-right">P.U. HT</th>
              <th className="px-4 py-3 font-semibold text-right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.length > 0 ? (
              quote.items.map((item) => (
                <tr key={item.id} className="border-t border-neu-text/5">
                  <td className="px-4 py-3 leading-relaxed">{item.description || "—"}</td>
                  <td className="px-4 py-3 text-center text-neu-muted">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-neu-muted">
                    {formatMoney(item.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatMoney(lineTotal(item))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neu-muted">
                  Aucune prestation renseignée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totaux */}
      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-sm space-y-2 text-sm">
          <div className="flex justify-between text-neu-muted">
            <span>Total HT</span>
            <span>{formatMoney(subtotalHT)}</span>
          </div>
          {isTvaExempt ? (
            <div className="flex justify-between text-neu-muted">
              <span>TVA</span>
              <span className="text-right text-xs">{legalMentions.tvaExempt}</span>
            </div>
          ) : (
            <div className="flex justify-between text-neu-muted">
              <span>TVA ({quote.tvaRate} %)</span>
              <span>{formatMoney(tvaAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-neu-text/10 pt-2 text-base font-bold">
            <span>Total {isTvaExempt ? "net" : "TTC"}</span>
            <span className="text-neu-accent-2">{formatMoney(totalTTC)}</span>
          </div>
          <p className="pt-1 text-right text-[10px] text-neu-muted">
            Prix exprimés en euros ({isTvaExempt ? "HT, franchise en base" : "HT + TVA"})
          </p>
        </div>
      </div>

      {subscription && subscription.monthlyPriceHT > 0 && (
        <div className="pdf-avoid-break mt-6 overflow-hidden rounded-2xl border border-neu-accent-2/25 bg-neu-accent-2/[0.04]">
          <div className="border-b border-neu-accent-2/15 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neu-accent-2">
              Abonnement mensuel récurrent
            </p>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm leading-relaxed text-neu-text">
              {subscription.label}
            </p>
            <div className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-neu-muted">
                <span>Montant mensuel HT</span>
                <span>{formatMoney(subscription.monthlyPriceHT)}</span>
              </div>
              {!isTvaExempt && (
                <div className="flex justify-between text-neu-muted">
                  <span>TVA ({quote.tvaRate} %)</span>
                  <span>{formatMoney(subscriptionTva)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-neu-text/10 pt-2 font-bold text-neu-text">
                <span>Total {isTvaExempt ? "net" : "TTC"} / mois</span>
                <span className="text-neu-accent-2">
                  {formatMoney(subscriptionTTC)}
                </span>
              </div>
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-neu-muted">
              Facturation mensuelle, distincte du montant de la prestation
              ponctuelle ci-dessus. Durée et conditions de résiliation à
              convenir par écrit.
            </p>
          </div>
        </div>
      )}

      {/* Conditions */}
      <div className="mt-8 space-y-5 border-t border-neu-text/10 pt-6">
        {quote.deliveryDelay && (
          <LegalBlock title="Délai d'exécution">
            <p>{quote.deliveryDelay}</p>
          </LegalBlock>
        )}

        {quote.paymentTerms && (
          <LegalBlock title="Conditions de paiement">
            <p className="whitespace-pre-line">{quote.paymentTerms}</p>
            <p className="mt-2">{legalMentions.paymentDeadline}</p>
            <p className="mt-1">{legalMentions.earlyPayment}</p>
          </LegalBlock>
        )}

        <LegalBlock title="Pénalités de retard (clients professionnels)">
          <p>{legalMentions.latePayment}</p>
        </LegalBlock>

        {quote.notes && (
          <LegalBlock title="Exclusions & remarques">
            <p className="whitespace-pre-line">{quote.notes}</p>
            <p className="mt-2">{legalMentions.hosting}</p>
          </LegalBlock>
        )}

        <LegalBlock title="Propriété intellectuelle">
          <p>{legalMentions.intellectualProperty}</p>
        </LegalBlock>

        <LegalBlock title="Protection des données (RGPD)">
          <p>{legalMentions.rgpd}</p>
        </LegalBlock>

        {isConsumer && (
          <>
            <LegalBlock title="Droit de rétractation (client consommateur)">
              <p>{legalMentions.withdrawal}</p>
            </LegalBlock>
            <LegalBlock title="Médiation de la consommation">
              <p>{legalMentions.mediation}</p>
              <p className="mt-1">
                {companyInfo.mediator.name} —{" "}
                <span className="break-all">{companyInfo.mediator.url}</span>
              </p>
            </LegalBlock>
          </>
        )}

        <LegalBlock title="Validité & litiges">
          <p>{legalMentions.validity}</p>
          {!isConsumer && <p className="mt-2">{legalMentions.dispute}</p>}
        </LegalBlock>
      </div>

      {/* Bon pour accord */}
      <div className="pdf-avoid-break mt-8 rounded-2xl border-2 border-dashed border-neu-text/15 p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neu-muted">
          Acceptation du devis
        </p>
        <p className="mt-2 text-xs leading-relaxed text-neu-text">
          {legalMentions.acceptance}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[10px] text-neu-muted">Fait à</p>
            <div className="mt-6 border-b border-neu-text/20" />
          </div>
          <div>
            <p className="text-[10px] text-neu-muted">Le</p>
            <div className="mt-6 border-b border-neu-text/20" />
          </div>
        </div>
        <div className="mt-6">
          <p className="text-[10px] text-neu-muted">
            Signature du client, précédée de la mention « Bon pour accord »
          </p>
          <div className="mt-8 h-16 border-b border-neu-text/20" />
        </div>
        <p className="mt-4 text-[10px] text-neu-muted">
          AKNO — {companyInfo.rcPro}
        </p>
      </div>
    </article>
  );
}
