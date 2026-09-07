"use client";

import { useMemo, useState } from "react";
import { ProspectsBoard } from "@/components/prospects/prospects-board";
import { EditProspectModal } from "@/components/prospects/edit-prospect-modal";
import { useProspects } from "@/components/prospects/prospects-context";
import { SearchInput } from "@/components/ui/search-input";
import { NeuCard } from "@/components/ui/neu-card";
import {
  getProspectFollowUp,
  getProspectsByBoard,
  type Prospect,
  type ProspectBoard,
} from "@/lib/prospects";
import { matchesProspectSearch } from "@/lib/search";

export function ProspectsBoardPage({ board }: { board: ProspectBoard }) {
  const { prospects, saveProspect, removeProspect } = useProspects();
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<Prospect | null>(null);

  const boardProspects = useMemo(() => {
    const items = getProspectsByBoard(prospects, board);
    if (!search.trim()) return items;
    return items.filter((prospect) => matchesProspectSearch(prospect, search));
  }, [prospects, board, search]);

  const stats = useMemo(() => {
    const active = boardProspects.filter((p) => p.outcome === "en-cours");
    return {
      yellow: active.filter((p) => getProspectFollowUp(p).tone === "yellow").length,
      red: active.filter((p) => getProspectFollowUp(p).tone === "red").length,
      green: active.filter((p) => getProspectFollowUp(p).tone === "green").length,
    };
  }, [boardProspects]);

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3 text-xs text-neu-muted">
        <span className="neu-inset inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <strong className="text-neu-text">{stats.yellow}</strong> à contacter
        </span>
        <span className="neu-inset inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <strong className="text-neu-text">{stats.red}</strong> relance
        </span>
        <span className="neu-inset inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <strong className="text-neu-text">{stats.green}</strong> en attente
        </span>
      </div>

      <NeuCard className="mb-6 p-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Entreprise, ville, email, téléphone…"
          className="w-full lg:max-w-md"
        />
        <p className="mt-3 text-xs text-neu-muted">
          {boardProspects.length} prospect{boardProspects.length !== 1 ? "s" : ""} affiché
          {boardProspects.length !== 1 ? "s" : ""}
        </p>
      </NeuCard>

      <ProspectsBoard board={board} prospects={boardProspects} onEdit={setEditTarget} />

      <EditProspectModal
        open={Boolean(editTarget)}
        prospect={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={saveProspect}
        onDelete={removeProspect}
      />
    </>
  );
}
