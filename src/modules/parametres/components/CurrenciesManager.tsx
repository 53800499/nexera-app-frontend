"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useToast } from "@/shared/components/feedback";
import {
  currencySchema,
  type CurrencyFormValues,
} from "../schemas/settingsForm.schema";
import type { TenantCurrency } from "../types/settings.types";

type Props = {
  currencies: TenantCurrency[];
  canManage: boolean;
  isSubmitting: boolean;
  onCreate: (values: CurrencyFormValues) => Promise<void>;
  onUpdate: (id: string, values: CurrencyFormValues) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
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
  const toast = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencySchema),
    defaultValues: emptyValues,
  });

  const startEdit = (currency: TenantCurrency) => {
    setEditingId(currency.id);
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
    reset(emptyValues);
  };

  const submit = handleSubmit(async (values) => {
    try {
      if (editingId) {
        await onUpdate(editingId, values);
        toast.success("Devise mise à jour");
      } else {
        await onCreate(values);
        toast.success("Devise créée");
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
              <tr key={currency.id} className="border-t border-gray-100 dark:border-gray-800">
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
                          onClick={async () => {
                            if (!window.confirm(`Supprimer ${currency.code} ?`)) return;
                            try {
                              await onDelete(currency.id);
                              toast.success("Devise supprimée");
                            } catch {
                              toast.error("Suppression impossible");
                            }
                          }}
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
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Code ISO</Label>
                <Input
                  {...register("code")}
                  disabled={Boolean(editingId)}
                  error={Boolean(errors.code)}
                  hint={errors.code?.message}
                />
              </div>
              <div>
                <Label>Nom</Label>
                <Input
                  {...register("name")}
                  error={Boolean(errors.name)}
                  hint={errors.name?.message}
                />
              </div>
              <div>
                <Label>Symbole</Label>
                <Input {...register("symbol")} />
              </div>
              <div>
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
