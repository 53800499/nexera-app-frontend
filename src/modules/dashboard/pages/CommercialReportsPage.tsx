"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ErrorState,
  LoadingBlock,
} from "@/shared/components/feedback";
import { AgedBalancePanel } from "../components/AgedBalancePanel";
import { DashboardPeriodFilter } from "../components/DashboardPeriodFilter";
import {
  TopArticlesTable,
  TopClientsTable,
} from "../components/DashboardRankings";
import { KpiCard } from "../components/KpiCard";
import { RequireDashboardAccess } from "../components/RequireDashboardAccess";
import { UpcomingDueInvoicesTable } from "../components/UpcomingDueInvoicesTable";
import { useCommercialDashboard } from "../hooks/useDashboard";
import {
  formatDashboardMoney,
  formatDashboardMoneyPrecise,
  formatDashboardPercent,
  formatPeriodLabel,
  getDefaultDashboardPeriod,
} from "../utils/dashboardFormatters";

export default function CommercialReportsPage() {
  const defaults = getDefaultDashboardPeriod();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [query, setQuery] = useState(defaults);

  const dashboardQuery = useCommercialDashboard(query);
  const dashboard = dashboardQuery.data;

  const variation = dashboard?.revenue.variationPercent ?? null;
  const variationTone =
    variation == null ? "default" : variation >= 0 ? "success" : "danger";

  return (
    <RequireDashboardAccess>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Rapports commerciaux
            </h1>
            <p className="text-sm text-gray-500">
              Analyse détaillée du chiffre d&apos;affaires, des clients et des articles.
            </p>
            {dashboard ? (
              <p className="mt-1 text-xs text-gray-400">
                Période : {formatPeriodLabel(dashboard.period.from, dashboard.period.to)}
              </p>
            ) : null}
          </div>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Tableau de bord
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
          <LoadingBlock label="Chargement des rapports..." />
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <KpiCard
                label="Chiffre d'affaires HT"
                value={formatDashboardMoney(dashboard.revenue.revenueHt)}
                hint={`N-1 : ${formatDashboardMoney(dashboard.revenue.previousPeriodRevenueHt)}`}
              />
              <KpiCard
                label="Variation CA"
                value={formatDashboardPercent(variation)}
                tone={variationTone}
              />
              <KpiCard
                label="Factures émises"
                value={String(dashboard.issuedInvoiceCount)}
              />
              <KpiCard
                label="Impayés en retard"
                value={formatDashboardMoneyPrecise(dashboard.totalOverdueAmountTtc)}
                tone="danger"
              />
              <KpiCard
                label="Conversion devis"
                value={
                  dashboard.quotationConversionRate != null
                    ? `${dashboard.quotationConversionRate.toFixed(1)} %`
                    : "—"
                }
                hint="Devis convertis / envoyés"
              />
            </div>

            <section className="space-y-3">
              <h2 className="font-medium">Balance âgée</h2>
              <AgedBalancePanel
                buckets={dashboard.agedBalance}
                totalOverdueAmountTtc={dashboard.totalOverdueAmountTtc}
              />
            </section>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <TopClientsTable clients={dashboard.topClients} />
              <TopArticlesTable articles={dashboard.topArticles} />
            </div>

            <UpcomingDueInvoicesTable invoices={dashboard.upcomingDueInvoices} />
          </>
        ) : null}
      </div>
    </RequireDashboardAccess>
  );
}
