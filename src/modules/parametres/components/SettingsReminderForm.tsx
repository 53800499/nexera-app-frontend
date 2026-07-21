"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import {
  buildFormHydrationKey,
  useHydrateFormDefaults,
} from "@/shared/forms/useHydrateFormDefaults";
import { useSettingsFormFeedback } from "../hooks/useSettingsFormFeedback";
import {
  reminderSettingsSchema,
  type ReminderSettingsFormValues,
} from "../schemas/settingsForm.schema";
import type { ReminderSettings } from "../types/settings.types";

type Props = {
  settings: ReminderSettings;
  readOnly?: boolean;
  isSubmitting: boolean;
  onSubmit: (values: ReminderSettingsFormValues) => Promise<void>;
};

export function SettingsReminderForm({
  settings,
  readOnly = false,
  isSubmitting,
  onSubmit,
}: Props) {
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

  const { formError, clearFormError, handleApiError, handleInvalidSubmit } =
    useSettingsFormFeedback(setError, {
      formErrorId: "reminder-settings-form-error",
      apiErrorTitle: "Enregistrement impossible",
    });

  useHydrateFormDefaults(reset, initialValues, hydrationKey);

  const submit = handleSubmit(async (values) => {
    clearFormError();
    try {
      await onSubmit(values);
    } catch (error) {
      await handleApiError(error);
    }
  }, handleInvalidSubmit);

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {formError ? (
        <p
          id="reminder-settings-form-error"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {formError}
        </p>
      ) : null}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isEnabled")} disabled={readOnly} />
        Relances automatiques activées
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div data-form-field="level1DaysAfterDue">
          <Label>Niveau 1 (J+)</Label>
          <Input
            type="number"
            {...register("level1DaysAfterDue", { valueAsNumber: true })}
            disabled={readOnly}
          />
        </div>
        <div data-form-field="level2DaysAfterDue">
          <Label>Niveau 2 (J+)</Label>
          <Input
            type="number"
            {...register("level2DaysAfterDue", { valueAsNumber: true })}
            disabled={readOnly}
          />
        </div>
        <div data-form-field="level3DaysAfterDue">
          <Label>Niveau 3 (J+)</Label>
          <Input
            type="number"
            {...register("level3DaysAfterDue", { valueAsNumber: true })}
            disabled={readOnly}
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("level2CopyCommercial")}
            disabled={readOnly}
          />
          Copie commercial (niveau 2)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("level3AlertDirector")}
            disabled={readOnly}
          />
          Alerte dirigeant (niveau 3)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("level3BlockNewOrders")}
            disabled={readOnly}
          />
          Bloquer nouveaux devis/commandes (niveau 3)
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div data-form-field="commercialEmail">
          <Label>Email commercial</Label>
          <Input
            {...register("commercialEmail")}
            disabled={readOnly}
            error={Boolean(errors.commercialEmail)}
            hint={errors.commercialEmail?.message}
          />
        </div>
        <div data-form-field="directorEmail">
          <Label>Email dirigeant</Label>
          <Input
            {...register("directorEmail")}
            disabled={readOnly}
            error={Boolean(errors.directorEmail)}
            hint={errors.directorEmail?.message}
          />
        </div>
      </div>

      {!readOnly ? (
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      ) : null}
    </form>
  );
}
