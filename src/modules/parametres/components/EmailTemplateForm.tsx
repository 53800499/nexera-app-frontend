"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { useToast } from "@/shared/components/feedback";
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
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      subject: template.subject,
      body: template.body,
      isActive: template.isActive,
    },
  });

  useEffect(() => {
    reset({
      subject: template.subject,
      body: template.body,
      isActive: template.isActive,
    });
  }, [template, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      toast.success("Modèle enregistré");
    } catch (error) {
      toast.error(
        "Enregistrement impossible",
        error instanceof Error ? error.message : undefined,
      );
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label>Sujet</Label>
        <Input
          {...register("subject")}
          disabled={readOnly}
          error={Boolean(errors.subject)}
          hint={errors.subject?.message}
        />
      </div>
      <div>
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
