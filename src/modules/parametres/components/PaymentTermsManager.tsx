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
  paymentTermSchema,
  type PaymentTermFormValues,
} from "../schemas/settingsForm.schema";
import type { PaymentTerm } from "../types/settings.types";

type Props = {
  paymentTerms: PaymentTerm[];
  canManage: boolean;
  isSubmitting: boolean;
  onCreate: (values: PaymentTermFormValues) => Promise<unknown>;
  onUpdate: (id: string, values: PaymentTermFormValues) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
};

const emptyValues: PaymentTermFormValues = {
  name: "",
  days: 30,
  endOfMonth: false,
  isDefault: false,
};

export function PaymentTermsManager({
  paymentTerms,
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
  } = useForm<PaymentTermFormValues>({
    resolver: zodResolver(paymentTermSchema),
    defaultValues: emptyValues,
  });

  const { formError, clearFormError, handleApiError, handleInvalidSubmit } =
    useSettingsFormFeedback(setError, {
      formErrorId: "payment-term-form-error",
      apiErrorTitle: "Action impossible",
    });

  const startEdit = (term: PaymentTerm) => {
    setEditingId(term.id);
    clearFormError();
    reset({
      name: term.name,
      days: term.days,
      endOfMonth: term.endOfMonth,
      isDefault: term.isDefault,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    clearFormError();
    reset(emptyValues);
  };

  const handleDelete = (term: PaymentTerm) => {
    void runAction({
      confirm: {
        title: "Supprimer cette condition ?",
        message: `« ${term.name} » (${term.days} jours) sera supprimée définitivement.`,
        confirmLabel: "Supprimer",
        variant: "danger",
      },
      loadingMessage: "Suppression de la condition...",
      success: {
        title: "Condition supprimée",
        message: term.name,
      },
      error: {
        title: "Suppression impossible",
        message:
          "Cette condition est peut-être utilisée sur des documents ou définie par défaut.",
      },
      action: () => onDelete(term.id),
    });
  };

  const submit = handleSubmit(async (values) => {
    clearFormError();
    try {
      let result: unknown;
      if (editingId) {
        result = await runAction({
          confirm: {
            title: "Mettre à jour cette condition ?",
            message: `« ${values.name} » (${values.days} jours) sera modifiée.`,
            confirmLabel: "Mettre à jour",
          },
          loadingMessage: "Mise à jour de la condition...",
          success: {
            title: "Condition mise à jour",
            message: values.name,
          },
          error: {
            title: "Mise à jour impossible",
            message: "Vérifiez le nom, le délai et l'option par défaut.",
          },
          showResultOnError: false,
          rethrowOnError: true,
          action: () => onUpdate(editingId, values),
        });
      } else {
        result = await runAction({
          confirm: {
            title: "Créer cette condition de paiement ?",
            message: `« ${values.name} » (${values.days} jours) sera ajoutée à votre catalogue.`,
            confirmLabel: "Créer",
          },
          loadingMessage: "Création de la condition...",
          success: {
            title: "Condition créée",
            message: values.name,
          },
          error: {
            title: "Création impossible",
            message: "Vérifiez le nom et le délai en jours.",
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
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Délai (jours)</th>
              <th className="px-4 py-3">Fin de mois</th>
              <th className="px-4 py-3">Défaut</th>
              {canManage ? <th className="px-4 py-3">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {paymentTerms.map((term) => (
              <tr
                key={term.id}
                className="border-t border-gray-100 dark:border-gray-800"
              >
                <td className="px-4 py-3">{term.name}</td>
                <td className="px-4 py-3">{term.days}</td>
                <td className="px-4 py-3">{term.endOfMonth ? "Oui" : "—"}</td>
                <td className="px-4 py-3">{term.isDefault ? "Oui" : "—"}</td>
                {canManage ? (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-brand-500 hover:underline"
                        onClick={() => startEdit(term)}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="text-red-500 hover:underline"
                        onClick={() => handleDelete(term)}
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
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 font-medium">
            {editingId ? "Modifier la condition" : "Nouvelle condition de paiement"}
          </h2>
          {formError ? (
            <p
              id="payment-term-form-error"
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
              <div data-form-field="days">
                <Label>Délai (jours)</Label>
                <Input
                  type="number"
                  {...register("days", { valueAsNumber: true })}
                  error={Boolean(errors.days)}
                  hint={errors.days?.message}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register("endOfMonth")} />
                Fin de mois
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register("isDefault")} />
                Condition par défaut
              </label>
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
