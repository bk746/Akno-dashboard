export type ProspectPipeline = "sur-mesure" | "templates";

export type ProspectOutcome = "en-cours" | "gagne" | "perdu";

export type Prospect = {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  company: string;
  website?: string;
  email: string;
  phone: string;
  sector: string;
  value: number;
  pipeline: ProspectPipeline;
  outcome: ProspectOutcome;
  mailsSent: number;
  callsMade: number;
  lastContact?: string;
  notes?: string;
};

export type ContactStep =
  | "none"
  | "mail-1"
  | "mail-2"
  | "mail-3"
  | "appel-1"
  | "appel-2"
  | "mail-1-appel-1"
  | "mail-2-appel-1"
  | "mail-2-appel-2"
  | "mail-3-appel-1";

export type NewProspectInput = {
  pipeline: ProspectPipeline;
  firstName: string;
  lastName: string;
  company: string;
  website?: string;
  contactStep: ContactStep;
  email?: string;
  phone?: string;
  notes?: string;
};

export const contactStepOptions: {
  value: ContactStep;
  label: string;
  mailsSent: number;
  callsMade: number;
}[] = [
  { value: "none", label: "Pas encore contacté", mailsSent: 0, callsMade: 0 },
  { value: "mail-1", label: "1er mail", mailsSent: 1, callsMade: 0 },
  { value: "mail-2", label: "2e mail", mailsSent: 2, callsMade: 0 },
  { value: "mail-3", label: "3e mail", mailsSent: 3, callsMade: 0 },
  { value: "appel-1", label: "1er appel", mailsSent: 0, callsMade: 1 },
  { value: "appel-2", label: "2e appel", mailsSent: 0, callsMade: 2 },
  {
    value: "mail-1-appel-1",
    label: "1er mail · 1er appel",
    mailsSent: 1,
    callsMade: 1,
  },
  {
    value: "mail-2-appel-1",
    label: "2e mail · 1er appel",
    mailsSent: 2,
    callsMade: 1,
  },
  {
    value: "mail-2-appel-2",
    label: "2e mail · 2e appel",
    mailsSent: 2,
    callsMade: 2,
  },
  {
    value: "mail-3-appel-1",
    label: "3e mail · 1er appel",
    mailsSent: 3,
    callsMade: 1,
  },
];

export const pipelineConfig: Record<
  ProspectPipeline,
  {
    label: string;
    subtitle: string;
    owner: string;
    valueHint: string;
    showValue: boolean;
    accentClass: string;
    badgeClass: string;
  }
> = {
  "sur-mesure": {
    label: "Sites sur mesure",
    subtitle: "Sites internet personnalisés",
    owner: "Keryan",
    valueHint: "",
    showValue: false,
    accentClass: "text-neu-accent-2",
    badgeClass: "bg-neu-accent-2/15 text-neu-accent-2",
  },
  templates: {
    label: "Sites templates",
    subtitle: "500 € — prêt à l'emploi",
    owner: "Collaboratrice",
    valueHint: "~500 €",
    showValue: true,
    accentClass: "text-neu-accent-1",
    badgeClass: "bg-neu-accent-1/15 text-neu-accent-1",
  },
};

export const prospectPipelines: ProspectPipeline[] = ["sur-mesure", "templates"];

import { AKNO_STORAGE_KEYS, readStorage, writeStorage } from "@/lib/persistence";

export const PROSPECTS_STORAGE_KEY = AKNO_STORAGE_KEYS.prospects;

export const initialProspects: Prospect[] = [];

/** @deprecated Utiliser loadStoredProspects() côté client */
export const prospects = initialProspects;

export function loadStoredProspects(): Prospect[] {
  const parsed = readStorage<Prospect[]>(PROSPECTS_STORAGE_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveStoredProspects(items: Prospect[]) {
  writeStorage(PROSPECTS_STORAGE_KEY, items);
}

function formatStep(count: number, type: "mail" | "appel") {
  const word = type === "mail" ? "mail" : "appel";
  if (count === 1) return `1er ${word}`;
  return `${count}e ${word}`;
}

export function isContacted(prospect: Prospect) {
  return prospect.mailsSent > 0 || prospect.callsMade > 0;
}

export function getProspectionLabel(prospect: Prospect) {
  if (prospect.outcome === "gagne") return "Client gagné";
  if (prospect.outcome === "perdu") return "Perdu";
  if (!isContacted(prospect)) return "Pas encore contacté";

  const parts: string[] = [];
  if (prospect.mailsSent > 0) {
    parts.push(formatStep(prospect.mailsSent, "mail"));
  }
  if (prospect.callsMade > 0) {
    parts.push(formatStep(prospect.callsMade, "appel"));
  }
  return parts.join(" · ");
}

export function getContactStatus(prospect: Prospect) {
  if (prospect.outcome === "gagne") {
    return { label: "Gagné", tone: "success" as const };
  }
  if (prospect.outcome === "perdu") {
    return { label: "Perdu", tone: "lost" as const };
  }
  if (!isContacted(prospect)) {
    return { label: "Non contacté", tone: "pending" as const };
  }
  return { label: "Contacté", tone: "active" as const };
}

export function getProspectsByPipeline(
  items: Prospect[],
  pipeline: ProspectPipeline,
) {
  return items.filter((p) => p.pipeline === pipeline);
}

export function createProspect(
  items: Prospect[],
  input: NewProspectInput,
): Prospect {
  const step = contactStepOptions.find((o) => o.value === input.contactStep);
  const mailsSent = step?.mailsSent ?? 0;
  const callsMade = step?.callsMade ?? 0;
  const contacted = mailsSent > 0 || callsMade > 0;
  const today = new Date().toISOString().slice(0, 10);
  const nextId = items.reduce((max, p) => Math.max(max, p.id), 0) + 1;

  return {
    id: nextId,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    name: `${input.firstName.trim()} ${input.lastName.trim()}`,
    company: input.company.trim(),
    website: input.website?.trim() || undefined,
    email: input.email?.trim() || "",
    phone: input.phone?.trim() || "",
    sector: "",
    value: input.pipeline === "templates" ? 500 : 0,
    pipeline: input.pipeline,
    outcome: "en-cours",
    mailsSent,
    callsMade,
    lastContact: contacted ? today : undefined,
    notes: input.notes?.trim() || undefined,
  };
}

export function normalizeWebsite(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
