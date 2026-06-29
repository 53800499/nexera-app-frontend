import type { OrderStatus } from "../types/order.types";
import { normalizeOrderStatus } from "./orderLabels";

export const EDITABLE_ORDER_STATUSES: OrderStatus[] = ["draft"];

export function canEditOrder(status: string) {
  return EDITABLE_ORDER_STATUSES.includes(normalizeOrderStatus(status));
}

export function canDeleteOrder(status: string) {
  return normalizeOrderStatus(status) === "draft";
}

export function canConfirmOrder(status: string) {
  return normalizeOrderStatus(status) === "draft";
}

export function canCancelOrder(status: string) {
  const normalized = normalizeOrderStatus(status);
  return (
    normalized === "draft" ||
    normalized === "confirmed" ||
    normalized === "partially_paid"
  );
}

export function canCreateOrderInvoice(status: string) {
  const normalized = normalizeOrderStatus(status);
  return (
    normalized === "confirmed" ||
    normalized === "partially_paid" ||
    normalized === "paid"
  );
}

export function isOrderTerminal(status: string) {
  const normalized = normalizeOrderStatus(status);
  return normalized === "cancelled" || normalized === "paid";
}
