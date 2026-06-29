"use client";

import {
  invoiceStatusLabel,
  INVOICE_STATUS_CLASSES,
  normalizeInvoiceStatus,
  invoiceTypeLabel,
} from "@/modules/factures/utils/invoiceLabels";
import type { CabinetInvoice } from "../types/cabinet.types";

type Props = {
  invoices: CabinetInvoice[];
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatAmount(value: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency || "EUR",
  }).format(value);
}

export function CompanyInvoicesTable({ invoices }: Props) {
  if (invoices.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Aucune facture enregistrée pour ce dossier.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900/60">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Numéro
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Client
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Date d&apos;émission
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Échéance
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Statut
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
              Montant TTC
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
          {invoices.map((invoice) => {
            const statusKey = normalizeInvoiceStatus(invoice.status);
            const statusClass =
              INVOICE_STATUS_CLASSES[statusKey] ??
              "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

            return (
              <tr key={invoice.id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                  {invoice.number}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {invoiceTypeLabel(invoice.invoiceType)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {invoice.client?.companyName ?? "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatDate(invoice.issueDate)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatDate(invoice.dueDate)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}
                  >
                    {invoiceStatusLabel(invoice.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-800 dark:text-white/90">
                  {formatAmount(invoice.totalTtc, invoice.currency)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
