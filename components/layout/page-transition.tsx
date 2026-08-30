"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { pageEnterTransition, pageExitTransition, pageTransition } from "@/lib/motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div key={pathname}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={pageTransition.initial}
        animate={{
          ...pageTransition.animate,
          transition: pageEnterTransition,
        }}
        exit={{
          ...pageTransition.exit,
          transition: pageExitTransition,
        }}
        className="origin-top"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
