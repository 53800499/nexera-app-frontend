import type { QuotationStatus } from "../types/quotation.types";

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  viewed: "Vu",
  accepted: "Accepté",
  declined: "Refusé",
  expired: "Expiré",
  converted: "Converti",
};

export const QUOTATION_STATUS_CLASSES: Record<QuotationStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  viewed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  accepted: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  declined: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  expired: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  converted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
};

export function quotationStatusLabel(status: string) {
  const key = status.toLowerCase() as QuotationStatus;
  return QUOTATION_STATUS_LABELS[key] ?? status;
}

export function normalizeQuotationStatus(status: string): QuotationStatus {
  return status.toLowerCase() as QuotationStatus;
}
