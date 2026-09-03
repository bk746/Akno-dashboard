import {
  companyInfo,
  formatQuoteDate,
  getClientDisplayName,
  getCompanyFullAddress,
  getQuoteAmounts,
  getQuoteTitle,
  type Quote,
  type QuoteClient,
} from "@/lib/quotes";

export type InvoiceStatus = "brouillon" | "envoyee" | "payee" | "en_retard" | "annulee";
export type InvoiceKind = "acompte" | "solde";

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Invoice = {
  id: number;
  number: string;
  kind: InvoiceKind;
  quoteId: number;
  quoteNumber: string;
  client: QuoteClient;
  items: InvoiceLineItem[];
  tvaRate: number;
  status: InvoiceStatus;
  date: string;
  dueDate: string;
  paidDate?: string;
  object: string;
  amount: number;
};

import { AKNO_STORAGE_KEYS, readStorage, writeStorage } from "@/lib/persistence";

export const INVOICES_STORAGE_KEY = AKNO_STORAGE_KEYS.invoices;
export const DEPOSIT_RATE = 40;
export const BALANCE_RATE = 60;
export const INVOICE_DUE_DAYS = 30;

export const invoiceKindLabels: Record<InvoiceKind, string> = {
  acompte: "Facture d'acompte",
  solde: "Facture de solde",
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  brouillon: "Brouillon",
  envoyee: "Envoyée",
  payee: "Payée",
  en_retard: "En retard",
  annulee: "Annulée",
};

export const invoiceStatusStyles: Record<InvoiceStatus, string> = {
  brouillon: "bg-slate-200/80 text-slate-600",
  envoyee: "bg-neu-accent-2/20 text-neu-accent-2",
  payee: "bg-emerald-100 text-emerald-700",
  en_retard: "bg-neu-accent-3/15 text-neu-accent-3",
  annulee: "bg-slate-100 text-slate-500",
};

export const invoiceLegalMentions = {
  paymentDeadline:
    "Paiement par virement bancaire sous 30 jours à compter de la date de facture.",
  latePayment:
    "En cas de retard de paiement, seront exigibles des pénalités de retard (3 fois le taux d'intérêt légal) et une indemnité forfaitaire de 40 € pour frais de recouvrement (art. L441-10 et D441-5 du Code de commerce).",
  tvaExempt: "TVA non applicable, article 293 B du CGI.",
  depositNote:
    "Facture d'acompte correspondant à la commande. L'acompte permet le démarrage du projet. Le site reste verrouillé (aperçu uniquement) jusqu'au paiement du solde.",
  balanceNote:
    "Facture de solde — prestation réalisée conformément au devis référencé. La mise en ligne du site et la remise des accès définitifs interviennent uniquement après encaissement de ce solde.",
  siteUnlock:
    "Tant que le solde (60 %) n'est pas réglé, le site du client reste verrouillé : pas de mise en ligne publique, pas de remise des accès administrateur.",
};

export const initialInvoices: Invoice[] = [];

export function lineTotal(item: InvoiceLineItem) {
  return item.quantity * item.unitPrice;
}

export function calculateInvoiceTotals(items: InvoiceLineItem[], tvaRate: number) {
  const subtotalHT = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const tvaAmount = subtotalHT * (tvaRate / 100);
  const totalTTC = subtotalHT + tvaAmount;

  return { subtotalHT, tvaAmount, totalTTC };
}

