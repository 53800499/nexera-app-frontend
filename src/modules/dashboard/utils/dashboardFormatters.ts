export function getDefaultDashboardPeriod() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    from: from.toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10),
  };
}

export function formatDashboardMoney(value: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDashboardMoneyPrecise(value: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(value);
}

export function formatDashboardPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} %`;
}

export function formatDashboardDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR");
}

export function formatPeriodLabel(from: string, to: string) {
  return `${formatDashboardDate(from)} — ${formatDashboardDate(to)}`;
}
