"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable, type DataTableColumn } from "@/shared/components/table";
import { EmptyState } from "@/shared/components/feedback";
import type {
  ClientDetail,
  PaymentSummary,
  TransactionSummary,
} from "../types/client.types";

type TabKey = "quotations" | "orders" | "invoices" | "payments";

const tabs: { key: TabKey; label: string }[] = [
  { key: "quotations", label: "Devis" },
  { key: "orders", label: "Commandes" },
  { key: "invoices", label: "Factures" },
  { key: "payments", label: "Paiements" },
];

function formatMoney(value: number | string) {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(num) ? num : 0);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR");
}

function transactionDetailPath(tab: TabKey, id: string) {
  if (tab === "quotations") return `/devis/${id}`;
  if (tab === "orders") return `/commandes/${id}`;
  return `/factures/${id}`;
}

function buildTransactionColumns(
  tab: TabKey,
): DataTableColumn<TransactionSummary>[] {
  return [
    {
      key: "number",
      header: "N°",
      render: (row) => (
        <Link
          href={transactionDetailPath(tab, row.id)}
          className="font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          {row.number}
        </Link>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (row) => formatDate(row.issueDate),
    },
    {
      key: "status",
      header: "Statut",
      render: (row) => (
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
          {row.status}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Montant TTC",
      render: (row) => formatMoney(row.totalTtc),
    },
  ];
}

const paymentColumns: DataTableColumn<PaymentSummary>[] = [
  {
    key: "reference",
    header: "Référence",
    render: (row) => (
      <Link
        href={`/encaissements/${row.id}`}
        className="font-medium text-brand-600 hover:underline dark:text-brand-400"
      >
        {row.reference || row.id.slice(0, 8)}
      </Link>
    ),
  },
  {
    key: "date",
    header: "Date",
    render: (row) => formatDate(row.paymentDate),
  },
  {
    key: "method",
    header: "Mode",
    render: (row) => row.paymentMethod || "—",
  },
  {
    key: "amount",
    header: "Montant",
    render: (row) => formatMoney(row.amount),
  },
];

type Props = {
  client: ClientDetail;
};

export function ClientHistoryTabs({ client }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("quotations");

  const history = client.history ?? {
    quotations: client.quotations ?? [],
    orders: client.orders ?? [],
    invoices: client.invoices ?? [],
    payments: client.payments ?? [],
    counts: client._count ?? {
      contacts: client.contacts.length,
      quotations: 0,
      invoices: 0,
      orders: 0,
      payments: 0,
    },
  };

  const dataByTab: Record<TabKey, TransactionSummary[] | PaymentSummary[]> = {
    quotations: history.quotations,
    orders: history.orders,
    invoices: history.invoices,
    payments: history.payments,
  };

  const counts: Record<TabKey, number> = {
    quotations: history.counts.quotations,
    orders: history.counts.orders,
    invoices: history.counts.invoices,
    payments: history.counts.payments,
  };

  const activeData = dataByTab[activeTab];
  const transactionColumns = useMemo(
    () => buildTransactionColumns(activeTab),
    [activeTab],
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 p-4 dark:border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              activeTab === tab.key
                ? "bg-brand-500 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeData.length === 0 ? (
          <EmptyState
            title="Aucune transaction"
            description="L'historique de ce client est vide pour cette catégorie."
            className="border-0 bg-transparent py-6"
          />
        ) : activeTab === "payments" ? (
          <DataTable<PaymentSummary>
            data={activeData as PaymentSummary[]}
            columns={paymentColumns}
            rowKey={(row) => row.id}
          />
        ) : (
          <DataTable<TransactionSummary>
            data={activeData as TransactionSummary[]}
            columns={transactionColumns}
            rowKey={(row) => row.id}
          />
        )}
      </div>
    </div>
  );
}
