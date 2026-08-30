export type DashboardCardId =
  | "kpi-paid-month"
  | "kpi-expenses"
  | "kpi-profit"
  | "kpi-active-clients"
  | "kpi-quotes"
  | "kpi-prospects"
  | "widget-finance-chart"
  | "widget-goals"
  | "widget-activity"
  | "widget-quotes"
  | "widget-prospects"
  | "widget-clients"
  | "widget-reminders"
  | "widget-schedule"
  | "widget-revenue"
  | "widget-calendar"
  | "widget-quick-links";

export type DashboardCardKind = "kpi" | "widget";

export type DashboardCardDefinition = {
  id: DashboardCardId;
  label: string;
  description: string;
  kind: DashboardCardKind;
  colSpan: "4" | "8" | "12";
};

import { AKNO_STORAGE_KEYS, readStorage, writeStorage } from "@/lib/persistence";

export const DASHBOARD_LAYOUT_STORAGE_KEY = AKNO_STORAGE_KEYS.dashboardLayout;

/** Layout AKNO — bandeau KPI puis blocs bento 7/5 et 4×3 */
export const recommendedDashboardLayout: DashboardCardId[] = [
  "kpi-paid-month",
  "kpi-expenses",
  "kpi-profit",
  "widget-revenue",
  "widget-goals",
  "widget-finance-chart",
  "widget-activity",
  "widget-quotes",
  "widget-reminders",
  "widget-schedule",
];

export const dashboardCardCatalog: DashboardCardDefinition[] = [
  {
    id: "kpi-paid-month",
    label: "Encaissé ce mois",
    description: "Total des factures payées ce mois",
    kind: "kpi",
    colSpan: "4",
  },
  {
    id: "kpi-expenses",
    label: "Dépenses (mois)",
    description: "Dépenses du mois en cours",
    kind: "kpi",
    colSpan: "4",
  },
  {
    id: "kpi-profit",
    label: "Bénéfice (mois)",
    description: "Revenus − dépenses du mois",
    kind: "kpi",
    colSpan: "4",
  },
  {
    id: "kpi-active-clients",
    label: "Clients actifs",
    description: "Compteur — préférez la carte « Clients actifs » (liste) pour le détail",
    kind: "kpi",
    colSpan: "4",
  },
  {
    id: "kpi-quotes",
    label: "Devis (total)",
    description: "Compteur — préférez « Devis récents » pour voir la liste",
    kind: "kpi",
    colSpan: "4",
  },
  {
    id: "kpi-prospects",
    label: "Prospects (total)",
    description: "Compteur — préférez « Prospects actifs » pour voir la liste",
    kind: "kpi",
    colSpan: "4",
  },
  {
    id: "widget-finance-chart",
    label: "Graphique finances",
    description: "Revenus vs dépenses",
    kind: "widget",
    colSpan: "8",
  },
  {
    id: "widget-goals",
    label: "Objectifs du mois",
    description: "Suivi de vos objectifs mensuels",
    kind: "widget",
    colSpan: "4",
  },
  {
    id: "widget-activity",
    label: "Activité récente",
    description: "Dernières transactions",
    kind: "widget",
    colSpan: "4",
  },
  {
    id: "widget-quotes",
    label: "Devis récents",
    description: "Les 4 derniers devis",
    kind: "widget",
    colSpan: "4",
  },
  {
    id: "widget-prospects",
    label: "Prospects actifs",
    description: "Liste des prospects en cours",
    kind: "widget",
    colSpan: "4",
  },
  {
    id: "widget-clients",
    label: "Clients actifs",
    description: "Liste de vos clients actifs",
    kind: "widget",
    colSpan: "4",
  },
  {
    id: "widget-reminders",
    label: "Rappels",
    description: "Tâches et échéances à ne pas oublier",
    kind: "widget",
    colSpan: "4",
  },
  {
    id: "widget-schedule",
    label: "Emploi du temps",
    description: "Planning de votre journée",
    kind: "widget",
    colSpan: "4",
  },
  {
    id: "widget-revenue",
    label: "Évolution du CA",
    description: "Courbe basée sur vos factures payées",
    kind: "widget",
    colSpan: "8",
  },
  {
    id: "widget-calendar",
    label: "Calendrier",
    description: "Vue calendrier mensuelle",
    kind: "widget",
    colSpan: "4",
  },
  {
    id: "widget-quick-links",
    label: "Raccourcis",
    description: "Liens rapides vers les pages",
    kind: "widget",
    colSpan: "12",
  },
];

export const dashboardCardMap = Object.fromEntries(
  dashboardCardCatalog.map((card) => [card.id, card]),
) as Record<DashboardCardId, DashboardCardDefinition>;

