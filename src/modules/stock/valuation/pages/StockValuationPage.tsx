"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import {
  ErrorState,
  LoadingBlock,
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { RequireStockAccess } from "../../components/RequireStockAccess";
import { useStockAccess } from "../../hooks/useStockAccess";
import { useWarehouses } from "../../hooks/useStock";
import {
  usePublishValuation,
  useStockTurnover,
  useStockValuation,
} from "../hooks/useValuation";
import {
  formatMoney,
  VALUATION_METHOD_LABELS,
} from "../utils/valuationLabels";

function defaultPeriod() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export default function StockValuationPage() {
  const { canManageStock } = useStockAccess();
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );
  const { warehousesQuery } = useWarehouses(false);

  const [asOf, setAsOf] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [appliedAsOf, setAppliedAsOf] = useState<string | undefined>();
  const [appliedWarehouseId, setAppliedWarehouseId] = useState<
    string | undefined
  >();

  const periodDefaults = useMemo(() => defaultPeriod(), []);
  const [turnoverFrom, setTurnoverFrom] = useState(periodDefaults.from);
  const [turnoverTo, setTurnoverTo] = useState(periodDefaults.to);
  const [appliedTurnover, setAppliedTurnover] = useState(periodDefaults);

  const reportQuery = useStockValuation({
    asOf: appliedAsOf,
    warehouseId: appliedWarehouseId,
  });
  const turnoverQuery = useStockTurnover({
    from: appliedTurnover.from,
    to: appliedTurnover.to,
    warehouseId: appliedWarehouseId,
  });
  const publishMutation = usePublishValuation();

  const applyFilters = () => {
    setAppliedAsOf(asOf.trim() || undefined);
    setAppliedWarehouseId(warehouseId || undefined);
  };

  const applyTurnover = () => {
    setAppliedTurnover({ from: turnoverFrom, to: turnoverTo });
  };

  const report = reportQuery.data;
  const turnover = turnoverQuery.data;

  return (
    <RequireStockAccess>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Valorisation du stock
            </h1>
            <p className="text-sm text-gray-500">
              CMUP / FIFO / LIFO — valeur à date, taux de rotation et
              publication comptable (UC-S08).
            </p>
          </div>
          {canManageStock ? (
            <Button
              disabled={isBusy || !report}
              onClick={() =>
                runAction({
                  confirm: {
                    title: "Publier vers la Comptabilité ?",
                    message:
                      "Événement stock.valuation.computed (RM-VAL04).",
                    confirmLabel: "Publier",
                  },
                  loadingMessage: "Publication...",
                  success: { title: "Valorisation publiée" },
                  error: { title: "Publication impossible" },
                  action: () =>
                    publishMutation.mutateAsync({
                      asOf: appliedAsOf,
                      warehouseId: appliedWarehouseId,
                    }),
                })
              }
            >
              Publier (Compta)
            </Button>
          ) : null}
        </div>

        <section className="grid gap-4 rounded-xl border border-gray-200 p-4 md:grid-cols-3 dark:border-gray-800">
          <div>
            <Label>Date (vide = aujourd&apos;hui)</Label>
            <Input
              type="date"
              value={asOf}
              onChange={(e) => setAsOf(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400">
              RM-VAL03 — valorisation à date historique
            </p>
          </div>
          <div>
            <Label>Entrepôt</Label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">— Tous —</option>
              {(warehousesQuery.data ?? []).map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} — {w.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={applyFilters}>
              Calculer
            </Button>
          </div>
        </section>

        {reportQuery.isLoading && (
          <LoadingBlock label="Calcul de la valorisation..." />
        )}
        {reportQuery.isError && (
          <ErrorState
            title="Impossible de calculer"
            message="Vérifiez la date ou relancez."
            onRetry={() => reportQuery.refetch()}
          />
        )}

        {report ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Date" value={report.asOf} />
              <StatCard
                label="Lignes"
                value={String(report.totals.lineCount)}
              />
              <StatCard
                label="Quantité totale"
                value={formatMoney(report.totals.totalQty)}
              />
              <StatCard
                label="Valeur totale"
                value={formatMoney(report.totals.totalValue)}
                emphasis
              />
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              {Object.entries(report.totals.byMethod).map(([method, m]) =>
                m.count > 0 ? (
                  <span
                    key={method}
                    className="rounded-lg bg-gray-100 px-3 py-1.5 dark:bg-gray-800"
                  >
                    {VALUATION_METHOD_LABELS[method] ?? method} :{" "}
                    {formatMoney(m.value)} ({m.count} lignes)
                  </span>
                ) : null,
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Article
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Méthode
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Entrepôt
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Lot
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      Qté
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      Coût u.
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      Valeur
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {report.lines.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Aucun stock valorisable pour ce périmètre.
                      </td>
                    </tr>
                  ) : (
                    report.lines.map((line, idx) => (
                      <tr
                        key={`${line.stockItemId}-${line.warehouseId}-${line.lotId}-${idx}`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium">{line.reference}</span>
                          <span className="text-gray-500">
                            {" "}
                            — {line.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {VALUATION_METHOD_LABELS[line.valuationMethod] ??
                            line.valuationMethod}
                        </td>
                        <td className="px-4 py-3">
                          {line.warehouseCode
                            ? `${line.warehouseCode} — ${line.warehouseName}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {line.lotNumber ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatMoney(line.qty)} {line.unit}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatMoney(line.unitCost)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatMoney(line.totalValue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        <section className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Taux de rotation
            </h2>
            <p className="text-sm text-gray-500">
              COGS (sorties vente) ÷ valeur moyenne du stock sur la période
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Du</Label>
              <Input
                type="date"
                value={turnoverFrom}
                onChange={(e) => setTurnoverFrom(e.target.value)}
              />
            </div>
            <div>
              <Label>Au</Label>
              <Input
                type="date"
                value={turnoverTo}
                onChange={(e) => setTurnoverTo(e.target.value)}
              />
            </div>
            <div className="flex items-end md:col-span-2">
              <Button variant="outline" onClick={applyTurnover}>
                Calculer le taux
              </Button>
            </div>
          </div>

          {turnoverQuery.isLoading && (
            <LoadingBlock label="Calcul du taux de rotation..." />
          )}
          {turnoverQuery.isError && (
            <ErrorState
              title="Impossible de calculer le taux"
              message="Vérifiez la période."
              onRetry={() => turnoverQuery.refetch()}
            />
          )}
          {turnover ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="COGS" value={formatMoney(turnover.cogs)} />
              <StatCard
                label="Valeur moyenne"
                value={formatMoney(turnover.averageStockValue)}
              />
              <StatCard
                label="Ouverture → Clôture"
                value={`${formatMoney(turnover.openingValue)} → ${formatMoney(turnover.closingValue)}`}
              />
              <StatCard
                label="Taux de rotation"
                value={
                  turnover.turnoverRate != null
                    ? `${turnover.turnoverRate.toFixed(2)}×`
                    : "—"
                }
                emphasis
              />
            </div>
          ) : null}
        </section>
      </div>
    </RequireStockAccess>
  );
}

function StatCard({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold ${
          emphasis ? "text-brand-600" : "text-gray-800 dark:text-white/90"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
