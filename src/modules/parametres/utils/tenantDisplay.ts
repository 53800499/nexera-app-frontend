import type { CompanyAddress, TenantSettings } from "../types/settings.types";

export const TENANT_TYPE_LABELS: Record<string, string> = {
  company: "Entreprise",
  cabinet: "Cabinet",
};

export const EXCHANGE_RATE_SOURCE_LABELS: Record<string, string> = {
  manual: "Manuel",
  api: "API",
};

export function formatTenantValue(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export function formatCompanyAddress(address?: CompanyAddress | null) {
  if (!address) return "—";
  const parts = [
    address.street,
    [address.postalCode, address.city].filter(Boolean).join(" "),
    address.country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

export type TenantDisplayField = {
  label: string;
  value: string;
};

export function buildTenantOrganizationFields(
  tenantMeta: {
    name: string;
    type: string;
  },
  settings?: TenantSettings | null,
  profileFallback?: {
    legalName?: string | null;
    tradeName?: string | null;
    primaryCurrency?: string;
    companyEmail?: string | null;
  },
): TenantDisplayField[] {
  const typeLabel = TENANT_TYPE_LABELS[tenantMeta.type] ?? tenantMeta.type;
  const merged = {
    legalName: settings?.legalName ?? profileFallback?.legalName,
    tradeName: settings?.tradeName ?? profileFallback?.tradeName,
    primaryCurrency:
      settings?.primaryCurrency ?? profileFallback?.primaryCurrency,
    companyEmail: settings?.companyEmail ?? profileFallback?.companyEmail,
  };

  return [
    { label: "Nom de l'organisation", value: tenantMeta.name },
    { label: "Type d'espace", value: typeLabel },
    { label: "Raison sociale", value: formatTenantValue(merged.legalName) },
    { label: "Nom commercial", value: formatTenantValue(merged.tradeName) },
    { label: "SIRET", value: formatTenantValue(settings?.siret) },
    { label: "N° TVA", value: formatTenantValue(settings?.vatNumber) },
    {
      label: "RCS / immatriculation",
      value: formatTenantValue(settings?.registrationNumber),
    },
    { label: "Capital social", value: formatTenantValue(settings?.shareCapital) },
    {
      label: "Adresse",
      value: formatCompanyAddress(settings?.companyAddress),
    },
    { label: "Téléphone", value: formatTenantValue(settings?.companyPhone) },
    { label: "Email", value: formatTenantValue(merged.companyEmail) },
    { label: "Site web", value: formatTenantValue(settings?.companyWebsite) },
    {
      label: "Devise principale",
      value: formatTenantValue(merged.primaryCurrency),
    },
    {
      label: "Source des taux de change",
      value: settings?.exchangeRateSource
        ? (EXCHANGE_RATE_SOURCE_LABELS[settings.exchangeRateSource] ??
          settings.exchangeRateSource)
        : "—",
    },
    {
      label: "Pénalités de retard (%)",
      value: formatTenantValue(settings?.latePaymentPenaltyRate),
    },
    {
      label: "Texte pénalités de retard",
      value: formatTenantValue(settings?.latePaymentPenaltyText),
    },
    {
      label: "Modes de paiement acceptés",
      value: formatTenantValue(settings?.acceptedPaymentMethods),
    },
    { label: "CGV", value: formatTenantValue(settings?.cgvText) },
  ];
}

export function buildTenantProfileBasicFields(
  tenantMeta: {
    name: string;
    type: string;
  },
  profileFallback?: {
    legalName?: string | null;
    tradeName?: string | null;
    primaryCurrency?: string;
    companyEmail?: string | null;
  },
): TenantDisplayField[] {
  const typeLabel = TENANT_TYPE_LABELS[tenantMeta.type] ?? tenantMeta.type;

  return [
    { label: "Nom de l'organisation", value: tenantMeta.name },
    { label: "Type d'espace", value: typeLabel },
    { label: "Raison sociale", value: formatTenantValue(profileFallback?.legalName) },
    { label: "Nom commercial", value: formatTenantValue(profileFallback?.tradeName) },
    {
      label: "Devise principale",
      value: formatTenantValue(profileFallback?.primaryCurrency),
    },
    { label: "Email", value: formatTenantValue(profileFallback?.companyEmail) },
  ];
}
