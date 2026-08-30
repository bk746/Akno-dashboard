"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { QuoteBuilder } from "@/components/devis/quote-builder";
import { PageHeader } from "@/components/ui/page-header";
import { NeuLinkButton } from "@/components/ui/neu-form";
import {
  loadStoredQuotes,
  saveStoredQuotes,
  type Quote,
} from "@/lib/quotes";

export default function NouveauDevisPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    setQuotes(loadStoredQuotes());
  }, []);

  function handleSave(quote: Quote) {
    const existing = loadStoredQuotes();
    const next = [quote, ...existing];
    saveStoredQuotes(next);
    router.push("/devis");
  }

  return (
    <>
      <PageHeader
        title="Nouveau devis"
        description="Comme sur Henrri ou Freebe : client, lignes, total — le reste est automatique"
        action={
          <NeuLinkButton href="/devis" variant="secondary" className="gap-2">
            <ArrowLeft size={16} />
            Retour
          </NeuLinkButton>
        }
      />

      <QuoteBuilder
        existingQuotes={quotes}
        onSave={handleSave}
        onCancel={() => router.push("/devis")}
      />
    </>
  );
}
