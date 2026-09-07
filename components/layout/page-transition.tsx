"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  pageEnterTransition,
  pageExitTransition,
  pageTransition,
} from "@/lib/motion";

/** Évite de re-animer le shell quand on change d'onglet sous /prospects */
function transitionKey(pathname: string) {
  if (pathname.startsWith("/prospects")) return "/prospects";
  return pathname;
}

const variants = {
  initial: pageTransition.initial,
  animate: {
    ...pageTransition.animate,
    transition: pageEnterTransition,
  },
  exit: {
    ...pageTransition.exit,
    transition: pageExitTransition,
  },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const key = transitionKey(pathname);
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div key={key}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={key}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="origin-top will-change-transform"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
