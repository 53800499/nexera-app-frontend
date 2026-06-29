import type { CatalogCategory } from "../types/catalogue.types";
import type { CatalogCategoryFormValues } from "../schemas/catalogItemForm.schema";
import type {
  CreateCatalogCategoryPayload,
  UpdateCatalogCategoryPayload,
} from "../types/catalogue.types";

export function categoryToFormValues(
  category: CatalogCategory,
): CatalogCategoryFormValues {
  return {
    name: category.name,
    code: category.code ?? "",
    description: category.description ?? "",
    parentId: category.parentId ?? "",
  };
}

export function buildCreateCategoryPayload(
  values: CatalogCategoryFormValues,
): CreateCatalogCategoryPayload {
  return {
    name: values.name.trim(),
    code: values.code?.trim() || undefined,
    description: values.description?.trim() || undefined,
    parentId: values.parentId || undefined,
  };
}

export function buildUpdateCategoryPayload(
  values: CatalogCategoryFormValues,
): UpdateCatalogCategoryPayload {
  return buildCreateCategoryPayload(values);
}
