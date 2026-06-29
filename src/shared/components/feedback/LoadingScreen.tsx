"use client";

import { Spinner } from "./Spinner";

type LoadingScreenProps = {
  label?: string;
};

export function LoadingScreen({ label = "Chargement..." }: LoadingScreenProps) {
  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-[var(--color-nexera-surface)] dark:bg-gray-900"
      aria-busy="true"
      aria-live="polite"
    >
      <Spinner size="lg" />
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {label}
      </p>
    </div>
  );
}
