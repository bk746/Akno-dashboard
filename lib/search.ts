import type { Prospect } from "@/lib/prospects";
import { getClientDisplayName, type Quote } from "@/lib/quotes";

function normalizeSearchQuery(query: string) {
  return query.trim().toLowerCase();
}

function matchesFields(query: string, fields: Array<string | undefined>) {
  if (!query) return true;
  return fields.some((field) => field?.toLowerCase().includes(query));
}

export function matchesProspectSearch(prospect: Prospect, query: string) {
  const normalized = normalizeSearchQuery(query);

  return matchesFields(normalized, [
    prospect.name,
    prospect.firstName,
    prospect.lastName,
    prospect.company,
    prospect.email,
    prospect.phone,
    prospect.sector,
    prospect.website,
    prospect.notes,
  ]);
}

export function matchesQuoteSearch(quote: Quote, query: string) {
  const normalized = normalizeSearchQuery(query);

  return matchesFields(normalized, [
    quote.number,
    getClientDisplayName(quote),
    quote.client.name,
    quote.client.company,
    quote.client.email,
    quote.object,
  ]);
}
