import { AKNO_STORAGE_KEYS, readStorage, writeStorage } from "@/lib/persistence";

export type QuoteStatus = "brouillon" | "envoye" | "accepte" | "refuse" | "expire";

export type QuoteClientType = "professional" | "consumer";

export type QuoteSubscription = {
  enabled: boolean;
  label: string;
  /** Prix mensuel HT fixé par vous */
  monthlyPriceHT: number;
};

export const defaultQuoteSubscriptionLabel =
  "Abonnement maintenance, hébergement et mises à jour mensuelles";

export type QuoteLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type QuoteClient = {
  name: string;
  company: string;
  email: string;
  address: string;
  siret?: string;
  tvaNumber?: string;
};

export type Quote = {
  id: number;
  number: string;
  client: QuoteClient;
  items: QuoteLineItem[];
  tvaRate: number;
  status: QuoteStatus;
  date: string;
  validUntil: string;
  object: string;
  deliveryDelay: string;
  clientType: QuoteClientType;
  notes?: string;
  paymentTerms?: string;
  subscription?: QuoteSubscription;
  /** Total TTC (prestation ponctuelle, hors abonnement mensuel) */
  amount: number;
};

export type QuoteDraft = Omit<Quote, "id" | "number" | "amount">;

export const QUOTES_STORAGE_KEY = AKNO_STORAGE_KEYS.quotes;

/** Micro-entreprise — franchise en base TVA (art. 293 B du CGI) */
export const defaultTvaRate = 0;

export const companyInfo = {
  name: "AKNO",
  legalName: "Keryan Bouzerda",
  legalForm: "Entrepreneur individuel",
  tagline: "Des expériences digitales sur mesure",
  email: "aknoweb.contact@gmail.com",
  phone: "07 81 99 07 61",
  website: "",
  address: "",
  postalCode: "",
  city: "",
  country: "France",
  siren: "101354413",
  siret: "10135441300011",
  iban: "FR76 2823 3000 0147 5243 7148 512",
  rcs: "",
  tvaNumber: "",
  ape: "02.01Z",
  vatExempt: true,
  capital: null as string | null,
  rcPro: "",
  mediator: {
    name: "",
    url: "",
    email: "",
  },
};

export const legalMentions = {
  freeQuote: "Devis établi gratuitement, sans obligation d'achat.",
  validity:
    "Le présent devis est valable 30 jours à compter de sa date d'émission, sauf mention contraire.",
  paymentDeadline:
    "Sauf stipulation contraire, le règlement s'effectue à 30 jours date de facture (clients professionnels), conformément aux usages du secteur.",
  latePayment:
    "En cas de retard de paiement, seront exigibles, conformément aux articles L441-10 et D441-5 du Code de commerce : des pénalités de retard calculées sur la base de 3 fois le taux d'intérêt légal en vigueur, ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement.",
  earlyPayment: "Aucun escompte n'est accordé en cas de paiement anticipé.",
  acceptance:
    "Bon pour accord — Devis reçu avant l'exécution des travaux. Le client reconnaît avoir pris connaissance des conditions ci-dessous et accepte le devis par signature manuscrite ou électronique, précédée de la mention « Bon pour accord », datée.",
  intellectualProperty:
    "Les droits patrimoniaux d'auteur sur les livrables (design, code source, contenus produits par AKNO) sont cédés au client après encaissement intégral du prix. Jusqu'au paiement complet, AKNO conserve la propriété intellectuelle des créations.",
  hosting:
    "L'hébergement, le nom de domaine, les licences tierces (plugins, polices, banques d'images) et la maintenance courante ne sont pas inclus sauf mention expresse dans le présent devis.",
  rgpd:
    "Dans le cadre du projet, AKNO peut être amené à traiter des données personnelles pour le compte du client. Le client reste responsable de traitement ; AKNO intervient en sous-traitant conformément au RGPD (UE 2016/679).",
  withdrawal:
    "Lorsque le client est un consommateur et que le contrat est conclu à distance, il dispose d'un délai de 14 jours à compter de l'acceptation du devis pour exercer son droit de rétractation, sauf exceptions légales applicables aux prestations personnalisées et exécutées avant la fin du délai avec accord exprès du client.",
  mediation:
    "Conformément à l'article L612-1 du Code de la consommation, le client consommateur peut recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d'un litige.",
  tvaExempt: "TVA non applicable, article 293 B du CGI.",
  dispute:
    "En cas de litige entre professionnels et à défaut d'accord amiable, compétence exclusive est attribuée aux tribunaux du ressort du siège social du prestataire, sous réserve des dispositions d'ordre public.",
};

