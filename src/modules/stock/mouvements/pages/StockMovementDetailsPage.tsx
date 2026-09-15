"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/icons";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { RequireStockAccess } from "../../components/RequireStockAccess";
import { useStockAccess } from "../../hooks/useStockAccess";
import {
  useAvailableSerials,
  useDraftMovementActions,
  useStockEntries,
  useStockMovement,
} from "../../hooks/useStock";
import type { StockMovement } from "../../types/stock.types";
import {
  STOCK_MOVEMENT_STATUS_LABELS,
  STOCK_MOVEMENT_TYPE_LABELS,
  STOCK_QUALITY_LABELS,
} from "../utils/movementLabels";

type MovementLine = NonNullable<NonNullable<StockMovement["lines"]>[number]>;

function EditSerialsModal({
  isOpen,
  onClose,
  line,
  movementId,
  isExit,
  warehouseId,
}: {
  isOpen: boolean;
  onClose: () => void;
  line: MovementLine;
  movementId: string;
  isExit: boolean;
  warehouseId: string;
}) {
  const [serialsText, setSerialsText] = useState(
    (line.serialNumbers ?? []).join("\n"),
  );
  const { runAction } = useActionFeedback();
  const { updateDraftSerialsMutation } = useDraftMovementActions();
  const serialsQuery = useAvailableSerials(
    line.stockItem?.id || "",
    isExit ? warehouseId : "",
  );

  const parsedSerials = serialsText
    .split(/[\n,;]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const availableList = isExit ? (serialsQuery.data?.serials ?? []) : [];
  const targetQty = Math.round(line.qtyActual || line.qtyPlanned || 0);

  const duplicateSerials = parsedSerials.filter(
    (sn, idx, arr) => arr.indexOf(sn) !== idx,
  );

  const unavailableSerials =
    isExit && availableList.length > 0
      ? parsedSerials.filter(
          (sn) =>
            !availableList.some((s) => s.serialNumber.toUpperCase() === sn),
        )
      : [];

  const toggleSerial = (sn: string) => {
    const upper = sn.trim().toUpperCase();
    if (parsedSerials.includes(upper)) {
      const next = parsedSerials.filter((s) => s !== upper);
      setSerialsText(next.join("\n"));
    } else {
      if (parsedSerials.length >= targetQty) return;
      const next = [...parsedSerials, upper];
      setSerialsText(next.join("\n"));
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await runAction({
      loadingMessage: "Mise à jour des numéros de série...",
      success: { title: "Numéros de série mis à jour" },
      error: { title: "Modification impossible" },
      action: async () => {
        await updateDraftSerialsMutation.mutateAsync({
          id: movementId,
          payload: {
            lineId: line.id,
            serialNumbers: parsedSerials,
          },
        });
        onClose();
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[650px]">
      <form onSubmit={handleSave} className="space-y-4 p-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Modifier les numéros de série
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Article : {line.stockItem?.commercialItem?.reference} —{" "}
            {line.stockItem?.commercialItem?.name}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Label>
            Numéros de série ({isExit ? "à sortir" : "réceptionnés"})
          </Label>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              parsedSerials.length === targetQty
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : parsedSerials.length > targetQty
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            }`}
          >
            {parsedSerials.length} / {targetQty} numéro
            {targetQty > 1 ? "s" : ""}
          </span>
        </div>

        {isExit && availableList.length > 0 ? (
          <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-2.5 dark:border-gray-800 dark:bg-gray-800/40">
            <p className="mb-1.5 text-xs text-gray-500">
              Sélection rapide parmi les numéros disponibles en stock :
            </p>
            <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">
              {availableList.map((s) => {
                const isSelected = parsedSerials.includes(
                  s.serialNumber.toUpperCase(),
                );
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSerial(s.serialNumber)}
                    className={`rounded-md border px-2.5 py-1 font-mono text-xs transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-white shadow-sm"
                        : "border-gray-300 bg-white text-gray-700 hover:border-primary/50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    }`}
                  >
                    {s.serialNumber}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <textarea
          value={serialsText}
          onChange={(e) => setSerialsText(e.target.value)}
          rows={4}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-mono text-sm dark:border-gray-700 dark:bg-gray-900"
          placeholder={"Un numéro de série par ligne ou séparés par virgule"}
        />

        {duplicateSerials.length > 0 ? (
          <p className="text-xs font-medium text-red-600 dark:text-red-400">
            Attention : le numéro « {duplicateSerials[0]} » est saisi plusieurs
            fois.
          </p>
        ) : null}

        {unavailableSerials.length > 0 && availableList.length > 0 ? (
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
            Attention : le numéro « {unavailableSerials[0]} » n&apos;est pas
            détecté en stock dans cet entrepôt.
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={() => void handleSave()}
            disabled={
              parsedSerials.length !== targetQty || duplicateSerials.length > 0
            }
          >
            Enregistrer les numéros
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function StockMovementDetailsPage({ id }: { id: string }) {
  const router = useRouter();
  const { canManageStock } = useStockAccess();
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const movementQuery = useStockMovement(id);
  const { validateEntryMutation } = useStockEntries();
  const { deleteDraftMovementMutation } = useDraftMovementActions();

  const [editingLine, setEditingLine] = useState<MovementLine | null>(null);

  const movement = movementQuery.data;
  const isExit = movement?.movementType?.startsWith("OUT_") ?? false;

  const handleValidate = () => {
    void runAction({
      confirm: {
        title: isExit ? "Valider cette sortie ?" : "Valider cette entrée ?",
        message: isExit
          ? "La validation décrémente le stock. Le mouvement devient définitif."
          : "La validation met à jour les stocks et recalcule le coût moyen unitaire pondéré (CMUP). L'entrée devient définitive.",
        confirmLabel: "Valider",
      },
      loadingMessage: "Validation...",
      success: { title: isExit ? "Sortie validée" : "Entrée validée" },
      error: { title: "Validation impossible" },
      action: () => validateEntryMutation.mutateAsync(id),
    });
  };

  const handleDeleteDraft = () => {
    void runAction({
      confirm: {
        title: "Supprimer ce mouvement brouillon ?",
        message:
          "Cette action supprimera définitivement le brouillon. Les stocks physiques ne seront pas impactés.",
        confirmLabel: "Supprimer",
      },
      loadingMessage: "Suppression du brouillon...",
      success: { title: "Brouillon supprimé" },
      error: { title: "Suppression impossible" },
      action: async () => {
        await deleteDraftMovementMutation.mutateAsync(id);
        router.push("/stock/mouvements");
      },
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={isBusy}
                    onClick={handleDeleteDraft}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/20"
                  >
                    Supprimer le brouillon
                  </Button>
                  <Button disabled={isBusy} onClick={handleValidate}>
                    Valider le mouvement
                  </Button>
                </div>
              ) : null}
            </div>

            {movement.status === "draft" ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
                <p className="font-semibold">Mouvement à l&apos;état de brouillon</p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  Ce mouvement n&apos;a pas encore impacté les stocks physiques. Vous pouvez vérifier ou corriger les numéros de série enregistrés sur chaque ligne avant de valider, ou supprimer ce brouillon s&apos;il a été créé par erreur.
                </p>
              </div>
            ) : null}

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
                    <th className="px-4 py-3 text-left font-medium">
                      Numéros de série
                    </th>
                    {movement.status === "draft" && canManageStock ? (
                      <th className="px-4 py-3 text-center font-medium">Action</th>
                    ) : null}
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
                      <td className="px-4 py-3">
                        {line.serialNumbers && line.serialNumbers.length > 0 ? (
                          <div className="flex max-w-xs flex-wrap gap-1">
                            {line.serialNumbers.map((s) => (
                              <span
                                key={s}
                                className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      {movement.status === "draft" && canManageStock ? (
                        <td className="px-4 py-3 text-center">
                          {line.stockItem?.trackSerials ? (
                            <button
                              type="button"
                              onClick={() => setEditingLine(line)}
                              className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                            >
                              Corriger séries
                            </button>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {editingLine ? (
              <EditSerialsModal
                isOpen={Boolean(editingLine)}
                onClose={() => setEditingLine(null)}
                line={editingLine}
                movementId={movement.id}
                isExit={isExit}
                warehouseId={movement.warehouseId}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </RequireStockAccess>
  );
}
