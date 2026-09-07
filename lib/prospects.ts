import { AKNO_STORAGE_KEYS, readStorage, writeStorage } from "@/lib/persistence";
import { resolveIaProspectNotes, severityOrder } from "@/lib/prospect-severity";

export type ProspectPipeline = "sur-mesure" | "templates";

export type ProspectBoard = "keryan" | "louise" | "ia";

export type ProspectOutcome = "en-cours" | "gagne" | "perdu";

/** Gravité de l'image web — rempli par Cursor à l'import IA */
export type ProspectSeverity = "critique" | "haute" | "moyenne" | "basse";

export type WebsiteAudit = {
  score: number;
  issues: string[];
};

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
  board: ProspectBoard;
  outcome: ProspectOutcome;
  mailsSent: number;
  callsMade: number;
  lastContact?: string;
  notes?: string;
  /** Champs enrichis par la prospection IA */
  address?: string;
  city?: string;
  trade?: string;
  googleRating?: number;
  googleReviewCount?: number;
  websiteScore?: number;
  websiteIssues?: string[];
  severity?: ProspectSeverity;
  severityNote?: string;
  iaSearchLabel?: string;
  iaImportedAt?: string;
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
  board: ProspectBoard;
  firstName: string;
  lastName: string;
  company: string;
  website?: string;
  contactStep: ContactStep;
  email?: string;
  phone?: string;
  notes?: string;
  sector?: string;
  address?: string;
  city?: string;
  trade?: string;
  googleRating?: number;
  googleReviewCount?: number;
  websiteScore?: number;
  websiteIssues?: string[];
  severity?: ProspectSeverity;
  severityNote?: string;
  iaSearchLabel?: string;
};

export type ProspectionImportInput = {
  company: string;
  address?: string;
  city?: string;
  phone?: string;
  website?: string;
  googleRating?: number;
  googleReviewCount?: number;
  websiteScore?: number;
  websiteIssues?: string[];
  severity?: ProspectSeverity;
  severityNote?: string;
  notes?: string;
  trade?: string;
  iaSearchLabel?: string;
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

export const boardConfig: Record<
  ProspectBoard,
  {
    label: string;
    subtitle: string;
    href: string;
    pipeline?: ProspectPipeline;
    showValue: boolean;
    accentClass: string;
    badgeClass: string;
  }
> = {
  keryan: {
    label: "Keryan",
    subtitle: "Sites sur mesure",
    href: "/prospects/keryan",
    pipeline: "sur-mesure",
    showValue: false,
    accentClass: "text-neu-accent-2",
    badgeClass: "bg-neu-accent-2/15 text-neu-accent-2",
  },
  louise: {
    label: "Louise",
    subtitle: "Sites templates",
    href: "/prospects/louise",
    pipeline: "templates",
    showValue: true,
    accentClass: "text-neu-accent-1",
    badgeClass: "bg-neu-accent-1/15 text-neu-accent-1",
  },
  ia: {
    label: "Prospection IA",
    subtitle: "Leads Cursor — note gravité + assignation Keryan/Louise",
    href: "/prospects/prospection-ia",
    showValue: false,
    accentClass: "text-violet-600",
    badgeClass: "bg-violet-100 text-violet-700",
  },
};

/** @deprecated Utiliser boardConfig */
export const pipelineConfig = {
  "sur-mesure": {
    label: "Sites sur mesure",
    subtitle: "Sites internet personnalisés",
    owner: "Keryan",
    valueHint: "",
    showValue: false,
    accentClass: boardConfig.keryan.accentClass,
    badgeClass: boardConfig.keryan.badgeClass,
  },
  templates: {
    label: "Sites templates",
    subtitle: "Prêt à l'emploi",
    owner: "Louise",
    valueHint: "",
    showValue: true,
    accentClass: boardConfig.louise.accentClass,
    badgeClass: boardConfig.louise.badgeClass,
  },
};

export const prospectBoards: ProspectBoard[] = ["keryan", "louise", "ia"];

export const prospectPipelines: ProspectPipeline[] = ["sur-mesure", "templates"];

export const PROSPECTS_STORAGE_KEY = AKNO_STORAGE_KEYS.prospects;

export const initialProspects: Prospect[] = [];

/** @deprecated Utiliser loadStoredProspects() côté client */
export const prospects = initialProspects;

export function boardToPipeline(board: ProspectBoard): ProspectPipeline | undefined {
  return boardConfig[board].pipeline;
}

export function migrateProspect(raw: Prospect & { board?: ProspectBoard }): Prospect {
  if (raw.board) return raw;

  const board: ProspectBoard =
    raw.pipeline === "templates" ? "louise" : raw.pipeline === "sur-mesure" ? "keryan" : "ia";

  return { ...raw, board };
}

export function loadStoredProspects(): Prospect[] {
  const parsed = readStorage<(Prospect & { board?: ProspectBoard })[]>(PROSPECTS_STORAGE_KEY, []);
  return Array.isArray(parsed) ? parsed.map(migrateProspect) : [];
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

export type ProspectFollowUpTone = "yellow" | "green" | "red" | "won" | "lost";

/** Délai (jours) avant relance après chaque mail envoyé */
export const followUpGraceDays: Record<1 | 2 | 3, number> = {
  1: 3,
  2: 7,
  3: 14,
};

export function daysSinceContact(lastContact: string, today = new Date()) {
  const from = new Date(`${lastContact}T12:00:00`);
  const to = new Date(`${today.toISOString().slice(0, 10)}T12:00:00`);
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 86_400_000));
}

