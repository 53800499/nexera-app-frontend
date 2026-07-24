import { z } from "zod";

export const stockItemFormSchema = z
  .object({
    storageUnit: z.string().min(1, "Unité de stockage requise"),
    conversionFactor: z.number().positive("Doit être > 0"),
    trackLots: z.boolean(),
    trackSerials: z.boolean(),
    trackExpiry: z.boolean(),
    expiryAlertDays: z.number().int().min(0).optional(),
    valuationMethod: z.enum(["cmup", "fifo", "lifo"]),
    minStockQty: z.number().min(0).optional(),
    safetyStockQty: z.number().min(0).optional(),
    maxStockQty: z.number().min(0).optional(),
    reorderQty: z.number().min(0).optional(),
    defaultWarehouseId: z.string().optional(),
    defaultLocationId: z.string().optional(),
    allowNegativeStock: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const { safetyStockQty: safety, minStockQty: min, maxStockQty: max } =
      values;

    if (
      safety != null &&
      !Number.isNaN(safety) &&
      min != null &&
      !Number.isNaN(min) &&
      safety > min
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Stock de sécurité ≤ stock minimum (RM-S04)",
        path: ["safetyStockQty"],
      });
    }
    if (
      min != null &&
      !Number.isNaN(min) &&
      max != null &&
      !Number.isNaN(max) &&
      min > max
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Stock minimum ≤ stock maximum (RM-S04)",
        path: ["minStockQty"],
      });
    }
  });

export type StockItemFormValues = z.infer<typeof stockItemFormSchema>;
