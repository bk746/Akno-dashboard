import type { Client } from "@/lib/clients";
import { saveStoredClients } from "@/lib/clients";
import {
  recommendedDashboardLayout,
  saveDashboardLayout,
} from "@/lib/dashboard";
import type { Transaction } from "@/lib/finances";
import { saveStoredTransactions } from "@/lib/finances";
import type { Goal } from "@/lib/goals";
import { saveStoredGoals } from "@/lib/goals";
import type { Invoice } from "@/lib/invoices";
import { saveStoredInvoices } from "@/lib/invoices";
import { AKNO_STORAGE_KEYS, readStorage } from "@/lib/persistence";
import type { PlannerData } from "@/lib/planner";
import { savePlannerData } from "@/lib/planner";
import type { Project } from "@/lib/projects";
import { saveStoredProjects } from "@/lib/projects";
import type { Prospect } from "@/lib/prospects";
import { saveStoredProspects } from "@/lib/prospects";
import type { Quote } from "@/lib/quotes";
import {
  defaultDeliveryDelay,
  defaultPaymentTerms,
  defaultQuoteObject,
  saveStoredQuotes,
} from "@/lib/quotes";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

function daysAgo(days: number) {
  return daysFromNow(-days);
}

function monthsAgo(months: number, day = 12) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  date.setDate(day);
  return isoDate(date);
}

export function isAppDataEmpty() {
  if (typeof window === "undefined") return false;

  const clients = readStorage<Client[]>(AKNO_STORAGE_KEYS.clients, []);
  const transactions = readStorage<Transaction[]>(AKNO_STORAGE_KEYS.finances, []);

  return clients.length === 0 && transactions.length === 0;
}

