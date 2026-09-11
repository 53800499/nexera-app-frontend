"use client";

import {
  paymentMethodLabel,
  formatPaymentMoney,
} from "@/modules/encaissements/utils/paymentLabels";
import type { CabinetCompanyPayment } from "../types/cabinet.types";

type Props = {
  payments: CabinetCompanyPayment[];
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function CompanyPaymentsTable({ payments }: Props) {
  if (payments.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Aucun encaissement enregistré pour ce dossier.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900/60">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Référence
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Client
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Moyen de paiement
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Imputations
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Statut
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
              Montant
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
          {payments.map((payment) => {
            const hasImputations = Boolean(payment.imputations && payment.imputations.length > 0);

            return (
              <tr key={payment.id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                  {payment.reference || "Règlement direct"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(payment.paymentDate)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {payment.client?.companyName ?? "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {paymentMethodLabel(payment.paymentMethod)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {hasImputations ? (
                    <div className="flex flex-wrap gap-1">
                      {payment.imputations!.map((imp) => (
                        <span
                          key={imp.id}
                          className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {imp.invoice?.number ?? "Facture"}
                        </span>
                      ))}
                    </div>
                  ) : payment.unallocatedAmount > 0 ? (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      Non imputé
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  {payment.isCancelled ? (
                    <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                      Annulé
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      Encaissé
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-800 dark:text-white/90">
                  {formatPaymentMoney(payment.amount, payment.currency)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
