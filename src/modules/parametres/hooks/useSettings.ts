"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { readReferenceDataWithCache } from "@/shared/offline/referenceDataOffline.service";
import { settingsApi } from "../services/settingsApi.service";
import type {
  CreateCurrencyPayload,
  CreatePaymentTermPayload,
  CreateTaxRatePayload,
  DocumentType,
  EmailTemplateType,
  UpdateCurrencyPayload,
  UpdateEmailTemplatePayload,
  UpdateNumberingRulePayload,
  UpdatePaymentTermPayload,
  UpdatePdfTemplatePayload,
  UpdateReminderSettingsPayload,
  UpdateTaxRatePayload,
  UpdateTenantSettingsPayload,
} from "../types/settings.types";

export const SETTINGS_OVERVIEW_KEY = ["settings", "overview"] as const;
export const TENANT_SETTINGS_KEY = ["settings", "tenant"] as const;
export const TAX_RATES_KEY = ["settings", "tax-rates"] as const;
export const PAYMENT_TERMS_KEY = ["settings", "payment-terms"] as const;
export const CURRENCIES_KEY = ["settings", "currencies"] as const;
export const NUMBERING_KEY = ["settings", "numbering"] as const;
export const EMAIL_TEMPLATES_KEY = ["settings", "email-templates"] as const;
export const PDF_TEMPLATE_KEY = ["settings", "pdf-template"] as const;
export const REMINDER_SETTINGS_KEY = ["settings", "reminders"] as const;

export function useSettingsOverview() {
  const queryEnabled = useQueryEnabled();

  return useQuery({
    queryKey: SETTINGS_OVERVIEW_KEY,
    queryFn: settingsApi.getOverview,
    enabled: queryEnabled,
  });
}

export function useTenantSettings(enabled = true) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled(enabled);

  const tenantQuery = useQuery({
    queryKey: TENANT_SETTINGS_KEY,
    queryFn: settingsApi.getTenant,
    enabled: queryEnabled,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateTenantSettingsPayload) =>
      settingsApi.updateTenant(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANT_SETTINGS_KEY });
      queryClient.invalidateQueries({ queryKey: SETTINGS_OVERVIEW_KEY });
    },
  });

  return { tenantQuery, updateMutation };
}

export function useTaxRates() {
  const queryEnabled = useQueryEnabled();

  return useQuery({
    queryKey: TAX_RATES_KEY,
    queryFn: () =>
      readReferenceDataWithCache({
        key: "tax-rates",
        onlineReader: () => settingsApi.listTaxRates(),
        hasUsableCache: (rates) => rates.length > 0,
      }),
    enabled: queryEnabled,
    placeholderData: (previous) => previous,
  });
}

export function useTaxRatesManagement() {
  const queryClient = useQueryClient();
  const taxRatesQuery = useTaxRates();

  const createMutation = useMutation({
    mutationFn: (payload: CreateTaxRatePayload) =>
      settingsApi.createTaxRate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_RATES_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaxRatePayload }) =>
      settingsApi.updateTaxRate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_RATES_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => settingsApi.deleteTaxRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_RATES_KEY });
    },
  });

  return {
    taxRatesQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}

export function usePaymentTerms() {
  const queryEnabled = useQueryEnabled();

  return useQuery({
    queryKey: PAYMENT_TERMS_KEY,
    queryFn: settingsApi.listPaymentTerms,
    enabled: queryEnabled,
  });
}

export function usePaymentTermsManagement() {
  const queryClient = useQueryClient();
  const paymentTermsQuery = usePaymentTerms();

  const createMutation = useMutation({
    mutationFn: (payload: CreatePaymentTermPayload) =>
      settingsApi.createPaymentTerm(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_TERMS_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePaymentTermPayload;
    }) => settingsApi.updatePaymentTerm(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_TERMS_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => settingsApi.deletePaymentTerm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_TERMS_KEY });
    },
  });

  return {
    paymentTermsQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}

export function useCurrencies() {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();

  const currenciesQuery = useQuery({
    queryKey: CURRENCIES_KEY,
    queryFn: settingsApi.listCurrencies,
    enabled: queryEnabled,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCurrencyPayload) =>
      settingsApi.createCurrency(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRENCIES_KEY });
      queryClient.invalidateQueries({ queryKey: TENANT_SETTINGS_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCurrencyPayload }) =>
      settingsApi.updateCurrency(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRENCIES_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => settingsApi.deleteCurrency(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRENCIES_KEY });
    },
  });

  return {
    currenciesQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}

export function useNumberingRules() {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();

  const numberingQuery = useQuery({
    queryKey: NUMBERING_KEY,
    queryFn: settingsApi.listNumbering,
    enabled: queryEnabled,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      documentType,
      payload,
    }: {
      documentType: DocumentType;
      payload: UpdateNumberingRulePayload;
    }) => settingsApi.updateNumbering(documentType, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NUMBERING_KEY });
    },
  });

  return { numberingQuery, updateMutation };
}

export function useEmailTemplates() {
  const queryEnabled = useQueryEnabled();

  return useQuery({
    queryKey: EMAIL_TEMPLATES_KEY,
    queryFn: settingsApi.listEmailTemplates,
    enabled: queryEnabled,
    retry: 1,
  });
}

export function useEmailTemplate(type: EmailTemplateType) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled(Boolean(type));

  const templateQuery = useQuery({
    queryKey: [...EMAIL_TEMPLATES_KEY, type],
    queryFn: () => settingsApi.getEmailTemplate(type),
    enabled: queryEnabled,
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateEmailTemplatePayload) =>
      settingsApi.updateEmailTemplate(type, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMAIL_TEMPLATES_KEY });
      queryClient.invalidateQueries({ queryKey: [...EMAIL_TEMPLATES_KEY, type] });
    },
  });

  return { templateQuery, updateMutation };
}

export function usePdfTemplate() {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();

  const pdfQuery = useQuery({
    queryKey: PDF_TEMPLATE_KEY,
    queryFn: settingsApi.getPdfTemplate,
    enabled: queryEnabled,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdatePdfTemplatePayload) =>
      settingsApi.updatePdfTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PDF_TEMPLATE_KEY });
    },
  });

  return { pdfQuery, updateMutation };
}

export function useSettingsReminders() {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();

  const settingsQuery = useQuery({
    queryKey: REMINDER_SETTINGS_KEY,
    queryFn: settingsApi.getReminderSettings,
    enabled: queryEnabled,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateReminderSettingsPayload) =>
      settingsApi.updateReminderSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDER_SETTINGS_KEY });
    },
  });

  return { settingsQuery, updateMutation };
}