export function buildDemoData() {
  const clients: Client[] = [
    {
      id: 1,
      name: "Sophie Martin",
      company: "Maison Lumière",
      email: "contact@maisonlumiere.fr",
      phone: "06 12 34 56 78",
      revenue: 5400,
      monthlySubscription: 89,
      status: "active",
      initials: "ML",
      color: "#635bff",
      sector: "Artisanat",
      city: "Lyon",
      jobTitle: "Directrice",
      website: "https://maisonlumiere.fr",
      startDate: monthsAgo(4),
    },
    {
      id: 2,
      name: "Thomas Renard",
      company: "Renard & Co",
      email: "thomas@renard-co.fr",
      phone: "06 98 76 54 32",
      revenue: 4200,
      monthlySubscription: 59,
      status: "active",
      initials: "RC",
      color: "#5851ea",
      sector: "Conseil",
      city: "Paris",
      jobTitle: "Fondateur",
      startDate: monthsAgo(3),
    },
    {
      id: 3,
      name: "Camille Dupont",
      company: "Studio Verde",
      email: "hello@studioverde.io",
      phone: "07 11 22 33 44",
      revenue: 3150,
      monthlySubscription: 49,
      status: "active",
      initials: "SV",
      color: "#09825d",
      sector: "Design",
      city: "Bordeaux",
      startDate: monthsAgo(2),
    },
    {
      id: 4,
      name: "Julien Moreau",
      company: "Moreau Immobilier",
      email: "j.moreau@moreau-immo.fr",
      phone: "06 55 44 33 22",
      revenue: 6800,
      status: "pending",
      initials: "MI",
      color: "#0a2540",
      sector: "Immobilier",
      city: "Nantes",
      startDate: daysAgo(18),
    },
    {
      id: 5,
      name: "Émilie Laurent",
      company: "La Table d'Émilie",
      email: "emilie@latabledemilie.fr",
      phone: "06 77 88 99 00",
      revenue: 2900,
      status: "active",
      initials: "TE",
      color: "#df1b41",
      sector: "Restauration",
      city: "Lille",
      monthlySubscription: 39,
      startDate: monthsAgo(5),
    },
    {
      id: 6,
      name: "Nicolas Petit",
      company: "Petit Avocats",
      email: "n.petit@petit-avocats.fr",
      phone: "06 21 43 65 87",
      revenue: 7500,
      status: "active",
      initials: "PA",
      color: "#697386",
      sector: "Juridique",
      city: "Strasbourg",
      monthlySubscription: 99,
      startDate: monthsAgo(6),
    },
    {
      id: 7,
      name: "Laura Bernard",
      company: "Bernard Architecture",
      email: "laura@bernard-archi.com",
      phone: "07 65 43 21 09",
      revenue: 0,
      status: "prospect",
      initials: "BA",
      color: "#635bff",
      sector: "Architecture",
      city: "Montpellier",
    },
    {
      id: 8,
      name: "Marc Lefèvre",
      company: "FitPro Coaching",
      email: "marc@fitpro-coaching.fr",
      phone: "06 34 56 78 90",
      revenue: 1800,
      status: "active",
      initials: "FP",
      color: "#5851ea",
      sector: "Sport & bien-être",
      city: "Toulouse",
      monthlySubscription: 29,
      startDate: monthsAgo(1),
    },
  ];

  const prospects: Prospect[] = [
    {
      id: 1,
      firstName: "Alice",
      lastName: "Fontaine",
      name: "Alice Fontaine",
      company: "Fontaine Digital",
      email: "alice@fontaine-digital.fr",
      phone: "06 10 20 30 40",
      sector: "Marketing",
      value: 4800,
      pipeline: "sur-mesure",
      outcome: "en-cours",
      mailsSent: 2,
      callsMade: 1,
      lastContact: daysAgo(3),
    },
    {
      id: 2,
      firstName: "Hugo",
      lastName: "Girard",
      name: "Hugo Girard",
      company: "Girard BTP",
      email: "hugo@girard-btp.fr",
      phone: "06 22 33 44 55",
      sector: "BTP",
      value: 6200,
      pipeline: "sur-mesure",
      outcome: "en-cours",
      mailsSent: 1,
      callsMade: 0,
      lastContact: daysAgo(6),
    },
    {
      id: 3,
      firstName: "Inès",
      lastName: "Roux",
      name: "Inès Roux",
      company: "Roux Photographie",
      email: "ines@roux-photo.com",
      phone: "07 88 99 00 11",
      sector: "Photo",
      value: 2400,
      pipeline: "templates",
      outcome: "gagne",
      mailsSent: 3,
      callsMade: 1,
      lastContact: daysAgo(12),
    },
    {
      id: 4,
      firstName: "Paul",
      lastName: "Mercier",
      name: "Paul Mercier",
      company: "Mercier Conseil",
      email: "p.mercier@mercier-conseil.fr",
      phone: "06 44 55 66 77",
      sector: "Finance",
      value: 8900,
      pipeline: "sur-mesure",
      outcome: "en-cours",
      mailsSent: 2,
      callsMade: 2,
      lastContact: daysAgo(1),
    },
    {
      id: 5,
      firstName: "Chloé",
      lastName: "Adam",
      name: "Chloé Adam",
      company: "Adam Beauty",
      email: "chloe@adam-beauty.fr",
      phone: "06 99 88 77 66",
      sector: "Beauté",
      value: 1900,
      pipeline: "templates",
      outcome: "perdu",
      mailsSent: 3,
      callsMade: 2,
      lastContact: daysAgo(20),
    },
  ];

  const quotes: Quote[] = [
    {
      id: 1,
      number: "DEV-2026-001",
      client: {
        name: "Sophie Martin",
        company: "Maison Lumière",
        email: "contact@maisonlumiere.fr",
        address: "12 rue des Artisans, 69002 Lyon",
        siret: "12345678900012",
      },
      items: [
        {
          id: "demo-q1-1",
          description: "Site vitrine sur mesure — design, développement, SEO",
          quantity: 1,
          unitPrice: 4500,
        },
      ],
      tvaRate: 0,
      status: "accepte",
      date: monthsAgo(2),
      validUntil: daysAgo(30),
      object: defaultQuoteObject,
      deliveryDelay: defaultDeliveryDelay,
      clientType: "professional",
      paymentTerms: defaultPaymentTerms,
      amount: 5400,
      subscription: {
        enabled: true,
        label: "Maintenance & hébergement mensuel",
        monthlyPriceHT: 89,
      },
    },
    {
      id: 2,
      number: "DEV-2026-002",
      client: {
        name: "Thomas Renard",
        company: "Renard & Co",
        email: "thomas@renard-co.fr",
        address: "8 avenue Haussmann, 75009 Paris",
      },
      items: [
        {
          id: "demo-q2-1",
          description: "Refonte identité visuelle + site corporate",
          quantity: 1,
          unitPrice: 3500,
        },
      ],
      tvaRate: 0,
      status: "accepte",
      date: monthsAgo(1),
      validUntil: daysAgo(10),
      object: "Refonte complète de l'identité digitale et du site corporate.",
      deliveryDelay: defaultDeliveryDelay,
      clientType: "professional",
      amount: 4200,
      subscription: {
        enabled: true,
        label: "Support & mises à jour",
        monthlyPriceHT: 59,
      },
    },
    {
      id: 3,
      number: "DEV-2026-003",
      client: {
        name: "Julien Moreau",
        company: "Moreau Immobilier",
        email: "j.moreau@moreau-immo.fr",
        address: "3 quai de la Fosse, 44000 Nantes",
      },
      items: [
        {
          id: "demo-q3-1",
          description: "Plateforme vitrine + espace annonces",
          quantity: 1,
          unitPrice: 5666.67,
        },
      ],
      tvaRate: 0,
      status: "envoye",
      date: daysAgo(8),
      validUntil: daysFromNow(22),
      object: "Site immobilier avec fiches biens et formulaire de contact avancé.",
      deliveryDelay: defaultDeliveryDelay,
      clientType: "professional",
      amount: 6800,
    },
    {
      id: 4,
      number: "DEV-2026-004",
      client: {
        name: "Alice Fontaine",
        company: "Fontaine Digital",
        email: "alice@fontaine-digital.fr",
        address: "15 rue de la République, 33000 Bordeaux",
      },
      items: [
        {
          id: "demo-q4-1",
          description: "Landing page + tunnel de conversion",
          quantity: 1,
          unitPrice: 4000,
        },
      ],
      tvaRate: 0,
      status: "envoye",
      date: daysAgo(4),
      validUntil: daysFromNow(26),
      object: "Landing page orientée conversion pour campagne marketing.",
      deliveryDelay: "4 semaines ouvrées.",
      clientType: "professional",
      amount: 4800,
    },
    {
      id: 5,
      number: "DEV-2026-005",
      client: {
        name: "Marc Lefèvre",
        company: "FitPro Coaching",
        email: "marc@fitpro-coaching.fr",
        address: "22 allée Jean Jaurès, 31000 Toulouse",
      },
      items: [
        {
          id: "demo-q5-1",
          description: "Site template personnalisé + réservation en ligne",
          quantity: 1,
          unitPrice: 1500,
        },
      ],
      tvaRate: 0,
      status: "accepte",
      date: daysAgo(25),
      validUntil: daysAgo(5),
      object: "Site vitrine coach sportif avec prise de rendez-vous.",
      deliveryDelay: "3 semaines ouvrées.",
      clientType: "professional",
      amount: 1800,
      subscription: {
        enabled: true,
        label: "Hébergement & support",
        monthlyPriceHT: 29,
      },
    },
  ];

  const invoices: Invoice[] = [
    {
      id: 1,
      number: "FAC-2026-001",
      kind: "acompte",
      quoteId: 1,
      quoteNumber: "DEV-2026-001",
      client: quotes[0].client,
      items: quotes[0].items,
      tvaRate: 0,
      status: "payee",
      date: monthsAgo(2, 18),
      dueDate: monthsAgo(2, 5),
      paidDate: monthsAgo(2, 6),
      object: quotes[0].object,
      amount: 2160,
    },
    {
      id: 2,
      number: "FAC-2026-002",
      kind: "solde",
      quoteId: 1,
      quoteNumber: "DEV-2026-001",
      client: quotes[0].client,
      items: quotes[0].items,
      tvaRate: 0,
      status: "payee",
      date: monthsAgo(1, 20),
      dueDate: monthsAgo(1, 5),
      paidDate: monthsAgo(1, 3),
      object: quotes[0].object,
      amount: 3240,
    },
    {
      id: 3,
      number: "FAC-2026-003",
      kind: "acompte",
      quoteId: 2,
      quoteNumber: "DEV-2026-002",
      client: quotes[1].client,
      items: quotes[1].items,
      tvaRate: 0,
      status: "payee",
      date: daysAgo(20),
      dueDate: daysAgo(5),
      paidDate: daysAgo(4),
      object: quotes[1].object,
      amount: 1680,
    },
    {
      id: 4,
      number: "FAC-2026-004",
      kind: "acompte",
      quoteId: 5,
      quoteNumber: "DEV-2026-005",
      client: quotes[4].client,
      items: quotes[4].items,
      tvaRate: 0,
      status: "envoyee",
      date: daysAgo(6),
      dueDate: daysFromNow(24),
      object: quotes[4].object,
      amount: 720,
    },
  ];

  const transactions: Transaction[] = [
    { id: 1, label: "Solde — Maison Lumière", amount: 3240, type: "income", category: "Prestations", date: monthsAgo(1, 3), source: "invoice", sourceId: 2 },
    { id: 2, label: "Acompte — Renard & Co", amount: 1680, type: "income", category: "Prestations", date: daysAgo(4), source: "invoice", sourceId: 3 },
    { id: 3, label: "Abonnements clients (MRR)", amount: 1287, type: "income", category: "Récurrent", date: daysAgo(2), frequency: "recurring" },
    { id: 4, label: "Studio Verde — acompte", amount: 1260, type: "income", category: "Prestations", date: daysAgo(10) },
    { id: 5, label: "Petit Avocats — maintenance", amount: 890, type: "income", category: "Récurrent", date: daysAgo(1), frequency: "recurring" },
    { id: 6, label: "Vercel Pro", amount: 20, type: "expense", category: "Outils & logiciels", date: daysAgo(1), frequency: "recurring" },
    { id: 7, label: "Figma", amount: 15, type: "expense", category: "Outils & logiciels", date: daysAgo(2), frequency: "recurring" },
    { id: 8, label: "Google Workspace", amount: 12, type: "expense", category: "Outils & logiciels", date: daysAgo(3), frequency: "recurring" },
    { id: 9, label: "Publicité LinkedIn", amount: 150, type: "expense", category: "Marketing", date: daysAgo(5) },
    { id: 10, label: "Freelance intégration", amount: 450, type: "expense", category: "Freelance", date: daysAgo(7) },
    { id: 11, label: "Acompte — Maison Lumière", amount: 2160, type: "income", category: "Prestations", date: monthsAgo(2, 6), source: "invoice", sourceId: 1 },
    { id: 12, label: "La Table d'Émilie — site", amount: 2900, type: "income", category: "Prestations", date: monthsAgo(3, 8) },
    { id: 13, label: "Petit Avocats — refonte", amount: 7500, type: "income", category: "Prestations", date: monthsAgo(4, 14) },
    { id: 14, label: "Hébergement OVH", amount: 29, type: "expense", category: "Hébergement", date: monthsAgo(1, 1), frequency: "recurring" },
    { id: 15, label: "Déplacement client Lyon", amount: 85, type: "expense", category: "Déplacements", date: monthsAgo(2, 20) },
    { id: 16, label: "Comptable", amount: 120, type: "expense", category: "Administratif", date: monthsAgo(1, 10), frequency: "recurring" },
    { id: 17, label: "Renard & Co — solde", amount: 2520, type: "income", category: "Prestations", date: monthsAgo(0, 8) },
    { id: 18, label: "Notion + outils", amount: 35, type: "expense", category: "Outils & logiciels", date: monthsAgo(2, 2), frequency: "recurring" },
    { id: 19, label: "Campagne Meta Ads", amount: 200, type: "expense", category: "Marketing", date: monthsAgo(3, 15) },
    { id: 20, label: "Studio Verde — solde", amount: 1890, type: "income", category: "Prestations", date: monthsAgo(1, 22) },
  ];

  const goals: Goal[] = [
    { id: 1, label: "Chiffre d'affaires", current: 12450, target: 18000, unit: "€", period: "month" },
    { id: 2, label: "Nouveaux clients", current: 3, target: 5, unit: "", period: "month" },
    { id: 3, label: "Devis signés", current: 4, target: 6, unit: "", period: "month" },
    { id: 4, label: "MRR abonnements", current: 1287, target: 2000, unit: "€", period: "month" },
    { id: 5, label: "Prospects contactés", current: 12, target: 20, unit: "", period: "week" },
    { id: 6, label: "CA annuel", current: 68400, target: 120000, unit: "€", period: "year" },
  ];

  const projects: Project[] = [
    {
      id: 1,
      name: "Refonte e-commerce Maison Lumière",
      code: "AKNO-2026-001",
      clientId: 1,
      status: "production",
      priority: "high",
      color: "#635bff",
      description: "Refonte complète du site e-commerce avec catalogue produits et paiement Stripe.",
      brief: "Moderniser l'expérience d'achat, améliorer le taux de conversion et intégrer la gestion des stocks.",
      startDate: monthsAgo(2),
      dueDate: daysFromNow(12),
      budgetHours: 80,
      budgetAmount: 8500,
      hourlyRate: 75,
      team: ["Marie", "Thomas"],
      phases: [
        { id: 1, name: "Kick-off & brief", completed: true },
        { id: 2, name: "Discovery & cadrage", completed: true },
        { id: 3, name: "Conception & maquettes", completed: true },
        { id: 4, name: "Production", completed: false },
        { id: 5, name: "Revue & retours", completed: false },
        { id: 6, name: "Livraison & clôture", completed: false },
      ],
      timeEntries: [
        { id: 1, date: daysAgo(14), hours: 4, description: "Wireframes catalogue", member: "Marie" },
        { id: 2, date: daysAgo(10), hours: 6, description: "Maquettes Figma homepage", member: "Marie" },
        { id: 3, date: daysAgo(5), hours: 8, description: "Intégration front Next.js", member: "Thomas" },
        { id: 4, date: daysAgo(2), hours: 5, description: "Setup Stripe + panier", member: "Thomas" },
      ],
      deliverables: [
        { id: 1, name: "Maquettes Figma", status: "done" },
        { id: 2, name: "Intégration front", status: "in-progress" },
        { id: 3, name: "Paiement Stripe", status: "in-progress" },
        { id: 4, name: "Recette & mise en prod", status: "todo" },
      ],
      folder: {
        localPath: "/Users/akno/Projets/AKNO-2026-001-Maison-Lumiere",
        cloudUrl: "https://drive.google.com/drive/folders/demo-maison-lumiere",
        figmaUrl: "https://figma.com/file/demo-maison-lumiere",
      },
      createdAt: monthsAgo(2),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Identité visuelle Studio Verde",
      code: "AKNO-2026-002",
      clientId: 3,
      status: "review",
      priority: "medium",
      color: "#09825d",
      description: "Création logo, charte graphique et templates réseaux sociaux.",
      brief: "Positionnement premium éco-responsable, palette nature, typographie élégante.",
      startDate: monthsAgo(1),
      dueDate: daysFromNow(5),
      budgetHours: 35,
      budgetAmount: 4200,
      hourlyRate: 75,
      team: ["Alex"],
      phases: [
        { id: 1, name: "Kick-off & brief", completed: true },
        { id: 2, name: "Discovery & cadrage", completed: true },
        { id: 3, name: "Conception & maquettes", completed: true },
        { id: 4, name: "Production", completed: true },
        { id: 5, name: "Revue & retours", completed: false },
        { id: 6, name: "Livraison & clôture", completed: false },
      ],
      timeEntries: [
        { id: 1, date: daysAgo(20), hours: 3, description: "Moodboard & directions", member: "Alex" },
        { id: 2, date: daysAgo(12), hours: 5, description: "Propositions logo", member: "Alex" },
        { id: 3, date: daysAgo(4), hours: 4, description: "Charte graphique finale", member: "Alex" },
      ],
      deliverables: [
        { id: 1, name: "Logo final", status: "done" },
        { id: 2, name: "Charte graphique PDF", status: "done" },
        { id: 3, name: "Templates Instagram", status: "in-progress" },
      ],
      folder: {
        localPath: "/Users/akno/Projets/AKNO-2026-002-Studio-Verde",
        cloudUrl: "https://drive.google.com/drive/folders/demo-studio-verde",
      },
      createdAt: monthsAgo(1),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: "Landing page FitPro Coaching",
      code: "AKNO-2026-003",
      clientId: 8,
      status: "design",
      priority: "urgent",
      color: "#5851ea",
      description: "Landing page conversion pour lancement programme coaching en ligne.",
      startDate: daysAgo(10),
      dueDate: daysFromNow(8),
      budgetHours: 25,
      budgetAmount: 2800,
      hourlyRate: 75,
      team: ["Marie", "Thomas"],
      phases: [
        { id: 1, name: "Kick-off & brief", completed: true },
        { id: 2, name: "Discovery & cadrage", completed: true },
        { id: 3, name: "Conception & maquettes", completed: false },
        { id: 4, name: "Production", completed: false },
        { id: 5, name: "Revue & retours", completed: false },
        { id: 6, name: "Livraison & clôture", completed: false },
      ],
      timeEntries: [
        { id: 1, date: daysAgo(8), hours: 2, description: "Benchmark concurrents", member: "Marie" },
        { id: 2, date: daysAgo(3), hours: 3, description: "Wireframes landing", member: "Marie" },
      ],
      deliverables: [
        { id: 1, name: "Wireframes", status: "done" },
        { id: 2, name: "Maquettes desktop/mobile", status: "in-progress" },
        { id: 3, name: "Intégration", status: "todo" },
      ],
      folder: {
        localPath: "/Users/akno/Projets/AKNO-2026-003-FitPro",
      },
      createdAt: daysAgo(10),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      name: "Audit UX Renard & Co",
      code: "AKNO-2026-004",
      clientId: 2,
      status: "discovery",
      priority: "low",
      color: "#0ea5e9",
      description: "Audit UX du parcours devis en ligne et recommandations.",
      startDate: daysAgo(3),
      dueDate: daysFromNow(21),
      budgetHours: 20,
      budgetAmount: 2400,
      hourlyRate: 75,
      team: ["Alex"],
      phases: [
        { id: 1, name: "Kick-off & brief", completed: true },
        { id: 2, name: "Discovery & cadrage", completed: false },
        { id: 3, name: "Conception & maquettes", completed: false },
        { id: 4, name: "Production", completed: false },
        { id: 5, name: "Revue & retours", completed: false },
        { id: 6, name: "Livraison & clôture", completed: false },
      ],
      timeEntries: [
        { id: 1, date: daysAgo(2), hours: 2, description: "Analyse parcours actuel", member: "Alex" },
      ],
      deliverables: [
        { id: 1, name: "Rapport audit UX", status: "in-progress" },
        { id: 2, name: "Recommandations priorisées", status: "todo" },
      ],
      folder: {},
      createdAt: daysAgo(3),
      updatedAt: new Date().toISOString(),
    },
  ];

  const planner: PlannerData = {
    reminders: [
      { id: 1, title: "Relancer devis Moreau Immobilier", dueDate: daysFromNow(1), done: false },
      { id: 2, title: "Envoyer facture solde Renard & Co", dueDate: daysFromNow(3), done: false },
      { id: 3, title: "Point mensuel MRR clients", dueDate: daysFromNow(5), done: false },
      { id: 4, title: "Préparer présentation demo AKNO", dueDate: daysAgo(1), done: true },
    ],
    schedule: [
      {
        id: 1,
        title: "Call découverte — Fontaine Digital",
        date: daysFromNow(0),
        time: "10:00",
        endTime: "10:45",
        category: "client",
        done: false,
        notes: "Présentation portfolio + besoins landing page",
      },
      {
        id: 2,
        title: "Revue projet Maison Lumière",
        date: daysFromNow(0),
        time: "14:30",
        endTime: "15:30",
        category: "projet",
        done: false,
      },
      {
        id: 3,
        title: "Envoi devis Mercier Conseil",
        date: daysFromNow(1),
        time: "09:30",
        endTime: "10:00",
        category: "admin",
        done: false,
      },
      {
        id: 4,
        title: "Livraison maquettes Studio Verde",
        date: daysFromNow(2),
        time: "11:00",
        endTime: "12:00",
        category: "projet",
        done: false,
      },
      {
        id: 5,
        title: "Suivi FitPro Coaching",
        date: daysFromNow(3),
        time: "16:00",
        endTime: "16:30",
        category: "client",
        done: false,
      },
    ],
  };

  return { clients, prospects, quotes, invoices, transactions, goals, projects, planner };
}

export function seedDemoData(options?: { replace?: boolean }) {
  if (typeof window === "undefined") return false;

  const replace = options?.replace ?? true;
  if (!replace && !isAppDataEmpty()) return false;

  const demo = buildDemoData();

  saveStoredClients(demo.clients);
  saveStoredProspects(demo.prospects);
  saveStoredQuotes(demo.quotes);
  saveStoredInvoices(demo.invoices);
  saveStoredTransactions(demo.transactions);
  saveStoredGoals(demo.goals);
  saveStoredProjects(demo.projects);
  savePlannerData(demo.planner);
  saveDashboardLayout(recommendedDashboardLayout);

  window.dispatchEvent(new CustomEvent("akno:backup-imported"));
  return true;
}

export function clearDemoData() {
  if (typeof window === "undefined") return;

  for (const key of Object.values(AKNO_STORAGE_KEYS)) {
    localStorage.removeItem(key);
  }

  window.dispatchEvent(new CustomEvent("akno:backup-imported"));
}
