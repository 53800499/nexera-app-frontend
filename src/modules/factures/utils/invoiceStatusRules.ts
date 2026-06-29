import type { InvoiceStatus } from "../types/invoice.types";
import { normalizeInvoiceStatus } from "./invoiceLabels";

export const EDITABLE_INVOICE_STATUSES: InvoiceStatus[] = ["draft"];

export function canEditInvoice(status: string) {
  return EDITABLE_INVOICE_STATUSES.includes(normalizeInvoiceStatus(status));
}

export function canDeleteInvoice(status: string) {
  return normalizeInvoiceStatus(status) === "draft";
}

export function canIssueInvoice(status: string) {
  return normalizeInvoiceStatus(status) === "draft";
}

export function canSendInvoice(status: string) {
  const normalized = normalizeInvoiceStatus(status);
  return normalized === "draft" || normalized === "issued";
}

export function canCreateCreditNote(status: string) {
  const normalized = normalizeInvoiceStatus(status);
  return (
    normalized === "issued" ||
    normalized === "sent" ||
    normalized === "partial" ||
    normalized === "paid" ||
    normalized === "overdue"
  );
}

export function canRecordInvoicePayment(status: string, amountDue: number) {
  const normalized = normalizeInvoiceStatus(status);
  if (amountDue <= 0) return false;
  return (
    normalized === "issued" ||
    normalized === "sent" ||
    normalized === "partial" ||
    normalized === "overdue"
  );
}

export function canDownloadInvoicePdf(status: string) {
  const normalized = normalizeInvoiceStatus(status);
  return normalized !== "draft";
}

export function isInvoiceTerminal(status: string) {
  const normalized = normalizeInvoiceStatus(status);
  return normalized === "cancelled" || normalized === "paid";
}
