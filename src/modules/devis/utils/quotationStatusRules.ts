import type { QuotationStatus } from "../types/quotation.types";
import { normalizeQuotationStatus } from "./quotationLabels";

/** Aligné sur EDITABLE_QUOTATION_STATUSES backend. */
export const EDITABLE_QUOTATION_STATUSES: QuotationStatus[] = [
  "draft",
  "sent",
  "viewed",
];

/** Statuts modifiables via PATCH /quotations/:id/status (ChangeQuotationStatusDto). */
export type ManualQuotationStatus = "viewed" | "accepted" | "declined";

const STATUS_TRANSITIONS: Partial<
  Record<QuotationStatus, ManualQuotationStatus[]>
> = {
  sent: ["viewed", "accepted", "declined"],
  viewed: ["accepted", "declined"],
};

export function canEditQuotation(status: string) {
  return EDITABLE_QUOTATION_STATUSES.includes(normalizeQuotationStatus(status));
}

export function canSendQuotation(status: string) {
  return normalizeQuotationStatus(status) === "draft";
}

export function canDeleteQuotation(status: string) {
  return normalizeQuotationStatus(status) === "draft";
}

export function canMarkQuotationViewed(status: string) {
  return normalizeQuotationStatus(status) === "sent";
}

export function canDecideQuotation(status: string) {
  const normalized = normalizeQuotationStatus(status);
  return normalized === "sent" || normalized === "viewed";
}

export function canConvertQuotation(status: string) {
  return normalizeQuotationStatus(status) === "accepted";
}

export function canChangeQuotationStatus(
  current: string,
  next: ManualQuotationStatus,
) {
  const normalized = normalizeQuotationStatus(current);
  return STATUS_TRANSITIONS[normalized]?.includes(next) ?? false;
}

export function isQuotationTerminal(status: string) {
  const normalized = normalizeQuotationStatus(status);
  return (
    normalized === "declined" ||
    normalized === "expired" ||
    normalized === "converted"
  );
}
