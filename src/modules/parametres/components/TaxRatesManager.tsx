"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useToast } from "@/shared/components/feedback";
import {
  taxRateSchema,
  type TaxRateFormValues,
} from "../schemas/settingsForm.schema";
import type { TaxRate } from "../types/settings.types";

type Props = {
  taxRates: TaxRate[];
  canManage: boolean;
  isSubmitting: boolean;
  onCreate: (values: TaxRateFormValues) => Promise<void>;
  onUpdate: (id: string, values: TaxRateFormValues) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
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
  const toast = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaxRateFormValues>({
    resolver: zodResolver(taxRateSchema),
    defaultValues: emptyValues,
  });

  const startEdit = (taxRate: TaxRate) => {
    setEditingId(taxRate.id);
    reset({
      name: taxRate.name,
      rate: taxRate.rate,
      isDefault: taxRate.isDefault,
      isActive: taxRate.isActive,
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
        toast.success("Taux mis à jour");
      } else {
        await onCreate(values);
        toast.success("Taux créé");
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
              <tr key={taxRate.id} className="border-t border-gray-100 dark:border-gray-800">
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
                        onClick={async () => {
                          if (!window.confirm(`Supprimer « ${taxRate.name} » ?`)) return;
                          try {
                            await onDelete(taxRate.id);
                            toast.success("Taux supprimé");
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
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/30">
          <h2 className="mb-4 text-sm font-semibold text-gray-800 dark:text-white/90">
            {editingId ? "Modifier le taux" : "Nouveau taux de TVA"}
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
