"use client";

import { useState } from "react";
import Button from "@/components/ui/button/Button";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { RequireStockAccess } from "../../components/RequireStockAccess";
import { useStockAccess } from "../../hooks/useStockAccess";
import { useReplenishments, useStockAlerts } from "../hooks/useAlerts";
import type { StockAlert, StockAlertType } from "../types/alerts.types";
import {
  ALERT_STATUS_LABELS,
  ALERT_TYPE_LABELS,
  REPLENISHMENT_STATUS_LABELS,
  alertBadgeClass,
} from "../utils/alertsLabels";

type Tab = "alerts" | "replenishments";

const TYPE_FILTERS: Array<{ value: StockAlertType | ""; label: string }> = [
  { value: "", label: "Tous les types" },
  { value: "shortage", label: "Rupture" },
  { value: "safety", label: "Sécurité" },
  { value: "overstock", label: "Surstock" },
  { value: "expiry", label: "Péremption" },
  { value: "dormant", label: "Dormant" },
];

export default function StockAlertsPage() {
  const { canManageStock } = useStockAccess();
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );

  const [tab, setTab] = useState<Tab>("alerts");
  const [alertType, setAlertType] = useState<StockAlertType | "">("");
  const [statusFilter, setStatusFilter] = useState<"open" | "">("open");

  const {
    alertsQuery,
    summaryQuery,
    scanMutation,
    acknowledgeMutation,
    dismissMutation,
    createReplenishmentMutation,
  } = useStockAlerts({
    alertType: alertType || undefined,
  });

  const { listQuery, approveMutation, rejectMutation } = useReplenishments();

  const runScan = async () => {
    await runAction({
      loadingMessage: "Analyse des stocks...",
      success: { title: "Scan terminé" },
      error: { title: "Scan impossible" },
      action: async () => {
        const result = await scanMutation.mutateAsync(undefined);
        return result;
      },
    });
  };

  return (
    <RequireStockAccess>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Alertes & réapprovisionnement
            </h1>
            <p className="text-sm text-gray-500">
              Seuils, péremption, dormants et demandes d&apos;achat internes
              (UC-S07).
            </p>
          </div>
          {canManageStock ? (
            <Button disabled={isBusy} onClick={runScan}>
              {isBusy ? "Analyse..." : "Relancer le scan"}
            </Button>
          ) : null}
        </div>

        {summaryQuery.data ? (
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-lg bg-red-50 px-3 py-1.5 font-medium text-red-700">
              Alertes actives : {summaryQuery.data.openCount}
            </span>
            <span className="rounded-lg bg-amber-50 px-3 py-1.5 font-medium text-amber-700">
              Réappro en attente : {summaryQuery.data.pendingReplenishments}
            </span>
          </div>
        ) : null}

        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setTab("alerts")}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === "alerts"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500"
            }`}
          >
            Alertes
          </button>
          <button
            type="button"
            onClick={() => setTab("replenishments")}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === "replenishments"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500"
            }`}
          >
            Demandes d&apos;achat
          </button>
        </div>

        {tab === "alerts" ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <select
                value={alertType}
                onChange={(e) =>
                  setAlertType(e.target.value as StockAlertType | "")
                }
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                {TYPE_FILTERS.map((f) => (
                  <option key={f.value || "all"} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "open" | "")
                }
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="open">Ouvertes / actives</option>
                <option value="">Tous les statuts</option>
              </select>
            </div>

            {alertsQuery.isLoading && (
              <LoadingBlock label="Chargement des alertes..." />
            )}
            {alertsQuery.isError && (
              <ErrorState
                title="Impossible de charger les alertes"
                message="Lancez un scan ou réessayez."
                onRetry={() => alertsQuery.refetch()}
              />
            )}
            {alertsQuery.data ? (
              <AlertsTable
                alerts={
                  statusFilter === "open"
                    ? alertsQuery.data.filter(
                        (a) =>
                          a.status === "open" || a.status === "acknowledged",
                      )
                    : alertsQuery.data
                }
                canManage={canManageStock}
                isBusy={isBusy}
                onAcknowledge={(id) =>
                  runAction({
                    loadingMessage: "Acquittement...",
                    success: { title: "Alerte acquittée" },
                    error: { title: "Action impossible" },
                    action: () => acknowledgeMutation.mutateAsync(id),
                  })
                }
                onDismiss={(id) =>
                  runAction({
                    confirm: {
                      title: "Ignorer cette alerte ?",
                      confirmLabel: "Ignorer",
                    },
                    loadingMessage: "Ignorer...",
                    success: { title: "Alerte ignorée" },
                    error: { title: "Action impossible" },
                    action: () => dismissMutation.mutateAsync(id),
                  })
                }
                onReplenish={(alert) =>
                  runAction({
                    loadingMessage: "Création demande d'achat...",
                    success: { title: "Demande créée" },
                    error: { title: "Création impossible" },
                    action: () =>
                      createReplenishmentMutation.mutateAsync({
                        alertId: alert.id,
                        qtyProposed: alert.suggestedQty ?? undefined,
                      }),
                  })
                }
              />
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            {listQuery.isLoading && (
              <LoadingBlock label="Chargement des demandes..." />
            )}
            {listQuery.isError && (
              <ErrorState
                title="Impossible de charger les demandes"
                message="Une erreur est survenue."
                onRetry={() => listQuery.refetch()}
              />
            )}
            {listQuery.data ? (
              <ReplenishmentsTable
                items={listQuery.data}
                canManage={canManageStock}
                isBusy={isBusy}
                onApprove={(id) =>
                  runAction({
                    confirm: {
                      title: "Approuver cette demande d'achat ?",
                      message:
                        "Validation interne v1.0 — la commande fournisseur viendra avec le Module Achats.",
                      confirmLabel: "Approuver",
                    },
                    loadingMessage: "Approbation...",
                    success: { title: "Demande approuvée" },
                    error: { title: "Approbation impossible" },
                    action: () => approveMutation.mutateAsync(id),
                  })
                }
                onReject={(id) =>
                  runAction({
                    confirm: {
                      title: "Rejeter cette demande ?",
                      confirmLabel: "Rejeter",
                    },
                    loadingMessage: "Rejet...",
                    success: { title: "Demande rejetée" },
                    error: { title: "Rejet impossible" },
                    action: () =>
                      rejectMutation.mutateAsync({ id }),
                  })
                }
              />
            ) : null}
          </div>
        )}
      </div>
    </RequireStockAccess>
  );
}

