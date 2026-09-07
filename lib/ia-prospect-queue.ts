import type { ProspectionImportInput } from "@/lib/prospects";

/** Incrémenter à chaque nouvel import Cursor → déclenche le merge au prochain chargement */
export const IA_PROSPECT_QUEUE_VERSION = 1;

/**
 * File d'attente remplie par Cursor lors d'une recherche prospection.
 * Après import automatique, vider le tableau et incrémenter IA_PROSPECT_QUEUE_VERSION.
 */
export const iaProspectQueue: ProspectionImportInput[] = [];
