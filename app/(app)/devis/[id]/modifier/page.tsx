"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { QuoteBuilder } from "@/components/devis/quote-builder";
import { NeuCard } from "@/components/ui/neu-card";
import { NeuLinkButton } from "@/components/ui/neu-form";
import { PageHeader } from "@/components/ui/page-header";
import { useStoredList } from "@/hooks/use-persistence";
import { flushAllPendingWrites } from "@/lib/persistence";
import {
  applyQuoteSubscriptionToClient,
  loadStoredClients,
  saveStoredClients,
} from "@/lib/clients";
import {
  loadStoredQuotes,
  QUOTES_STORAGE_KEY,
  saveStoredQuotes,
  type Quote,
} from "@/lib/quotes";

type LoadState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "ready"; quote: Quote; all: Quote[] };

const noopSubscribe = () => () => {};

export default function ModifierDevisPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const all = useStoredList<Quote>(QUOTES_STORAGE_KEY, loadStoredQuotes);
  // true uniquement après hydratation : évite d'afficher « introuvable » côté serveur
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const id = Number(params?.id);
  const quote = all.find((q) => q.id === id);
  const state: LoadState = !hydrated
    ? { status: "loading" }
    : quote
      ? { status: "ready", quote, all }
      : { status: "missing" };

  function handleSave(updated: Quote) {
    const all = loadStoredQuotes();
    const next = all.map((q) => (q.id === updated.id ? updated : q));
    saveStoredQuotes(next, { immediate: true });

    if (
      updated.status === "accepte" &&
      updated.subscription?.enabled &&
      updated.subscription.monthlyPriceHT > 0
    ) {
      saveStoredClients(applyQuoteSubscriptionToClient(loadStoredClients(), updated));
    }

    flushAllPendingWrites();
    router.push("/devis");
  }

  return (
    <>
      <PageHeader
        title={state.status === "ready" ? `Modifier ${state.quote.number}` : "Modifier le devis"}
        description={
          state.status === "ready"
            ? state.quote.client.company || state.quote.client.name
            : "Chargement du devis…"
        }
        action={
          <NeuLinkButton href="/devis" variant="secondary" className="gap-2">
            <ArrowLeft size={16} />
            Retour
          </NeuLinkButton>
        }
      />

      {state.status === "loading" && (
        <NeuCard className="p-8 text-center text-sm text-neu-muted">Chargement…</NeuCard>
      )}

      {state.status === "missing" && (
        <NeuCard className="p-8 text-center text-sm text-neu-muted">
          Ce devis n&apos;existe plus.{" "}
          <Link href="/devis" className="font-semibold text-neu-accent-2 hover:underline">
            Retour à la liste
          </Link>
        </NeuCard>
      )}

      {state.status === "ready" && (
        <QuoteBuilder
          key={state.quote.id}
          existingQuotes={state.all}
          initialQuote={state.quote}
          onSave={handleSave}
          onCancel={() => router.push("/devis")}
        />
      )}
    </>
  );
}
