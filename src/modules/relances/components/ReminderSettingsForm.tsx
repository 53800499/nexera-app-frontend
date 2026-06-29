"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { useToast } from "@/shared/components/feedback";
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
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReminderSettingsFormValues>({
    resolver: zodResolver(reminderSettingsSchema),
    defaultValues: {
      isEnabled: settings.isEnabled,
      level1DaysAfterDue: settings.level1DaysAfterDue,
      level2DaysAfterDue: settings.level2DaysAfterDue,
      level3DaysAfterDue: settings.level3DaysAfterDue,
      level2CopyCommercial: settings.level2CopyCommercial,
      level3AlertDirector: settings.level3AlertDirector,
      level3BlockNewOrders: settings.level3BlockNewOrders,
      commercialEmail: settings.commercialEmail ?? "",
      directorEmail: settings.directorEmail ?? "",
    },
  });

  useEffect(() => {
    reset({
      isEnabled: settings.isEnabled,
      level1DaysAfterDue: settings.level1DaysAfterDue,
      level2DaysAfterDue: settings.level2DaysAfterDue,
      level3DaysAfterDue: settings.level3DaysAfterDue,
      level2CopyCommercial: settings.level2CopyCommercial,
      level3AlertDirector: settings.level3AlertDirector,
      level3BlockNewOrders: settings.level3BlockNewOrders,
      commercialEmail: settings.commercialEmail ?? "",
      directorEmail: settings.directorEmail ?? "",
    });
  }, [settings, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      toast.success("Paramètres enregistrés");
    } catch (error) {
      toast.error(
        "Enregistrement impossible",
        error instanceof Error ? error.message : undefined,
      );
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isEnabled")} className="rounded" />
        Relances automatiques activées
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label>Niveau 1 — Rappel (J+)</Label>
          <Input
            type="number"
            min={0}
            {...register("level1DaysAfterDue", { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label>Niveau 2 — Relance (J+)</Label>
          <Input
            type="number"
            min={0}
            {...register("level2DaysAfterDue", { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label>Niveau 3 — Mise en demeure (J+)</Label>
          <Input
            type="number"
            min={0}
            {...register("level3DaysAfterDue", { valueAsNumber: true })}
          />
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
        <div>
          <Label>Email commercial</Label>
          <Input type="email" {...register("commercialEmail")} />
          {errors.commercialEmail ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.commercialEmail.message}
            </p>
          ) : null}
        </div>
        <div>
          <Label>Email dirigeant</Label>
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
