import { z } from "zod";
import { currencySchema } from "@/shared/constants/currencies";

export const orderLineSchema = z.object({
  itemId: z.string().optional(),
  description: z.string().trim().min(1, "Description obligatoire"),
  quantity: z.number().min(0.01, "Quantité obligatoire"),
  unitPriceHt: z.number().min(0, "Prix unitaire obligatoire"),
  discountPct: z.number().min(0).max(100),
  taxRateId: z.string().min(1, "TVA obligatoire"),
});

export const orderFormSchema = z.object({
  clientId: z.string().min(1, "Client obligatoire"),
  quotationId: z.string().optional(),
  issueDate: z
    .string()
    .min(1, "Date obligatoire")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  currency: currencySchema,
  globalDiscountPct: z.number().min(0).max(100),
  lines: z.array(orderLineSchema).min(1, "Ajoutez au moins une ligne"),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export const defaultOrderLine = (taxRateId = "") => ({
  itemId: undefined,
  description: "",
  quantity: 1,
  unitPriceHt: 0,
  discountPct: 0,
  taxRateId,
});
