import type { QuotationTotals } from "../utils/quotationCalculations";
import { formatMoney } from "../utils/quotationCalculations";

type Props = {
  totals: QuotationTotals;
  currency?: string;
};

export function QuotationTotalsPanel({ totals, currency = "EUR" }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
      <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">
        Totaux
      </h3>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Sous-total HT</dt>
          <dd className="font-medium">
            {formatMoney(totals.subtotalHt, currency)}
          </dd>
        </div>
        {totals.globalDiscountPct > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">
              Remise globale ({totals.globalDiscountPct}%)
            </dt>
            <dd className="font-medium">
              {formatMoney(totals.discountedSubtotalHt, currency)}
            </dd>
          </div>
        ) : null}
        {totals.taxByRate.map((bucket) => (
          <div key={bucket.ratePct} className="flex justify-between gap-4">
            <dt className="text-gray-500">TVA {bucket.ratePct}%</dt>
            <dd>{formatMoney(bucket.taxAmount, currency)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
          <dt className="font-semibold text-gray-800 dark:text-white/90">
            Total TTC
          </dt>
          <dd className="text-lg font-semibold text-brand-600 dark:text-brand-400">
            {formatMoney(totals.totalTtc, currency)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
