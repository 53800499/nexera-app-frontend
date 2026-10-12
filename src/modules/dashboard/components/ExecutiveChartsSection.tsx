"use client";

import React, { useState } from "react";
import BarChartOne from "@/components/charts/bar/BarChartOne";
import LineChartOne from "@/components/charts/line/LineChartOne";
import ComponentCard from "@/components/common/ComponentCard";
import type { AgedBalanceBucket, RevenueKpi } from "../types/dashboard.types";
import { formatDashboardMoney, formatDashboardMoneyPrecise } from "../utils/dashboardFormatters";

interface ExecutiveChartsSectionProps {
  revenue: RevenueKpi;
  agedBalance: AgedBalanceBucket[];
  totalOverdueAmountTtc: number;
}

export function ExecutiveChartsSection({
  revenue,
  agedBalance,
  totalOverdueAmountTtc,
}: ExecutiveChartsSectionProps) {
  const [revenueChartType, setRevenueChartType] = useState<"area" | "bar">("area");

  const moneyTooltip = (value: number) => formatDashboardMoney(value);
  const preciseMoneyTooltip = (value: number) => formatDashboardMoneyPrecise(value);

  // Data for revenue chart
  const revenueCategories = ["Période Sélectionnée", "Même Période (N-1)"];
  const revenueSeries = [
    {
      name: "Chiffre d'Affaires HT",
      data: [revenue.revenueHt, revenue.previousPeriodRevenueHt],
    },
  ];

  // Data for aged balance chart
  const agedCategories = agedBalance.map((b) => b.label);
  const agedSeries = [
    {
      name: "Montant TTC échu",
      data: agedBalance.map((b) => b.amountTtc),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {/* 1. Évolution et comparatif du CA HT */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Performance Chiffre d&apos;Affaires HT
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Comparaison directe avec la même période de l&apos;exercice N-1
            </p>
          </div>

          <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setRevenueChartType("area")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                revenueChartType === "area"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Courbe
            </button>
            <button
              type="button"
              onClick={() => setRevenueChartType("bar")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                revenueChartType === "bar"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Histogramme
            </button>
          </div>
        </div>

        {/* Legend pills */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-brand-500" />
            <span className="text-gray-600 dark:text-gray-300">
              Période actuelle : <strong>{formatDashboardMoney(revenue.revenueHt)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-slate-400" />
            <span className="text-gray-600 dark:text-gray-300">
              Période N-1 : <strong>{formatDashboardMoney(revenue.previousPeriodRevenueHt)}</strong>
            </span>
          </div>

          {revenue.variationPercent != null && (
            <span
              className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold ${
                revenue.variationPercent >= 0
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
              }`}
            >
              {revenue.variationPercent >= 0 ? "+" : ""}
              {revenue.variationPercent.toFixed(1)} % vs N-1
            </span>
          )}
        </div>

        {/* Chart View */}
        <div className="mt-4">
          {revenueChartType === "area" ? (
            <LineChartOne
              chartId="cockpit-revenue-area"
              minWidth="100%"
              height={260}
              showLegend={false}
              colors={["#1b3a6b"]}
              categories={revenueCategories}
              series={revenueSeries}
              tooltipFormatter={moneyTooltip}
            />
          ) : (
            <BarChartOne
              chartId="cockpit-revenue-bar"
              minWidth="100%"
              height={260}
              showLegend={false}
              colors={["#1b3a6b", "#94a3b8"]}
              categories={revenueCategories}
              series={revenueSeries}
              tooltipFormatter={moneyTooltip}
            />
          )}
        </div>
      </div>

      {/* 2. Structure de la Balance Âgée */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Structure de la Balance Âgée des Créances
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Exposition au risque de retard par tranche d&apos;échéance
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
            <span>Total en retard :</span>
            <span>{formatDashboardMoneyPrecise(totalOverdueAmountTtc)}</span>
          </div>
        </div>

        {/* Bucket overview badges */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 text-center">
          {agedBalance.map((bucket, i) => (
            <div
              key={bucket.label}
              className="rounded-xl border border-gray-100 bg-gray-50/70 p-2.5 dark:border-gray-800 dark:bg-gray-850"
            >
              <p className="text-[11px] font-medium text-gray-500">{bucket.label}</p>
              <p className="mt-1 text-xs font-bold text-gray-900 dark:text-white">
                {formatDashboardMoney(bucket.amountTtc)}
              </p>
              <p className="text-[10px] text-gray-400">
                {bucket.invoiceCount} facture(s)
              </p>
            </div>
          ))}
        </div>

        {/* Chart View */}
        <div className="mt-4">
          <BarChartOne
            chartId="cockpit-aged-balance-bar"
            minWidth="100%"
            height={240}
            showLegend={false}
            colors={["#f59e0b"]}
            categories={agedCategories}
            series={agedSeries}
            tooltipFormatter={preciseMoneyTooltip}
          />
        </div>
      </div>
    </div>
  );
}
