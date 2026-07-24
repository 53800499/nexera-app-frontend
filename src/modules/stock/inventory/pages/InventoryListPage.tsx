"use client";

import Link from "next/link";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { RequireStockAccess } from "../../components/RequireStockAccess";
import { useStockAccess } from "../../hooks/useStockAccess";
import { useInventories } from "../hooks/useInventory";
import {
  INVENTORY_STATUS_LABELS,
  INVENTORY_TYPE_LABELS,
} from "../utils/inventoryLabels";
import type {
  InventorySession,
  InventorySessionStatus,
} from "../types/inventory.types";

function statusClass(status: InventorySessionStatus) {
  switch (status) {
    case "closed":
    case "validated":
      return "bg-emerald-50 text-emerald-700";
    case "counting":
    case "recount":
      return "bg-sky-50 text-sky-700";
    case "analyzing":
      return "bg-amber-50 text-amber-700";
    case "cancelled":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function InventoriesTable({ sessions }: { sessions: InventorySession[] }) {
  if (sessions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
        Aucune session d&apos;inventaire.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600">N°</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">
              Entrepôt
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">
              Lignes
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
          {sessions.map((s) => (
            <tr key={s.id}>
              <td className="px-4 py-3 font-mono text-xs">{s.number}</td>
              <td className="px-4 py-3">
                {INVENTORY_TYPE_LABELS[s.type] ?? s.type}
              </td>
              <td className="px-4 py-3">
                {s.warehouse
                  ? `${s.warehouse.code} — ${s.warehouse.name}`
                  : "—"}
              </td>
              <td className="px-4 py-3">{s._count?.lines ?? "—"}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(s.status)}`}
                >
                  {INVENTORY_STATUS_LABELS[s.status] ?? s.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/stock/inventaires/${s.id}`}
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

export default function InventoryListPage() {
  const { canManageStock } = useStockAccess();
  const { listQuery } = useInventories();

  return (
    <RequireStockAccess>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Inventaires physiques
            </h1>
            <p className="text-sm text-gray-500">
              Comptage total ou tournant, écarts et ajustements (UC-S06).
            </p>
          </div>
          {canManageStock ? (
            <Link
              href="/stock/inventaires/nouveau"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Nouvel inventaire
            </Link>
          ) : null}
        </div>

        {listQuery.isLoading && (
          <LoadingBlock label="Chargement des inventaires..." />
        )}
        {listQuery.isError && (
          <ErrorState
            title="Impossible de charger les inventaires"
            message="Une erreur est survenue."
            onRetry={() => listQuery.refetch()}
          />
        )}
        {listQuery.data ? (
          <InventoriesTable sessions={listQuery.data} />
        ) : null}
      </div>
    </RequireStockAccess>
  );
}
