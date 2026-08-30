"use client";

import { motion } from "framer-motion";
import { appleSpringSnappy } from "@/lib/motion";
import { cn } from "@/lib/utils";

type NeuCardProps = {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  /** "raised" = ancien style relief fort */
  variant?: "nav" | "raised";
};

const navPadding = {
  sm: "p-4",
  md: "p-6",
  lg: "p-7",
};

const raisedSizeStyles = {
  sm: "rounded-[1.25rem] p-4",
  md: "rounded-[1.75rem] p-6",
  lg: "rounded-[2rem] p-7",
};

export function NeuCard({
  children,
  className,
  inset = false,
  size = "md",
  interactive = false,
  variant = "nav",
}: NeuCardProps) {
  const isNav = variant === "nav";

  return (
    <motion.div
      whileHover={interactive ? { scale: 1.005, y: -1 } : undefined}
      whileTap={interactive ? { scale: 0.995 } : undefined}
      transition={appleSpringSnappy}
      className={cn(
        isNav
          ? cn("neu-inset-sm rounded-[1.25rem]", navPadding[size])
          : cn(
              raisedSizeStyles[size],
              inset ? "neu-inset-md" : "neu-raised",
            ),
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function NeuCell({
  children,
  className,
  active = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.008 }}
      transition={appleSpringSnappy}
      className={cn(
        "neu-flat cursor-default rounded-[1.25rem]",
        active && "neu-inset-sm",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function NeuIconButton({
  children,
  className,
  active = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.06 }}
      transition={appleSpringSnappy}
      className={cn(
        "neu-btn flex h-10 w-10 items-center justify-center rounded-full text-neu-muted outline-none",
        active && "neu-inset-sm text-neu-text",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
