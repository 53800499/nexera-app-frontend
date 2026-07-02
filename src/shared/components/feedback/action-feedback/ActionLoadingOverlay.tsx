"use client";

import { Spinner } from "../Spinner";
import { useActionFeedbackStore } from "./actionFeedbackStore";

export function ActionLoadingOverlay() {
  const loadingCount = useActionFeedbackStore((state) => state.loadingCount);
  const loadingMessage = useActionFeedbackStore((state) => state.loadingMessage);
  const isRedirecting = useActionFeedbackStore((state) => state.isRedirecting);
  const redirectMessage = useActionFeedbackStore((state) => state.redirectMessage);

  const isVisible = loadingCount > 0 || isRedirecting;
  if (!isVisible) return null;

  const message = isRedirecting
    ? (redirectMessage ?? "Redirection en cours...")
    : (loadingMessage ?? "Action en cours...");
  const subtitle = isRedirecting
    ? "Chargement de la page..."
    : "Veuillez patienter";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[99998] flex items-center justify-center bg-gray-900/40 backdrop-blur-[2px]"
    >
      <div className="mx-4 flex min-w-[280px] max-w-md flex-col items-center rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-theme-xl dark:border-gray-700 dark:bg-gray-900">
        <Spinner size="lg" variant="primary" />
        <p className="mt-5 text-center text-base font-medium text-gray-800 dark:text-white/90">
          {message}
        </p>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
        {!isRedirecting && loadingCount > 1 ? (
          <p className="mt-3 text-xs text-gray-400">
            {loadingCount} actions en cours
          </p>
        ) : null}
      </div>
    </div>
  );
}
