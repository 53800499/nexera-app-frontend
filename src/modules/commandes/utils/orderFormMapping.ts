import type { OrderDetail } from "../types/order.types";
import type { OrderFormValues } from "../schemas/orderForm.schema";

function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function orderToFormValues(order: OrderDetail): Partial<OrderFormValues> {
  return {
    clientId: order.clientId,
    quotationId: order.quotationId ?? "",
    issueDate: toDateInput(order.issueDate),
    currency: order.currency,
    globalDiscountPct: order.discountPct ?? 0,
    lines: order.lines.map((line) => ({
      itemId: line.itemId ?? undefined,
      description: line.description,
      quantity: line.quantity,
      unitPriceHt: line.unitPriceHt,
      discountPct: line.discountPct,
      taxRateId: line.taxRateId,
    })),
  };
}
