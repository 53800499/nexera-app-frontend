import { z } from "zod";
import { currencySchema } from "@/shared/constants/currencies";
import type { InvoiceType } from "../types/invoice.types";

export const invoiceLineSchema = z.object({
  itemId: z.string().optional(),
  description: z.string().trim().min(1, "Description obligatoire"),
  quantity: z.number().min(0.01, "Quantité obligatoire"),
  unitPriceHt: z.number().min(0, "Prix unitaire obligatoire"),
  discountPct: z.number().min(0).max(100),
  taxRateId: z.string().min(1, "TVA obligatoire"),
});

const invoiceTypeSchema = z.enum([
  "standard",
  "proforma",
  "deposit",
  "balance",
  "credit_note",
]);

export const invoiceFormSchema = z.object({
  clientId: z.string().min(1, "Client obligatoire"),
  orderId: z.string().optional(),
  quotationId: z.string().optional(),
  invoiceType: invoiceTypeSchema,
  issueDate: z
    .string()
    .min(1, "Date obligatoire")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide")
    .optional()
    .or(z.literal("")),
  currency: currencySchema,
  exchangeRate: z.number().min(0.0001, "Taux de change invalide"),
  paymentTermId: z.string().optional(),
  globalDiscountPct: z.number().min(0).max(100),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  lines: z.array(invoiceLineSchema).min(1, "Ajoutez au moins une ligne"),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export const defaultInvoiceLine = (taxRateId = "") => ({
  itemId: undefined,
  description: "",
  quantity: 1,
  unitPriceHt: 0,
  discountPct: 0,
  taxRateId,
});

export const INVOICE_TYPE_OPTIONS: { value: InvoiceType; label: string }[] = [
  { value: "standard", label: "Facture standard" },
  { value: "proforma", label: "Proforma" },
  { value: "deposit", label: "Acompte" },
  { value: "balance", label: "Solde" },
];
