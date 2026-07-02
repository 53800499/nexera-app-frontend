"use client";

import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { ResultIcon } from "./ActionFeedbackIcons";
import { useActionFeedbackStore } from "./actionFeedbackStore";
import type { ActionResultVariant } from "./types";

const resultButtonStyles: Record<ActionResultVariant, string> = {
  success: "bg-success-500 hover:bg-success-600 text-white",
  error: "bg-error-500 hover:bg-error-600 text-white",
};

export function ActionResultDialog() {
  const resultDialog = useActionFeedbackStore((state) => state.resultDialog);
  const closeResult = useActionFeedbackStore((state) => state.closeResult);

  if (!resultDialog?.isOpen) return null;

  const variant = resultDialog.variant;

  return (
    <Modal
      isOpen
      onClose={closeResult}
      showCloseButton={false}
      className="max-w-[560px] p-6 lg:p-10"
    >
      <div className="text-center">
        <ResultIcon variant={variant} />
        <h4
          className={cn(
            "mb-2 text-2xl font-semibold sm:text-title-sm",
            variant === "success"
              ? "text-gray-800 dark:text-white/90"
              : "text-error-700 dark:text-error-300",
          )}
        >
          {resultDialog.title}
        </h4>
        {resultDialog.message ? (
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            {resultDialog.message}
          </p>
        ) : null}

        <div className="mt-8 flex items-center justify-center">
          <button
            type="button"
            onClick={closeResult}
            className={cn(
              "w-full rounded-lg px-5 py-3 text-sm font-medium shadow-theme-xs sm:w-auto",
              resultButtonStyles[variant],
            )}
          >
            {resultDialog.closeLabel ?? "Fermer"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
