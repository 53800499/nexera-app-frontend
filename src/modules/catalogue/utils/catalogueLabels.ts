import type { CatalogItemType } from "../types/catalogue.types";

export const ITEM_TYPE_LABELS: Record<CatalogItemType, string> = {
  product: "Produit",
  service: "Service",
  package: "Forfait",
};

import { DEFAULT_CURRENCY } from "@/shared/constants/currencies";

export function formatPriceHt(value: number, currency: string = DEFAULT_CURRENCY) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatTaxRate(rate: number) {
  return `${rate}%`;
}
