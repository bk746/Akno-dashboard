"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { boardFromPath } from "@/components/prospects/prospects-utils";
import { prospectBoards, type ProspectBoard } from "@/lib/prospects";

function boardIndex(board: ProspectBoard) {
  return prospectBoards.indexOf(board);
}

const easeOut = [0.22, 1, 0.36, 1] as const;

export function ProspectsPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const board = boardFromPath(pathname);
  const reducedMotion = useReducedMotion();

  const prevBoardRef = useRef(board);
  const directionRef = useRef(0);

  if (board !== prevBoardRef.current) {
    directionRef.current = boardIndex(board) - boardIndex(prevBoardRef.current);
    prevBoardRef.current = board;
  }

  const direction = directionRef.current;

  if (reducedMotion) {
    return <div key={board}>{children}</div>;
  }

  const enterX = direction === 0 ? 0 : direction > 0 ? 28 : -28;
  const exitX = direction === 0 ? 0 : direction > 0 ? -20 : 20;

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={board}
          initial={{ opacity: 0, x: enterX, y: 8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: exitX, y: -6 }}
          transition={{
            x: { type: "spring", stiffness: 320, damping: 32, mass: 0.9 },
            y: { type: "spring", stiffness: 320, damping: 32, mass: 0.9 },
            opacity: { duration: 0.22, ease: easeOut },
          }}
          className="origin-top will-change-transform"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
