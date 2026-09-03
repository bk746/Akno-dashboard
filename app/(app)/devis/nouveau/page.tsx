"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { QuoteBuilder } from "@/components/devis/quote-builder";
import { PageHeader } from "@/components/ui/page-header";
import { NeuLinkButton } from "@/components/ui/neu-form";
import { useStoredList } from "@/hooks/use-persistence";
import { flushAllPendingWrites } from "@/lib/persistence";
import {
  loadStoredQuotes,
  QUOTES_STORAGE_KEY,
  saveStoredQuotes,
  type Quote,
} from "@/lib/quotes";

export default function NouveauDevisPage() {
  const router = useRouter();
  const existingQuotes = useStoredList<Quote>(QUOTES_STORAGE_KEY, loadStoredQuotes);

  function handleSave(quote: Quote) {
    const existing = loadStoredQuotes();
    const next = [quote, ...existing];
    saveStoredQuotes(next, { immediate: true });
    flushAllPendingWrites();
    router.push("/devis");
  }

  return (
    <>
      <PageHeader
        title="Nouveau devis"
        description="Client, phases chiffrées, options, échéancier — le PDF est généré automatiquement"
        action={
          <NeuLinkButton href="/devis" variant="secondary" className="gap-2">
            <ArrowLeft size={16} />
            Retour
          </NeuLinkButton>
        }
      />

      <QuoteBuilder
        existingQuotes={existingQuotes}
        onSave={handleSave}
        onCancel={() => router.push("/devis")}
      />
    </>
  );
}
