"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm, type SubmitErrorHandler } from "react-hook-form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { useActionFeedback } from "@/shared/components/feedback";
import {
  focusFirstFormError,
  scrollToFormField,
} from "@/shared/forms/formErrorFocus";
import {
  buildFormHydrationKey,
  useHydrateFormDefaults,
} from "@/shared/forms/useHydrateFormDefaults";
import { applyFormApiErrors } from "@/shared/http/applyFormApiErrors";
import { resolveFormErrorMessage } from "@/shared/http/resolveFormErrorMessage";
import type { ReminderSettings } from "../types/reminder.types";
import {
  reminderSettingsSchema,
  type ReminderSettingsFormValues,
} from "../schemas/reminderForm.schema";

type Props = {
  settings: ReminderSettings;
  isSubmitting: boolean;
  onSubmit: (values: ReminderSettingsFormValues) => Promise<void>;
};

export function ReminderSettingsForm({
  settings,
  isSubmitting,
  onSubmit,
}: Props) {
  const { showResult } = useActionFeedback();
  const [formError, setFormError] = useState<string | null>(null);

  const initialValues = useMemo(
    () => ({
      isEnabled: settings.isEnabled,
      level1DaysAfterDue: settings.level1DaysAfterDue,
      level2DaysAfterDue: settings.level2DaysAfterDue,
      level3DaysAfterDue: settings.level3DaysAfterDue,
      level2CopyCommercial: settings.level2CopyCommercial,
      level3AlertDirector: settings.level3AlertDirector,
      level3BlockNewOrders: settings.level3BlockNewOrders,
      commercialEmail: settings.commercialEmail ?? "",
      directorEmail: settings.directorEmail ?? "",
    }),
    [
      settings.isEnabled,
      settings.level1DaysAfterDue,
      settings.level2DaysAfterDue,
      settings.level3DaysAfterDue,
      settings.level2CopyCommercial,
      settings.level3AlertDirector,
      settings.level3BlockNewOrders,
      settings.commercialEmail,
      settings.directorEmail,
    ],
  );

  const hydrationKey = buildFormHydrationKey(initialValues);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ReminderSettingsFormValues>({
    resolver: zodResolver(reminderSettingsSchema),
    defaultValues: initialValues,
  });

  useHydrateFormDefaults(reset, initialValues, hydrationKey);

  const handleFormSubmit = async (values: ReminderSettingsFormValues) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const { message, firstField } = applyFormApiErrors(error, setError);
      const displayMessage = message ?? resolveFormErrorMessage(error);
      setFormError(displayMessage);
      void showResult({
        variant: "error",
        title: "Enregistrement impossible",
        message: firstField
          ? `${displayMessage} Le champ concerné est mis en évidence ci-dessous.`
          : displayMessage,
      });
      if (firstField) {
        window.setTimeout(() => scrollToFormField(firstField), 0);
      } else {
        document
          .getElementById("reminder-settings-form-error")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleInvalidSubmit: SubmitErrorHandler<ReminderSettingsFormValues> = (
    fieldErrors,
  ) => {
    const firstError = focusFirstFormError(fieldErrors);
    if (!firstError) return;
    setFormError(firstError.message);
    void showResult({
      variant: "error",
      title: "Formulaire incomplet",
      message: `${firstError.message} Corrigez le champ indiqué puis réessayez.`,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit, handleInvalidSubmit)}
      className="space-y-4"
      noValidate
    >
      {formError ? (
        <p
          id="reminder-settings-form-error"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {formError}
        </p>
      ) : null}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isEnabled")} className="rounded" />
        Relances automatiques activées
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div data-form-field="level1DaysAfterDue">
          <Label>Niveau 1 — Rappel (J+)</Label>
          <Input
            type="number"
            min={0}
            {...register("level1DaysAfterDue", { valueAsNumber: true })}
          />
          {errors.level1DaysAfterDue ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.level1DaysAfterDue.message}
            </p>
          ) : null}
        </div>
        <div data-form-field="level2DaysAfterDue">
          <Label>Niveau 2 — Relance (J+)</Label>
          <Input
            type="number"
            min={0}
            {...register("level2DaysAfterDue", { valueAsNumber: true })}
          />
          {errors.level2DaysAfterDue ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.level2DaysAfterDue.message}
            </p>
          ) : null}
        </div>
        <div data-form-field="level3DaysAfterDue">
          <Label>Niveau 3 — Mise en demeure (J+)</Label>
          <Input
            type="number"
            min={0}
            {...register("level3DaysAfterDue", { valueAsNumber: true })}
          />
          {errors.level3DaysAfterDue ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.level3DaysAfterDue.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("level2CopyCommercial")}
            className="rounded"
          />
          Copie au responsable commercial (niveau 2)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("level3AlertDirector")}
            className="rounded"
          />
          Alerte au dirigeant (niveau 3)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("level3BlockNewOrders")}
            className="rounded"
          />
          Bloquer nouveaux devis/commandes (niveau 3)
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div data-form-field="commercialEmail">
          <Label>E-mail commercial</Label>
          <Input type="email" {...register("commercialEmail")} />
          {errors.commercialEmail ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.commercialEmail.message}
            </p>
          ) : null}
        </div>
        <div data-form-field="directorEmail">
          <Label>E-mail dirigeant</Label>
          <Input type="email" {...register("directorEmail")} />
          {errors.directorEmail ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.directorEmail.message}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {isSubmitting ? "Enregistrement..." : "Enregistrer les paramètres"}
      </button>
    </form>
  );
}
