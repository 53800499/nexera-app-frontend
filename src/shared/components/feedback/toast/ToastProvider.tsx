"use client";

import { cn } from "@/lib/utils";
import { useToastStore } from "./toastStore";
import type { Toast, ToastVariant } from "./types";

const variantStyles: Record<
  ToastVariant,
  { container: string; icon: string; label: string }
> = {
  success: {
    container:
      "border-success-200 bg-success-50 dark:border-success-500/30 dark:bg-success-500/10",
    icon: "text-success-600 dark:text-success-400",
    label: "✓",
  },
  error: {
    container:
      "border-error-200 bg-error-50 dark:border-error-500/30 dark:bg-error-500/10",
    icon: "text-error-600 dark:text-error-400",
    label: "✕",
  },
  warning: {
    container:
      "border-warning-200 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/10",
    icon: "text-warning-600 dark:text-warning-400",
    label: "!",
  },
  info: {
    container:
      "border-brand-200 bg-brand-50 dark:border-brand-500/30 dark:bg-brand-500/10",
    icon: "text-brand-600 dark:text-brand-400",
    label: "i",
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((state) => state.dismiss);
  const styles = variantStyles[toast.variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto w-full max-w-sm rounded-xl border p-4 shadow-theme-lg backdrop-blur-sm",
        styles.container,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/80 text-xs font-bold dark:bg-gray-900/60",
            styles.icon,
          )}
          aria-hidden
        >
          {styles.label}
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
            {toast.title}
          </p>
          {toast.description ? (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {toast.description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => dismiss(toast.id)}
          className="shrink-0 rounded-md px-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Fermer la notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function ToastProvider() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed right-4 top-4 z-[99999] flex w-[calc(100%-2rem)] flex-col gap-3 sm:right-6 sm:top-6 sm:w-auto"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
