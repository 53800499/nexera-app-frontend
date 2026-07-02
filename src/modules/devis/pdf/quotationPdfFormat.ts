import { DEFAULT_CURRENCY } from "@/shared/constants/currencies";

export function formatPdfDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR");
}

export function formatPdfMoney(value: number, currency: string = DEFAULT_CURRENCY) {
  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(Number.isFinite(value) ? value : 0);
  // React PDF rend mal certains espaces insécables (ex: 1 234) sur quelques polices.
  // On force des espaces ASCII pour éviter les "/" à la place des séparateurs.
  return formatted.replace(/[\u00A0\u202F]/g, " ");
}

export function formatCompanyAddress(
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  } | null,
) {
  if (!address) return "";
  return [
    address.street,
    [address.postalCode, address.city].filter(Boolean).join(" "),
    address.country,
  ]
    .filter(Boolean)
    .join("\n");
}

export function sanitizePdfFileName(number: string) {
  return number.replace(/[^\w.-]+/g, "_");
}
