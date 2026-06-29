"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import {
  catalogCategoryFormSchema,
  type CatalogCategoryFormValues,
} from "../schemas/catalogItemForm.schema";
import type { CatalogCategory } from "../types/catalogue.types";

type Props = {
  categories: CatalogCategory[];
  excludeCategoryId?: string;
  defaultValues?: Partial<CatalogCategoryFormValues>;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel?: () => void;
  onSubmit: (values: CatalogCategoryFormValues) => Promise<void>;
};

export function CatalogCategoryForm({
  categories,
  excludeCategoryId,
  defaultValues,
  isSubmitting,
  submitLabel,
  onCancel,
  onSubmit,
}: Props) {
  const initialValues = useMemo<CatalogCategoryFormValues>(
    () => ({
      name: defaultValues?.name ?? "",
      code: defaultValues?.code ?? "",
      description: defaultValues?.description ?? "",
      parentId: defaultValues?.parentId ?? "",
    }),
    [defaultValues],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CatalogCategoryFormValues>({
    resolver: zodResolver(catalogCategoryFormSchema),
    defaultValues: initialValues,
  });

  const parentOptions = categories.filter(
    (category) => category.id !== excludeCategoryId,
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>
            Nom <span className="text-red-600">*</span>
          </Label>
          <Input
            {...register("name")}
            error={Boolean(errors.name)}
            hint={errors.name?.message}
          />
        </div>
        <div>
          <Label>Code</Label>
          <Input {...register("code")} />
        </div>
        <div className="md:col-span-2">
          <Label>Description</Label>
          <Input {...register("description")} />
        </div>
        <div>
          <Label>Catégorie parente</Label>
          <select
            {...register("parentId")}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">— Racine —</option>
            {parentOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700"
          >
            Annuler
          </button>
        ) : null}
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
