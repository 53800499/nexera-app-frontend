import { z } from "zod";
import { currencySchema } from "@/shared/constants/currencies";

const addressSchema = z.object({
  street: z.string().min(1, "Rue requise"),
  city: z.string().min(1, "Ville requise"),
  postalCode: z.string().min(1, "Code postal requis"),
  country: z.string().min(1, "Pays requis"),
});

const contactSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  jobTitle: z.string().optional(),
  email: z.string().email("E-mail invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
});

export const clientFormSchema = z.object({
  clientType: z.enum(["company", "individual"]),
  companyName: z.string().min(2, "Raison sociale requise"),
  tradeName: z.string().optional(),
  siret: z.string().optional(),
  taxId: z.string().optional(),
  sector: z.string().optional(),
  primaryContact: contactSchema,
  billingAddress: addressSchema,
  shippingAddress: addressSchema.optional(),
  useShippingAddress: z.boolean().optional(),
  defaultCurrency: currencySchema,
  defaultDiscountPct: z.number().min(0).max(100).optional(),
  creditLimit: z.number().min(0).optional(),
  notes: z.string().optional(),
  remindersDisabled: z.boolean().optional(),
  remindersDisabledReason: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const clientEditSchema = clientFormSchema.omit({
  primaryContact: true,
});

export type ClientEditFormValues = z.infer<typeof clientEditSchema>;

export const contactFormSchema = contactSchema.extend({
  isPrimary: z.boolean().optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export function addressToJson(address: z.infer<typeof addressSchema>): string {
  return JSON.stringify(address);
}

export function parseAddress(value: unknown): z.infer<typeof addressSchema> {
  if (!value || typeof value !== "object") {
    return { street: "", city: "", postalCode: "", country: "" };
  }
  const addr = value as Record<string, string>;
  return {
    street: addr.street ?? "",
    city: addr.city ?? "",
    postalCode: addr.postalCode ?? "",
    country: addr.country ?? "",
  };
}

export function buildUpdateClientPayload(values: ClientEditFormValues) {
  return {
    clientType: values.clientType,
    companyName: values.companyName,
    tradeName: values.tradeName || undefined,
    siret: values.siret || undefined,
    taxId: values.taxId || undefined,
    sector: values.sector || undefined,
    billingAddress: addressToJson(values.billingAddress),
    shippingAddress:
      values.useShippingAddress && values.shippingAddress
        ? addressToJson(values.shippingAddress)
        : "",
    defaultCurrency: values.defaultCurrency,
    defaultDiscountPct: values.defaultDiscountPct,
    creditLimit: values.creditLimit,
    notes: values.notes || undefined,
    remindersDisabled: values.remindersDisabled,
    remindersDisabledReason: values.remindersDisabledReason || undefined,
  };
}
