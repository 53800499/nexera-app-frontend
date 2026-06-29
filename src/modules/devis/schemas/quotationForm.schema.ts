import { z } from "zod";
import { currencySchema } from "@/shared/constants/currencies";

export const quotationLineSchema = z.object({
  itemId: z.string().optional(),
  description: z.string().trim().min(1, "Description obligatoire"),
  quantity: z.number().min(0.01, "Quantité obligatoire"),
  unitPriceHt: z.number().min(0, "Prix unitaire obligatoire"),
  discountPct: z.number().min(0).max(100),
  taxRateId: z.string().min(1, "TVA obligatoire"),
});

export const quotationFormSchema = z.object({
  clientId: z.string().min(1, "Client obligatoire"),
  issueDate: z
    .string()
    .min(1, "Date du devis obligatoire")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date du devis invalide"),
  validUntil: z.string().optional(),
  currency: currencySchema,
  globalDiscountPct: z.number().min(0).max(100),
  paymentTermId: z.string().optional(),
  notes: z.string().optional(),
  legalMentions: z.string().optional(),
  lines: z.array(quotationLineSchema).min(1, "Ajoutez au moins une ligne"),
});

export type QuotationFormValues = z.infer<typeof quotationFormSchema>;
export type QuotationLineFormValues = z.infer<typeof quotationLineSchema>;

export const defaultQuotationLine = (
  taxRateId = "",
): QuotationLineFormValues => ({
  itemId: undefined,
  description: "",
  quantity: 1,
  unitPriceHt: 0,
  discountPct: 0,
  taxRateId,
});

export const defaultQuotationFormValues = (
  taxRateId = "",
): QuotationFormValues => ({
  clientId: "",
  issueDate: new Date().toISOString().slice(0, 10),
  validUntil: "",
  currency: "EUR",
  globalDiscountPct: 0,
  paymentTermId: "",
  notes: "",
  legalMentions: "",
  lines: [defaultQuotationLine(taxRateId)],
});
