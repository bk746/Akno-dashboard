"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, UserRound } from "lucide-react";
import { boardFromPath } from "@/components/prospects/prospects-utils";
import { boardConfig, prospectBoards, type ProspectBoard } from "@/lib/prospects";
import { appleSpringSoft } from "@/lib/motion";
import { cn } from "@/lib/utils";

const boardIcons: Record<ProspectBoard, typeof UserRound> = {
  keryan: UserRound,
  louise: UserRound,
  ia: Sparkles,
};

const activeStyles: Record<ProspectBoard, string> = {
  keryan: "text-neu-accent-2",
  louise: "text-neu-accent-1",
  ia: "text-violet-600",
};

export function ProspectsNav({ counts }: { counts: Record<ProspectBoard, number> }) {
  const pathname = usePathname();
  const activeBoard = boardFromPath(pathname);
  const reducedMotion = useReducedMotion();

  return (
    <nav className="neu-inset mb-6 flex flex-wrap gap-1 rounded-2xl p-1.5">
      {prospectBoards.map((board) => {
        const config = boardConfig[board];
        const Icon = boardIcons[board];
        const active = activeBoard === board;

        return (
          <Link
            key={board}
            href={config.href}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-[color,transform] duration-300 ease-out sm:flex-none sm:px-4",
              active ? activeStyles[board] : "text-neu-muted hover:text-neu-text",
            )}
          >
            {active && !reducedMotion && (
              <motion.span
                layoutId="prospects-nav-pill"
                className="absolute inset-0 rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                transition={appleSpringSoft}
              />
            )}
            {active && reducedMotion && (
              <span className="absolute inset-0 rounded-xl bg-white shadow-sm" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <motion.span
                layout
                transition={appleSpringSoft}
                className="flex items-center gap-2"
              >
                <Icon size={16} />
                {config.label}
              </motion.span>
              <motion.span
                layout
                transition={appleSpringSoft}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px]",
                  active ? "bg-black/5 text-current" : "neu-inset-sm text-neu-muted",
                )}
              >
                {counts[board]}
              </motion.span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
