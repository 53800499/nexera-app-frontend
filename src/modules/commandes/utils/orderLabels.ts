import type { OrderStatus } from "../types/order.types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Brouillon",
  confirmed: "Confirmé",
  partially_paid: "En cours",
  paid: "Facturé",
  cancelled: "Annulé",
};

export const ORDER_STATUS_CLASSES: Record<OrderStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  partially_paid:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

export function orderStatusLabel(status: string) {
  const key = status.toLowerCase() as OrderStatus;
  return ORDER_STATUS_LABELS[key] ?? status;
}

export function normalizeOrderStatus(status: string): OrderStatus {
  return status.toLowerCase() as OrderStatus;
}
