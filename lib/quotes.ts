import { AKNO_STORAGE_KEYS, readStorage, writeStorage } from "@/lib/persistence";

export type QuoteStatus = "brouillon" | "envoye" | "accepte" | "refuse" | "expire";

export type QuoteClientType = "professional" | "consumer";

export type QuoteUnit = "forfait" | "jour" | "heure" | "unite" | "mois" | "page";

export const quoteUnitLabels: Record<QuoteUnit, string> = {
  forfait: "Forfait",
  jour: "Jour",
  heure: "Heure",
  unite: "Unité",
  mois: "Mois",
  page: "Page",
};

export const quoteUnitShort: Record<QuoteUnit, string> = {
  forfait: "forf.",
  jour: "j",
  heure: "h",
  unite: "u",
  mois: "mois",
  page: "p.",
};

export type QuoteSubscription = {
  enabled: boolean;
  label: string;
  /** Prix mensuel HT fixé par vous */
  monthlyPriceHT: number;
  /** Engagement minimum en mois (0 = sans engagement) */
  commitmentMonths?: number;
};

export const defaultQuoteSubscriptionLabel =
  "Maintenance, hébergement, sauvegardes et mises à jour mensuelles";

export type QuoteLineItem = {
  id: string;
  description: string;
  /** Détail / livrables de la ligne (affiché sous la désignation) */
  details?: string;
  quantity: number;
  unit?: QuoteUnit;
  unitPrice: number;
  /** Option proposée mais non incluse dans le total */
  optional?: boolean;
};

export type QuoteSection = {
  id: string;
  title: string;
  description?: string;
  items: QuoteLineItem[];
};

export type QuoteDiscount = {
  type: "percent" | "amount";
  value: number;
  label?: string;
};

export type QuoteClient = {
  name: string;
  company: string;
  email: string;
  address: string;
  phone?: string;
  siret?: string;
  tvaNumber?: string;
};

export type Quote = {
  id: number;
  number: string;
  /** Lien vers la fiche client (optionnel) */
  clientId?: number;
  client: QuoteClient;
  /** Titre du projet (ex. « Refonte du site vitrine ») */
  title?: string;
  /** Contexte & objectifs — texte d'introduction du devis */
  introduction?: string;
  /** Prestations structurées par phases / lots */
  sections?: QuoteSection[];
  /** Lignes incluses (aplaties depuis sections) — conservé pour compatibilité */
  items: QuoteLineItem[];
  discount?: QuoteDiscount;
  /** Pourcentage d'acompte à la signature (le solde = 100 - acompte) */
  depositPercent?: number;
  tvaRate: number;
  status: QuoteStatus;
  date: string;
  validUntil: string;
  object: string;
  deliveryDelay: string;
  clientType: QuoteClientType;
  notes?: string;
  internalNotes?: string;
  paymentTerms?: string;
  subscription?: QuoteSubscription;
  /** Total TTC (prestation ponctuelle, hors abonnement mensuel, remise déduite) */
  amount: number;
  sentAt?: string;
  acceptedAt?: string;
  refusedAt?: string;
  updatedAt?: string;
};

export type QuoteDraft = Omit<Quote, "id" | "number" | "amount">;

export const QUOTES_STORAGE_KEY = AKNO_STORAGE_KEYS.quotes;

