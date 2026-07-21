import { z } from "zod";
import { currencySchema } from "@/shared/constants/currencies";

const addressSchema = z.object({
  street: z.string().min(1, "Rue requise"),
  city: z.string().min(1, "Ville requise"),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Pays requis"),
});

const contactSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  jobTitle: z.string().optional(),
  email: z.string().email("E-mail invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
});

const clientFormBaseSchema = z.object({
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

function withPostalCodeRule<
  T extends z.ZodObject<z.ZodRawShape, z.core.$strip>
>(schema: T) {
  return schema.superRefine((values, ctx) => {
    const form = values as {
      clientType?: "company" | "individual";
      billingAddress?: { postalCode?: string };
      useShippingAddress?: boolean;
      shippingAddress?: { postalCode?: string };
    };

    const postalCodeRequired = form.clientType === "company";
    if (!postalCodeRequired) return;

    const billingPostalCode = form.billingAddress?.postalCode?.trim() ?? "";
    if (!billingPostalCode) {
      ctx.addIssue({
        code: "custom",
        path: ["billingAddress", "postalCode"],
        message: "Code postal requis",
      });
    }

    if (form.useShippingAddress) {
      const shippingPostalCode = form.shippingAddress?.postalCode?.trim() ?? "";
      if (!shippingPostalCode) {
        ctx.addIssue({
          code: "custom",
          path: ["shippingAddress", "postalCode"],
          message: "Code postal requis",
        });
      }
    }
  });
}

export const clientFormSchema = withPostalCodeRule(clientFormBaseSchema);

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const clientEditSchema = withPostalCodeRule(
  clientFormBaseSchema.omit({
    primaryContact: true,
  }),
);

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
  const isCompany = values.clientType === "company";

  return {
    clientType: values.clientType,
    companyName: values.companyName,
    tradeName: isCompany ? values.tradeName || undefined : undefined,
    siret: isCompany ? values.siret || undefined : undefined,
    taxId: isCompany ? values.taxId || undefined : undefined,
    sector: isCompany ? values.sector || undefined : undefined,
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
