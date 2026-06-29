import type { PaymentMethod } from "../types/payment.types";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  wire: "Virement",
  check: "Chèque",
  cash: "Espèces",
  card: "Carte bancaire",
  other: "Autre",
};

export function paymentMethodLabel(method: string) {
  const key = method.toLowerCase() as PaymentMethod;
  return PAYMENT_METHOD_LABELS[key] ?? method;
}

export function formatPaymentMoney(value: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(value);
}