function AlertsTable({
  alerts,
  canManage,
  isBusy,
  onAcknowledge,
  onDismiss,
  onReplenish,
}: {
  alerts: StockAlert[];
  canManage: boolean;
  isBusy: boolean;
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
  onReplenish: (alert: StockAlert) => void;
}) {
  if (alerts.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
        Aucune alerte. Lancez un scan pour analyser les seuils.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600">
              Type
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">
              Alerte
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">
              Entrepôt
            </th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">
              Stock
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">
              Suggestion
            </th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {alerts.map((a) => (
            <tr key={a.id}>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${alertBadgeClass(a.severity, a.alertType)}`}
                >
                  {ALERT_TYPE_LABELS[a.alertType] ?? a.alertType}
                </span>
                <div className="mt-1 text-xs text-gray-400">
                  {ALERT_STATUS_LABELS[a.status]}
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium">{a.title}</p>
                <p className="text-xs text-gray-500">{a.message}</p>
              </td>
              <td className="px-4 py-3">
                {a.warehouse
                  ? `${a.warehouse.code} — ${a.warehouse.name}`
                  : "—"}
              </td>
              <td className="px-4 py-3 text-right">{a.qtyOnHand}</td>
              <td className="px-4 py-3 text-xs text-gray-600">
                {a.suggestion ?? "—"}
                {a.suggestedQty != null ? (
                  <div className="mt-0.5 font-medium">
                    Qté suggérée : {a.suggestedQty}
                  </div>
                ) : null}
                {a.daysMetric != null &&
                a.daysMetric > 0 &&
                a.alertType === "safety" ? (
                  <div className="text-amber-700">
                    ~{Math.ceil(a.daysMetric)} j avant rupture
                  </div>
                ) : null}
              </td>
              <td className="px-4 py-3 text-right">
                {canManage &&
                (a.status === "open" || a.status === "acknowledged") ? (
                  <div className="flex flex-wrap justify-end gap-2">
                    {a.alertType === "shortage" && !a.replenishment ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        className="text-xs font-medium text-brand-600"
                        onClick={() => onReplenish(a)}
                      >
                        Demande d&apos;achat
                      </button>
                    ) : null}
                    {a.replenishment ? (
                      <span className="text-xs text-gray-500">
                        {a.replenishment.number}
                      </span>
                    ) : null}
                    {a.status === "open" ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        className="text-xs font-medium text-gray-600"
                        onClick={() => onAcknowledge(a.id)}
                      >
                        Acquitter
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={isBusy}
                      className="text-xs text-red-600"
                      onClick={() => onDismiss(a.id)}
                    >
                      Ignorer
                    </button>
                  </div>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReplenishmentsTable({
  items,
  canManage,
  isBusy,
  onApprove,
  onReject,
}: {
  items: Array<{
    id: string;
    number: string;
    status: string;
    qtyProposed: number;
    qtyConfigured: number | null;
    qtyAiSuggested: number | null;
    avgDailyUsage: number | null;
    daysToStockout: number | null;
    stockItem?: {
      commercialItem?: { reference: string; name: string };
    };
    warehouse?: { code: string; name: string };
  }>;
  canManage: boolean;
  isBusy: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
        Aucune demande d&apos;achat. Les ruptures génèrent une proposition au
        scan.
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
              Article
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">
              Entrepôt
            </th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">
              Qté proposée
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">
              Analyse
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">
              Statut
            </th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {items.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 font-mono text-xs">{p.number}</td>
              <td className="px-4 py-3">
                {p.stockItem?.commercialItem
                  ? `${p.stockItem.commercialItem.reference} — ${p.stockItem.commercialItem.name}`
                  : "—"}
              </td>
              <td className="px-4 py-3">
                {p.warehouse
                  ? `${p.warehouse.code} — ${p.warehouse.name}`
                  : "—"}
              </td>
              <td className="px-4 py-3 text-right font-medium">
                {p.qtyProposed}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {p.qtyConfigured != null ? (
                  <div>Paramétré : {p.qtyConfigured}</div>
                ) : null}
                {p.qtyAiSuggested != null ? (
                  <div>Suggestion IA : {p.qtyAiSuggested}</div>
                ) : null}
                {p.avgDailyUsage != null ? (
                  <div>Conso/j : {p.avgDailyUsage.toFixed(2)}</div>
                ) : null}
                {p.daysToStockout != null && p.daysToStockout > 0 ? (
                  <div>~{Math.ceil(p.daysToStockout)} j avant rupture</div>
                ) : null}
              </td>
              <td className="px-4 py-3">
                {REPLENISHMENT_STATUS_LABELS[p.status] ?? p.status}
              </td>
              <td className="px-4 py-3 text-right">
                {canManage && p.status === "pending" ? (
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      className="text-xs font-medium text-emerald-700"
                      onClick={() => onApprove(p.id)}
                    >
                      Approuver
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      className="text-xs text-red-600"
                      onClick={() => onReject(p.id)}
                    >
                      Rejeter
                    </button>
                  </div>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
