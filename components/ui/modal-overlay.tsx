"use client";

import { useEffect } from "react";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { cn } from "@/lib/utils";

type ModalOverlayProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  panelClassName?: string;
  backdropClassName?: string;
};

export function ModalOverlay({
  open,
  onClose,
  children,
  panelClassName,
  backdropClassName,
}: ModalOverlayProps) {
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className={cn(
          "absolute inset-0 touch-none bg-akno-text/20 backdrop-blur-[2px]",
          backdropClassName,
        )}
        onClick={onClose}
        aria-label="Fermer"
      />
      <div
        className={cn(
          "relative z-10 w-full max-h-[min(90dvh,calc(100dvh-2rem))] overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]",
          panelClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
