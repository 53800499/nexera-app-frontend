import { z } from "zod";
import { currencySchema } from "@/shared/constants/currencies";

export const catalogItemFormSchema = z.object({
  name: z.string().min(2, "Désignation requise").max(150),
  description: z.string().optional(),
  itemType: z.enum(["product", "service", "package"]),
  unit: z.string().min(1, "Unité requise"),
  priceHt: z.number().min(0, "Le prix HT doit être >= 0"),
  defaultTaxRateId: z.string().min(1, "TVA obligatoire"),
  categoryId: z.string().optional(),
  maxDiscountPct: z.number().min(0).max(100).optional(),
});

export type CatalogItemFormValues = z.infer<typeof catalogItemFormSchema>;

export const catalogCategoryFormSchema = z.object({
  name: z.string().min(2, "Nom requis").max(100),
  code: z.string().max(100).optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export type CatalogCategoryFormValues = z.infer<typeof catalogCategoryFormSchema>;

export const catalogPriceFormSchema = z
  .object({
    priceHt: z.number().min(0, "Prix HT >= 0"),
    currency: currencySchema,
    clientId: z.string().optional(),
    groupName: z.string().optional(),
    validFrom: z.string().optional(),
    validTo: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => v.clientId?.trim() || v.groupName?.trim(), {
    message: "Indiquez un client ou un groupe de clients",
    path: ["groupName"],
  });

export const catalogPriceEditFormSchema = z.object({
  priceHt: z.number().min(0, "Prix HT >= 0"),
  currency: currencySchema,
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  isActive: z.boolean(),
});

export type CatalogPriceFormValues = z.infer<typeof catalogPriceFormSchema>;
export type CatalogPriceEditFormValues = z.infer<typeof catalogPriceEditFormSchema>;
