import { authorizedFetch } from "@/shared/http/authorizedFetch";
import type {
  CreateCurrencyPayload,
  CreatePaymentTermPayload,
  CreateTaxRatePayload,
  EmailTemplate,
  EmailTemplateType,
  NumberingRule,
  PaymentTerm,
  PdfTemplate,
  ReminderSettings,
  SettingsOverview,
  TaxRate,
  TenantCurrency,
  TenantSettings,
  UpdateCurrencyPayload,
  UpdateEmailTemplatePayload,
  UpdateNumberingRulePayload,
  UpdatePaymentTermPayload,
  UpdatePdfTemplatePayload,
  UpdateReminderSettingsPayload,
  UpdateTaxRatePayload,
  UpdateTenantSettingsPayload,
  DocumentType,
} from "../types/settings.types";

export const settingsApi = {
  getOverview: () => authorizedFetch<SettingsOverview>("/settings"),

  getTenant: () => authorizedFetch<TenantSettings>("/settings/tenant"),

  updateTenant: (payload: UpdateTenantSettingsPayload) =>
    authorizedFetch<TenantSettings>("/settings/tenant", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  listTaxRates: () => authorizedFetch<TaxRate[]>("/settings/tax-rates"),

  createTaxRate: (payload: CreateTaxRatePayload) =>
    authorizedFetch<TaxRate>("/settings/tax-rates", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTaxRate: (id: string, payload: UpdateTaxRatePayload) =>
    authorizedFetch<TaxRate>(`/settings/tax-rates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteTaxRate: (id: string) =>
    authorizedFetch<{ message: string }>(`/settings/tax-rates/${id}`, {
      method: "DELETE",
    }),

  listPaymentTerms: () =>
    authorizedFetch<PaymentTerm[]>("/settings/payment-terms"),

  createPaymentTerm: (payload: CreatePaymentTermPayload) =>
    authorizedFetch<PaymentTerm>("/settings/payment-terms", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updatePaymentTerm: (id: string, payload: UpdatePaymentTermPayload) =>
    authorizedFetch<PaymentTerm>(`/settings/payment-terms/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deletePaymentTerm: (id: string) =>
    authorizedFetch<{ message: string }>(`/settings/payment-terms/${id}`, {
      method: "DELETE",
    }),

  listCurrencies: () =>
    authorizedFetch<TenantCurrency[]>("/settings/currencies"),

  createCurrency: (payload: CreateCurrencyPayload) =>
    authorizedFetch<TenantCurrency>("/settings/currencies", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateCurrency: (id: string, payload: UpdateCurrencyPayload) =>
    authorizedFetch<TenantCurrency>(`/settings/currencies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteCurrency: (id: string) =>
    authorizedFetch<{ message: string }>(`/settings/currencies/${id}`, {
      method: "DELETE",
    }),

  listNumbering: () =>
    authorizedFetch<NumberingRule[]>("/settings/numbering"),

  updateNumbering: (
    documentType: DocumentType,
    payload: UpdateNumberingRulePayload,
  ) =>
    authorizedFetch<NumberingRule>(`/settings/numbering/${documentType}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  listEmailTemplates: () =>
    authorizedFetch<EmailTemplate[]>("/settings/email-templates"),

  getEmailTemplate: (type: EmailTemplateType) =>
    authorizedFetch<EmailTemplate>(`/settings/email-templates/${type}`),

  updateEmailTemplate: (
    type: EmailTemplateType,
    payload: UpdateEmailTemplatePayload,
  ) =>
    authorizedFetch<EmailTemplate>(`/settings/email-templates/${type}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  getPdfTemplate: () =>
    authorizedFetch<PdfTemplate>("/settings/pdf-template"),

  updatePdfTemplate: (payload: UpdatePdfTemplatePayload) =>
    authorizedFetch<PdfTemplate>("/settings/pdf-template", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  getReminderSettings: () =>
    authorizedFetch<ReminderSettings>("/settings/reminders"),

  updateReminderSettings: (payload: UpdateReminderSettingsPayload) =>
    authorizedFetch<ReminderSettings>("/settings/reminders", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
