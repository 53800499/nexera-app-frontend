import { DEFAULT_CURRENCY } from "@/shared/constants/currencies";

export function formatPdfDate(value?: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export function formatPdfMoney(
  value?: number | null,
  currency: string = DEFAULT_CURRENCY
): string {
  const num = typeof value === "number" && Number.isFinite(value) ? value : 0;
  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency || "XOF",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num);
  // Remplace les espaces insécables Unicode pour compatibilité React-PDF Helvetica
  return formatted.replace(/[\u00A0\u202F]/g, " ");
}

export function formatPdfNumber(value?: number | null): string {
  const num = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  })
    .format(num)
    .replace(/[\u00A0\u202F]/g, " ");
}

export function sanitizePdfFileName(name: string): string {
  return name.replace(/[^\w.-]+/g, "_");
}
