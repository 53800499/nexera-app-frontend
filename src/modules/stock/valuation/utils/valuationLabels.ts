export const VALUATION_METHOD_LABELS: Record<string, string> = {
  cmup: "CMUP",
  fifo: "FIFO",
  lifo: "LIFO",
};

export function formatMoney(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
