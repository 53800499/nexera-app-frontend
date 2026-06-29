import type { InvoiceDetail } from "../types/invoice.types";
import type { InvoiceFormValues } from "../schemas/invoiceForm.schema";

function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function invoiceToFormValues(
  invoice: InvoiceDetail,
): Partial<InvoiceFormValues> {
  return {
    clientId: invoice.clientId,
    orderId: invoice.orderId ?? "",
    quotationId: invoice.quotationId ?? "",
    invoiceType: invoice.invoiceType,
    issueDate: toDateInput(invoice.issueDate),
    dueDate: toDateInput(invoice.dueDate),
    currency: invoice.currency,
    exchangeRate: invoice.exchangeRate ?? 1,
    paymentTermId: invoice.paymentTermId ?? "",
    globalDiscountPct: invoice.discountPct ?? 0,
    notes: invoice.notes ?? "",
    internalNotes: invoice.internalNotes ?? "",
    lines: invoice.lines.map((line) => ({
      itemId: line.itemId ?? undefined,
      description: line.description,
      quantity: line.quantity,
      unitPriceHt: line.unitPriceHt,
      discountPct: line.discountPct,
      taxRateId: line.taxRateId,
    })),
  };
}
