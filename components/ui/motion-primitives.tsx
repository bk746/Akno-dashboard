"use client";

import Link from "next/link";
import { motion, type HTMLMotionProps } from "framer-motion";
import { appleSpringSnappy, tapScale, tapScaleSubtle } from "@/lib/motion";
import { cn } from "@/lib/utils";

type MotionButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "icon";
};

export function MotionButton({
  className,
  variant = "secondary",
  children,
  ...props
}: MotionButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: variant === "icon" ? 0.92 : 0.98 }}
      whileHover={{ scale: variant === "ghost" ? 1 : 1.01 }}
      transition={appleSpringSnappy}
      className={cn(
        "px-5 py-2.5 text-sm font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "akno-btn-primary",
        variant === "secondary" && "akno-btn-secondary",
        variant === "ghost" && "rounded-lg px-3 py-2 text-akno-muted hover:bg-akno-bg hover:text-akno-text",
        variant === "icon" &&
          "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-akno-border bg-akno-surface p-0 text-akno-text hover:bg-akno-bg",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

type MotionLinkProps = React.ComponentProps<typeof Link> & {
  active?: boolean;
  layoutId?: string;
};

export function MotionLink({
  className,
  children,
  active,
  layoutId,
  ...props
}: MotionLinkProps) {
  return (
    <Link {...props} className={cn("relative block outline-none", className)}>
      <motion.span
        className="relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
        whileTap={{ scale: 0.98 }}
        transition={appleSpringSnappy}
      >
        {active && layoutId && (
          <motion.span
            layoutId={layoutId}
            className="absolute inset-0 rounded-lg bg-akno-primary/10"
            transition={appleSpringSnappy}
          />
        )}
        {!layoutId && active && (
          <span className="absolute inset-0 rounded-lg bg-akno-primary/10" />
        )}
        <span
          className={cn(
            "relative z-10 flex w-full items-center gap-3",
            active ? "font-semibold text-akno-primary" : "text-akno-muted",
          )}
        >
          {children}
        </span>
      </motion.span>
    </Link>
  );
}

export function MotionPressable({
  className,
  children,
  subtle = false,
  ...props
}: HTMLMotionProps<"div"> & { subtle?: boolean }) {
  const interaction = subtle ? tapScaleSubtle : tapScale;

  return (
    <motion.div
      className={className}
      whileTap={interaction.whileTap}
      whileHover={interaction.whileHover}
      transition={interaction.transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionFilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={appleSpringSnappy}
      className={cn(
        "akno-btn-filter px-4 py-2 text-xs outline-none",
        active && "akno-btn-filter-active",
      )}
    >
      {children}
    </motion.button>
  );
}