export function addDaysToDate(date: string, days: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

export function generateInvoiceNumber(existing: Invoice[]) {
  const year = new Date().getFullYear();
  const prefix = `FAC-${year}-`;
  const numbers = existing
    .map((invoice) => invoice.number)
    .filter((number) => number.startsWith(prefix))
    .map((number) => Number(number.replace(prefix, "")))
    .filter((number) => !Number.isNaN(number));

  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

export function getInvoiceClientName(invoice: Invoice) {
  return getClientDisplayName({ client: invoice.client } as Quote);
}

export function getInvoicesForQuote(invoices: Invoice[], quoteId: number) {
  return invoices.filter((invoice) => invoice.quoteId === quoteId);
}

export function removeInvoicesForQuote(invoices: Invoice[], quoteId: number) {
  return invoices.filter((invoice) => invoice.quoteId !== quoteId);
}

export type SiteStatus =
  | "en_attente_acompte"
  | "en_production"
  | "en_attente_solde"
  | "en_ligne";

export const siteStatusLabels: Record<SiteStatus, string> = {
  en_attente_acompte: "En attente acompte",
  en_production: "En production · site verrouillé",
  en_attente_solde: "En attente solde · site verrouillé",
  en_ligne: "Site en ligne · débloqué",
};

export const siteStatusStyles: Record<SiteStatus, string> = {
  en_attente_acompte: "bg-amber-100 text-amber-800",
  en_production: "bg-neu-accent-2/20 text-neu-accent-2",
  en_attente_solde: "bg-neu-accent-3/15 text-neu-accent-3",
  en_ligne: "bg-emerald-100 text-emerald-700",
};

export function getSiteStatus(invoices: Invoice[], quoteId: number): SiteStatus {
  const projectInvoices = getInvoicesForQuote(invoices, quoteId).filter(
    (invoice) => invoice.status !== "annulee",
  );
  const deposit = projectInvoices.find((invoice) => invoice.kind === "acompte");
  const balance = projectInvoices.find((invoice) => invoice.kind === "solde");

  if (balance?.status === "payee") return "en_ligne";
  if (balance) return "en_attente_solde";
  if (deposit?.status === "payee") return "en_production";
  return "en_attente_acompte";
}

export function isSiteUnlocked(invoices: Invoice[], quoteId: number) {
  return getSiteStatus(invoices, quoteId) === "en_ligne";
}

export function canCreateInvoiceKind(
  invoices: Invoice[],
  quoteId: number,
  kind: InvoiceKind,
): { ok: boolean; reason?: string } {
  const existing = getInvoicesForQuote(invoices, quoteId).filter(
    (invoice) => invoice.status !== "annulee",
  );

  if (kind === "acompte") {
    if (existing.some((invoice) => invoice.kind === "acompte")) {
      return { ok: false, reason: "Une facture d'acompte existe déjà pour ce devis." };
    }
    return { ok: true };
  }

  const deposit = existing.find((invoice) => invoice.kind === "acompte");
  if (!deposit) {
    return {
      ok: false,
      reason: "Créez d'abord la facture d'acompte (40 %) après signature du devis.",
    };
  }
  if (deposit.status !== "payee") {
    return {
      ok: false,
      reason: "La facture d'acompte doit être payée avant d'émettre le solde.",
    };
  }
  if (existing.some((invoice) => invoice.kind === "solde")) {
    return { ok: false, reason: "Une facture de solde existe déjà pour ce devis." };
  }

  return { ok: true };
}

export function createInvoiceFromQuote(
  existing: Invoice[],
  quote: Quote,
  kind: InvoiceKind,
  status: InvoiceStatus = "envoyee",
): Invoice | null {
  const check = canCreateInvoiceKind(existing, quote.id, kind);
  if (!check.ok) return null;

  const amounts = getQuoteAmounts(quote);
  const depositRate = amounts.depositPercent;
  const balanceRate = 100 - depositRate;
  const rate = kind === "acompte" ? depositRate : balanceRate;
  const amountHT = Math.round((amounts.netHT * rate) / 100 * 100) / 100;
  const amountTTC = kind === "acompte" ? amounts.depositAmount : amounts.balanceAmount;
  const today = new Date().toISOString().slice(0, 10);
  const title = getQuoteTitle(quote);

  const invoice: Invoice = {
    id: existing.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    number: generateInvoiceNumber(existing),
    kind,
    quoteId: quote.id,
    quoteNumber: quote.number,
    client: { ...quote.client },
    items: [
      {
        id: `inv-${Date.now()}`,
        description:
          kind === "acompte"
            ? `Acompte ${depositRate} % — ${title} (devis ${quote.number})`
            : `Solde ${balanceRate} % — ${title} (devis ${quote.number})`,
        quantity: 1,
        unitPrice: amountHT,
      },
    ],
    tvaRate: quote.tvaRate,
    status,
    date: today,
    dueDate: addDaysToDate(today, INVOICE_DUE_DAYS),
    object:
      kind === "acompte"
        ? `${title} — acompte à la commande`
        : `${title} — solde à la livraison`,
    amount: amountTTC,
  };

  return invoice;
}

export function loadStoredInvoices(): Invoice[] {
  const parsed = readStorage<Invoice[]>(INVOICES_STORAGE_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveStoredInvoices(invoices: Invoice[]) {
  writeStorage(INVOICES_STORAGE_KEY, invoices);
}

export { companyInfo, formatQuoteDate, getCompanyFullAddress };
