"use client";

import { ErrorState } from "./ErrorState";

type RouteErrorFallbackProps = {
  error: Error & { digest?: string };
  reset: () => void;
  fullScreen?: boolean;
};

export function RouteErrorFallback({
  error,
  reset,
  fullScreen = false,
}: RouteErrorFallbackProps) {
  return (
    <div
      className={
        fullScreen
          ? "flex min-h-screen items-center justify-center bg-[var(--color-nexera-surface)] p-6 dark:bg-gray-900"
          : "flex min-h-[50vh] items-center justify-center p-6"
      }
    >
      <ErrorState
        title="Impossible d'afficher la page"
        message={
          error.message.includes("Failed to load chunk") ||
          error.message.includes("ChunkLoadError")
            ? "Une mise à jour de l'application est disponible. Rechargez la page pour continuer."
            : error.message ||
              "Une erreur inattendue est survenue. Veuillez réessayer."
        }
        onRetry={
          error.message.includes("Failed to load chunk") ||
          error.message.includes("ChunkLoadError")
            ? () => window.location.reload()
            : reset
        }
      />
    </div>
  );
}