export function loadDashboardLayout(): DashboardCardId[] {
  const parsed = readStorage<DashboardCardId[]>(DASHBOARD_LAYOUT_STORAGE_KEY, []);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((id) => id in dashboardCardMap);
}

export function loadAndNormalizeDashboardLayout(): DashboardCardId[] {
  return normalizeDashboardLayout(loadDashboardLayout());
}

export function saveDashboardLayout(layout: DashboardCardId[]) {
  writeStorage(DASHBOARD_LAYOUT_STORAGE_KEY, layout);
}

export function getAvailableCards(layout: DashboardCardId[]) {
  return dashboardCardCatalog.filter((card) => !layout.includes(card.id));
}

export function getWidgetColClass(colSpan: DashboardCardDefinition["colSpan"]) {
  if (colSpan === "12") return "xl:col-span-12";
  if (colSpan === "8") return "xl:col-span-8";
  return "xl:col-span-4";
}

/** Largeur grille (12 cols) de chaque widget */
export function getWidgetGridSpan(id: DashboardCardId): number {
  const definition = dashboardCardMap[id];
  if (definition.colSpan === "12") return 12;
  if (definition.colSpan === "8") return 8;
  return 4;
}

const XL_COL_SPAN: Record<number, string> = {
  1: "xl:col-span-1",
  2: "xl:col-span-2",
  3: "xl:col-span-3",
  4: "xl:col-span-4",
  5: "xl:col-span-5",
  6: "xl:col-span-6",
  7: "xl:col-span-7",
  8: "xl:col-span-8",
  9: "xl:col-span-9",
  10: "xl:col-span-10",
  11: "xl:col-span-11",
  12: "xl:col-span-12",
};

export function getDashboardCardColClass(definition: DashboardCardDefinition) {
  if (definition.kind === "kpi") {
    return "col-span-1 sm:col-span-1 xl:col-span-4";
  }
  return getWidgetColClass(definition.colSpan);
}

/** Classe responsive avec expansion auto pour éviter les trous dans la grille */
export function getDashboardCardColClassInRow(
  id: DashboardCardId,
  row: DashboardCardId[],
): string {
  const definition = dashboardCardMap[id];
  if (definition.kind === "kpi") {
    return "col-span-1 sm:col-span-1 xl:col-span-4";
  }

  const span = getWidgetGridSpan(id);
  const index = row.indexOf(id);
  const totalSpan = row.reduce((sum, rowId) => sum + getWidgetGridSpan(rowId), 0);
  const gap = 12 - totalSpan;
  const isLast = index === row.length - 1;

  if (isLast && gap > 0) {
    return XL_COL_SPAN[Math.min(span + gap, 12)] ?? getWidgetColClass(definition.colSpan);
  }

  return XL_COL_SPAN[span] ?? getWidgetColClass(definition.colSpan);
}

/** Regroupe les widgets en lignes de 12 colonnes max */
export function packWidgetRows(widgetIds: DashboardCardId[]): DashboardCardId[][] {
  const rows: DashboardCardId[][] = [];
  let currentRow: DashboardCardId[] = [];
  let used = 0;

  for (const id of widgetIds) {
    const span = getWidgetGridSpan(id);

    if (used > 0 && used + span > 12) {
      rows.push(currentRow);
      currentRow = [id];
      used = span;
      continue;
    }

    currentRow.push(id);
    used += span;

    if (used === 12) {
      rows.push(currentRow);
      currentRow = [];
      used = 0;
    }
  }

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}

/** Place les cartes compagnes côte à côte (CA + objectifs, finances + activité) */
export function normalizeDashboardLayout(layout: DashboardCardId[]): DashboardCardId[] {
  const result = [...layout];

  function moveAfter(item: DashboardCardId, after: DashboardCardId) {
    if (!result.includes(item) || !result.includes(after)) return;

    const itemIndex = result.indexOf(item);
    const afterIndex = result.indexOf(after);
    if (itemIndex === afterIndex + 1) return;

    result.splice(itemIndex, 1);
    const newAfterIndex = result.indexOf(after);
    result.splice(newAfterIndex + 1, 0, item);
  }

  moveAfter("widget-goals", "widget-revenue");
  moveAfter("widget-activity", "widget-finance-chart");

  return result;
}

export function groupDashboardLayout(layout: DashboardCardId[]) {
  const groups: { kind: DashboardCardKind; ids: DashboardCardId[] }[] = [];

  for (const id of layout) {
    const kind = dashboardCardMap[id].kind;
    const last = groups.at(-1);

    if (last?.kind === kind) {
      last.ids.push(id);
    } else {
      groups.push({ kind, ids: [id] });
    }
  }

  return groups;
}

export function applyRecommendedDashboardLayout(_current: DashboardCardId[] = []) {
  return [...recommendedDashboardLayout];
}