export const defaultQuoteObject =
  "Conception, design, développement et mise en ligne d'un site internet vitrine sur mesure, responsive et optimisé pour le référencement naturel.";

export const defaultDeliveryDelay =
  "Délai indicatif de 6 à 8 semaines ouvrées à compter de la réception de l'acompte et de l'ensemble des contenus client (textes, images, logos, accès).";

export const defaultPaymentTerms = `Acompte de 40 % à la commande (signature du devis).
Solde de 60 % à la livraison du site.
Mise en ligne et remise des accès définitifs après encaissement du solde — le site reste verrouillé jusqu'au paiement complet.
Paiement par virement bancaire sous 30 jours date de facture.

Coordonnées bancaires :
IBAN : ${companyInfo.iban}
Titulaire : ${companyInfo.legalName}
Contact : ${companyInfo.email} · ${companyInfo.phone}`;

export function getDefaultWebsiteQuoteLines(): QuoteLineItem[] {
  const base = Date.now();
  return [
    {
      id: `line-${base}-1`,
      description:
        "Phase 1 — Cadrage, arborescence, wireframes et validation du parcours utilisateur",
      quantity: 1,
      unitPrice: 600,
    },
    {
      id: `line-${base}-2`,
      description:
        "Phase 2 — Design UI/UX responsive (desktop, tablette, mobile) et déclinaison charte graphique",
      quantity: 1,
      unitPrice: 900,
    },
    {
      id: `line-${base}-3`,
      description:
        "Phase 3 — Développement front-end (Next.js), intégration CMS et formulaires de contact",
      quantity: 1,
      unitPrice: 1350,
    },
    {
      id: `line-${base}-4`,
      description:
        "Phase 4 — Optimisation SEO technique de base, performances (Core Web Vitals) et accessibilité",
      quantity: 1,
      unitPrice: 300,
    },
    {
      id: `line-${base}-5`,
      description:
        "Phase 5 — Mise en ligne, certificat SSL, tests multi-navigateurs, formation et remise des accès",
      quantity: 1,
      unitPrice: 600,
    },
  ];
}

export const defaultQuoteNotes = `Non inclus : hébergement annuel, nom de domaine, maintenance mensuelle, rédaction de contenus, shootings photo.
Toute demande hors périmètre fera l'objet d'un avenant ou d'un devis complémentaire.`;

export type QuoteTemplateId = "sur-mesure" | "template";

export const quoteTemplates: Record<
  QuoteTemplateId,
  { label: string; object: string; items: QuoteLineItem[] }
> = {
  "sur-mesure": {
    label: "Site sur mesure (~4 500 €)",
    object: defaultQuoteObject,
    items: getDefaultWebsiteQuoteLines(),
  },
  template: {
    label: "Site template (500 €)",
    object: "Site vitrine prêt à l'emploi, personnalisé à votre activité.",
    items: [
      {
        id: "line-template",
        description:
          "Site template — design personnalisé, mise en ligne et formation",
        quantity: 1,
        unitPrice: 500,
      },
    ],
  },
};

export function applyQuoteTemplate(templateId: QuoteTemplateId) {
  const template = quoteTemplates[templateId];
  return {
    object: template.object,
    items: template.items.map((item) => ({
      ...item,
      id: createEmptyLineItem().id,
    })),
  };
}

export type SimpleQuoteInput = {
  clientCompany: string;
  clientName: string;
  clientEmail: string;
  object: string;
  items: QuoteLineItem[];
  date: string;
  validityDays: number;
  tvaRate: number;
  subscription?: QuoteSubscription;
};

export function buildQuoteDraft(input: SimpleQuoteInput): QuoteDraft | null {
  if (!input.clientCompany.trim() && !input.clientName.trim()) {
    return null;
  }

  const validItems = input.items.filter(
    (item) => item.description.trim() && item.unitPrice > 0,
  );

  if (validItems.length === 0) {
    const sub = input.subscription;
    if (!sub?.enabled || sub.monthlyPriceHT <= 0) {
      return null;
    }
  }

  return {
    client: {
      name: input.clientName.trim(),
      company: input.clientCompany.trim(),
      email: input.clientEmail.trim(),
      address: "",
    },
    items: validItems.map((item) => ({
      ...item,
      description: item.description.trim(),
      quantity: Math.max(1, item.quantity),
    })),
    tvaRate: input.tvaRate ?? defaultTvaRate,
    status: "brouillon",
    date: input.date,
    validUntil: addDaysToDate(input.date, input.validityDays),
    object: input.object.trim() || defaultQuoteObject,
    deliveryDelay: defaultDeliveryDelay,
    clientType: "professional",
    notes: defaultQuoteNotes,
    paymentTerms: defaultPaymentTerms,
    subscription: input.subscription?.enabled
      ? {
          enabled: true,
          label: input.subscription.label.trim() || defaultQuoteSubscriptionLabel,
          monthlyPriceHT: Math.max(0, input.subscription.monthlyPriceHT),
        }
      : undefined,
  };
}

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé",
  accepte: "Accepté",
  refuse: "Refusé",
  expire: "Expiré",
};

