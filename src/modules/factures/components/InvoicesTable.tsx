"use client";

import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/shared/components/table";
import { EmptyState } from "@/shared/components/feedback";
import { formatMoney } from "@/modules/devis/utils/quotationCalculations";
import type { InvoiceSummary } from "../types/invoice.types";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import {
  invoiceTypeLabel,
  normalizeInvoiceStatus,
  normalizeInvoiceType,
} from "../utils/invoiceLabels";
import { canEditInvoice } from "../utils/invoiceStatusRules";

type Props = {
  invoices: InvoiceSummary[];
  canManage: boolean;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR");
}

export function InvoicesTable({ invoices, canManage }: Props) {
  const columns: DataTableColumn<InvoiceSummary>[] = [
    {
      key: "number",
      header: "N° facture",
      render: (row) => (
        <p className="font-medium text-gray-800 dark:text-white/90">
          {row.number}
        </p>
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (row) => (
        <div>
          <p className="text-sm">{row.client?.companyName ?? "—"}</p>
          <p className="text-xs text-gray-500">{row.client?.code ?? ""}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => invoiceTypeLabel(normalizeInvoiceType(row.invoiceType)),
    },
    {
      key: "date",
      header: "Date",
      render: (row) => formatDate(row.issueDate),
    },
    {
      key: "due",
      header: "Échéance",
      render: (row) => (row.dueDate ? formatDate(row.dueDate) : "—"),
    },
    {
      key: "amount",
      header: "Montant TTC",
      render: (row) => formatMoney(row.totalTtc, row.currency),
    },
    {
      key: "dueAmount",
      header: "Reste dû",
      render: (row) => formatMoney(row.amountDue, row.currency),
    },
    {
      key: "status",
      header: "Statut",
      render: (row) => (
        <InvoiceStatusBadge status={normalizeInvoiceStatus(row.status)} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/factures/${row.id}`}
            className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Détail
          </Link>
          {canManage && canEditInvoice(row.status) ? (
            <Link
              href={`/factures/${row.id}/modifier`}
              className="rounded border border-brand-300 px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-400"
            >
              Modifier
            </Link>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1100px]">
          <DataTable<InvoiceSummary>
            data={invoices}
            columns={columns}
            rowKey={(row) => row.id}
            emptyState={
              <EmptyState
                title="Aucune facture"
                description="Créez une facture manuellement ou depuis un bon de commande."
                className="border-0 bg-transparent py-8"
                action={
                  canManage ? (
                    <Link
                      href="/factures/nouvelle"
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                    >
                      Nouvelle facture
                    </Link>
                  ) : undefined
                }
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
