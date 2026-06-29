import type { InvoiceStatus, InvoiceType } from "../types/invoice.types";

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Brouillon",
  issued: "Émise",
  sent: "Envoyée",
  partial: "Partiellement payée",
  paid: "Payée",
  overdue: "En retard",
  cancelled: "Annulée",
};

export const INVOICE_STATUS_CLASSES: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  issued: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  sent: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  partial:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  cancelled: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

export const INVOICE_TYPE_LABELS: Record<InvoiceType, string> = {
  standard: "Standard",
  proforma: "Proforma",
  deposit: "Acompte",
  balance: "Solde",
  credit_note: "Avoir",
};

export function invoiceStatusLabel(status: string) {
  const key = status.toLowerCase() as InvoiceStatus;
  return INVOICE_STATUS_LABELS[key] ?? status;
}

export function invoiceTypeLabel(type: string) {
  const key = type.toLowerCase() as InvoiceType;
  return INVOICE_TYPE_LABELS[key] ?? type;
}

export function normalizeInvoiceStatus(status: string): InvoiceStatus {
  return status.toLowerCase() as InvoiceStatus;
}

export function normalizeInvoiceType(type: string): InvoiceType {
  return type.toLowerCase() as InvoiceType;
}
