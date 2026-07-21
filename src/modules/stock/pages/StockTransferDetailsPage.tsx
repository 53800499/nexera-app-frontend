"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { RequireStockAccess } from "../components/RequireStockAccess";
import { useStockAccess } from "../hooks/useStockAccess";
import { useStockTransfer, useStockTransfers } from "../hooks/useStock";
import { STOCK_TRANSFER_STATUS_LABELS } from "../utils/movementLabels";
import type { StockTransferLine } from "../types/stock.types";

type RecvDraft = {
  lineId: string;
  qtyReceived: string;
  varianceReason: string;
};

export default function StockTransferDetailsPage({
  transferId,
}: {
  transferId: string;
}) {
  const { canManageStock } = useStockAccess();
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const transferQuery = useStockTransfer(transferId);
  const {
    submitTransferMutation,
    shipTransferMutation,
    receiveTransferMutation,
    cancelTransferMutation,
  } = useStockTransfers();

  const transfer = transferQuery.data;
  const [recvLines, setRecvLines] = useState<RecvDraft[]>([]);
  const [globalVariance, setGlobalVariance] = useState("");
  const [receiveNotes, setReceiveNotes] = useState("");

  useEffect(() => {
    if (!transfer?.lines) return;
    setRecvLines(
      transfer.lines.map((l) => ({
        lineId: l.id,
        qtyReceived: String(l.qtyShipped || l.qtyPlanned),
        varianceReason: "",
      })),
    );
  }, [transfer?.id, transfer?.status, transfer?.lines]);

  const hasVariance = useMemo(() => {
    if (!transfer?.lines) return false;
    return transfer.lines.some((line) => {
      const draft = recvLines.find((r) => r.lineId === line.id);
      if (!draft) return false;
      return Number(draft.qtyReceived) !== line.qtyShipped;
    });
  }, [transfer?.lines, recvLines]);

  const runShip = async () => {
    await runAction({
      confirm: {
        title: "Valider le départ ?",
        message:
          "Le stock de l’entrepôt source sera diminué. Statut → En transit.",
        confirmLabel: "Expédier",
      },
      loadingMessage: "Expédition en cours...",
      success: { title: "Transfert en transit" },
      error: { title: "Expédition impossible" },
      action: () => shipTransferMutation.mutateAsync(transferId),
    });
  };

  const runReceive = async () => {
    await runAction({
      confirm: {
        title: "Confirmer la réception ?",
        message: hasVariance
          ? "Des écarts sont détectés : le motif est obligatoire."
          : "Le stock de destination sera augmenté.",
        confirmLabel: "Réceptionner",
      },
      loadingMessage: "Réception en cours...",
      success: { title: "Transfert complété" },
      error: { title: "Réception impossible" },
      action: () =>
        receiveTransferMutation.mutateAsync({
          id: transferId,
          payload: {
            lines: recvLines.map((r) => ({
              lineId: r.lineId,
              qtyReceived: Number(r.qtyReceived),
              varianceReason: r.varianceReason.trim() || undefined,
            })),
            varianceReason: globalVariance.trim() || undefined,
            notes: receiveNotes.trim() || undefined,
          },
        }),
    });
  };

  if (transferQuery.isLoading) {
    return (
      <RequireStockAccess>
        <LoadingBlock label="Chargement du transfert..." />
      </RequireStockAccess>
    );
  }

  if (transferQuery.isError || !transfer) {
    return (
      <RequireStockAccess>
        <ErrorState
          title="Transfert introuvable"
          message="Ce transfert n’existe pas ou a été supprimé."
          onRetry={() => transferQuery.refetch()}
        />
      </RequireStockAccess>
    );
  }

  const canSubmit = transfer.status === "draft";
  const canShip =
    transfer.status === "draft" || transfer.status === "pending";
  const canReceive = transfer.status === "in_transit";
  const canCancel =
    transfer.status === "draft" || transfer.status === "pending";

  return (
    <RequireStockAccess>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link
              href="/stock/transferts"
              className="mb-2 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ChevronLeftIcon />
              Retour aux transferts
            </Link>
            <h1 className="font-mono text-2xl font-semibold text-gray-800 dark:text-white/90">
              {transfer.number}
            </h1>
            <p className="text-sm text-gray-500">
              {STOCK_TRANSFER_STATUS_LABELS[transfer.status] ??
                transfer.status}
            </p>
          </div>
          {canManageStock ? (
            <div className="flex flex-wrap gap-2">
              {canSubmit ? (
                <Button
                  variant="outline"
                  disabled={isBusy}
                  onClick={() =>
                    runAction({
                      loadingMessage: "Soumission...",
                      success: { title: "En attente de départ" },
                      error: { title: "Soumission impossible" },
                      action: () =>
                        submitTransferMutation.mutateAsync(transferId),
                    })
                  }
                >
                  Soumettre
                </Button>
              ) : null}
              {canShip ? (
                <Button disabled={isBusy} onClick={runShip}>
                  Valider le départ
                </Button>
              ) : null}
              {canCancel ? (
                <Button
                  variant="outline"
                  disabled={isBusy}
                  onClick={() =>
                    runAction({
                      confirm: {
                        title: "Annuler ce transfert ?",
                        message: "Action irréversible avant expédition.",
                        confirmLabel: "Annuler le transfert",
                      },
                      loadingMessage: "Annulation...",
                      success: { title: "Transfert annulé" },
                      error: { title: "Annulation impossible" },
                      action: () =>
                        cancelTransferMutation.mutateAsync(transferId),
                    })
                  }
                >
                  Annuler
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-800 md:grid-cols-2">
          <div>
            <p className="text-gray-500">Source</p>
            <p className="font-medium">
              {transfer.sourceWarehouse
                ? `${transfer.sourceWarehouse.code} — ${transfer.sourceWarehouse.name}`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Destination</p>
            <p className="font-medium">
              {transfer.destWarehouse
                ? `${transfer.destWarehouse.code} — ${transfer.destWarehouse.name}`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Date prévue</p>
            <p>{transfer.plannedDate?.slice(0, 10) ?? "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">Expédié / Reçu</p>
            <p>
              {transfer.shippedAt
                ? new Date(transfer.shippedAt).toLocaleString("fr-FR")
                : "—"}{" "}
              /{" "}
              {transfer.receivedAt
                ? new Date(transfer.receivedAt).toLocaleString("fr-FR")
                : "—"}
            </p>
          </div>
          {transfer.notes ? (
            <div className="md:col-span-2">
              <p className="text-gray-500">Notes</p>
              <p className="whitespace-pre-wrap">{transfer.notes}</p>
            </div>
          ) : null}
          {transfer.varianceReason ? (
            <div className="md:col-span-2">
              <p className="text-gray-500">Motif d’écart</p>
              <p>{transfer.varianceReason}</p>
            </div>
          ) : null}
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Article
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Lot
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Prévu
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Expédié
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Reçu
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Empl. dest.
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {(transfer.lines ?? []).map((line: StockTransferLine) => (
                <tr key={line.id}>
                  <td className="px-4 py-3">
                    {line.stockItem?.commercialItem
                      ? `${line.stockItem.commercialItem.reference} — ${line.stockItem.commercialItem.name}`
                      : line.stockItemId}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {line.lotNumber ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">{line.qtyPlanned}</td>
                  <td className="px-4 py-3 text-right">{line.qtyShipped}</td>
                  <td className="px-4 py-3 text-right">
                    {line.qtyReceived ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {line.destLocation?.code ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {canManageStock && canReceive ? (
          <div className="space-y-4 rounded-xl border border-sky-200 bg-sky-50/40 p-4 dark:border-sky-900 dark:bg-sky-950/20">
            <h2 className="text-lg font-medium">Confirmation réception</h2>
            {(transfer.lines ?? []).map((line) => {
              const draft = recvLines.find((r) => r.lineId === line.id);
              if (!draft) return null;
              const diverges =
                Number(draft.qtyReceived) !== line.qtyShipped;
              return (
                <div
                  key={line.id}
                  className="grid gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 md:grid-cols-3"
                >
                  <div className="md:col-span-3 text-sm font-medium">
                    {line.stockItem?.commercialItem?.reference} — expédié{" "}
                    {line.qtyShipped}
                  </div>
                  <div>
                    <Label>Quantité reçue</Label>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={draft.qtyReceived}
                      onChange={(e) =>
                        setRecvLines((prev) =>
                          prev.map((r) =>
                            r.lineId === line.id
                              ? { ...r, qtyReceived: e.target.value }
                              : r,
                          ),
                        )
                      }
                    />
                  </div>
                  {diverges ? (
                    <div className="md:col-span-2">
                      <Label>Motif d’écart (ligne)</Label>
                      <Input
                        value={draft.varianceReason}
                        onChange={(e) =>
                          setRecvLines((prev) =>
                            prev.map((r) =>
                              r.lineId === line.id
                                ? { ...r, varianceReason: e.target.value }
                                : r,
                            ),
                          )
                        }
                        placeholder="Obligatoire si écart"
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
            {hasVariance ? (
              <div>
                <Label>Motif d’écart global</Label>
                <textarea
                  value={globalVariance}
                  onChange={(e) => setGlobalVariance(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
                  placeholder="Au moins un motif (ligne ou global) est requis"
                />
              </div>
            ) : null}
            <div>
              <Label>Notes de réception</Label>
              <textarea
                value={receiveNotes}
                onChange={(e) => setReceiveNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"
              />
            </div>
            <Button disabled={isBusy} onClick={runReceive}>
              Confirmer la réception
            </Button>
          </div>
        ) : null}
      </div>
    </RequireStockAccess>
  );
}
