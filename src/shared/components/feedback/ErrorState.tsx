"use client";

import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export function ErrorState({
  title = "Une erreur est survenue",
  message = "Impossible de charger les données. Veuillez réessayer.",
  onRetry,
  action,
  className,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-error-200 bg-error-50 px-6 text-center dark:border-error-500/30 dark:bg-error-500/10",
        compact ? "py-8" : "py-12",
        className,
      )}
      role="alert"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-100 text-2xl dark:bg-error-500/20">
        ⚠️
      </div>
      <h3 className="text-base font-semibold text-error-700 dark:text-error-400">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm text-error-600 dark:text-error-300">
        {message}
      </p>
      {(onRetry || action) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-[var(--color-nexera-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              Réessayer
            </button>
          ) : null}
          {action}
        </div>
      )}
    </div>
  );
}
