import type { StockItem, UpdateStockItemPayload } from "../../types/stock.types";
import type { StockItemFormValues } from "../schemas/stockItemForm.schema";

function optionalQty(value: number | undefined): number | null {
  if (value === undefined || Number.isNaN(value)) return null;
  return value;
}

export function stockItemToFormValues(
  item: StockItem,
  fallbackUnit: string,
): StockItemFormValues {
  return {
    storageUnit: item.storageUnit || fallbackUnit,
    conversionFactor: item.conversionFactor ?? 1,
    trackLots: item.trackLots,
    trackSerials: item.trackSerials,
    trackExpiry: item.trackExpiry,
    expiryAlertDays: item.expiryAlertDays ?? 30,
    valuationMethod: item.valuationMethod,
    minStockQty: item.minStockQty ?? undefined,
    safetyStockQty: item.safetyStockQty ?? undefined,
    maxStockQty: item.maxStockQty ?? undefined,
    reorderQty: item.reorderQty ?? undefined,
    defaultWarehouseId: item.defaultWarehouseId ?? "",
    defaultLocationId: item.defaultLocationId ?? "",
    allowNegativeStock: item.allowNegativeStock,
  };
}

export function buildStockItemPayload(
  values: StockItemFormValues,
): UpdateStockItemPayload {
  return {
    storageUnit: values.storageUnit.trim(),
    conversionFactor: values.conversionFactor,
    trackLots: values.trackLots,
    trackSerials: values.trackSerials,
    trackExpiry: values.trackExpiry,
    expiryAlertDays: optionalQty(values.expiryAlertDays) ?? 30,
    valuationMethod: values.valuationMethod,
    minStockQty: optionalQty(values.minStockQty),
    safetyStockQty: optionalQty(values.safetyStockQty),
    maxStockQty: optionalQty(values.maxStockQty),
    reorderQty: optionalQty(values.reorderQty),
    defaultWarehouseId: values.defaultWarehouseId || null,
    defaultLocationId: values.defaultLocationId || null,
    allowNegativeStock: values.allowNegativeStock,
  };
}

export const VALUATION_METHOD_LABELS: Record<string, string> = {
  cmup: "CMUP (coût moyen pondéré)",
  fifo: "FIFO (premier entré, premier sorti)",
  lifo: "LIFO (dernier entré, premier sorti)",
};