/** Micro-entreprise — franchise en base TVA (art. 293 B du CGI) */
export const defaultTvaRate = 0;
export const defaultDepositPercent = 40;

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
    "Le présent devis est valable jusqu'à la date indiquée en en-tête. Au-delà, les prix et délais pourront être réévalués.",
  paymentDeadline:
    "Sauf stipulation contraire, chaque facture est payable par virement bancaire sous 30 jours à compter de sa date d'émission.",
  latePayment:
    "En cas de retard de paiement, seront exigibles, conformément aux articles L441-10 et D441-5 du Code de commerce : des pénalités de retard calculées sur la base de 3 fois le taux d'intérêt légal en vigueur, ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement.",
  earlyPayment: "Aucun escompte n'est accordé en cas de paiement anticipé.",
  acceptance:
    "Le client reconnaît avoir pris connaissance de l'ensemble du devis et de ses conditions, et l'accepte en le retournant daté et signé, précédé de la mention manuscrite ou électronique « Bon pour accord ». L'acceptation vaut commande ferme et déclenche la facturation de l'acompte.",
  intellectualProperty:
    "Les droits patrimoniaux d'auteur sur les livrables (design, code source, contenus produits par AKNO) sont cédés au client après encaissement intégral du prix. Jusqu'au paiement complet, AKNO conserve la propriété intellectuelle des créations. AKNO se réserve le droit de mentionner la réalisation dans ses références.",
  hosting:
    "L'hébergement, le nom de domaine, les licences tierces (plugins, polices, banques d'images) et la maintenance courante ne sont pas inclus sauf mention expresse dans le présent devis.",
  revisions:
    "Chaque phase inclut jusqu'à deux séries de retours. Les demandes au-delà, ou hors périmètre défini, feront l'objet d'un avenant chiffré avant réalisation.",
  clientObligations:
    "Le client s'engage à fournir les contenus (textes, visuels, logos, accès) et à valider chaque étape dans un délai raisonnable. Tout retard de fourniture décale d'autant le planning prévisionnel.",
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

export type QuoteLegalBlock = { label: string; text: string };

export function getQuoteLegalBlocks(
  quote: Pick<Quote, "clientType" | "tvaRate" | "notes" | "deliveryDelay" | "paymentTerms">,
): QuoteLegalBlock[] {
  const blocks: QuoteLegalBlock[] = [
    { label: "Devis gratuit", text: legalMentions.freeQuote },
    { label: "Validité", text: legalMentions.validity },
    { label: "Délai & planning", text: quote.deliveryDelay?.trim() || defaultDeliveryDelay },
    {
      label: "Conditions de paiement",
      text: quote.paymentTerms?.trim() || defaultPaymentTerms,
    },
    { label: "Retard de paiement", text: legalMentions.latePayment },
    { label: "Escompte", text: legalMentions.earlyPayment },
    { label: "Acceptation du devis", text: legalMentions.acceptance },
    { label: "Propriété intellectuelle", text: legalMentions.intellectualProperty },
    { label: "Hébergement & licences", text: legalMentions.hosting },
    { label: "Retours & révisions", text: legalMentions.revisions },
    { label: "Obligations du client", text: legalMentions.clientObligations },
    { label: "Données personnelles (RGPD)", text: legalMentions.rgpd },
  ];

  if (quote.tvaRate === 0 || companyInfo.vatExempt) {
    blocks.push({ label: "TVA", text: legalMentions.tvaExempt });
  }

  if (quote.notes?.trim()) {
    blocks.push({ label: "Périmètre & exclusions", text: quote.notes.trim() });
  }

  if (quote.clientType === "consumer") {
    blocks.push({ label: "Droit de rétractation", text: legalMentions.withdrawal });
    const mediatorParts = [
      legalMentions.mediation,
      companyInfo.mediator.name ? `Médiateur : ${companyInfo.mediator.name}` : null,
      companyInfo.mediator.url ? companyInfo.mediator.url : null,
      companyInfo.mediator.email ? companyInfo.mediator.email : null,
    ].filter(Boolean);
    blocks.push({ label: "Médiation", text: mediatorParts.join(" · ") });
  } else {
    blocks.push({ label: "Litiges", text: legalMentions.dispute });
  }

  return blocks;
}

