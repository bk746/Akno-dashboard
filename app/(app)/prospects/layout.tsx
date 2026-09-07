"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AddProspectModal } from "@/components/prospects/add-prospect-modal";
import { ProspectsNav } from "@/components/prospects/prospects-nav";
import { ProspectsPageTransition } from "@/components/prospects/prospects-page-transition";
import { ProspectsProvider, useProspects } from "@/components/prospects/prospects-context";
import { boardFromPath } from "@/components/prospects/prospects-utils";
import { PageHeader } from "@/components/ui/page-header";
import { NeuButton } from "@/components/ui/neu-form";
import {
  boardConfig,
  getProspectsByBoard,
  prospectBoards,
  type ProspectBoard,
} from "@/lib/prospects";

function ProspectsLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { prospects } = useProspects();
  const [addOpen, setAddOpen] = useState(false);
  const currentBoard = boardFromPath(pathname);
  const config = boardConfig[currentBoard];

  const counts = useMemo(
    () =>
      Object.fromEntries(
        prospectBoards.map((board) => [board, getProspectsByBoard(prospects, board).length]),
      ) as Record<ProspectBoard, number>,
    [prospects],
  );

  return (
    <>
      <PageHeader
        title="Prospects"
        description={`${config.label} — ${config.subtitle}`}
        action={
          currentBoard !== "ia" ? (
            <NeuButton
              variant="primary"
              className="flex items-center gap-2"
              onClick={() => setAddOpen(true)}
            >
              <Plus size={16} />
              Ajouter un prospect
            </NeuButton>
          ) : undefined
        }
      />

      <ProspectsNav counts={counts} />
      <ProspectsPageTransition>{children}</ProspectsPageTransition>

      <AddProspectModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        defaultBoard={currentBoard === "ia" ? "keryan" : currentBoard}
      />
    </>
  );
}

export default function ProspectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProspectsProvider>
      <ProspectsLayoutInner>{children}</ProspectsLayoutInner>
    </ProspectsProvider>
  );
}
