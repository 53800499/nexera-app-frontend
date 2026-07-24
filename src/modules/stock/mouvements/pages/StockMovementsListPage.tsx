"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { RequireStockAccess } from "../../components/RequireStockAccess";
import { useStockAccess } from "../../hooks/useStockAccess";
import { useStockEntries, useStockExits } from "../../hooks/useStock";
import {
  STOCK_MOVEMENT_STATUS_LABELS,
  STOCK_MOVEMENT_TYPE_LABELS,
} from "../utils/movementLabels";
import type { StockMovement } from "../../types/stock.types";

type Tab = "entries" | "exits";

function MovementsTable({ movements }: { movements: StockMovement[] }) {
  if (movements.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
        Aucun mouvement dans cette catégorie.
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
            <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">
              Statut
            </th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {movements.map((m) => (
            <tr key={m.id}>
              <td className="px-4 py-3 font-mono text-xs">{m.number}</td>
              <td className="px-4 py-3">
                {STOCK_MOVEMENT_TYPE_LABELS[m.movementType] ?? m.movementType}
              </td>
              <td className="px-4 py-3">
                {m.warehouse
                  ? `${m.warehouse.code} — ${m.warehouse.name}`
                  : "—"}
              </td>
              <td className="px-4 py-3">{m.movementDate?.slice(0, 10)}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    m.status === "validated"
                      ? "bg-emerald-50 text-emerald-700"
                      : m.status === "draft"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {STOCK_MOVEMENT_STATUS_LABELS[m.status] ?? m.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/stock/mouvements/${m.id}`}
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

export default function StockMovementsListPage() {
  const { canManageStock } = useStockAccess();
  const [tab, setTab] = useState<Tab>("exits");
  const { entriesQuery } = useStockEntries();
  const { exitsQuery } = useStockExits();

  const activeQuery = tab === "entries" ? entriesQuery : exitsQuery;

  return (
    <RequireStockAccess>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Mouvements de stock
            </h1>
            <p className="text-sm text-gray-500">
              Entrées (UC-S03) et sorties (UC-S04).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/stock/articles"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Articles
            </Link>
            {canManageStock ? (
              <>
                <Link
                  href="/stock/mouvements/nouvelle-entree"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Nouvelle entrée
                </Link>
                <Link
                  href="/stock/mouvements/nouvelle-sortie"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Nouvelle sortie
                </Link>
                <Link
                  href="/stock/transferts"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Transferts
                </Link>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setTab("exits")}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === "exits"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500"
            }`}
          >
            Sorties
          </button>
          <button
            type="button"
            onClick={() => setTab("entries")}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === "entries"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500"
            }`}
          >
            Entrées
          </button>
        </div>

        {activeQuery.isLoading && (
          <LoadingBlock label="Chargement des mouvements..." />
        )}
        {activeQuery.isError && (
          <ErrorState
            title="Impossible de charger les mouvements"
            message="Une erreur est survenue."
            onRetry={() => activeQuery.refetch()}
          />
        )}
        {activeQuery.data ? (
          <MovementsTable movements={activeQuery.data} />
        ) : null}
      </div>
    </RequireStockAccess>
  );
}
