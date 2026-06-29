import type { QuotationDetail } from "../types/quotation.types";
import type { QuotationFormValues } from "../schemas/quotationForm.schema";

function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function quotationToFormValues(
  quotation: QuotationDetail,
): Partial<QuotationFormValues> {
  return {
    clientId: quotation.clientId,
    issueDate: toDateInput(quotation.issueDate),
    validUntil: toDateInput(quotation.expiryDate),
    currency: quotation.currency,
    globalDiscountPct: quotation.discountPct ?? 0,
    paymentTermId: quotation.paymentTermId ?? "",
    notes: quotation.notes ?? "",
    legalMentions: quotation.internalNotes ?? "",
    lines: quotation.lines.map((line) => ({
      itemId: line.itemId ?? undefined,
      description: line.description,
      quantity: line.quantity,
      unitPriceHt: line.unitPriceHt,
      discountPct: line.discountPct,
      taxRateId: line.taxRateId,
    })),
  };
}
