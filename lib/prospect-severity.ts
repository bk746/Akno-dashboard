import type { ProspectSeverity } from "@/lib/prospects";

export const severityOrder: Record<ProspectSeverity, number> = {
  critique: 0,
  haute: 1,
  moyenne: 2,
  basse: 3,
};

export const severityConfig: Record<
  ProspectSeverity,
  { label: string; shortLabel: string; badgeClass: string; dotClass: string }
> = {
  critique: {
    label: "Critique",
    shortLabel: "Critique — priorité max",
    badgeClass: "bg-red-600 text-white",
    dotClass: "bg-red-600",
  },
  haute: {
    label: "Haute",
    shortLabel: "Haute — site à refaire",
    badgeClass: "bg-orange-500 text-white",
    dotClass: "bg-orange-500",
  },
  moyenne: {
    label: "Moyenne",
    shortLabel: "Moyenne — améliorations possibles",
    badgeClass: "bg-amber-400 text-amber-950",
    dotClass: "bg-amber-400",
  },
  basse: {
    label: "Basse",
    shortLabel: "Basse — site correct",
    badgeClass: "bg-slate-200 text-slate-600",
    dotClass: "bg-slate-400",
  },
};

/** Infère la gravité à partir du score site et de la présence d'un site */
export function inferProspectSeverity(input: {
  website?: string;
  websiteScore?: number;
  websiteIssues?: string[];
}): ProspectSeverity {
  if (!input.website?.trim()) return "critique";

  const score = input.websiteScore;
  if (score === undefined || score === null) {
    const issues = input.websiteIssues ?? [];
    if (issues.some((i) => /pas de https|injoignable|wix|daté/i.test(i))) return "haute";
    return "moyenne";
  }

  if (score <= 30) return "critique";
  if (score <= 50) return "haute";
  if (score <= 70) return "moyenne";
  return "basse";
}

/** Note IA par défaut si l'agent n'en fournit pas */
export function buildDefaultSeverityNote(
  severity: ProspectSeverity,
  input: {
    website?: string;
    websiteScore?: number;
    websiteIssues?: string[];
  },
): string {
  if (!input.website?.trim()) {
    return "Aucun site web — vitrine absente, fort potentiel pour un site AKNO.";
  }

  const issues = input.websiteIssues?.filter(Boolean) ?? [];
  const scorePart =
    input.websiteScore !== undefined ? `Score site ${input.websiteScore}/100.` : "";

  const issuePart =
    issues.length > 0 ? issues.slice(0, 3).join(" · ") : "Présence en ligne perfectible.";

  switch (severity) {
    case "critique":
      return `${scorePart} Image très faible : ${issuePart} Refonte urgente.`.trim();
    case "haute":
      return `${scorePart} Site daté ou peu pro : ${issuePart}`.trim();
    case "moyenne":
      return `${scorePart} Site fonctionnel mais améliorable : ${issuePart}`.trim();
    case "basse":
      return `${scorePart} Site déjà correct — argumentaire sur-mesure / SEO / conversion.`.trim();
  }
}

export function resolveIaProspectNotes(input: {
  severity?: ProspectSeverity;
  severityNote?: string;
  website?: string;
  websiteScore?: number;
  websiteIssues?: string[];
  notes?: string;
}) {
  const severity =
    input.severity ?? inferProspectSeverity(input);
  const severityNote =
    input.severityNote?.trim() ||
    buildDefaultSeverityNote(severity, input);
  return { severity, severityNote };
}
