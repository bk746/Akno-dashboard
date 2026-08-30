import type { Client, ClientStatus } from "@/lib/clients";

export type ClientFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  siret: string;
  sector: string;
  website: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  status: ClientStatus;
  source: string;
  estimatedRevenue: string;
  monthlySubscription: string;
  startDate: string;
  notes: string;
};

export type ClientFormStepId = "contact" | "organization" | "location" | "commercial";

export const CLIENT_FORM_STEPS: {
  id: ClientFormStepId;
  label: string;
  description: string;
}[] = [
  { id: "contact", label: "Contact", description: "Décideur principal" },
  { id: "organization", label: "Organisation", description: "Entité & activité" },
  { id: "location", label: "Localisation", description: "Siège social" },
  { id: "commercial", label: "Contrat", description: "Statut & revenus" },
];

export const CLIENT_SECTORS = [
  "Technologie",
  "Design & Créatif",
  "Commerce & Retail",
  "Industrie",
  "Services",
  "Santé",
  "Immobilier",
  "Restauration",
  "Artisanat",
  "Autre",
] as const;

export const CLIENT_SOURCES = [
  "Recommandation",
  "Site web",
  "LinkedIn",
  "Salon / Événement",
  "Prospection",
  "Partenaire",
  "Autre",
] as const;

export const initialClientForm: ClientFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  jobTitle: "",
  company: "",
  siret: "",
  sector: "",
  website: "",
  address: "",
  postalCode: "",
  city: "",
  country: "France",
  status: "prospect",
  source: "",
  estimatedRevenue: "",
  monthlySubscription: "",
  startDate: "",
  notes: "",
};

export function getClientInitials(firstName: string, lastName: string) {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || "?";
}

export function splitClientName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function clientToFormData(client: Client): ClientFormData {
  const { firstName, lastName } = splitClientName(client.name);
  return {
    firstName,
    lastName,
    email: client.email,
    phone: client.phone,
    jobTitle: client.jobTitle ?? "",
    company: client.company,
    siret: client.siret ?? "",
    sector: client.sector ?? "",
    website: client.website ?? "",
    address: client.address ?? "",
    postalCode: client.postalCode ?? "",
    city: client.city ?? "",
    country: client.country ?? "France",
    status: client.status,
    source: client.source ?? "",
    estimatedRevenue: client.revenue ? String(client.revenue) : "",
    monthlySubscription:
      client.monthlySubscription != null && client.monthlySubscription > 0
        ? String(client.monthlySubscription)
        : "",
    startDate: client.startDate ?? "",
    notes: client.notes ?? "",
  };
}

export function formDataToClientPayload(form: ClientFormData): Omit<Client, "id"> {
  const monthlySub = Number(form.monthlySubscription) || 0;
  return {
    name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
    company: form.company.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    revenue: Number(form.estimatedRevenue) || 0,
    monthlySubscription: monthlySub > 0 ? monthlySub : undefined,
    status: form.status,
    initials: getClientInitials(form.firstName, form.lastName),
    color: "from-neu-accent-2 to-neu-accent-1",
    sector: form.sector || undefined,
    city: form.city || undefined,
    jobTitle: form.jobTitle.trim() || undefined,
    siret: form.siret.trim() || undefined,
    website: form.website.trim() || undefined,
    address: form.address.trim() || undefined,
    postalCode: form.postalCode.trim() || undefined,
    country: form.country.trim() || undefined,
    source: form.source || undefined,
    notes: form.notes.trim() || undefined,
    startDate: form.startDate || undefined,
  };
}

export function validateClientFormStep(
  step: ClientFormStepId,
  form: ClientFormData,
): Partial<Record<keyof ClientFormData, string>> {
  const errors: Partial<Record<keyof ClientFormData, string>> = {};

  if (step === "contact") {
    if (!form.firstName.trim()) errors.firstName = "Requis";
    if (!form.lastName.trim()) errors.lastName = "Requis";
    if (!form.email.trim()) {
      errors.email = "Requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Email invalide";
    }
    if (!form.phone.trim()) errors.phone = "Requis";
  }

  if (step === "organization") {
    if (!form.company.trim()) errors.company = "Requis";
  }

  return errors;
}

export function getClientFormProgress(form: ClientFormData, stepIndex: number) {
  const checks = [
    Boolean(form.firstName && form.lastName && form.email && form.phone),
    Boolean(form.company),
    Boolean(form.city || form.address),
    Boolean(form.status),
  ];

  const completed = checks.filter(Boolean).length;
  const stepBonus = (stepIndex + 1) / CLIENT_FORM_STEPS.length;
  return Math.min(100, Math.round(((completed / checks.length) * 0.7 + stepBonus * 0.3) * 100));
}

export function formatFormMoney(value: string) {
  const num = Number(value);
  if (!value || Number.isNaN(num)) return null;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(num);
}
