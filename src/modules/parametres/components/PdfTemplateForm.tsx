"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { useSettingsFormFeedback } from "../hooks/useSettingsFormFeedback";
import {
  pdfTemplateSchema,
  type PdfTemplateFormValues,
} from "../schemas/settingsForm.schema";
import type { PdfTemplate } from "../types/settings.types";

type Props = {
  template: PdfTemplate;
  readOnly?: boolean;
  isSubmitting: boolean;
  onSubmit: (values: PdfTemplateFormValues) => Promise<void>;
};

function toFormValues(template: PdfTemplate): PdfTemplateFormValues {
  return {
    logoUrl: template.logoUrl ?? "",
    primaryColor: template.primaryColor ?? "#1a56db",
    secondaryColor: template.secondaryColor ?? "#6b7280",
    layoutType: template.layoutType ?? "classic",
    showPageNumbers: template.showPageNumbers ?? true,
    fontFamily: template.fontFamily ?? "Helvetica",
    headerText: template.headerText ?? "",
    footerText: template.footerText ?? "",
    legalMentions: template.legalMentions ?? "",
    termsAndConditions: template.termsAndConditions ?? "",
  };
}

export function PdfTemplateForm({
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
  } = useForm<PdfTemplateFormValues>({
    resolver: zodResolver(pdfTemplateSchema),
    defaultValues: toFormValues(template),
  });

  const { formError, clearFormError, handleApiError, handleInvalidSubmit } =
    useSettingsFormFeedback(setError, {
      formErrorId: "pdf-template-form-error",
      apiErrorTitle: "Enregistrement impossible",
    });

  useEffect(() => {
    reset(toFormValues(template));
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
    <form onSubmit={submit} className="space-y-6" noValidate>
      {formError ? (
        <p
          id="pdf-template-form-error"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {formError}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2" data-form-field="logoUrl">
          <Label>URL du logo</Label>
          <Input {...register("logoUrl")} disabled={readOnly} />
        </div>
        <div data-form-field="primaryColor">
          <Label>Couleur principale</Label>
          <Input type="color" {...register("primaryColor")} disabled={readOnly} />
        </div>
        <div data-form-field="secondaryColor">
          <Label>Couleur secondaire</Label>
          <Input type="color" {...register("secondaryColor")} disabled={readOnly} />
        </div>
        <div data-form-field="layoutType">
          <Label>Mise en page</Label>
          <select
            {...register("layoutType")}
            disabled={readOnly}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="classic">Classique</option>
            <option value="modern">Moderne</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        <div>
          <Label>Police</Label>
          <select
            {...register("fontFamily")}
            disabled={readOnly}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="Helvetica">Helvetica</option>
            <option value="Times-Roman">Times Roman</option>
            <option value="Courier">Courier</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("showPageNumbers")} disabled={readOnly} />
        Afficher la numérotation des pages
      </label>

      <div className="space-y-4">
        <div>
          <Label>En-tête</Label>
          <textarea
            {...register("headerText")}
            disabled={readOnly}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
        <div>
          <Label>Pied de page</Label>
          <textarea
            {...register("footerText")}
            disabled={readOnly}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
        <div>
          <Label>Mentions légales</Label>
          <textarea
            {...register("legalMentions")}
            disabled={readOnly}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
        <div>
          <Label>CGV complémentaires</Label>
          <textarea
            {...register("termsAndConditions")}
            disabled={readOnly}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
      </div>

      {errors.primaryColor?.message ? (
        <p className="text-xs text-red-500">{errors.primaryColor.message}</p>
      ) : null}

      {!readOnly ? (
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      ) : null}
    </form>
  );
}
