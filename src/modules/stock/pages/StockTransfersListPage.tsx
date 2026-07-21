"use client";

import Link from "next/link";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { RequireStockAccess } from "../components/RequireStockAccess";
import { useStockAccess } from "../hooks/useStockAccess";
import { useStockTransfers } from "../hooks/useStock";
import { STOCK_TRANSFER_STATUS_LABELS } from "../utils/movementLabels";
import type { StockTransfer, StockTransferStatus } from "../types/stock.types";

function statusClass(status: StockTransferStatus) {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700";
    case "in_transit":
      return "bg-sky-50 text-sky-700";
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "draft":
      return "bg-gray-100 text-gray-700";
    case "cancelled":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function TransfersTable({ transfers }: { transfers: StockTransfer[] }) {
  if (transfers.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
        Aucun transfert pour le moment.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600">N°</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">
              Source
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">
              Destination
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">
              Date prévue
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">
              Statut
            </th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {transfers.map((t) => (
            <tr key={t.id}>
              <td className="px-4 py-3 font-mono text-xs">{t.number}</td>
              <td className="px-4 py-3">
                {t.sourceWarehouse
                  ? `${t.sourceWarehouse.code} — ${t.sourceWarehouse.name}`
                  : "—"}
              </td>
              <td className="px-4 py-3">
                {t.destWarehouse
                  ? `${t.destWarehouse.code} — ${t.destWarehouse.name}`
                  : "—"}
              </td>
              <td className="px-4 py-3">
                {t.plannedDate?.slice(0, 10) ?? "—"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(t.status)}`}
                >
                  {STOCK_TRANSFER_STATUS_LABELS[t.status] ?? t.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/stock/transferts/${t.id}`}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Voir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StockTransfersListPage() {
  const { canManageStock } = useStockAccess();
  const { transfersQuery } = useStockTransfers();

  return (
    <RequireStockAccess>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Transferts inter-entrepôts
            </h1>
            <p className="text-sm text-gray-500">
              Mouvement en deux temps : sortie source puis entrée destination
              (UC-S05).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/stock/mouvements"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Mouvements
            </Link>
            {canManageStock ? (
              <Link
                href="/stock/transferts/nouveau"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Nouveau transfert
              </Link>
            ) : null}
          </div>
        </div>

        {transfersQuery.isLoading && (
          <LoadingBlock label="Chargement des transferts..." />
        )}
        {transfersQuery.isError && (
          <ErrorState
            title="Impossible de charger les transferts"
            message="Une erreur est survenue."
            onRetry={() => transfersQuery.refetch()}
          />
        )}
        {transfersQuery.data ? (
          <TransfersTable transfers={transfersQuery.data} />
        ) : null}
      </div>
    </RequireStockAccess>
  );
}
