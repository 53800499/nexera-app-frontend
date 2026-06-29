"use client";

import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/shared/components/table";
import { EmptyState } from "@/shared/components/feedback";
import type { UpcomingDueInvoice } from "../types/dashboard.types";
import {
  formatDashboardDate,
  formatDashboardMoneyPrecise,
} from "../utils/dashboardFormatters";

type Props = {
  invoices: UpcomingDueInvoice[];
};

export function UpcomingDueInvoicesTable({ invoices }: Props) {
  const columns: DataTableColumn<UpcomingDueInvoice>[] = [
    {
      key: "number",
      header: "Facture",
      render: (row) => (
        <Link
          href={`/factures/${row.id}`}
          className="font-medium text-brand-600 hover:underline"
        >
          {row.number}
        </Link>
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (row) => (
        <Link
          href={`/clients/${row.clientId}`}
          className="text-sm hover:text-brand-600"
        >
          {row.clientName}
        </Link>
      ),
    },
    {
      key: "due",
      header: "Échéance",
      render: (row) => formatDashboardDate(row.dueDate),
    },
    {
      key: "days",
      header: "Jours",
      render: (row) => (
        <span
          className={
            row.daysUntilDue <= 3
              ? "font-medium text-amber-700"
              : "text-gray-600"
          }
        >
          J{row.daysUntilDue >= 0 ? "+" : ""}
          {row.daysUntilDue}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Reste dû",
      render: (row) => formatDashboardMoneyPrecise(row.amountDue),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 p-4 dark:border-gray-800">
        <h2 className="font-medium">Factures à échéance (J+7)</h2>
      </div>
      <div className="p-4">
        <DataTable<UpcomingDueInvoice>
          data={invoices}
          columns={columns}
          rowKey={(row) => row.id}
          emptyState={
            <EmptyState
              title="Aucune échéance proche"
              description="Aucune facture à échéance dans les 7 prochains jours."
              className="border-0 bg-transparent py-6"
            />
          }
        />
      </div>
    </div>
  );
}
