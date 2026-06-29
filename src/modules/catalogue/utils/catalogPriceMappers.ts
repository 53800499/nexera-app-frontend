import type { CatalogItemPrice } from "../types/catalogue.types";
import type {
  CatalogPriceEditFormValues,
  CatalogPriceFormValues,
} from "../schemas/catalogItemForm.schema";
import { DEFAULT_CURRENCY, isCurrencyCode } from "@/shared/constants/currencies";
import type {
  CreateCatalogPricePayload,
  UpdateCatalogPricePayload,
} from "../types/catalogue.types";

export function toDateInputValue(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function priceToEditFormValues(
  price: CatalogItemPrice,
): CatalogPriceEditFormValues {
  return {
    priceHt: price.priceHt,
    currency: isCurrencyCode(price.currency) ? price.currency : DEFAULT_CURRENCY,
    validFrom: toDateInputValue(price.validFrom),
    validTo: toDateInputValue(price.validTo),
    isActive: price.isActive,
  };
}

export function buildCreatePricePayload(
  values: CatalogPriceFormValues,
  clientId?: string,
): CreateCatalogPricePayload {
  return {
    clientId: clientId || values.clientId || undefined,
    groupName: values.groupName?.trim() || undefined,
    priceHt: values.priceHt,
    currency: values.currency || DEFAULT_CURRENCY,
    validFrom: values.validFrom || undefined,
    validTo: values.validTo || undefined,
    isActive: values.isActive ?? true,
  };
}

export function buildUpdatePricePayload(
  values: CatalogPriceEditFormValues,
): UpdateCatalogPricePayload {
  return {
    priceHt: values.priceHt,
    currency: values.currency,
    validFrom: values.validFrom || null,
    validTo: values.validTo || null,
    isActive: values.isActive,
  };
}

export function priceTargetLabel(price: CatalogItemPrice) {
  if (price.client) {
    return `${price.client.companyName} (${price.client.code})`;
  }
  if (price.clientId) {
    return `Client ${price.clientId.slice(0, 8)}…`;
  }
  return price.groupName ?? "—";
}