export function getProspectFollowUp(prospect: Prospect, today = new Date()) {
  if (prospect.outcome === "gagne") {
    return {
      tone: "won" as const,
      label: "Gagné",
      sortOrder: 4,
    };
  }

  if (prospect.outcome === "perdu") {
    return {
      tone: "lost" as const,
      label: "Échec",
      sortOrder: 5,
    };
  }

  if (!isContacted(prospect) || !prospect.lastContact) {
    return {
      tone: "yellow" as const,
      label: "Pas encore contacté",
      hint: "Envoyer le 1er mail",
      sortOrder: 1,
    };
  }

  const days = daysSinceContact(prospect.lastContact, today);
  const mails = Math.min(prospect.mailsSent, 3) as 0 | 1 | 2 | 3;

  if (prospect.mailsSent >= 3 && days > followUpGraceDays[3]) {
    return {
      tone: "red" as const,
      label: "À passer en échec",
      hint: `${days} j sans réponse après 3 mails`,
      suggestFailure: true,
      daysSinceContact: days,
      sortOrder: 0,
    };
  }

  if (mails === 0) {
    return {
      tone: "green" as const,
      label: "Contacté",
      hint: prospect.callsMade > 0 ? "Appel effectué — envoyer un mail" : undefined,
      daysSinceContact: days,
      sortOrder: 2,
    };
  }

  const grace = followUpGraceDays[mails];

  if (days > grace) {
    const next = prospect.mailsSent + 1;
    return {
      tone: "red" as const,
      label: "Relance à faire",
      hint:
        next <= 3
          ? `Envoyer le ${next}${next === 2 ? "e" : next === 3 ? "e" : "er"} mail · ${days} j`
          : `${days} j sans réponse`,
      daysSinceContact: days,
      sortOrder: 0,
    };
  }

  const remaining = grace - days;
  return {
    tone: "green" as const,
    label: "En attente",
    hint:
      remaining === 0
        ? "Relance demain si pas de réponse"
        : `Relance dans ${remaining} j`,
    daysSinceContact: days,
    sortOrder: 2,
  };
}

export function compareProspectFollowUp(a: Prospect, b: Prospect) {
  if (a.board === "ia" && b.board === "ia") {
    const sa = severityOrder[a.severity ?? "basse"];
    const sb = severityOrder[b.severity ?? "basse"];
    if (sa !== sb) return sa - sb;
    const scoreA = a.websiteScore ?? 100;
    const scoreB = b.websiteScore ?? 100;
    if (scoreA !== scoreB) return scoreA - scoreB;
  }

  const fa = getProspectFollowUp(a);
  const fb = getProspectFollowUp(b);
  if (fa.sortOrder !== fb.sortOrder) return fa.sortOrder - fb.sortOrder;
  if (a.outcome !== b.outcome) {
    const order = { "en-cours": 0, gagne: 1, perdu: 2 };
    return order[a.outcome] - order[b.outcome];
  }
  return a.company.localeCompare(b.company, "fr");
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
  const followUp = getProspectFollowUp(prospect);
  if (followUp.tone === "won") {
    return { label: "Gagné", tone: "success" as const };
  }
  if (followUp.tone === "lost") {
    return { label: "Échec", tone: "lost" as const };
  }
  if (followUp.tone === "yellow") {
    return { label: "Non contacté", tone: "pending" as const };
  }
  if (followUp.tone === "red") {
    return { label: followUp.label, tone: "lost" as const };
  }
  return { label: followUp.label, tone: "active" as const };
}

export function getProspectsByBoard(items: Prospect[], board: ProspectBoard) {
  return items.filter((p) => p.board === board);
}

/** @deprecated Utiliser getProspectsByBoard */
export function getProspectsByPipeline(items: Prospect[], pipeline: ProspectPipeline) {
  return items.filter((p) => p.pipeline === pipeline);
}

export function getWebsiteScoreLabel(score?: number) {
  if (score === undefined || score === null) return "—";
  if (score <= 40) return "Site à refaire";
  if (score <= 65) return "Site moyen";
  return "Site correct";
}

export function getWebsiteScoreTone(score?: number) {
  if (score === undefined || score === null) return "neutral" as const;
  if (score <= 40) return "bad" as const;
  if (score <= 65) return "mid" as const;
  return "good" as const;
}

