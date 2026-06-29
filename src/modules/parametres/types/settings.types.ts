export type ExchangeRateSource = "manual" | "api";

export type CompanyAddress = {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

export type TenantSettings = {
  primaryCurrency: string;
  exchangeRateSource: ExchangeRateSource;
  latePaymentPenaltyRate?: number | null;
  latePaymentPenaltyText?: string | null;
  legalName?: string | null;
  tradeName?: string | null;
  siret?: string | null;
  vatNumber?: string | null;
  registrationNumber?: string | null;
  shareCapital?: string | null;
  companyAddress?: CompanyAddress | null;
  companyPhone?: string | null;
  companyEmail?: string | null;
  companyWebsite?: string | null;
  acceptedPaymentMethods?: string | null;
  cgvText?: string | null;
};

export type UpdateTenantSettingsPayload = Partial<TenantSettings>;

export type TaxRate = {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
  isActive: boolean;
};

export type CreateTaxRatePayload = {
  name: string;
  rate: number;
  isDefault?: boolean;
};

export type UpdateTaxRatePayload = Partial<CreateTaxRatePayload> & {
  isActive?: boolean;
};

export type PaymentTerm = {
  id: string;
  name: string;
  days: number;
  endOfMonth: boolean;
  isDefault: boolean;
};

export type CreatePaymentTermPayload = {
  name: string;
  days: number;
  endOfMonth?: boolean;
  isDefault?: boolean;
};

export type UpdatePaymentTermPayload = Partial<CreatePaymentTermPayload>;

export type TenantCurrency = {
  id: string;
  code: string;
  name: string;
  symbol?: string | null;
  manualRate?: number | null;
  isActive: boolean;
  isPrimary?: boolean;
};

export type CreateCurrencyPayload = {
  code: string;
  name: string;
  symbol?: string;
  manualRate?: number;
};

export type UpdateCurrencyPayload = {
  name?: string;
  symbol?: string;
  manualRate?: number;
  isActive?: boolean;
};

export type DocumentType =
  | "quotation"
  | "order_draft"
  | "order_issued"
  | "invoice_draft"
  | "invoice_issued"
  | "client"
  | "catalog_item";

export type NumberingRule = {
  documentType: DocumentType;
  prefix: string;
  suffix?: string | null;
  separator: string;
  draftMarker?: string | null;
  includeYear: boolean;
  counterLength: number;
  annualReset: boolean;
  nextCounter?: number;
  preview?: string | null;
};

export type UpdateNumberingRulePayload = {
  prefix?: string;
  suffix?: string;
  separator?: string;
  draftMarker?: string;
  includeYear?: boolean;
  counterLength?: number;
  annualReset?: boolean;
};

export type EmailTemplateType =
  | "quotation_send"
  | "invoice_send"
  | "reminder_level_1"
  | "reminder_level_2"
  | "reminder_level_3"
  | "recurring_invoice";

export type EmailTemplate = {
  type: EmailTemplateType;
  subject: string;
  body: string;
  isActive: boolean;
};

export type UpdateEmailTemplatePayload = {
  subject?: string;
  body?: string;
  isActive?: boolean;
};

export type PdfLayoutType = "classic" | "modern" | "minimal";

export type PdfTemplate = {
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  layoutType?: PdfLayoutType | null;
  showPageNumbers?: boolean;
  fontFamily?: string | null;
  headerText?: string | null;
  footerText?: string | null;
  legalMentions?: string | null;
  termsAndConditions?: string | null;
};

export type UpdatePdfTemplatePayload = Partial<PdfTemplate>;

export type ReminderSettings = {
  isEnabled: boolean;
  level1DaysAfterDue: number;
  level2DaysAfterDue: number;
  level3DaysAfterDue: number;
  level2CopyCommercial: boolean;
  level3AlertDirector: boolean;
  level3BlockNewOrders: boolean;
  commercialEmail?: string | null;
  directorEmail?: string | null;
};

export type UpdateReminderSettingsPayload = Partial<ReminderSettings>;

export type SettingsOverview = {
  tenantConfigured?: boolean;
  taxRatesCount?: number;
  paymentTermsCount?: number;
  currenciesCount?: number;
};
