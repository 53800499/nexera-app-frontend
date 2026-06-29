import type { AgedBalanceBucket } from "../types/dashboard.types";
import { formatDashboardMoneyPrecise } from "../utils/dashboardFormatters";

type Props = {
  buckets: AgedBalanceBucket[];
  totalOverdueAmountTtc: number;
};

export function AgedBalancePanel({ buckets, totalOverdueAmountTtc }: Props) {
  const maxAmount = Math.max(...buckets.map((bucket) => bucket.amountTtc), 1);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
        <p className="text-sm text-red-800 dark:text-red-300">Total en retard</p>
        <p className="text-2xl font-semibold text-red-700 dark:text-red-400">
          {formatDashboardMoneyPrecise(totalOverdueAmountTtc)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {buckets.map((bucket) => (
          <div
            key={bucket.label}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <p className="text-sm font-medium text-gray-500">{bucket.label}</p>
            <p className="mt-2 text-xl font-semibold text-gray-800 dark:text-white/90">
              {formatDashboardMoneyPrecise(bucket.amountTtc)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {bucket.invoiceCount} facture(s)
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{
                  width: `${Math.max((bucket.amountTtc / maxAmount) * 100, 4)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
