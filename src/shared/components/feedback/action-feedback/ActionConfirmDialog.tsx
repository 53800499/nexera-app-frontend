"use client";

import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { ConfirmIcon } from "./ActionFeedbackIcons";
import { useActionFeedbackStore } from "./actionFeedbackStore";
import type { ActionConfirmVariant } from "./types";

const confirmButtonStyles: Record<ActionConfirmVariant, string> = {
  default: "bg-brand-500 hover:bg-brand-600 text-white",
  warning: "bg-warning-500 hover:bg-warning-600 text-white",
  danger: "bg-error-500 hover:bg-error-600 text-white",
};

export function ActionConfirmDialog() {
  const confirmDialog = useActionFeedbackStore((state) => state.confirmDialog);
  const closeConfirm = useActionFeedbackStore((state) => state.closeConfirm);

  if (!confirmDialog?.isOpen) return null;

  const variant = confirmDialog.variant ?? "default";

  return (
    <Modal
      isOpen
      onClose={() => closeConfirm(false)}
      showCloseButton={false}
      className="max-w-[520px] p-6 lg:p-10"
    >
      <div className="text-center">
        <ConfirmIcon variant={variant} />
        <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90 sm:text-2xl">
          {confirmDialog.title}
        </h4>
        {confirmDialog.message ? (
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            {confirmDialog.message}
          </p>
        ) : null}

        <div className="mt-8 flex w-full flex-col-reverse items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => closeConfirm(false)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 sm:w-auto"
          >
            {confirmDialog.cancelLabel ?? "Annuler"}
          </button>
          <button
            type="button"
            onClick={() => closeConfirm(true)}
            className={cn(
              "w-full rounded-lg px-4 py-3 text-sm font-medium shadow-theme-xs sm:w-auto",
              confirmButtonStyles[variant],
            )}
          >
            {confirmDialog.confirmLabel ?? "Confirmer"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