function nextProspectId(items: Prospect[]) {
  return items.reduce((max, p) => Math.max(max, p.id), 0) + 1;
}

export function resolveProspectName(firstName: string, lastName: string, company: string) {
  return `${firstName.trim()} ${lastName.trim()}`.trim() || company.trim();
}

export function createProspect(items: Prospect[], input: NewProspectInput): Prospect {
  const step = contactStepOptions.find((o) => o.value === input.contactStep);
  const mailsSent = step?.mailsSent ?? 0;
  const callsMade = step?.callsMade ?? 0;
  const contacted = mailsSent > 0 || callsMade > 0;
  const today = new Date().toISOString().slice(0, 10);
  const pipeline = boardToPipeline(input.board) ?? "sur-mesure";

  return {
    id: nextProspectId(items),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    name: resolveProspectName(input.firstName, input.lastName, input.company),
    company: input.company.trim(),
    website: input.website?.trim() || undefined,
    email: input.email?.trim() || "",
    phone: input.phone?.trim() || "",
    sector: input.sector?.trim() || input.trade?.trim() || "",
    value: pipeline === "templates" ? 500 : 0,
    pipeline,
    board: input.board,
    outcome: "en-cours",
    mailsSent,
    callsMade,
    lastContact: contacted ? today : undefined,
    notes: input.notes?.trim() || undefined,
    address: input.address?.trim() || undefined,
    city: input.city?.trim() || undefined,
    trade: input.trade?.trim() || undefined,
    googleRating: input.googleRating,
    googleReviewCount: input.googleReviewCount,
    websiteScore: input.websiteScore,
    websiteIssues: input.websiteIssues,
    iaSearchLabel: input.iaSearchLabel,
    iaImportedAt: input.board === "ia" ? today : undefined,
  };
}

export function createProspectsFromIa(
  items: Prospect[],
  imports: ProspectionImportInput[],
): Prospect[] {
  const today = new Date().toISOString().slice(0, 10);
  let nextId = nextProspectId(items);
  const existingKeys = new Set(
    items.map((p) => `${p.company.toLowerCase()}|${p.city?.toLowerCase() ?? ""}`),
  );

  const created: Prospect[] = [];

  for (const row of imports) {
    const key = `${row.company.toLowerCase()}|${row.city?.toLowerCase() ?? ""}`;
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);

    const { severity, severityNote } = resolveIaProspectNotes(row);

    created.push({
      id: nextId++,
      firstName: "",
      lastName: "",
      name: row.company.trim(),
      company: row.company.trim(),
      website: row.website?.trim() || undefined,
      email: "",
      phone: row.phone?.trim() || "",
      sector: row.trade?.trim() || "",
      value: 0,
      pipeline: "sur-mesure",
      board: "ia",
      outcome: "en-cours",
      mailsSent: 0,
      callsMade: 0,
      notes: row.notes?.trim() || undefined,
      address: row.address?.trim() || undefined,
      city: row.city?.trim() || undefined,
      trade: row.trade?.trim() || undefined,
      googleRating: row.googleRating,
      googleReviewCount: row.googleReviewCount,
      websiteScore: row.websiteScore,
      websiteIssues: row.websiteIssues,
      severity,
      severityNote,
      iaSearchLabel: row.iaSearchLabel,
      iaImportedAt: today,
    });
  }

  return created;
}

export function updateProspect(prospect: Prospect, patch: Partial<Prospect>): Prospect {
  const board = patch.board ?? prospect.board;
  const pipeline = boardToPipeline(board) ?? patch.pipeline ?? prospect.pipeline;
  const firstName = patch.firstName ?? prospect.firstName;
  const lastName = patch.lastName ?? prospect.lastName;
  const company = patch.company ?? prospect.company;
  const name = patch.name ?? resolveProspectName(firstName, lastName, company);

  return {
    ...prospect,
    ...patch,
    board,
    pipeline,
    firstName,
    lastName,
    name,
    value: pipeline === "templates" ? patch.value ?? prospect.value ?? 500 : 0,
  };
}

export function assignProspectBoard(prospect: Prospect, board: ProspectBoard): Prospect {
  const pipeline = boardToPipeline(board);
  return updateProspect(prospect, {
    board,
    ...(pipeline ? { pipeline } : {}),
    iaImportedAt: board === "ia" ? prospect.iaImportedAt ?? new Date().toISOString().slice(0, 10) : prospect.iaImportedAt,
  });
}

export function normalizeWebsite(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function bumpProspectMail(prospect: Prospect): Prospect {
  const today = new Date().toISOString().slice(0, 10);
  const nextMails = Math.min(3, prospect.mailsSent + 1);
  return updateProspect(prospect, {
    mailsSent: nextMails,
    lastContact: today,
    outcome: "en-cours",
  });
}
