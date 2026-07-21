"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import {
  stockItemFormSchema,
  type StockItemFormValues,
} from "../schemas/stockItemForm.schema";
import { VALUATION_METHOD_LABELS } from "../utils/stockMappers";
import type { Warehouse } from "../types/stock.types";

type Props = {
  isSubmitting: boolean;
  submitLabel: string;
  defaultValues?: Partial<StockItemFormValues>;
  warehouses: Warehouse[];
  valuationLocked?: boolean;
  onSubmit: (values: StockItemFormValues) => Promise<void>;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700">
      {children}
    </h3>
  );
}

export function StockItemForm({
  isSubmitting,
  submitLabel,
  defaultValues,
  warehouses,
  valuationLocked = false,
  onSubmit,
}: Props) {
  const initialValues = useMemo<StockItemFormValues>(
    () => ({
      storageUnit: defaultValues?.storageUnit ?? "unit",
      conversionFactor: defaultValues?.conversionFactor ?? 1,
      trackLots: defaultValues?.trackLots ?? false,
      trackSerials: defaultValues?.trackSerials ?? false,
      trackExpiry: defaultValues?.trackExpiry ?? false,
      valuationMethod: defaultValues?.valuationMethod ?? "cmup",
      minStockQty: defaultValues?.minStockQty,
      safetyStockQty: defaultValues?.safetyStockQty,
      maxStockQty: defaultValues?.maxStockQty,
      reorderQty: defaultValues?.reorderQty,
      defaultWarehouseId: defaultValues?.defaultWarehouseId ?? "",
      defaultLocationId: defaultValues?.defaultLocationId ?? "",
      allowNegativeStock: defaultValues?.allowNegativeStock ?? false,
    }),
    [defaultValues],
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StockItemFormValues>({
    resolver: zodResolver(stockItemFormSchema),
    defaultValues: initialValues,
  });

  const warehouseId = watch("defaultWarehouseId");
  const selectedWarehouse = warehouses.find((w) => w.id === warehouseId);
  const locations = selectedWarehouse?.locations ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="space-y-4">
        <SectionTitle>Attributs de stockage</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>
              Unité de stockage <span className="text-red-600">*</span>
            </Label>
            <Input
              {...register("storageUnit")}
              error={Boolean(errors.storageUnit)}
              hint={errors.storageUnit?.message}
            />
          </div>
          <div>
            <Label>
              Facteur de conversion <span className="text-red-600">*</span>
            </Label>
            <Input
              type="number"
              step="any"
              min="0.0001"
              {...register("conversionFactor", { valueAsNumber: true })}
              error={Boolean(errors.conversionFactor)}
              hint={
                errors.conversionFactor?.message ??
                "Ex. : boîte = 12 unités de vente"
              }
            />
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-6">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" {...register("trackLots")} />
              Gestion par lot
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" {...register("trackSerials")} />
              Gestion par n° de série
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" {...register("trackExpiry")} />
              Suivi de péremption
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Valorisation</SectionTitle>
        <div>
          <Label>
            Méthode <span className="text-red-600">*</span>
          </Label>
          <select
            {...register("valuationMethod")}
            disabled={valuationLocked}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900"
          >
            {Object.entries(VALUATION_METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {valuationLocked ? (
            <p className="mt-1 text-xs text-amber-600">
              Méthode verrouillée tant que le stock est positif (RM-S01).
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Seuils d&apos;alerte</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Stock de sécurité</Label>
            <Input
              type="number"
              step="any"
              min="0"
              {...register("safetyStockQty", { valueAsNumber: true })}
              error={Boolean(errors.safetyStockQty)}
              hint={errors.safetyStockQty?.message}
            />
          </div>
          <div>
            <Label>Stock minimum</Label>
            <Input
              type="number"
              step="any"
              min="0"
              {...register("minStockQty", { valueAsNumber: true })}
              error={Boolean(errors.minStockQty)}
              hint={errors.minStockQty?.message}
            />
          </div>
          <div>
            <Label>Stock maximum</Label>
            <Input
              type="number"
              step="any"
              min="0"
              {...register("maxStockQty", { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label>Qté de réapprovisionnement</Label>
            <Input
              type="number"
              step="any"
              min="0"
              {...register("reorderQty", { valueAsNumber: true })}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Entrepôt par défaut</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Entrepôt</Label>
            <select
              {...register("defaultWarehouseId")}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">— Aucun —</option>
              {warehouses
                .filter((w) => w.isActive)
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} — {w.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <Label>Emplacement</Label>
            <select
              {...register("defaultLocationId")}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">— Aucun —</option>
              {locations
                .filter((l) => l.isActive)
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code}
                  </option>
                ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" {...register("allowNegativeStock")} />
              Autoriser le stock négatif (dérogation admin — RM-S05)
            </label>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
