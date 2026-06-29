"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import type { CatalogCategory, TaxRate } from "../types/catalogue.types";
import {
  catalogItemFormSchema,
  type CatalogItemFormValues,
} from "../schemas/catalogItemForm.schema";
import { ITEM_TYPE_LABELS } from "../utils/catalogueLabels";

type Props = {
  isSubmitting: boolean;
  submitLabel: string;
  defaultValues?: Partial<CatalogItemFormValues>;
  categories: CatalogCategory[];
  taxRates: TaxRate[];
  onSubmit: (values: CatalogItemFormValues) => Promise<void>;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700">
      {children}
    </h3>
  );
}

export function CatalogItemForm({
  isSubmitting,
  submitLabel,
  defaultValues,
  categories,
  taxRates,
  onSubmit,
}: Props) {
  const activeTaxRates = taxRates.filter((rate) => rate.isActive);
  const defaultTaxId =
    activeTaxRates.find((rate) => rate.isDefault)?.id ??
    activeTaxRates[0]?.id ??
    "";

  const initialValues = useMemo<CatalogItemFormValues>(
    () => ({
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      itemType: defaultValues?.itemType ?? "product",
      unit: defaultValues?.unit ?? "unit",
      priceHt: defaultValues?.priceHt ?? 0,
      defaultTaxRateId: defaultValues?.defaultTaxRateId ?? defaultTaxId,
      categoryId: defaultValues?.categoryId ?? "",
      maxDiscountPct: defaultValues?.maxDiscountPct,
    }),
    [defaultValues, defaultTaxId],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CatalogItemFormValues>({
    resolver: zodResolver(catalogItemFormSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="space-y-4">
        <SectionTitle>Identification</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>
              Désignation <span className="text-red-600">*</span>
            </Label>
            <Input
              {...register("name")}
              error={Boolean(errors.name)}
              hint={errors.name?.message}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          <div>
            <Label>
              Type <span className="text-red-600">*</span>
            </Label>
            <select
              {...register("itemType")}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              {(
                Object.entries(ITEM_TYPE_LABELS) as [
                  CatalogItemFormValues["itemType"],
                  string,
                ][]
              ).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Catégorie</Label>
            <select
              {...register("categoryId")}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">— Aucune —</option>
              {categories
                .filter((category) => !category.isArchived)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Tarification</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>
              Prix HT <span className="text-red-600">*</span>
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("priceHt", { valueAsNumber: true })}
              error={Boolean(errors.priceHt)}
              hint={errors.priceHt?.message}
            />
          </div>
          <div>
            <Label>
              TVA <span className="text-red-600">*</span>
            </Label>
            <select
              {...register("defaultTaxRateId")}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
              disabled={activeTaxRates.length === 0}
            >
              {activeTaxRates.length === 0 ? (
                <option value="">Aucun taux disponible</option>
              ) : (
                activeTaxRates.map((rate) => (
                  <option key={rate.id} value={rate.id}>
                    {rate.name} ({rate.rate}%)
                  </option>
                ))
              )}
            </select>
            {errors.defaultTaxRateId ? (
              <p className="mt-1 text-xs text-error-500">
                {errors.defaultTaxRateId.message}
              </p>
            ) : null}
          </div>
          <div>
            <Label>Unité</Label>
            <Input
              {...register("unit")}
              placeholder="unit, h, jour..."
              error={Boolean(errors.unit)}
              hint={errors.unit?.message}
            />
          </div>
          <div>
            <Label>Remise max. (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              {...register("maxDiscountPct", { valueAsNumber: true })}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button disabled={isSubmitting || activeTaxRates.length === 0}>
          {isSubmitting ? "Enregistrement..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
