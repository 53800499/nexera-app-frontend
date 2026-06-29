"use client";

import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/shared/components/table";
import { EmptyState } from "@/shared/components/feedback";
import type { QuotationSummary } from "../types/quotation.types";
import { QuotationStatusBadge } from "./QuotationStatusBadge";
import { formatMoney } from "../utils/quotationCalculations";
import { normalizeQuotationStatus } from "../utils/quotationLabels";
import { canEditQuotation } from "../utils/quotationStatusRules";

type Props = {
  quotations: QuotationSummary[];
  canManage: boolean;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR");
}

export function QuotationsTable({ quotations, canManage }: Props) {
  const columns: DataTableColumn<QuotationSummary>[] = [
    {
      key: "number",
      header: "N° devis",
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
      key: "dates",
      header: "Dates",
      render: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>Émis : {formatDate(row.issueDate)}</p>
          {row.expiryDate ? (
            <p className="text-xs text-gray-500">
              Valide jusqu&apos;au {formatDate(row.expiryDate)}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Montant TTC",
      render: (row) => formatMoney(row.totalTtc, row.currency),
    },
    {
      key: "status",
      header: "Statut",
      render: (row) => (
        <QuotationStatusBadge status={normalizeQuotationStatus(row.status)} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/devis/${row.id}`}
            className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Détail
          </Link>
          {canManage && canEditQuotation(row.status) ? (
            <Link
              href={`/devis/${row.id}/modifier`}
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
        <div className="min-w-[900px]">
          <DataTable<QuotationSummary>
            data={quotations}
            columns={columns}
            rowKey={(row) => row.id}
            emptyState={
              <EmptyState
                title="Aucun devis"
                description="Créez votre premier devis pour démarrer le cycle commercial."
                className="border-0 bg-transparent py-8"
                action={
                  canManage ? (
                    <Link
                      href="/devis/nouveau"
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                    >
                      Nouveau devis
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
