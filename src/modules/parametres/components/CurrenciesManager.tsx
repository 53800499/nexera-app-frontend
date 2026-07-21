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
  currencySchema,
  type CurrencyFormValues,
} from "../schemas/settingsForm.schema";
import type { TenantCurrency } from "../types/settings.types";

type Props = {
  currencies: TenantCurrency[];
  canManage: boolean;
  isSubmitting: boolean;
  onCreate: (values: CurrencyFormValues) => Promise<unknown>;
  onUpdate: (id: string, values: CurrencyFormValues) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
};

const emptyValues: CurrencyFormValues = {
  code: "",
  name: "",
  symbol: "",
  manualRate: "",
  isActive: true,
};

export function CurrenciesManager({
  currencies,
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
  } = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencySchema),
    defaultValues: emptyValues,
  });

  const { formError, clearFormError, handleApiError, handleInvalidSubmit } =
    useSettingsFormFeedback(setError, {
      formErrorId: "currency-form-error",
      apiErrorTitle: "Action impossible",
    });

  const startEdit = (currency: TenantCurrency) => {
    setEditingId(currency.id);
    clearFormError();
    reset({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol ?? "",
      manualRate:
        currency.manualRate != null ? String(currency.manualRate) : "",
      isActive: currency.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    clearFormError();
    reset(emptyValues);
  };

  const handleDelete = (currency: TenantCurrency) => {
    void runAction({
      confirm: {
        title: "Supprimer cette devise ?",
        message: `La devise ${currency.code} (${currency.name}) sera retirée de votre catalogue.`,
        confirmLabel: "Supprimer",
        variant: "danger",
      },
      loadingMessage: "Suppression de la devise...",
      success: {
        title: "Devise supprimée",
        message: currency.code,
      },
      error: {
        title: "Suppression impossible",
        message:
          "La devise principale ou une devise encore utilisée ne peut pas être supprimée.",
      },
      action: () => onDelete(currency.id),
    });
  };

  const submit = handleSubmit(async (values) => {
    clearFormError();
    try {
      let result: unknown;
      if (editingId) {
        result = await runAction({
          confirm: {
            title: "Mettre à jour cette devise ?",
            message: `Les informations de ${values.code.toUpperCase()} seront mises à jour.`,
            confirmLabel: "Mettre à jour",
          },
          loadingMessage: "Mise à jour de la devise...",
          success: {
            title: "Devise mise à jour",
            message: values.code.toUpperCase(),
          },
          error: {
            title: "Mise à jour impossible",
            message: "Vérifiez le nom, le symbole et le taux manuel.",
          },
          showResultOnError: false,
          rethrowOnError: true,
          action: () => onUpdate(editingId, values),
        });
      } else {
        result = await runAction({
          confirm: {
            title: "Ajouter cette devise ?",
            message: `La devise ${values.code.toUpperCase()} (${values.name}) sera ajoutée.`,
            confirmLabel: "Créer",
          },
          loadingMessage: "Création de la devise...",
          success: {
            title: "Devise créée",
            message: values.code.toUpperCase(),
          },
          error: {
            title: "Création impossible",
            message:
              "Vérifiez le code ISO (3 lettres), le nom et le taux manuel.",
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
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Symbole</th>
              <th className="px-4 py-3">Taux manuel</th>
              <th className="px-4 py-3">Principale</th>
              <th className="px-4 py-3">Active</th>
              {canManage ? <th className="px-4 py-3">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {currencies.map((currency) => (
              <tr
                key={currency.id}
                className="border-t border-gray-100 dark:border-gray-800"
              >
                <td className="px-4 py-3 font-medium">{currency.code}</td>
                <td className="px-4 py-3">{currency.name}</td>
                <td className="px-4 py-3">{currency.symbol ?? "—"}</td>
                <td className="px-4 py-3">{currency.manualRate ?? "—"}</td>
                <td className="px-4 py-3">{currency.isPrimary ? "Oui" : "—"}</td>
                <td className="px-4 py-3">{currency.isActive ? "Oui" : "Non"}</td>
                {canManage ? (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-brand-500 hover:underline"
                        onClick={() => startEdit(currency)}
                      >
                        Modifier
                      </button>
                      {!currency.isPrimary ? (
                        <button
                          type="button"
                          className="text-red-500 hover:underline"
                          onClick={() => handleDelete(currency)}
                        >
                          Supprimer
                        </button>
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canManage ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 font-medium">
            {editingId ? "Modifier la devise" : "Nouvelle devise"}
          </h2>
          {formError ? (
            <p
              id="currency-form-error"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
            >
              {formError}
            </p>
          ) : null}
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div data-form-field="code">
                <Label>Code ISO</Label>
                <Input
                  {...register("code")}
                  disabled={Boolean(editingId)}
                  error={Boolean(errors.code)}
                  hint={errors.code?.message}
                />
              </div>
              <div data-form-field="name">
                <Label>Nom</Label>
                <Input
                  {...register("name")}
                  error={Boolean(errors.name)}
                  hint={errors.name?.message}
                />
              </div>
              <div data-form-field="symbol">
                <Label>Symbole</Label>
                <Input {...register("symbol")} />
              </div>
              <div data-form-field="manualRate">
                <Label>Taux manuel</Label>
                <Input type="number" step="0.0001" {...register("manualRate")} />
              </div>
            </div>
            {editingId ? (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("isActive")} />
                Active
              </label>
            ) : null}
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
