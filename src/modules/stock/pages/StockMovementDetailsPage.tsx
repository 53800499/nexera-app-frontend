"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import Button from "@/components/ui/button/Button";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { RequireStockAccess } from "../components/RequireStockAccess";
import { useStockAccess } from "../hooks/useStockAccess";
import { useStockEntries, useStockMovement } from "../hooks/useStock";
import {
  STOCK_MOVEMENT_STATUS_LABELS,
  STOCK_MOVEMENT_TYPE_LABELS,
  STOCK_QUALITY_LABELS,
} from "../utils/movementLabels";

export default function StockMovementDetailsPage({ id }: { id: string }) {
  const { canManageStock } = useStockAccess();
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const movementQuery = useStockMovement(id);
  const { validateEntryMutation } = useStockEntries();

  const movement = movementQuery.data;
  const isExit = movement?.movementType?.startsWith("OUT_") ?? false;

  const handleValidate = () => {
    void runAction({
      confirm: {
        title: isExit ? "Valider cette sortie ?" : "Valider cette entrée ?",
        message: isExit
          ? "La validation décrémente le stock. Le mouvement devient immuable."
          : "La validation met à jour les stocks et recalcule le CMUP. L'entrée devient immuable (RM-IN05).",
        confirmLabel: "Valider",
      },
      loadingMessage: "Validation...",
      success: { title: isExit ? "Sortie validée" : "Entrée validée" },
      error: { title: "Validation impossible" },
      action: () => validateEntryMutation.mutateAsync(id),
    });
  };

  return (
    <RequireStockAccess>
      <div className="space-y-4">
        <Link
          href="/stock/mouvements"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeftIcon />
          Retour aux mouvements
        </Link>

        {movementQuery.isLoading && (
          <LoadingBlock label="Chargement du mouvement..." />
        )}
        {movementQuery.isError && (
          <ErrorState
            title="Mouvement introuvable"
            message="Impossible de charger ce mouvement."
            onRetry={() => movementQuery.refetch()}
          />
        )}

        {movement ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                  {movement.number}
                </h1>
                <p className="text-sm text-gray-500">
                  {STOCK_MOVEMENT_TYPE_LABELS[movement.movementType] ??
                    movement.movementType}{" "}
                  —{" "}
                  {STOCK_MOVEMENT_STATUS_LABELS[movement.status] ??
                    movement.status}
                </p>
              </div>
              {canManageStock && movement.status === "draft" ? (
                <Button disabled={isBusy} onClick={handleValidate}>
                  Valider le mouvement
                </Button>
              ) : null}
            </div>

            <div className="grid gap-3 rounded-xl border border-gray-200 p-4 text-sm md:grid-cols-2 dark:border-gray-800">
              <div>
                <span className="text-gray-500">Entrepôt : </span>
                {movement.warehouse
                  ? `${movement.warehouse.code} — ${movement.warehouse.name}`
                  : "—"}
              </div>
              <div>
                <span className="text-gray-500">Date : </span>
                {movement.movementDate?.slice(0, 10)}
              </div>
              <div>
                <span className="text-gray-500">Référence : </span>
                {movement.reference ?? "—"}
              </div>
              <div>
                <span className="text-gray-500">Qualité : </span>
                {movement.qualityStatus
                  ? STOCK_QUALITY_LABELS[movement.qualityStatus]
                  : "—"}
              </div>
              {movement.reason ? (
                <div className="md:col-span-2">
                  <span className="text-gray-500">Motif : </span>
                  {movement.reason}
                </div>
              ) : null}
              {movement.notes ? (
                <div className="md:col-span-2">
                  <span className="text-gray-500">Notes : </span>
                  {movement.notes}
                </div>
              ) : null}
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Article</th>
                    <th className="px-4 py-3 text-right font-medium">Prévu</th>
                    <th className="px-4 py-3 text-right font-medium">Accepté</th>
                    <th className="px-4 py-3 text-right font-medium">Coût U.</th>
                    <th className="px-4 py-3 text-right font-medium">CMUP</th>
                    <th className="px-4 py-3 text-left font-medium">Lot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(movement.lines ?? []).map((line) => (
                    <tr key={line.id}>
                      <td className="px-4 py-3">
                        {line.stockItem?.commercialItem
                          ? `${line.stockItem.commercialItem.reference} — ${line.stockItem.commercialItem.name}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {line.qtyPlanned}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {line.qtyActual}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {line.unitCost}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-xs">
                        {line.cmupBefore != null && line.cmupAfter != null
                          ? `${line.cmupBefore.toFixed(4)} → ${line.cmupAfter.toFixed(4)}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {line.lotNumber ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </RequireStockAccess>
  );
}
