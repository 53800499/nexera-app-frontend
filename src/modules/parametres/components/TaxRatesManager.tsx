"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useActionFeedback } from "@/shared/components/feedback";
import { useSettingsFormFeedback } from "../hooks/useSettingsFormFeedback";
import {
  taxRateSchema,
  type TaxRateFormValues,
} from "../schemas/settingsForm.schema";
import type { TaxRate } from "../types/settings.types";

type Props = {
  taxRates: TaxRate[];
  canManage: boolean;
  isSubmitting: boolean;
  onCreate: (values: TaxRateFormValues) => Promise<unknown>;
  onUpdate: (id: string, values: TaxRateFormValues) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
};

const emptyValues: TaxRateFormValues = {
  name: "",
  rate: 0,
  isDefault: false,
  isActive: true,
};

export function TaxRatesManager({
  taxRates,
  canManage,
  isSubmitting,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const { runAction } = useActionFeedback();
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<TaxRateFormValues>({
    resolver: zodResolver(taxRateSchema),
    defaultValues: emptyValues,
  });

  const { formError, clearFormError, handleApiError, handleInvalidSubmit } =
    useSettingsFormFeedback(setError, {
      formErrorId: "tax-rate-form-error",
      apiErrorTitle: "Action impossible",
    });

  const startEdit = (taxRate: TaxRate) => {
    setEditingId(taxRate.id);
    clearFormError();
    reset({
      name: taxRate.name,
      rate: taxRate.rate,
      isDefault: taxRate.isDefault,
      isActive: taxRate.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    clearFormError();
    reset(emptyValues);
  };

  const handleDelete = (taxRate: TaxRate) => {
    void runAction({
      confirm: {
        title: "Supprimer ce taux de TVA ?",
        message: `Le taux « ${taxRate.name} » (${taxRate.rate} %) sera supprimé définitivement.`,
        confirmLabel: "Supprimer",
        variant: "danger",
      },
      loadingMessage: "Suppression du taux...",
      success: {
        title: "Taux supprimé",
        message: taxRate.name,
      },
      error: {
        title: "Suppression impossible",
        message:
          "Ce taux est peut-être utilisé sur des documents ou défini par défaut.",
      },
      action: () => onDelete(taxRate.id),
    });
  };

  const submit = handleSubmit(async (values) => {
    clearFormError();
    try {
      let result: unknown;
      if (editingId) {
        result = await runAction({
          confirm: {
            title: "Mettre à jour ce taux de TVA ?",
            message: `Les modifications sur « ${values.name} » (${values.rate} %) seront appliquées.`,
            confirmLabel: "Mettre à jour",
          },
          loadingMessage: "Mise à jour du taux...",
          success: {
            title: "Taux mis à jour",
            message: values.name,
          },
          error: {
            title: "Mise à jour impossible",
            message:
              "Vérifiez le nom, le taux et l'option « taux par défaut ».",
          },
          showResultOnError: false,
          rethrowOnError: true,
          action: () => onUpdate(editingId, values),
        });
      } else {
        result = await runAction({
          confirm: {
            title: "Créer ce taux de TVA ?",
            message: `Le taux « ${values.name} » (${values.rate} %) sera ajouté à votre catalogue.`,
            confirmLabel: "Créer",
          },
          loadingMessage: "Création du taux...",
          success: {
            title: "Taux créé",
            message: values.name,
          },
          error: {
            title: "Création impossible",
            message: "Vérifiez le nom et le taux saisis.",
          },
          showResultOnError: false,
          rethrowOnError: true,
          action: () => onCreate(values),
        });
      }
      if (result !== undefined) {
        cancelEdit();
      }
    } catch (error) {
      await handleApiError(error);
    }
  }, handleInvalidSubmit);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Taux</th>
              <th className="px-4 py-3">Défaut</th>
              <th className="px-4 py-3">Actif</th>
              {canManage ? <th className="px-4 py-3">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {taxRates.map((taxRate) => (
              <tr
                key={taxRate.id}
                className="border-t border-gray-100 dark:border-gray-800"
              >
                <td className="px-4 py-3">{taxRate.name}</td>
                <td className="px-4 py-3">{taxRate.rate} %</td>
                <td className="px-4 py-3">{taxRate.isDefault ? "Oui" : "—"}</td>
                <td className="px-4 py-3">{taxRate.isActive ? "Oui" : "Non"}</td>
                {canManage ? (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-brand-500 hover:underline"
                        onClick={() => startEdit(taxRate)}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="text-red-500 hover:underline"
                        onClick={() => handleDelete(taxRate)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canManage ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/30">
          <h2 className="mb-4 text-sm font-semibold text-gray-800 dark:text-white/90">
            {editingId ? "Modifier le taux" : "Nouveau taux de TVA"}
          </h2>
          {formError ? (
            <p
              id="tax-rate-form-error"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
            >
              {formError}
            </p>
          ) : null}
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div data-form-field="name">
                <Label>Nom</Label>
                <Input
                  {...register("name")}
                  error={Boolean(errors.name)}
                  hint={errors.name?.message}
                />
              </div>
              <div data-form-field="rate">
                <Label>Taux (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("rate", { valueAsNumber: true })}
                  error={Boolean(errors.rate)}
                  hint={errors.rate?.message}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register("isDefault")} />
                Taux par défaut
              </label>
              {editingId ? (
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register("isActive")} />
                  Actif
                </label>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button disabled={isSubmitting}>
                {editingId ? "Mettre à jour" : "Créer"}
              </Button>
              {editingId ? (
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700"
                  onClick={cancelEdit}
                >
                  Annuler
                </button>
              ) : null}
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
