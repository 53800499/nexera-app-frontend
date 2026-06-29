"use client";

import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/shared/components/table";
import { EmptyState } from "@/shared/components/feedback";
import type { TopArticle, TopClient } from "../types/dashboard.types";
import { formatDashboardMoney } from "../utils/dashboardFormatters";

export function TopClientsTable({ clients }: { clients: TopClient[] }) {
  const columns: DataTableColumn<TopClient>[] = [
    {
      key: "client",
      header: "Client",
      render: (row) => (
        <Link
          href={`/clients/${row.clientId}`}
          className="font-medium text-brand-600 hover:underline"
        >
          {row.clientName}
        </Link>
      ),
    },
    {
      key: "revenue",
      header: "CA HT",
      render: (row) => formatDashboardMoney(row.revenueHt),
    },
    {
      key: "count",
      header: "Factures",
      render: (row) => row.invoiceCount,
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 p-4 dark:border-gray-800">
        <h2 className="font-medium">Top clients</h2>
      </div>
      <div className="p-4">
        <DataTable<TopClient>
          data={clients}
          columns={columns}
          rowKey={(row) => row.clientId}
          emptyState={
            <EmptyState
              title="Aucune donnée"
              description="Aucun client sur la période sélectionnée."
              className="border-0 bg-transparent py-6"
            />
          }
        />
      </div>
    </div>
  );
}

export function TopArticlesTable({ articles }: { articles: TopArticle[] }) {
  const columns: DataTableColumn<TopArticle>[] = [
    {
      key: "label",
      header: "Article / service",
      render: (row) => (
        <div>
          <p className="font-medium">{row.label}</p>
          {row.itemId ? (
            <Link
              href={`/catalogue/${row.itemId}`}
              className="text-xs text-brand-600 hover:underline"
            >
              Voir fiche
            </Link>
          ) : null}
        </div>
      ),
    },
    {
      key: "revenue",
      header: "CA HT",
      render: (row) => formatDashboardMoney(row.revenueHt),
    },
    {
      key: "qty",
      header: "Quantité",
      render: (row) => row.quantity,
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 p-4 dark:border-gray-800">
        <h2 className="font-medium">Top articles</h2>
      </div>
      <div className="p-4">
        <DataTable<TopArticle>
          data={articles}
          columns={columns}
          rowKey={(row, index) => row.itemId ?? `${row.label}-${index}`}
          emptyState={
            <EmptyState
              title="Aucune donnée"
              description="Aucun article sur la période sélectionnée."
              className="border-0 bg-transparent py-6"
            />
          }
        />
      </div>
    </div>
  );
}
