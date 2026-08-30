/** Courbes et springs style Apple */
export const appleSpring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 32,
  mass: 0.8,
};

export const appleSpringSoft = {
  type: "spring" as const,
  stiffness: 280,
  damping: 30,
  mass: 0.9,
};

export const appleSpringSnappy = {
  type: "spring" as const,
  stiffness: 500,
  damping: 35,
  mass: 0.6,
};

export const pageTransition = {
  initial: { opacity: 0, y: 6, scale: 0.992 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.996,
  },
};

export const pageEnterTransition = {
  ...appleSpringSoft,
  opacity: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

export const pageExitTransition = {
  duration: 0.2,
  ease: [0.4, 0, 1, 1] as const,
};

export const tapScale = {
  whileTap: { scale: 0.96 },
  whileHover: { scale: 1.015 },
  transition: appleSpringSnappy,
};

export const tapScaleSubtle = {
  whileTap: { scale: 0.985 },
  whileHover: { scale: 1.01 },
  transition: appleSpringSnappy,
};

export const tapOpacity = {
  whileTap: { scale: 0.97, opacity: 0.88 },
  transition: appleSpringSnappy,
};
