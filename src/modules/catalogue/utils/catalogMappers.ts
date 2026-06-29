import type { CatalogItem } from "../types/catalogue.types";
import type { CatalogItemFormValues } from "../schemas/catalogItemForm.schema";
import type {
  CreateCatalogItemPayload,
  UpdateCatalogItemPayload,
} from "../types/catalogue.types";

export function itemToFormValues(item: CatalogItem): CatalogItemFormValues {
  return {
    name: item.name,
    description: item.description ?? "",
    itemType: item.itemType,
    unit: item.unit,
    priceHt: item.priceHt,
    defaultTaxRateId: item.defaultTaxRateId,
    categoryId: item.categoryId ?? undefined,
    maxDiscountPct: item.maxDiscountPct ?? undefined,
  };
}

export function buildCreateItemPayload(
  values: CatalogItemFormValues,
): CreateCatalogItemPayload {
  return {
    name: values.name.trim(),
    description: values.description?.trim() || undefined,
    itemType: values.itemType,
    unit: values.unit.trim() || "unit",
    priceHt: values.priceHt,
    defaultTaxRateId: values.defaultTaxRateId,
    categoryId: values.categoryId || undefined,
    maxDiscountPct: values.maxDiscountPct,
  };
}

export function buildUpdateItemPayload(
  values: CatalogItemFormValues,
): UpdateCatalogItemPayload {
  const { name, description, itemType, unit, priceHt, defaultTaxRateId, categoryId, maxDiscountPct } =
    buildCreateItemPayload(values);
  return {
    name,
    description,
    itemType,
    unit,
    priceHt,
    defaultTaxRateId,
    categoryId,
    maxDiscountPct,
  };
}
