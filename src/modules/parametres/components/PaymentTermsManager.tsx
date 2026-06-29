"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useToast } from "@/shared/components/feedback";
import {
  paymentTermSchema,
  type PaymentTermFormValues,
} from "../schemas/settingsForm.schema";
import type { PaymentTerm } from "../types/settings.types";

type Props = {
  paymentTerms: PaymentTerm[];
  canManage: boolean;
  isSubmitting: boolean;
  onCreate: (values: PaymentTermFormValues) => Promise<void>;
  onUpdate: (id: string, values: PaymentTermFormValues) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
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
  const toast = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentTermFormValues>({
    resolver: zodResolver(paymentTermSchema),
    defaultValues: emptyValues,
  });

  const startEdit = (term: PaymentTerm) => {
    setEditingId(term.id);
    reset({
      name: term.name,
      days: term.days,
      endOfMonth: term.endOfMonth,
      isDefault: term.isDefault,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset(emptyValues);
  };

  const submit = handleSubmit(async (values) => {
    try {
      if (editingId) {
        await onUpdate(editingId, values);
        toast.success("Condition mise à jour");
      } else {
        await onCreate(values);
        toast.success("Condition créée");
      }
      cancelEdit();
    } catch (error) {
      toast.error(
        "Action impossible",
        error instanceof Error ? error.message : undefined,
      );
    }
  });

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
              <tr key={term.id} className="border-t border-gray-100 dark:border-gray-800">
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
                        onClick={async () => {
                          if (!window.confirm(`Supprimer « ${term.name} » ?`)) return;
                          try {
                            await onDelete(term.id);
                            toast.success("Condition supprimée");
                          } catch {
                            toast.error("Suppression impossible");
                          }
                        }}
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
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Nom</Label>
                <Input
                  {...register("name")}
                  error={Boolean(errors.name)}
                  hint={errors.name?.message}
                />
              </div>
              <div>
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
