"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { RequireStockAccess } from "../../components/RequireStockAccess";
import { useStockAccess } from "../../hooks/useStockAccess";
import {
  useInventories,
  useInventory,
  useInventoryVariances,
} from "../hooks/useInventory";
import {
  INVENTORY_STATUS_LABELS,
  INVENTORY_TYPE_LABELS,
} from "../utils/inventoryLabels";

type CountDraft = { lineId: string; qty: string };

export default function InventoryDetailsPage({
  sessionId,
}: {
  sessionId: string;
}) {
  const { canManageStock } = useStockAccess();
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );

  const detailQuery = useInventory(sessionId, "detail");
  const sheetQuery = useInventory(sessionId, "sheet");
  const [significantOnly, setSignificantOnly] = useState(false);
  const variancesQuery = useInventoryVariances(sessionId, significantOnly);

  const {
    startMutation,
    submitCountsMutation,
    completeCountMutation,
    completeRecountMutation,
    validateMutation,
    closeMutation,
    cancelMutation,
  } = useInventories();

  const session = detailQuery.data;
  const sheet = sheetQuery.data;
  const [drafts, setDrafts] = useState<CountDraft[]>([]);

  const status = session?.status;
  const showSheet = status === "counting" || status === "recount";
  const showVariances =
    status === "analyzing" ||
    status === "validated" ||
    status === "closed";

  useEffect(() => {
    const lines = showSheet ? sheet?.lines : undefined;
    if (!lines) return;
    setDrafts(
      lines
        .filter((l) =>
          status === "recount" ? l.requiresRecount : true,
        )
        .map((l) => ({
          lineId: l.id,
          qty: String(
            status === "recount"
              ? (l.qtyCounted2 ?? "")
              : (l.qtyCounted1 ?? ""),
          ),
        })),
    );
  }, [sheet?.id, sheet?.lines, status, showSheet]);

  if (detailQuery.isLoading) {
    return (
      <RequireStockAccess>
        <LoadingBlock label="Chargement de l'inventaire..." />
      </RequireStockAccess>
    );
  }

  if (detailQuery.isError || !session) {
    return (
      <RequireStockAccess>
        <ErrorState
          title="Inventaire introuvable"
          message="Cette session n'existe pas ou a été supprimée."
          onRetry={() => detailQuery.refetch()}
        />
      </RequireStockAccess>
    );
  }

  const saveCounts = async () => {
    await runAction({
      loadingMessage: "Enregistrement des comptages...",
      success: { title: "Comptages enregistrés" },
      error: { title: "Enregistrement impossible" },
      action: () =>
        submitCountsMutation.mutateAsync({
          id: sessionId,
          payload: {
            lines: drafts.map((d) => ({
              lineId: d.lineId,
              qtyCounted: Number(d.qty) || 0,
            })),
          },
        }),
    });
    sheetQuery.refetch();
  };

  return (
    <RequireStockAccess>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link
              href="/stock/inventaires"
              className="mb-2 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ChevronLeftIcon />
              Retour aux inventaires
            </Link>
            <h1 className="font-mono text-2xl font-semibold text-gray-800 dark:text-white/90">
              {session.number}
            </h1>
            <p className="text-sm text-gray-500">
              {INVENTORY_TYPE_LABELS[session.type]} —{" "}
              {INVENTORY_STATUS_LABELS[session.status]}
            </p>
          </div>
          {canManageStock ? (
            <div className="flex flex-wrap gap-2">
              {status === "draft" ? (
                <>
                  <Button
                    disabled={isBusy}
                    onClick={() =>
                      runAction({
                        confirm: {
                          title: "Démarrer le comptage ?",
                          message: session.freezeMovements
                            ? "Les mouvements sur cet entrepôt seront gelés (RM-INV01)."
                            : "Le comptage peut commencer.",
                          confirmLabel: "Démarrer",
                        },
                        loadingMessage: "Démarrage...",
                        success: { title: "Comptage démarré" },
                        error: { title: "Démarrage impossible" },
                        action: () => startMutation.mutateAsync(sessionId),
                      })
                    }
                  >
                    Démarrer le comptage
                  </Button>
                  <Button
                    variant="outline"
                    disabled={isBusy}
                    onClick={() =>
                      runAction({
                        confirm: {
                          title: "Annuler cette session ?",
                          confirmLabel: "Annuler",
                        },
                        loadingMessage: "Annulation...",
                        success: { title: "Session annulée" },
                        error: { title: "Annulation impossible" },
                        action: () => cancelMutation.mutateAsync(sessionId),
                      })
                    }
                  >
                    Annuler
                  </Button>
                </>
              ) : null}
              {status === "counting" ? (
                <Button
                  disabled={isBusy}
                  onClick={() =>
                    runAction({
                      confirm: {
                        title: "Clôturer le 1er comptage ?",
                        message:
                          "Les écarts au-delà du seuil déclencheront un double comptage (RM-INV03).",
                        confirmLabel: "Clôturer",
                      },
                      loadingMessage: "Analyse...",
                      success: { title: "1er comptage clôturé" },
                      error: { title: "Clôture impossible" },
                      action: () =>
                        completeCountMutation.mutateAsync(sessionId),
                    })
                  }
                >
                  Clôturer 1er comptage
                </Button>
              ) : null}
              {status === "recount" ? (
                <Button
                  disabled={isBusy}
                  onClick={() =>
                    runAction({
                      loadingMessage: "Finalisation...",
                      success: { title: "Double comptage terminé" },
                      error: { title: "Action impossible" },
                      action: () =>
                        completeRecountMutation.mutateAsync(sessionId),
                    })
                  }
                >
                  Clôturer double comptage
                </Button>
              ) : null}
              {status === "analyzing" ? (
                <Button
                  disabled={isBusy}
                  onClick={() =>
                    runAction({
                      confirm: {
                        title: "Valider les ajustements ?",
                        message:
                          "Des mouvements IN/OUT_ADJUSTMENT seront générés (RM-INV04).",
                        confirmLabel: "Valider",
                      },
                      loadingMessage: "Validation...",
                      success: { title: "Ajustements validés" },
                      error: { title: "Validation impossible" },
                      action: () => validateMutation.mutateAsync(sessionId),
                    })
                  }
                >
                  Valider les ajustements
                </Button>
              ) : null}
              {status === "validated" ? (
                <Button
                  disabled={isBusy}
                  onClick={() =>
                    runAction({
                      confirm: {
                        title: "Clôturer l'inventaire ?",
                        message:
                          "Publication de l'événement vers la comptabilité.",
                        confirmLabel: "Clôturer",
                      },
                      loadingMessage: "Clôture...",
                      success: { title: "Inventaire clôturé" },
                      error: { title: "Clôture impossible" },
                      action: () => closeMutation.mutateAsync(sessionId),
                    })
                  }
                >
                  Clôturer la session
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-800 md:grid-cols-2">
          <div>
            <p className="text-gray-500">Entrepôt</p>
            <p className="font-medium">
              {session.warehouse
                ? `${session.warehouse.code} — ${session.warehouse.name}`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Gel mouvements</p>
            <p>{session.freezeMovements ? "Oui (RM-INV01)" : "Non"}</p>
          </div>
          <div>
            <p className="text-gray-500">Date prévue</p>
            <p>{session.plannedDate?.slice(0, 10) ?? "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">Seuil double comptage</p>
            <p>{session.varianceThresholdQty}</p>
          </div>
        </div>

        {showSheet ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  {status === "recount"
                    ? "Double comptage (lignes en écart)"
                    : "Feuille de comptage"}
                </h2>
                <p className="text-xs text-gray-400">
                  Stock théorique masqué (RM-INV02)
                </p>
              </div>
              {canManageStock ? (
                <Button variant="outline" disabled={isBusy} onClick={saveCounts}>
                  Enregistrer les quantités
                </Button>
              ) : null}
            </div>

            {sheetQuery.isLoading && (
              <LoadingBlock label="Chargement de la feuille..." />
            )}

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
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Empl.
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      Qté comptée
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(sheet?.lines ?? [])
                    .filter((l) =>
                      status === "recount" ? l.requiresRecount : true,
                    )
                    .map((line) => {
                      const draft = drafts.find((d) => d.lineId === line.id);
                      return (
                        <tr key={line.id}>
                          <td className="px-4 py-3">
                            {line.stockItem?.commercialItem
                              ? `${line.stockItem.commercialItem.reference} — ${line.stockItem.commercialItem.name}`
                              : line.stockItemId}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs">
                            {line.lot?.lotNumber ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            {line.location?.code ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {canManageStock ? (
                              <Input
                                type="number"
                                min="0"
                                step="any"
                                className="ml-auto max-w-[8rem] text-right"
                                value={draft?.qty ?? ""}
                                onChange={(e) =>
                                  setDrafts((prev) =>
                                    prev.map((d) =>
                                      d.lineId === line.id
                                        ? { ...d, qty: e.target.value }
                                        : d,
                                    ),
                                  )
                                }
                              />
                            ) : (
                              (status === "recount"
                                ? line.qtyCounted2
                                : line.qtyCounted1) ?? "—"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {showVariances ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Analyse des écarts
              </h2>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={significantOnly}
                  onChange={(e) => setSignificantOnly(e.target.checked)}
                />
                Écarts significatifs uniquement
              </label>
            </div>
            {variancesQuery.isLoading && (
              <LoadingBlock label="Chargement des écarts..." />
            )}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Article
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      Théorique
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      Final
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      Écart qty
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      Écart valeur
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(variancesQuery.data?.lines ?? []).map((line) => (
                    <tr key={line.id}>
                      <td className="px-4 py-3">
                        {line.reference} — {line.name}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {line.qtyTheoretical}
                      </td>
                      <td className="px-4 py-3 text-right">{line.qtyFinal}</td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          (line.varianceQty ?? 0) !== 0
                            ? "text-amber-700"
                            : ""
                        }`}
                      >
                        {line.varianceQty}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {line.varianceValue?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {status === "draft" ? (
          <p className="text-sm text-gray-500">
            {session.lines?.length ?? 0} ligne(s) générées. Démarrez le
            comptage pour afficher la feuille (sans stock théorique).
          </p>
        ) : null}
      </div>
    </RequireStockAccess>
  );
}
