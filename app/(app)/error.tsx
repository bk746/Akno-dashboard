"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-akno-bg px-6 text-center">
      <p className="text-base font-semibold text-akno-text">Une erreur est survenue</p>
      <p className="max-w-md text-sm text-akno-muted">
        {error.message || "Impossible d'afficher cette page pour le moment."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="akno-btn-primary px-5 py-2.5 text-sm"
      >
        Réessayer
      </button>
    </div>
  );
}
