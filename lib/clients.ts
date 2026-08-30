import type { QuoteSubscription } from "@/lib/quotes";
import { AKNO_STORAGE_KEYS, readStorage, writeStorage } from "@/lib/persistence";

export type ClientStatus = "active" | "pending" | "prospect";

export type Client = {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  revenue: number;
  /** Abonnement mensuel récurrent (MRR) */
  monthlySubscription?: number;
  status: ClientStatus;
  initials: string;
  color: string;
  sector?: string;
  city?: string;
  jobTitle?: string;
  siret?: string;
  website?: string;
  address?: string;
  postalCode?: string;
  country?: string;
  source?: string;
  notes?: string;
  startDate?: string;
};

export const CLIENTS_STORAGE_KEY = AKNO_STORAGE_KEYS.clients;

export const initialClients: Client[] = [];

/** @deprecated Préférer loadStoredClients() côté client */
export const clients = initialClients;

export function loadStoredClients(): Client[] {
  const parsed = readStorage<Client[]>(CLIENTS_STORAGE_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveStoredClients(clients: Client[]) {
  writeStorage(CLIENTS_STORAGE_KEY, clients);
}

export function createClient(
  existing: Client[],
  input: Omit<Client, "id">,
): Client {
  return {
    id: existing.reduce((max, client) => Math.max(max, client.id), 0) + 1,
    ...input,
  };
}

export function updateClient(
  existing: Client[],
  id: number,
  input: Partial<Omit<Client, "id">>,
): Client[] {
  return existing.map((client) =>
    client.id === id ? { ...client, ...input } : client,
  );
}

export function findClientForQuote(
  clients: Client[],
  company: string,
  email: string,
): Client | undefined {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCompany = company.trim().toLowerCase();

  return clients.find((client) => {
    if (normalizedEmail && client.email.toLowerCase() === normalizedEmail) return true;
    if (normalizedCompany && client.company.toLowerCase() === normalizedCompany) return true;
    return false;
  });
}

export function applyQuoteSubscriptionToClient(
  clients: Client[],
  quote: { client: { company: string; email: string }; subscription?: QuoteSubscription },
): Client[] {
  if (!quote.subscription?.enabled || quote.subscription.monthlyPriceHT <= 0) {
    return clients;
  }

  const match = findClientForQuote(clients, quote.client.company, quote.client.email);
  if (!match) return clients;

  return updateClient(clients, match.id, {
    monthlySubscription: quote.subscription.monthlyPriceHT,
    status: match.status === "prospect" ? "active" : match.status,
  });
}

export function formatClientRevenue(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Montant mensuel d'un client (abonnement explicite, sinon CA estimé pour rétrocompat) */
export function getClientMonthlySubscription(client: Client): number {
  if (client.monthlySubscription != null && client.monthlySubscription > 0) {
    return client.monthlySubscription;
  }
  return client.status === "active" ? client.revenue : 0;
}

/** Nombre de clients actifs avec un abonnement mensuel > 0 */
export function getActiveSubscriptionsCount(clients: Client[]): number {
  return clients.filter(
    (client) => client.status === "active" && getClientMonthlySubscription(client) > 0,
  ).length;
}

/** Total MRR — abonnements mensuels des clients actifs */
export function getActiveMonthlySubscriptionsTotal(clients: Client[]): number {
  return clients
    .filter((client) => client.status === "active")
    .reduce((sum, client) => sum + getClientMonthlySubscription(client), 0);
}

export const statusLabels: Record<ClientStatus, string> = {
  active: "Actif",
  pending: "En attente",
  prospect: "Prospect",
};

export const statusStyles: Record<ClientStatus, string> = {
  active: "neu-inset-sm text-neu-accent-2",
  pending: "neu-inset-sm text-neu-accent-1",
  prospect: "neu-inset-sm text-neu-accent-3",
};
