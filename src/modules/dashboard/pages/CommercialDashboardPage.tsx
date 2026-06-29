"use client";

import Link from "next/link";
import { useState } from "react";
import BarChartOne from "@/components/charts/bar/BarChartOne";
import LineChartOne from "@/components/charts/line/LineChartOne";
import ComponentCard from "@/components/common/ComponentCard";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { DashboardPeriodFilter } from "../components/DashboardPeriodFilter";
import { KpiCard } from "../components/KpiCard";
import { RequireDashboardAccess } from "../components/RequireDashboardAccess";
import { useCommercialDashboard } from "../hooks/useDashboard";
import {
  formatDashboardMoney,
  formatDashboardMoneyPrecise,
  formatDashboardPercent,
  formatPeriodLabel,
  getDefaultDashboardPeriod,
} from "../utils/dashboardFormatters";

function truncateLabel(value: string, max = 18) {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export default function CommercialDashboardPage() {
  const defaults = getDefaultDashboardPeriod();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [query, setQuery] = useState(defaults);

  const dashboardQuery = useCommercialDashboard(query);
  const dashboard = dashboardQuery.data;

  const variation = dashboard?.revenue.variationPercent ?? null;
  const variationTone =
    variation == null ? "default" : variation >= 0 ? "success" : "danger";

  const moneyTooltip = (value: number) => formatDashboardMoney(value);

  return (
    <RequireDashboardAccess>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Tableau de bord
            </h1>
            <p className="text-sm text-gray-500">
              Vue graphique de l&apos;activité commerciale (UC-08).
            </p>
            {dashboard ? (
              <p className="mt-1 text-xs text-gray-400">
                Période : {formatPeriodLabel(dashboard.period.from, dashboard.period.to)}
              </p>
            ) : null}
          </div>
          <Link
            href="/rapports"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Voir les rapports détaillés
          </Link>
        </div>

        <DashboardPeriodFilter
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
          onSubmit={() => setQuery({ from, to })}
        />

        {dashboardQuery.isPending && !dashboardQuery.data && (
          <LoadingBlock label="Chargement du tableau de bord..." />
        )}

        {dashboardQuery.isError && (
          <ErrorState
            title="Échec du chargement"
            message="Impossible de charger les indicateurs commerciaux."
            onRetry={() => dashboardQuery.refetch()}
          />
        )}

        {dashboard ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Chiffre d'affaires HT"
                value={formatDashboardMoney(dashboard.revenue.revenueHt)}
              />
              <KpiCard
                label="Variation CA"
                value={formatDashboardPercent(variation)}
                tone={variationTone}
              />
              <KpiCard
                label="Impayés en retard"
                value={formatDashboardMoneyPrecise(dashboard.totalOverdueAmountTtc)}
                tone="danger"
              />
              <KpiCard
                label="Factures émises"
                value={String(dashboard.issuedInvoiceCount)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <ComponentCard
                title="Chiffre d'affaires HT"
                desc="Comparaison avec la même période N-1"
              >
                <BarChartOne
                  chartId="dashboard-revenue"
                  minWidth="100%"
                  height={220}
                  showLegend={false}
                  colors={["#1b3a6b", "#98a2b3"]}
                  categories={["Période", "N-1"]}
                  series={[
                    {
                      name: "CA HT",
                      data: [
                        dashboard.revenue.revenueHt,
                        dashboard.revenue.previousPeriodRevenueHt,
                      ],
                    },
                  ]}
                  tooltipFormatter={moneyTooltip}
                />
              </ComponentCard>

              <ComponentCard
                title="Balance âgée"
                desc="Montants TTC par tranche d'échéance"
              >
                <BarChartOne
                  chartId="dashboard-aged-balance"
                  minWidth="100%"
                  height={220}
                  showLegend={false}
                  categories={dashboard.agedBalance.map((bucket) => bucket.label)}
                  series={[
                    {
                      name: "Montant TTC",
                      data: dashboard.agedBalance.map((bucket) => bucket.amountTtc),
                    },
                  ]}
                  tooltipFormatter={(value) => formatDashboardMoneyPrecise(value)}
                />
              </ComponentCard>
            </div>

            <ComponentCard
              title="Évolution des meilleurs clients"
              desc="CA HT des clients les plus actifs sur la période"
            >
              <LineChartOne
                chartId="dashboard-top-clients"
                minWidth="100%"
                height={280}
                showLegend={false}
                categories={dashboard.topClients.map((client) =>
                  truncateLabel(client.clientName)
                )}
                series={[
                  {
                    name: "CA HT",
                    data: dashboard.topClients.map((client) => client.revenueHt),
                  },
                ]}
                tooltipFormatter={moneyTooltip}
              />
            </ComponentCard>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <ComponentCard title="Top clients" desc="Par chiffre d'affaires HT">
                <BarChartOne
                  chartId="dashboard-clients-bar"
                  minWidth="100%"
                  height={220}
                  showLegend={false}
                  categories={dashboard.topClients.map((client) =>
                    truncateLabel(client.clientName)
                  )}
                  series={[
                    {
                      name: "CA HT",
                      data: dashboard.topClients.map((client) => client.revenueHt),
                    },
                  ]}
                  tooltipFormatter={moneyTooltip}
                />
              </ComponentCard>

              <ComponentCard title="Top articles" desc="Par chiffre d'affaires HT">
                <BarChartOne
                  chartId="dashboard-articles-bar"
                  minWidth="100%"
                  height={220}
                  showLegend={false}
                  colors={["#9CB9FF"]}
                  categories={dashboard.topArticles.map((article) =>
                    truncateLabel(article.label)
                  )}
                  series={[
                    {
                      name: "CA HT",
                      data: dashboard.topArticles.map((article) => article.revenueHt),
                    },
                  ]}
                  tooltipFormatter={moneyTooltip}
                />
              </ComponentCard>
            </div>

            <ComponentCard
              title="Échéances à venir (J+7)"
              desc="Montants dus par facture"
            >
              <BarChartOne
                chartId="dashboard-upcoming-due"
                minWidth="100%"
                height={240}
                showLegend={false}
                colors={["#f59e0b"]}
                categories={dashboard.upcomingDueInvoices.map((invoice) =>
                  truncateLabel(invoice.number)
                )}
                series={[
                  {
                    name: "Montant dû",
                    data: dashboard.upcomingDueInvoices.map(
                      (invoice) => invoice.amountDue
                    ),
                  },
                ]}
                tooltipFormatter={(value) => formatDashboardMoneyPrecise(value)}
              />
            </ComponentCard>
          </>
        ) : null}
      </div>
    </RequireDashboardAccess>
  );
}
