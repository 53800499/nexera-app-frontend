"use client";

import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/shared/components/table";
import { EmptyState } from "@/shared/components/feedback";
import type { PaymentSummary } from "../types/payment.types";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import {
  formatPaymentMoney,
  paymentMethodLabel,
} from "../utils/paymentLabels";

type Props = {
  payments: PaymentSummary[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR");
}

export function PaymentsTable({ payments }: Props) {
  const columns: DataTableColumn<PaymentSummary>[] = [
    {
      key: "date",
      header: "Date",
      render: (row) => formatDate(row.paymentDate),
    },
    {
      key: "client",
      header: "Client",
      render: (row) => (
        <p className="text-sm font-medium">{row.clientName ?? row.clientId}</p>
      ),
    },
    {
      key: "amount",
      header: "Montant",
      render: (row) => formatPaymentMoney(row.amount, row.currency),
    },
    {
      key: "method",
      header: "Mode",
      render: (row) => paymentMethodLabel(row.paymentMethod),
    },
    {
      key: "reference",
      header: "Référence",
      render: (row) => row.reference ?? "—",
    },
    {
      key: "imputations",
      header: "Imputations",
      render: (row) => `${row.imputations?.length ?? 0} facture(s)`,
    },
    {
      key: "unallocated",
      header: "Avance",
      render: (row) =>
        row.unallocatedAmount > 0
          ? formatPaymentMoney(row.unallocatedAmount, row.currency)
          : "—",
    },
    {
      key: "status",
      header: "Statut",
      render: (row) => <PaymentStatusBadge isCancelled={row.isCancelled} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Link
          href={`/encaissements/${row.id}`}
          className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Détail
        </Link>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          <DataTable<PaymentSummary>
            data={payments}
            columns={columns}
            rowKey={(row) => row.id}
            emptyState={
              <EmptyState
                title="Aucun encaissement"
                description="Enregistrez un paiement client pour imputer les factures ouvertes."
                className="border-0 bg-transparent py-8"
                action={
                  <Link
                    href="/encaissements/nouveau"
                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                  >
                    Nouveau paiement
                  </Link>
                }
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
