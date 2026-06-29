"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import {
  manualReminderSchema,
  type ManualReminderFormValues,
} from "../schemas/reminderForm.schema";
import { REMINDER_LEVEL_LABELS } from "../utils/reminderLabels";

type Props = {
  isSubmitting: boolean;
  onSubmit: (values: ManualReminderFormValues) => Promise<void>;
  onCancel?: () => void;
};

export function ManualReminderForm({
  isSubmitting,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManualReminderFormValues>({
    resolver: zodResolver(manualReminderSchema),
    defaultValues: {
      message: "",
      subject: "",
      channel: "email",
      level: 1,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Canal</Label>
        <select
          className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          {...register("channel")}
        >
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="print">Courrier</option>
        </select>
      </div>
      <div>
        <Label>Niveau affiché</Label>
        <select
          className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          {...register("level", { valueAsNumber: true })}
        >
          {Object.entries(REMINDER_LEVEL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Objet (email)</Label>
        <Input
          placeholder="Rappel facture FAC-..."
          {...register("subject")}
        />
      </div>
      <div>
        <Label>
          Message <span className="text-red-600">*</span>
        </Label>
        <textarea
          className="min-h-28 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          placeholder="Bonjour, nous vous rappelons que la facture reste impayée..."
          {...register("message")}
        />
        {errors.message ? (
          <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {isSubmitting ? "Envoi..." : "Envoyer la relance"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          >
            Annuler
          </button>
        ) : null}
      </div>
    </form>
  );
}
