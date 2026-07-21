"use client";

import { useCallback, useState } from "react";
import type { FieldValues, SubmitErrorHandler, UseFormSetError } from "react-hook-form";
import { useActionFeedback } from "@/shared/components/feedback";
import {
  focusFirstFormError,
  scrollToFormField,
} from "@/shared/forms/formErrorFocus";
import { applyFormApiErrors } from "@/shared/http/applyFormApiErrors";
import { resolveFormErrorMessage } from "@/shared/http/resolveFormErrorMessage";
import { SETTINGS_API_FIELD_MAP } from "../utils/settingsApiFieldMap";

type Options = {
  formErrorId: string;
  invalidTitle?: string;
  apiErrorTitle?: string;
  fieldMap?: Record<string, string>;
};

export function useSettingsFormFeedback<T extends FieldValues>(
  setError: UseFormSetError<T>,
  options: Options,
) {
  const { showResult } = useActionFeedback();
  const [formError, setFormError] = useState<string | null>(null);

  const handleApiError = useCallback(
    async (error: unknown) => {
      const fieldMap = { ...SETTINGS_API_FIELD_MAP, ...options.fieldMap };
      const { message, firstField } = applyFormApiErrors(error, setError, fieldMap);
      const displayMessage = message ?? resolveFormErrorMessage(error);
      setFormError(displayMessage);
      await showResult({
        variant: "error",
        title: options.apiErrorTitle ?? "Enregistrement impossible",
        message: firstField
          ? `${displayMessage} Le champ concerné est mis en évidence ci-dessous.`
          : displayMessage,
      });
      if (firstField) {
        window.setTimeout(() => scrollToFormField(firstField), 0);
      } else {
        document
          .getElementById(options.formErrorId)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [options.apiErrorTitle, options.fieldMap, options.formErrorId, setError, showResult],
  );

  const handleInvalidSubmit: SubmitErrorHandler<T> = useCallback(
    (fieldErrors) => {
      const firstError = focusFirstFormError(fieldErrors);
      if (!firstError) return;
      setFormError(firstError.message);
      void showResult({
        variant: "error",
        title: options.invalidTitle ?? "Formulaire incomplet",
        message: `${firstError.message} Corrigez le champ indiqué puis réessayez.`,
      });
    },
    [options.invalidTitle, showResult],
  );

  const clearFormError = useCallback(() => setFormError(null), []);

  return {
    formError,
    clearFormError,
    handleApiError,
    handleInvalidSubmit,
  };
}
