"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { useToast } from "@/shared/components/feedback";
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
        <input type="checkbox" {...register("isEnabled")} disabled={readOnly} />
        Relances automatiques activées
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label>Niveau 1 (J+)</Label>
          <Input
            type="number"
            {...register("level1DaysAfterDue", { valueAsNumber: true })}
            disabled={readOnly}
          />
        </div>
        <div>
          <Label>Niveau 2 (J+)</Label>
          <Input
            type="number"
            {...register("level2DaysAfterDue", { valueAsNumber: true })}
            disabled={readOnly}
          />
        </div>
        <div>
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
          <input type="checkbox" {...register("level2CopyCommercial")} disabled={readOnly} />
          Copie commercial (niveau 2)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("level3AlertDirector")} disabled={readOnly} />
          Alerte dirigeant (niveau 3)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("level3BlockNewOrders")} disabled={readOnly} />
          Bloquer nouveaux devis/commandes (niveau 3)
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Email commercial</Label>
          <Input
            {...register("commercialEmail")}
            disabled={readOnly}
            error={Boolean(errors.commercialEmail)}
            hint={errors.commercialEmail?.message}
          />
        </div>
        <div>
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
