"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type SubmitErrorHandler } from "react-hook-form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { useActionFeedback } from "@/shared/components/feedback";
import { focusFirstFormError, scrollToFormField } from "@/shared/forms/formErrorFocus";
import { applyFormApiErrors } from "@/shared/http/applyFormApiErrors";
import { resolveFormErrorMessage } from "@/shared/http/resolveFormErrorMessage";
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
  const { showResult } = useActionFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
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

  const handleFormSubmit = async (values: ManualReminderFormValues) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const { message, firstField } = applyFormApiErrors(error, setError);
      const displayMessage = message ?? resolveFormErrorMessage(error);
      setFormError(displayMessage);
      void showResult({
        variant: "error",
        title: "Relance impossible",
        message: firstField
          ? `${displayMessage} Le champ concerné est mis en évidence ci-dessous.`
          : displayMessage,
      });
      if (firstField) {
        window.setTimeout(() => scrollToFormField(firstField), 0);
      } else {
        document
          .getElementById("manual-reminder-form-error")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleInvalidSubmit: SubmitErrorHandler<ManualReminderFormValues> = (
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
          id="manual-reminder-form-error"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {formError}
        </p>
      ) : null}

      <div data-form-field="channel">
        <Label>Canal</Label>
        <select
          className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          {...register("channel")}
        >
          <option value="email">E-mail</option>
          <option value="sms">SMS</option>
          <option value="print">Courrier</option>
        </select>
        {errors.channel ? (
          <p className="mt-1 text-xs text-red-600">{errors.channel.message}</p>
        ) : null}
      </div>
      <div data-form-field="level">
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
        {errors.level ? (
          <p className="mt-1 text-xs text-red-600">{errors.level.message}</p>
        ) : null}
      </div>
      <div data-form-field="subject">
        <Label>Objet (e-mail)</Label>
        <Input
          placeholder="Rappel facture FAC-..."
          {...register("subject")}
        />
        {errors.subject ? (
          <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>
        ) : null}
      </div>
      <div data-form-field="message">
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
