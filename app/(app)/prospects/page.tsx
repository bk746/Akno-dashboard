"use client";

import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AddProspectModal } from "@/components/prospects/add-prospect-modal";
import { ProspectsList } from "@/components/prospects/prospects-list";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { NeuButton } from "@/components/ui/neu-form";
import { NeuCard } from "@/components/ui/neu-card";
import {
  isContacted,
  loadStoredProspects,
  saveStoredProspects,
  type Prospect,
} from "@/lib/prospects";
import { matchesProspectSearch } from "@/lib/search";

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [ready, setReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setProspects(loadStoredProspects());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveStoredProspects(prospects);
  }, [prospects, ready]);

  const active = prospects.filter((p) => p.outcome === "en-cours");
  const notContacted = active.filter((p) => !isContacted(p)).length;
  const inProgress = active.filter((p) => isContacted(p)).length;

  const filteredProspects = useMemo(
    () => prospects.filter((prospect) => matchesProspectSearch(prospect, search)),
    [prospects, search],
  );

  return (
    <>
      <PageHeader
        title="Prospects"
        description="Suivi simple : contacté ou pas, et où vous en êtes (mail, appel…)"
        action={
          <NeuButton
            variant="primary"
            className="flex items-center gap-2"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={16} />
            Ajouter un prospect
          </NeuButton>
        }
      />

      <div className="mb-6 flex flex-wrap gap-3 text-xs text-neu-muted">
        <span className="neu-inset rounded-full px-3 py-1.5">
          <strong className="text-neu-text">{notContacted}</strong> à contacter
        </span>
        <span className="neu-inset rounded-full px-3 py-1.5">
          <strong className="text-neu-text">{inProgress}</strong> en prospection
        </span>
        <span className="neu-inset rounded-full px-3 py-1.5">
          Ex. : <strong className="text-neu-text">2e mail · 1er appel</strong>
        </span>
      </div>

      <NeuCard className="mb-6 p-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Nom, entreprise, email, téléphone…"
          className="w-full lg:max-w-md"
        />
        <p className="mt-3 text-xs text-neu-muted">
          {filteredProspects.length} prospect{filteredProspects.length !== 1 ? "s" : ""}{" "}
          affiché{filteredProspects.length !== 1 ? "s" : ""}
          {search.trim() ? ` · recherche « ${search.trim()} »` : ""}
        </p>
      </NeuCard>

      {filteredProspects.length === 0 ? (
        <NeuCard className="py-16 text-center">
          <p className="text-sm font-medium text-neu-text">Aucun prospect trouvé</p>
          <p className="mt-2 text-sm text-neu-muted">
            {search.trim()
              ? "Modifiez votre recherche ou ajoutez un nouveau prospect."
              : "Ajoutez votre premier prospect pour commencer."}
          </p>
          {!search.trim() && (
            <NeuButton
              variant="primary"
              className="mt-6 gap-2"
              onClick={() => setModalOpen(true)}
            >
              <Plus size={16} />
              Ajouter un prospect
            </NeuButton>
          )}
        </NeuCard>
      ) : (
        <ProspectsList prospects={filteredProspects} />
      )}

      <AddProspectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        prospects={prospects}
        onAdd={(prospect) => setProspects((current) => [prospect, ...current])}
      />
    </>
  );
}
