import type { OrderBillingSummary } from "../types/order.types";
import { formatMoney } from "@/modules/devis/utils/quotationCalculations";

type Props = {
  billing: OrderBillingSummary;
  currency: string;
};

export function OrderBillingPanel({ billing, currency }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
      <h2 className="mb-3 font-medium">Facturation</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Total BC TTC</dt>
          <dd>{formatMoney(billing.totalTtc, currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Déjà facturé</dt>
          <dd>{formatMoney(billing.invoicedTtc, currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Reste à facturer</dt>
          <dd className="font-medium">
            {formatMoney(billing.remainingToInvoice, currency)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
          <dt className="text-gray-500">Progression</dt>
          <dd>{billing.billingProgressPct.toFixed(0)} %</dd>
        </div>
      </dl>
    </div>
  );
}
