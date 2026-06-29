import { z } from "zod";

export const tenantSettingsSchema = z.object({
  primaryCurrency: z.string().trim().min(1, "Devise obligatoire"),
  exchangeRateSource: z.enum(["manual", "api"]),
  latePaymentPenaltyRate: z.string().optional(),
  latePaymentPenaltyText: z.string().optional(),
  legalName: z.string().optional(),
  tradeName: z.string().optional(),
  siret: z.string().optional(),
  vatNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  shareCapital: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  companyWebsite: z.string().optional(),
  acceptedPaymentMethods: z.string().optional(),
  cgvText: z.string().optional(),
});

export type TenantSettingsFormValues = z.infer<typeof tenantSettingsSchema>;

export const taxRateSchema = z.object({
  name: z.string().trim().min(1, "Nom obligatoire"),
  rate: z.number().min(0, "Taux invalide"),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type TaxRateFormValues = z.infer<typeof taxRateSchema>;

export const paymentTermSchema = z.object({
  name: z.string().trim().min(1, "Nom obligatoire"),
  days: z.number().min(0, "Délai invalide"),
  endOfMonth: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export type PaymentTermFormValues = z.infer<typeof paymentTermSchema>;

export const currencySchema = z.object({
  code: z.string().trim().min(3, "Code ISO requis").max(3),
  name: z.string().trim().min(1, "Nom obligatoire"),
  symbol: z.string().optional(),
  manualRate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CurrencyFormValues = z.infer<typeof currencySchema>;

export const numberingRuleSchema = z.object({
  prefix: z.string().trim().min(1, "Préfixe obligatoire"),
  suffix: z.string().optional(),
  separator: z.string().optional(),
  draftMarker: z.string().optional(),
  includeYear: z.boolean(),
  counterLength: z.number().min(1).max(12),
  annualReset: z.boolean(),
});

export type NumberingRuleFormValues = z.infer<typeof numberingRuleSchema>;

export const emailTemplateSchema = z.object({
  subject: z.string().trim().min(1, "Sujet obligatoire"),
  body: z.string().trim().min(1, "Corps obligatoire"),
  isActive: z.boolean(),
});

export type EmailTemplateFormValues = z.infer<typeof emailTemplateSchema>;

export const pdfTemplateSchema = z.object({
  logoUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  layoutType: z.enum(["classic", "modern", "minimal"]).optional(),
  showPageNumbers: z.boolean().optional(),
  fontFamily: z.string().optional(),
  headerText: z.string().optional(),
  footerText: z.string().optional(),
  legalMentions: z.string().optional(),
  termsAndConditions: z.string().optional(),
});

export type PdfTemplateFormValues = z.infer<typeof pdfTemplateSchema>;

export const reminderSettingsSchema = z.object({
  isEnabled: z.boolean(),
  level1DaysAfterDue: z.number().min(0),
  level2DaysAfterDue: z.number().min(0),
  level3DaysAfterDue: z.number().min(0),
  level2CopyCommercial: z.boolean(),
  level3AlertDirector: z.boolean(),
  level3BlockNewOrders: z.boolean(),
  commercialEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  directorEmail: z.string().email("Email invalide").optional().or(z.literal("")),
});

export type ReminderSettingsFormValues = z.infer<typeof reminderSettingsSchema>;
