"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useActionFeedback } from "@/shared/components/feedback";
import { useSettingsFormFeedback } from "../hooks/useSettingsFormFeedback";
import {
  numberingRuleSchema,
  type NumberingRuleFormValues,
} from "../schemas/settingsForm.schema";
import type { DocumentType, NumberingRule } from "../types/settings.types";
import { DOCUMENT_TYPE_LABELS } from "../utils/settingsLabels";

type Props = {
  rules: NumberingRule[];
  canManage: boolean;
  isSubmitting: boolean;
  onUpdate: (
    documentType: DocumentType,
    values: NumberingRuleFormValues,
  ) => Promise<unknown>;
};

function toFormValues(rule: NumberingRule): NumberingRuleFormValues {
  return {
    prefix: rule.prefix,
    suffix: rule.suffix ?? "",
    separator: rule.separator,
    draftMarker: rule.draftMarker ?? "",
    includeYear: rule.includeYear,
    counterLength: rule.counterLength,
    annualReset: rule.annualReset,
  };
}

export function NumberingRulesEditor({
  rules,
  canManage,
  isSubmitting,
  onUpdate,
}: Props) {
  const { runAction } = useActionFeedback();
  const [selectedType, setSelectedType] = useState<DocumentType>(
    rules[0]?.documentType ?? "quotation",
  );
  const selectedRule = rules.find((rule) => rule.documentType === selectedType);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<NumberingRuleFormValues>({
    resolver: zodResolver(numberingRuleSchema),
    defaultValues: toFormValues(
      selectedRule ?? {
        documentType: "quotation",
        prefix: "",
        separator: "-",
        includeYear: true,
        counterLength: 6,
        annualReset: true,
      },
    ),
  });

  const { formError, clearFormError, handleApiError, handleInvalidSubmit } =
    useSettingsFormFeedback(setError, {
      formErrorId: "numbering-form-error",
      apiErrorTitle: "Enregistrement impossible",
    });

  useEffect(() => {
    if (!rules.length) return;
    if (!rules.some((rule) => rule.documentType === selectedType)) {
      setSelectedType(rules[0].documentType);
    }
  }, [rules, selectedType]);

  useEffect(() => {
    const rule = rules.find((item) => item.documentType === selectedType);
    if (rule) {
      clearFormError();
      reset(toFormValues(rule));
    }
  }, [rules, selectedType, reset, clearFormError]);

  const submit = handleSubmit(async (values) => {
    const docLabel = DOCUMENT_TYPE_LABELS[selectedType];
    clearFormError();
    try {
      await runAction({
        confirm: {
          title: "Enregistrer cette règle de numérotation ?",
          message: `La numérotation des ${docLabel.toLowerCase()} sera mise à jour (préfixe « ${values.prefix} »).`,
          confirmLabel: "Enregistrer",
        },
        loadingMessage: "Enregistrement de la règle...",
        success: {
          title: "Règle enregistrée",
          message: docLabel,
        },
        error: {
          title: "Enregistrement impossible",
          message:
            "Vérifiez le préfixe, le séparateur et la longueur du compteur.",
        },
        showResultOnError: false,
        rethrowOnError: true,
        action: () => onUpdate(selectedType, values),
      });
    } catch (error) {
      await handleApiError(error);
    }
  }, handleInvalidSubmit);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
      <div className="space-y-1 rounded-xl border border-gray-200 p-2 dark:border-gray-800">
        {rules.map((rule) => (
          <button
            key={rule.documentType}
            type="button"
            onClick={() => setSelectedType(rule.documentType)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
              selectedType === rule.documentType
                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10"
                : "hover:bg-gray-50 dark:hover:bg-gray-900"
            }`}
          >
            {DOCUMENT_TYPE_LABELS[rule.documentType]}
          </button>
        ))}
      </div>

      {selectedRule ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4">
            <h2 className="font-medium">
              {DOCUMENT_TYPE_LABELS[selectedRule.documentType]}
            </h2>
            {selectedRule.preview ? (
              <p className="mt-1 text-sm text-gray-500">
                Aperçu : {selectedRule.preview}
              </p>
            ) : null}
          </div>

          {formError ? (
            <p
              id="numbering-form-error"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
            >
              {formError}
            </p>
          ) : null}

          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div data-form-field="prefix">
                <Label>Préfixe</Label>
                <Input
                  {...register("prefix")}
                  disabled={!canManage}
                  error={Boolean(errors.prefix)}
                  hint={errors.prefix?.message}
                />
              </div>
              <div data-form-field="suffix">
                <Label>Suffixe</Label>
                <Input {...register("suffix")} disabled={!canManage} />
              </div>
              <div data-form-field="separator">
                <Label>Séparateur</Label>
                <Input {...register("separator")} disabled={!canManage} />
              </div>
              <div data-form-field="draftMarker">
                <Label>Marqueur brouillon</Label>
                <Input {...register("draftMarker")} disabled={!canManage} />
              </div>
              <div data-form-field="counterLength">
                <Label>Longueur compteur</Label>
                <Input
                  type="number"
                  {...register("counterLength", { valueAsNumber: true })}
                  disabled={!canManage}
                  error={Boolean(errors.counterLength)}
                  hint={errors.counterLength?.message}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("includeYear")}
                  disabled={!canManage}
                />
                Inclure l&apos;année
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("annualReset")}
                  disabled={!canManage}
                />
                Remise à zéro annuelle
              </label>
            </div>
            {canManage ? (
              <Button disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            ) : null}
          </form>
        </div>
      ) : null}
    </div>
  );
}