export function getQuoteLegalIdentityLine() {
  return [
    companyInfo.legalName,
    companyInfo.legalForm,
    `SIRET ${companyInfo.siret}`,
    `SIREN ${companyInfo.siren}`,
    `APE ${companyInfo.ape}`,
    companyInfo.email,
    companyInfo.phone ? `Tél. ${companyInfo.phone}` : null,
    `IBAN ${companyInfo.iban}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export const defaultQuoteObject =
  "Conception, design, développement et mise en ligne d'un site internet vitrine sur mesure, responsive et optimisé pour le référencement naturel.";

export const defaultQuoteIntroduction =
  "Suite à nos échanges, vous trouverez ci-dessous notre proposition détaillée. Elle décrit le périmètre du projet, les prestations incluses, le planning prévisionnel et les conditions de réalisation. Chaque phase est chiffrée de manière transparente afin que vous puissiez ajuster le périmètre selon vos priorités.";

export const defaultDeliveryDelay =
  "Délai indicatif de 6 à 8 semaines ouvrées à compter de l'encaissement de l'acompte et de la réception de l'ensemble des contenus (textes, images, logos, accès).";

export const defaultPaymentTerms = `Acompte à la signature du devis, solde à la livraison.
Mise en ligne et remise des accès définitifs après encaissement du solde.
Paiement par virement bancaire sous 30 jours date de facture.

Coordonnées bancaires :
IBAN : ${companyInfo.iban}
Titulaire : ${companyInfo.legalName}
Contact : ${companyInfo.email} · ${companyInfo.phone}`;

export const defaultQuoteNotes = `Non inclus : nom de domaine, licences tierces, rédaction des contenus, shootings photo/vidéo, traductions.
Toute demande hors périmètre fera l'objet d'un avenant ou d'un devis complémentaire.`;

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptyLineItem(partial?: Partial<QuoteLineItem>): QuoteLineItem {
  return {
    id: uid("line"),
    description: "",
    details: "",
    quantity: 1,
    unit: "forfait",
    unitPrice: 0,
    optional: false,
    ...partial,
  };
}

export function createEmptySection(partial?: Partial<QuoteSection>): QuoteSection {
  return {
    id: uid("section"),
    title: "",
    description: "",
    items: [createEmptyLineItem()],
    ...partial,
  };
}

function line(
  description: string,
  unitPrice: number,
  options?: Partial<QuoteLineItem>,
): QuoteLineItem {
  return createEmptyLineItem({ description, unitPrice, ...options });
}

function section(
  title: string,
  description: string,
  items: QuoteLineItem[],
): QuoteSection {
  return createEmptySection({ title, description, items });
}

/* ───────────────────────── Templates agence ───────────────────────── */

export type QuoteTemplateId =
  | "vitrine-sur-mesure"
  | "site-template"
  | "ecommerce"
  | "refonte"
  | "maintenance";

export type QuoteTemplate = {
  label: string;
  hint: string;
  title: string;
  object: string;
  introduction: string;
  deliveryDelay: string;
  buildSections: () => QuoteSection[];
  subscription?: QuoteSubscription;
};

export const quoteTemplates: Record<QuoteTemplateId, QuoteTemplate> = {
  "vitrine-sur-mesure": {
    label: "Site vitrine sur mesure",
    hint: "≈ 4 500 € · 6–8 semaines",
    title: "Création d'un site vitrine sur mesure",
    object: defaultQuoteObject,
    introduction: defaultQuoteIntroduction,
    deliveryDelay: defaultDeliveryDelay,
    buildSections: () => [
      section(
        "Cadrage & stratégie",
        "Poser les bases du projet : objectifs, cibles, arborescence et parcours utilisateur.",
        [
          line("Atelier de cadrage & recueil des besoins", 350, {
            details: "Réunion de lancement, benchmark concurrentiel, définition des objectifs et KPIs.",
          }),
          line("Arborescence & wireframes", 450, {
            details: "Structure du site, maquettes fil de fer des pages clés, validation du parcours.",
          }),
        ],
      ),
      section(
        "Design UI/UX",
        "Une identité visuelle cohérente, déclinée sur tous les écrans.",
        [
          line("Direction artistique & maquette page d'accueil", 600, {
            details: "Deux pistes créatives, choix d'une direction, maquette haute fidélité.",
          }),
          line("Déclinaison des pages intérieures", 120, {
            quantity: 5,
            unit: "page",
            details: "Design responsive desktop, tablette et mobile pour chaque page.",
          }),
        ],
      ),
      section(
        "Développement & intégration",
        "Un site rapide, sécurisé et administrable en autonomie.",
        [
          line("Développement front-end (Next.js / React)", 1500, {
            details: "Intégration pixel-perfect, animations, formulaires de contact, performance optimisée.",
          }),
          line("CMS & back-office", 500, {
            details: "Interface d'administration pour éditer textes, images et actualités sans compétence technique.",
          }),
        ],
      ),
      section(
        "SEO, mise en ligne & formation",
        "Assurer la visibilité et la prise en main.",
        [
          line("Optimisation SEO technique & performances", 350, {
            details: "Balises, données structurées, sitemap, Core Web Vitals, accessibilité.",
          }),
          line("Mise en ligne, tests & formation", 400, {
            details: "Configuration hébergement, SSL, tests multi-navigateurs, session de formation d'1 h, remise des accès.",
          }),
          line("Rédaction des contenus (par page)", 90, {
            quantity: 5,
            unit: "page",
            optional: true,
            details: "Rédaction web optimisée SEO, deux allers-retours inclus.",
          }),
        ],
      ),
    ],
    subscription: {
      enabled: true,
      label: defaultQuoteSubscriptionLabel,
      monthlyPriceHT: 89,
      commitmentMonths: 12,
    },
  },
  "site-template": {
    label: "Site template",
    hint: "500 € · 1–2 semaines",
    title: "Site vitrine sur base template",
    object:
      "Site vitrine prêt à l'emploi, personnalisé à votre activité et mis en ligne rapidement.",
    introduction:
      "Vous souhaitez être présent en ligne rapidement avec un budget maîtrisé. Nous personnalisons un template professionnel à vos couleurs, intégrons vos contenus et mettons le site en ligne, prêt à convertir.",
    deliveryDelay:
      "Délai indicatif de 1 à 2 semaines ouvrées à compter de l'encaissement de l'acompte et de la réception des contenus.",
    buildSections: () => [
      section("Personnalisation & mise en ligne", "", [
        line("Personnalisation du template", 300, {
          details: "Couleurs, typographies, logo, structure des pages adaptée à votre activité.",
        }),
        line("Intégration des contenus", 120, {
          details: "Textes et visuels fournis, jusqu'à 5 pages.",
        }),
        line("Mise en ligne & formation", 80, {
          details: "Hébergement, SSL, tests, prise en main de 30 min.",
        }),
      ]),
    ],
    subscription: {
      enabled: true,
      label: defaultQuoteSubscriptionLabel,
      monthlyPriceHT: 49,
      commitmentMonths: 12,
    },
  },
  ecommerce: {
    label: "Boutique e-commerce",
    hint: "≈ 7 500 € · 8–12 semaines",
    title: "Création d'une boutique en ligne",
    object:
      "Conception, design et développement d'une boutique e-commerce sur mesure : catalogue, panier, paiement sécurisé et back-office de gestion.",
    introduction:
      "Cette proposition couvre la création complète de votre boutique en ligne, de la stratégie à la mise en production. L'objectif : une expérience d'achat fluide, un tunnel de conversion optimisé et une gestion quotidienne simple pour votre équipe.",
    deliveryDelay:
      "Délai indicatif de 8 à 12 semaines ouvrées à compter de l'encaissement de l'acompte et de la réception du catalogue produits.",
    buildSections: () => [
      section("Cadrage & UX e-commerce", "", [
        line("Atelier de cadrage & parcours d'achat", 600, {
          details: "Objectifs, cibles, benchmark, définition du tunnel de conversion et des règles métier.",
        }),
        line("Wireframes des pages clés", 600, {
          details: "Accueil, catégorie, fiche produit, panier, checkout, compte client.",
        }),
      ]),
      section("Design", "", [
        line("Direction artistique & maquettes", 1500, {
          details: "Charte e-commerce, maquettes haute fidélité responsive de l'ensemble des templates.",
        }),
      ]),
      section("Développement", "", [
        line("Développement front-end & catalogue", 2400, {
          details: "Listing produits, filtres, recherche, fiches produits, variantes, stock.",
        }),
        line("Tunnel d'achat & paiement sécurisé", 1200, {
          details: "Panier, checkout, Stripe / PayPal, emails transactionnels, gestion des livraisons.",
        }),
        line("Back-office de gestion", 600, {
          details: "Commandes, clients, produits, promotions, exports comptables.",
        }),
      ]),
      section("Lancement", "", [
        line("SEO, performances & sécurité", 400, {
          details: "Données structurées produits, sitemap, RGPD, HTTPS, tests de charge.",
        }),
        line("Mise en production & formation", 200, {
          details: "Recette, mise en ligne, formation de 2 h à la gestion quotidienne.",
        }),
        line("Import du catalogue produits", 8, {
          quantity: 50,
          unit: "unite",
          optional: true,
          details: "Saisie et mise en forme des fiches produits à partir de vos fichiers.",
        }),
      ]),
    ],
    subscription: {
      enabled: true,
      label: "Maintenance e-commerce, hébergement haute disponibilité, sauvegardes et support",
      monthlyPriceHT: 149,
      commitmentMonths: 12,
    },
  },
  refonte: {
    label: "Refonte de site",
    hint: "≈ 3 200 € · 4–6 semaines",
    title: "Refonte du site internet",
    object:
      "Refonte complète du site existant : nouvelle identité visuelle, expérience utilisateur repensée, performances et référencement améliorés.",
    introduction:
      "Votre site actuel ne reflète plus votre positionnement. Cette refonte vise à moderniser l'image, fluidifier la navigation, améliorer la conversion et préserver — voire renforcer — votre référencement acquis.",
    deliveryDelay:
      "Délai indicatif de 4 à 6 semaines ouvrées à compter de l'encaissement de l'acompte.",
    buildSections: () => [
      section("Audit & cadrage", "", [
        line("Audit de l'existant (UX, SEO, technique)", 400, {
          details: "Analyse des parcours, du contenu, des performances et du positionnement SEO actuel.",
        }),
        line("Nouvelle arborescence & wireframes", 400),
      ]),
      section("Design", "", [
        line("Nouvelle direction artistique & maquettes", 900, {
          details: "Refonte graphique complète, responsive, cohérente avec votre charte.",
        }),
      ]),
      section("Développement & migration", "", [
        line("Développement du nouveau site", 1100, {
          details: "Intégration, animations, formulaires, CMS.",
        }),
        line("Migration des contenus & redirections SEO", 250, {
          details: "Reprise des contenus, plan de redirections 301 pour conserver le référencement.",
        }),
        line("Mise en ligne, tests & formation", 150),
      ]),
    ],
    subscription: {
      enabled: true,
      label: defaultQuoteSubscriptionLabel,
      monthlyPriceHT: 89,
      commitmentMonths: 12,
    },
  },
  maintenance: {
    label: "Maintenance & accompagnement",
    hint: "Forfait mensuel",
    title: "Contrat de maintenance & accompagnement digital",
    object:
      "Maintenance technique, hébergement, sauvegardes, mises à jour et accompagnement à l'évolution du site.",
    introduction:
      "Un site vivant nécessite un suivi régulier. Ce contrat garantit la sécurité, la disponibilité et l'évolution continue de votre site, avec un interlocuteur unique et des temps de réponse définis.",
    deliveryDelay: "Mise en place sous 5 jours ouvrés à compter de la signature.",
    buildSections: () => [
      section("Mise en place", "", [
        line("Audit initial & mise en place du monitoring", 250, {
          details: "Vérification de l'existant, sauvegardes, alertes de disponibilité, plan de maintenance.",
        }),
      ]),
    ],
    subscription: {
      enabled: true,
      label:
        "Maintenance mensuelle : hébergement, sauvegardes quotidiennes, mises à jour de sécurité, 1 h d'évolutions incluse, support sous 48 h",
      monthlyPriceHT: 129,
      commitmentMonths: 12,
    },
  },
};

export function applyQuoteTemplate(templateId: QuoteTemplateId) {
  const template = quoteTemplates[templateId];
  return {
    title: template.title,
    object: template.object,
    introduction: template.introduction,
    deliveryDelay: template.deliveryDelay,
    sections: template.buildSections(),
    subscription: template.subscription
      ? { ...template.subscription }
      : undefined,
  };
}

/* ───────────────────────── Calculs ───────────────────────── */

export function lineTotal(item: QuoteLineItem) {
  return round2(item.quantity * item.unitPrice);
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function flattenQuoteItems(sections: QuoteSection[] | undefined, items: QuoteLineItem[]) {
  if (!sections || sections.length === 0) return items.filter((item) => !item.optional);
  return sections.flatMap((s) => s.items.filter((item) => !item.optional));
}

export function getQuoteSections(quote: Pick<Quote, "sections" | "items">): QuoteSection[] {
  if (quote.sections && quote.sections.length > 0) return quote.sections;
  if (quote.items.length === 0) return [];
  return [createEmptySection({ title: "Prestations", description: "", items: quote.items })];
}

export function getQuoteOptionalItems(quote: Pick<Quote, "sections" | "items">) {
  return getQuoteSections(quote).flatMap((s) => s.items.filter((item) => item.optional));
}

export function getSectionSubtotal(section: QuoteSection) {
  return round2(
    section.items
      .filter((item) => !item.optional)
      .reduce((sum, item) => sum + lineTotal(item), 0),
  );
}

export function getDiscountAmount(subtotalHT: number, discount?: QuoteDiscount) {
  if (!discount || discount.value <= 0) return 0;
  if (discount.type === "percent") {
    return round2(subtotalHT * Math.min(100, discount.value) / 100);
  }
  return round2(Math.min(subtotalHT, discount.value));
}

export type QuoteAmounts = {
  subtotalHT: number;
  discountAmount: number;
  netHT: number;
  tvaAmount: number;
  totalTTC: number;
  depositPercent: number;
  depositAmount: number;
  balanceAmount: number;
  optionalTotal: number;
};

export function getQuoteAmounts(
  quote: Pick<Quote, "sections" | "items" | "tvaRate" | "discount" | "depositPercent">,
): QuoteAmounts {
  const included = flattenQuoteItems(quote.sections, quote.items);
  const subtotalHT = round2(included.reduce((sum, item) => sum + lineTotal(item), 0));
  const discountAmount = getDiscountAmount(subtotalHT, quote.discount);
  const netHT = round2(subtotalHT - discountAmount);
  const tvaAmount = round2(netHT * (quote.tvaRate / 100));
  const totalTTC = round2(netHT + tvaAmount);
  const depositPercent = clampPercent(quote.depositPercent ?? defaultDepositPercent);
  const depositAmount = round2(totalTTC * depositPercent / 100);
  const balanceAmount = round2(totalTTC - depositAmount);
  const optionalTotal = round2(
    getQuoteOptionalItems(quote).reduce((sum, item) => sum + lineTotal(item), 0),
  );

  return {
    subtotalHT,
    discountAmount,
    netHT,
    tvaAmount,
    totalTTC,
    depositPercent,
    depositAmount,
    balanceAmount,
    optionalTotal,
  };
}

function clampPercent(value: number) {
  if (Number.isNaN(value)) return defaultDepositPercent;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/** Compatibilité : totaux simples sur une liste de lignes (factures) */
export function calculateQuoteTotals(items: QuoteLineItem[], tvaRate: number) {
  const subtotalHT = round2(
    items.filter((item) => !item.optional).reduce((sum, item) => sum + lineTotal(item), 0),
  );
  const tvaAmount = round2(subtotalHT * (tvaRate / 100));
  const totalTTC = round2(subtotalHT + tvaAmount);

  return { subtotalHT, tvaAmount, totalTTC };
}

export function getSubscriptionMonthlyTTC(
  subscription: QuoteSubscription | undefined,
  tvaRate: number,
) {
  if (!subscription?.enabled || subscription.monthlyPriceHT <= 0) return 0;
  return round2(subscription.monthlyPriceHT * (1 + tvaRate / 100));
}

/* ───────────────────────── Dates & numéros ───────────────────────── */

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

export function isQuoteExpired(quote: Pick<Quote, "validUntil" | "status">) {
  if (quote.status === "accepte" || quote.status === "refuse") return false;
  const today = new Date().toISOString().slice(0, 10);
  return quote.validUntil < today;
}

/* ───────────────────────── Construction ───────────────────────── */

export type QuoteBuilderInput = {
  clientId?: number;
  client: QuoteClient;
  clientType: QuoteClientType;
  title: string;
  object: string;
  introduction: string;
  sections: QuoteSection[];
  discount?: QuoteDiscount;
  depositPercent: number;
  date: string;
  validityDays: number;
  tvaRate: number;
  deliveryDelay: string;
  paymentTerms: string;
  notes: string;
  internalNotes: string;
  subscription?: QuoteSubscription;
};

export type QuoteValidation = { ok: true; draft: QuoteDraft } | { ok: false; error: string };

export function buildQuoteDraft(input: QuoteBuilderInput): QuoteValidation {
  if (!input.client.company.trim() && !input.client.name.trim()) {
    return { ok: false, error: "Renseignez au moins l'entreprise ou le nom du contact client." };
  }

  const cleanedSections = input.sections
    .map((s) => ({
      ...s,
      title: s.title.trim(),
      description: s.description?.trim() || "",
      items: s.items
        .filter((item) => item.description.trim() && item.unitPrice > 0)
        .map((item) => ({
          ...item,
          description: item.description.trim(),
          details: item.details?.trim() || undefined,
          quantity: Math.max(0.25, item.quantity || 1),
          unit: item.unit ?? "forfait",
          unitPrice: round2(Math.max(0, item.unitPrice)),
          optional: Boolean(item.optional),
        })),
    }))
    .filter((s) => s.items.length > 0);

  const included = flattenQuoteItems(cleanedSections, []);
  const hasSubscription = Boolean(input.subscription?.enabled && input.subscription.monthlyPriceHT > 0);

  if (included.length === 0 && !hasSubscription) {
    return {
      ok: false,
      error: "Ajoutez au moins une prestation incluse (avec un prix) ou un abonnement.",
    };
  }

  const draft: QuoteDraft = {
    clientId: input.clientId,
    client: {
      name: input.client.name.trim(),
      company: input.client.company.trim(),
      email: input.client.email.trim(),
      address: input.client.address.trim(),
      phone: input.client.phone?.trim() || undefined,
      siret: input.client.siret?.trim() || undefined,
      tvaNumber: input.client.tvaNumber?.trim() || undefined,
    },
    clientType: input.clientType,
    title: input.title.trim() || undefined,
    object: input.object.trim() || defaultQuoteObject,
    introduction: input.introduction.trim() || undefined,
    sections: cleanedSections,
    items: included,
    discount:
      input.discount && input.discount.value > 0
        ? { ...input.discount, label: input.discount.label?.trim() || undefined }
        : undefined,
    depositPercent: clampPercent(input.depositPercent),
    tvaRate: input.tvaRate ?? defaultTvaRate,
    status: "brouillon",
    date: input.date,
    validUntil: addDaysToDate(input.date, input.validityDays),
    deliveryDelay: input.deliveryDelay.trim() || defaultDeliveryDelay,
    paymentTerms: input.paymentTerms.trim() || defaultPaymentTerms,
    notes: input.notes.trim() || undefined,
    internalNotes: input.internalNotes.trim() || undefined,
    subscription: hasSubscription && input.subscription
      ? {
          enabled: true,
          label: input.subscription.label.trim() || defaultQuoteSubscriptionLabel,
          monthlyPriceHT: round2(Math.max(0, input.subscription.monthlyPriceHT)),
          commitmentMonths: input.subscription.commitmentMonths ?? 0,
        }
      : undefined,
  };

  return { ok: true, draft };
}

export function createQuoteFromDraft(existing: Quote[], draft: QuoteDraft): Quote {
  const { totalTTC } = getQuoteAmounts(draft);
  const now = new Date().toISOString();

  return {
    ...draft,
    id: existing.reduce((max, q) => Math.max(max, q.id), 0) + 1,
    number: generateQuoteNumber(existing),
    amount: totalTTC,
    sentAt: draft.status === "envoye" ? now : undefined,
    updatedAt: now,
  };
}

export function applyDraftToQuote(quote: Quote, draft: QuoteDraft): Quote {
  const { totalTTC } = getQuoteAmounts(draft);
  const now = new Date().toISOString();

  return {
    ...quote,
    ...draft,
    id: quote.id,
    number: quote.number,
    amount: totalTTC,
    sentAt: draft.status === "envoye" && !quote.sentAt ? now : quote.sentAt,
    updatedAt: now,
  };
}

export function duplicateQuote(existing: Quote[], source: Quote): Quote {
  const today = new Date().toISOString().slice(0, 10);
  const validityDays = Math.max(
    7,
    Math.round(
      (new Date(`${source.validUntil}T12:00:00`).getTime() -
        new Date(`${source.date}T12:00:00`).getTime()) /
        86_400_000,
    ) || 30,
  );

  const sections = getQuoteSections(source).map((s) => ({
    ...s,
    id: uid("section"),
    items: s.items.map((item) => ({ ...item, id: uid("line") })),
  }));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, number: _number, amount: _amount, ...rest } = source;
  const draft: QuoteDraft = {
    ...rest,
    sections,
    items: flattenQuoteItems(sections, []),
    status: "brouillon",
    date: today,
    validUntil: addDaysToDate(today, validityDays),
    sentAt: undefined,
    acceptedAt: undefined,
    refusedAt: undefined,
  };

  return createQuoteFromDraft(existing, draft);
}

export function setQuoteStatus(quote: Quote, status: QuoteStatus): Quote {
  const now = new Date().toISOString();
  return {
    ...quote,
    status,
    sentAt: status === "envoye" && !quote.sentAt ? now : quote.sentAt,
    acceptedAt: status === "accepte" ? now : status === "refuse" ? undefined : quote.acceptedAt,
    refusedAt: status === "refuse" ? now : status === "accepte" ? undefined : quote.refusedAt,
    updatedAt: now,
  };
}

/* ───────────────────────── Labels ───────────────────────── */

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

/* ───────────────────────── Persistance ───────────────────────── */

export function normalizeStoredQuote(quote: Quote): Quote {
  const rawSections = Array.isArray(quote.sections) ? quote.sections : undefined;
  const items = Array.isArray(quote.items) ? quote.items : [];

  const sections =
    rawSections && rawSections.length > 0
      ? rawSections.map((s) => ({
          ...s,
          items: Array.isArray(s.items) ? s.items.map(normalizeLine) : [],
        }))
      : items.length > 0
        ? [createEmptySection({ title: "Prestations", description: "", items: items.map(normalizeLine) })]
        : [];

  const normalized: Quote = {
    ...quote,
    sections,
    items: flattenQuoteItems(sections, items.map(normalizeLine)),
    object: quote.object ?? defaultQuoteObject,
    deliveryDelay: quote.deliveryDelay ?? defaultDeliveryDelay,
    clientType: quote.clientType ?? "professional",
    depositPercent: quote.depositPercent ?? defaultDepositPercent,
    tvaRate: typeof quote.tvaRate === "number" ? quote.tvaRate : defaultTvaRate,
    subscription: quote.subscription?.enabled
      ? {
          enabled: true,
          label: quote.subscription.label || defaultQuoteSubscriptionLabel,
          monthlyPriceHT: quote.subscription.monthlyPriceHT ?? 0,
          commitmentMonths: quote.subscription.commitmentMonths ?? 0,
        }
      : undefined,
    client: {
      name: quote.client?.name ?? "",
      company: quote.client?.company ?? "",
      email: quote.client?.email ?? "",
      address: quote.client?.address ?? "",
      phone: quote.client?.phone,
      siret: quote.client?.siret ?? "",
      tvaNumber: quote.client?.tvaNumber ?? "",
    },
  };

  if (normalized.status === "envoye" && isQuoteExpired(normalized)) {
    normalized.status = "expire";
  }

  normalized.amount = getQuoteAmounts(normalized).totalTTC;
  return normalized;
}

function normalizeLine(item: QuoteLineItem): QuoteLineItem {
  return {
    id: item.id ?? uid("line"),
    description: item.description ?? "",
    details: item.details,
    quantity: typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1,
    unit: item.unit ?? "forfait",
    unitPrice: typeof item.unitPrice === "number" ? item.unitPrice : 0,
    optional: Boolean(item.optional),
  };
}

export function loadStoredQuotes(): Quote[] {
  const parsed = readStorage<Quote[]>(QUOTES_STORAGE_KEY, []);
  if (!Array.isArray(parsed)) return [];
  return parsed.map(normalizeStoredQuote);
}

export function saveStoredQuotes(quotes: Quote[], options?: { immediate?: boolean }) {
  writeStorage(QUOTES_STORAGE_KEY, quotes, { immediate: options?.immediate });
}

export function getClientDisplayName(quote: Pick<Quote, "client">) {
  return quote.client.company || quote.client.name;
}

export function getQuoteTitle(quote: Pick<Quote, "title" | "object">) {
  return quote.title?.trim() || quote.object;
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
