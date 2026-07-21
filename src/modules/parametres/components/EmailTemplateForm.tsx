"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { useSettingsFormFeedback } from "../hooks/useSettingsFormFeedback";
import {
  emailTemplateSchema,
  type EmailTemplateFormValues,
} from "../schemas/settingsForm.schema";
import type { EmailTemplate } from "../types/settings.types";

type Props = {
  template: EmailTemplate;
  readOnly?: boolean;
  isSubmitting: boolean;
  onSubmit: (values: EmailTemplateFormValues) => Promise<void>;
};

export function EmailTemplateForm({
  template,
  readOnly = false,
  isSubmitting,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      subject: template.subject,
      body: template.body,
      isActive: template.isActive,
    },
  });

  const { formError, clearFormError, handleApiError, handleInvalidSubmit } =
    useSettingsFormFeedback(setError, {
      formErrorId: "email-template-form-error",
      apiErrorTitle: "Enregistrement impossible",
    });

  useEffect(() => {
    reset({
      subject: template.subject,
      body: template.body,
      isActive: template.isActive,
    });
  }, [template, reset]);

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
          id="email-template-form-error"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {formError}
        </p>
      ) : null}

      <div data-form-field="subject">
        <Label>Sujet</Label>
        <Input
          {...register("subject")}
          disabled={readOnly}
          error={Boolean(errors.subject)}
          hint={errors.subject?.message}
        />
      </div>
      <div data-form-field="body">
        <Label>Corps du message</Label>
        <textarea
          {...register("body")}
          disabled={readOnly}
          rows={12}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        {errors.body?.message ? (
          <p className="mt-1 text-xs text-red-500">{errors.body.message}</p>
        ) : null}
        <p className="mt-1 text-xs text-gray-400">
          Variables : {"{{documentNumber}}"}, {"{{clientName}}"}, etc.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isActive")} disabled={readOnly} />
        Modèle actif
      </label>
      {!readOnly ? (
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      ) : null}
    </form>
  );
}