export const quoteStatusStyles: Record<QuoteStatus, string> = {
  brouillon: "bg-slate-200/80 text-slate-600",
  envoye: "bg-neu-accent-2/20 text-neu-accent-2",
  accepte: "bg-emerald-100 text-emerald-700",
  refuse: "bg-neu-accent-3/15 text-neu-accent-3",
  expire: "bg-amber-100 text-amber-700",
};

export const initialQuotes: Quote[] = [];

/** @deprecated Utiliser initialQuotes */
export const quotes = initialQuotes;

export function lineTotal(item: QuoteLineItem) {
  return item.quantity * item.unitPrice;
}

export function getSubscriptionMonthlyTTC(
  subscription: QuoteSubscription | undefined,
  tvaRate: number,
) {
  if (!subscription?.enabled || subscription.monthlyPriceHT <= 0) return 0;
  return subscription.monthlyPriceHT * (1 + tvaRate / 100);
}

export function calculateQuoteTotals(items: QuoteLineItem[], tvaRate: number) {
  const subtotalHT = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const tvaAmount = subtotalHT * (tvaRate / 100);
  const totalTTC = subtotalHT + tvaAmount;

  return {
    subtotalHT,
    tvaAmount,
    totalTTC,
  };
}

export function formatQuoteDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function addDaysToDate(date: string, days: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

export function generateQuoteNumber(existing: Quote[]) {
  const year = new Date().getFullYear();
  const prefix = `DEV-${year}-`;
  const numbers = existing
    .map((q) => q.number)
    .filter((n) => n.startsWith(prefix))
    .map((n) => Number(n.replace(prefix, "")))
    .filter((n) => !Number.isNaN(n));

  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

export function createEmptyLineItem(): QuoteLineItem {
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description: "",
    quantity: 1,
    unitPrice: 0,
  };
}

export function createQuoteFromDraft(
  existing: Quote[],
  draft: QuoteDraft,
): Quote {
  const { totalTTC } = calculateQuoteTotals(draft.items, draft.tvaRate);

  return {
    id: existing.reduce((max, q) => Math.max(max, q.id), 0) + 1,
    number: generateQuoteNumber(existing),
    ...draft,
    amount: totalTTC,
  };
}

export function normalizeStoredQuote(quote: Quote): Quote {
  return {
    ...quote,
    object: quote.object ?? defaultQuoteObject,
    deliveryDelay: quote.deliveryDelay ?? defaultDeliveryDelay,
    clientType: quote.clientType ?? "professional",
    subscription: quote.subscription?.enabled
      ? {
          enabled: true,
          label: quote.subscription.label || defaultQuoteSubscriptionLabel,
          monthlyPriceHT: quote.subscription.monthlyPriceHT ?? 0,
        }
      : undefined,
    client: {
      ...quote.client,
      siret: quote.client.siret ?? "",
      tvaNumber: quote.client.tvaNumber ?? "",
    },
  };
}

export function loadStoredQuotes(): Quote[] {
  const parsed = readStorage<Quote[]>(QUOTES_STORAGE_KEY, []);
  if (!Array.isArray(parsed)) return [];
  return parsed.map(normalizeStoredQuote);
}

export function saveStoredQuotes(quotes: Quote[]) {
  writeStorage(QUOTES_STORAGE_KEY, quotes);
}

export function getClientDisplayName(quote: Quote) {
  return quote.client.company || quote.client.name;
}

export function getCompanyFullAddress() {
  const parts = [
    companyInfo.address,
    [companyInfo.postalCode, companyInfo.city].filter(Boolean).join(" "),
    companyInfo.country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "À compléter";
}

export function getCompanyBankDetails() {
  return {
    iban: companyInfo.iban,
    holder: companyInfo.legalName,
    email: companyInfo.email,
    phone: companyInfo.phone,
  };
}
