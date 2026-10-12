"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ErrorState, LoadingBlock } from "@/shared/components/feedback";
import { useCommercialDashboard } from "../hooks/useDashboard";
import { useExecutiveAuxiliaryMetrics } from "../hooks/useExecutiveAuxiliaryMetrics";
import { RequireDashboardAccess } from "../components/RequireDashboardAccess";
import { ExecutiveCockpitBanner } from "../components/ExecutiveCockpitBanner";
import { DashboardPeriodPresets, type PeriodRange } from "../components/DashboardPeriodPresets";
import { CockpitTabs, type CockpitTabKey } from "../components/CockpitTabs";
import { ExecutiveKpiCard } from "../components/ExecutiveKpiCard";
import { ExecutiveChartsSection } from "../components/ExecutiveChartsSection";
import { OperationalActionRadar } from "../components/OperationalActionRadar";
import { TopPerformersPanel } from "../components/TopPerformersPanel";
import { ModuleEcosystemGrid } from "../components/ModuleEcosystemGrid";
import {
  formatDashboardMoney,
  formatDashboardMoneyPrecise,
  formatDashboardPercent,
  getDefaultDashboardPeriod,
} from "../utils/dashboardFormatters";

export default function CommercialDashboardPage() {
  const defaults = getDefaultDashboardPeriod();
  const [period, setPeriod] = useState<PeriodRange>(defaults);
  const [activeTab, setActiveTab] = useState<CockpitTabKey>("overview");

  // Primary commercial dashboard query (UC-08)
  const dashboardQuery = useCommercialDashboard(period);
  const dashboard = dashboardQuery.data;

  // Supplementary cross-module executive metrics
  const { metrics, isLoading: isAuxLoading, refetchAll: refetchAux } =
    useExecutiveAuxiliaryMetrics();

  const handleRefreshAll = () => {
    dashboardQuery.refetch();
    refetchAux();
  };

  const isRefreshing = dashboardQuery.isFetching || isAuxLoading;

  const variation = dashboard?.revenue.variationPercent ?? null;
  const isVariationPositive = variation == null ? null : variation >= 0;

  return (
    <RequireDashboardAccess>
      <div className="space-y-6">
        {/* 1. Master Executive Cockpit Banner */}
        <ExecutiveCockpitBanner
          onRefresh={handleRefreshAll}
          isRefreshing={isRefreshing}
        />

        {/* 2. Intelligent Period Filter Toolbar */}
        <DashboardPeriodPresets
          currentFrom={period.from}
          currentTo={period.to}
          onApply={setPeriod}
        />

        {/* 3. Cockpit Perspective Switcher Tabs */}
        <CockpitTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          badgeCounts={{
            overdueInvoices:
              dashboard?.totalOverdueAmountTtc && dashboard.totalOverdueAmountTtc > 0
                ? 1
                : 0,
            pendingEcritures: metrics.comptabilite.ecrituresEnAttenteCount,
            stockAlerts: metrics.stock.openAlertsCount,
          }}
        />

        {/* Loading & Error States */}
        {dashboardQuery.isPending && !dashboardQuery.data && (
          <div className="py-12">
            <LoadingBlock label="Chargement des indicateurs du tableau de bord exécutif..." />
          </div>
        )}

        {dashboardQuery.isError && (
          <ErrorState
            title="Échec de synchronisation du tableau de bord"
            message="Impossible de charger les indicateurs commerciaux et financiers. Veuillez vérifier votre connexion ou vos droits d'accès."
            onRetry={() => handleRefreshAll()}
          />
        )}

        {dashboard ? (
          <>
            {/* 4. Adaptive Executive KPI Grid */}
            {(activeTab === "overview" || activeTab === "commercial") && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* KPI 1 : Chiffre d'Affaires HT */}
                <ExecutiveKpiCard
                  label="Chiffre d'Affaires HT"
                  value={formatDashboardMoney(dashboard.revenue.revenueHt)}
                  subtitle={`N-1 : ${formatDashboardMoney(dashboard.revenue.previousPeriodRevenueHt)}`}
                  theme="primary"
                  href="/factures"
                  trend={{
                    value: formatDashboardPercent(variation),
                    isPositive: isVariationPositive,
                    comparisonText: "vs N-1",
                  }}
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                />

                {/* KPI 2 : Impayés Clients en Retard */}
                <ExecutiveKpiCard
                  label="Créances & Impayés en Retard"
                  value={formatDashboardMoneyPrecise(dashboard.totalOverdueAmountTtc)}
                  subtitle="Factures échues non recouvrées"
                  theme={dashboard.totalOverdueAmountTtc > 0 ? "rose" : "emerald"}
                  href="/encaissements/balance-agee"
                  badge={
                    dashboard.totalOverdueAmountTtc > 0
                      ? { text: "Action Recommandée", variant: "danger" }
                      : { text: "Aucun Retard", variant: "success" }
                  }
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  }
                />

                {/* KPI 3 : Factures Émises & e-MECeF */}
                <ExecutiveKpiCard
                  label="Factures Émises"
                  value={String(dashboard.issuedInvoiceCount)}
                  subtitle="Sur la période sélectionnée"
                  theme="indigo"
                  href="/factures"
                  badge={{ text: "Conforme e-MECeF", variant: "info" }}
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  }
                />

                {/* KPI 4 : Taux de Conversion Devis */}
                <ExecutiveKpiCard
                  label="Transformation Commerciale"
                  value={
                    dashboard.quotationConversionRate != null
                      ? `${(dashboard.quotationConversionRate * 100).toFixed(1)} %`
                      : "—"
                  }
                  subtitle="Taux de conversion devis → factures"
                  theme="cyan"
                  href="/devis"
                  progress={
                    dashboard.quotationConversionRate != null
                      ? {
                          percent: dashboard.quotationConversionRate * 100,
                          label: "Efficacité Ventes",
                        }
                      : undefined
                  }
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  }
                />
              </div>
            )}

            {/* Supplementary Cross-Module KPI Grid for Overview & Finance & Operations */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* KPI 5 : Alertes Stocks & Ruptures */}
                <ExecutiveKpiCard
                  label="Gestion des Stocks"
                  value={
                    metrics.stock.openAlertsCount > 0
                      ? `${metrics.stock.openAlertsCount} alerte(s)`
                      : "Stock Optimal"
                  }
                  subtitle={
                    metrics.stock.pendingReplenishments > 0
                      ? `${metrics.stock.pendingReplenishments} réapprovisionnement(s) suggéré(s)`
                      : "Aucune rupture critique"
                  }
                  theme={metrics.stock.openAlertsCount > 0 ? "amber" : "emerald"}
                  href="/stock/alertes"
                  badge={
                    metrics.stock.openAlertsCount > 0
                      ? { text: "Seuil Atteint", variant: "warning" }
                      : { text: "Conforme", variant: "success" }
                  }
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  }
                />

                {/* KPI 6 : Fiscalité & TVA du Mois */}
                <ExecutiveKpiCard
                  label="Conformité Fiscale (TVA)"
                  value={
                    metrics.fiscalite.tvaNetteMois > 0
                      ? formatDashboardMoney(metrics.fiscalite.tvaNetteMois)
                      : metrics.fiscalite.creditTvaReporte > 0
                      ? `Crédit ${formatDashboardMoney(metrics.fiscalite.creditTvaReporte)}`
                      : "À déclarer"
                  }
                  subtitle={
                    metrics.fiscalite.prochainesEcheancesCount > 0
                      ? `${metrics.fiscalite.prochainesEcheancesCount} déclaration(s) ce mois`
                      : "Échéances DGI sous contrôle"
                  }
                  theme="purple"
                  href="/fiscalite/tva"
                  badge={{ text: "DGI Bénin", variant: "neutral" }}
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                      />
                    </svg>
                  }
                />

                {/* KPI 7 : Contrôle Interne SYSCOHADA (Visa EF-008) */}
                <ExecutiveKpiCard
                  label="Comptabilité SYSCOHADA"
                  value={
                    metrics.comptabilite.ecrituresEnAttenteCount > 0
                      ? `${metrics.comptabilite.ecrituresEnAttenteCount} en attente`
                      : "Journal Validé"
                  }
                  subtitle={
                    metrics.comptabilite.totalDebitEnAttente > 0
                      ? `Volume : ${formatDashboardMoney(metrics.comptabilite.totalDebitEnAttente)}`
                      : "Conforme AUDCIF 2017"
                  }
                  theme={metrics.comptabilite.ecrituresEnAttenteCount > 0 ? "indigo" : "emerald"}
                  href="/comptabilite/validation"
                  badge={
                    metrics.comptabilite.ecrituresEnAttenteCount > 0
                      ? { text: "Visa Requis", variant: "info" }
                      : { text: "Équilibré", variant: "success" }
                  }
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  }
                />

                {/* KPI 8 : RH, Paie & Notes de Frais */}
                <ExecutiveKpiCard
                  label="Capital Humain & Dépenses"
                  value={
                    metrics.rh.totalActifs > 0
                      ? `${metrics.rh.totalActifs} collaborateurs`
                      : "Équipe active"
                  }
                  subtitle={
                    metrics.notesFrais.rapportsEnAttenteCount > 0
                      ? `${metrics.notesFrais.rapportsEnAttenteCount} note(s) de frais à valider`
                      : metrics.rh.masseSalarialeBrute > 0
                      ? `Masse salariale : ${formatDashboardMoney(metrics.rh.masseSalarialeBrute)}`
                      : "Paie et absences à jour"
                  }
                  theme="emerald"
                  href="/rh"
                  badge={{ text: "Paie & Frais", variant: "neutral" }}
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  }
                />
              </div>
            )}

            {/* Finance Tab Specific KPIs */}
            {activeTab === "finance" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ExecutiveKpiCard
                  label="TVA Nette du Mois"
                  value={formatDashboardMoney(metrics.fiscalite.tvaNetteMois)}
                  subtitle="TVA collectée déduction faite de la déductible"
                  theme="purple"
                  href="/fiscalite/tva"
                  badge={{ text: "e-MECeF DGI", variant: "info" }}
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <ExecutiveKpiCard
                  label="Crédit TVA Reporté"
                  value={formatDashboardMoney(metrics.fiscalite.creditTvaReporte)}
                  subtitle="Report sur prochaines déclarations"
                  theme="emerald"
                  href="/fiscalite/tva"
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <ExecutiveKpiCard
                  label="Écritures en Attente de Visa"
                  value={`${metrics.comptabilite.ecrituresEnAttenteCount} écriture(s)`}
                  subtitle="Ségrégation des tâches EF-008"
                  theme="indigo"
                  href="/comptabilite/validation"
                  badge={metrics.comptabilite.ecrituresEnAttenteCount > 0 ? { text: "Action", variant: "warning" } : undefined}
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  }
                />
                <ExecutiveKpiCard
                  label="Échéancier Fiscal"
                  value={`${metrics.fiscalite.prochainesEcheancesCount} date(s) limite(s)`}
                  subtitle="Déclarations TVA, AIB, IS"
                  theme="amber"
                  href="/fiscalite/calendrier"
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>
            )}

            {/* Operations Tab Specific KPIs */}
            {activeTab === "operations" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ExecutiveKpiCard
                  label="Alertes Rupture & Stock"
                  value={`${metrics.stock.openAlertsCount} article(s)`}
                  subtitle="Seuil minimum ou rupture"
                  theme={metrics.stock.openAlertsCount > 0 ? "rose" : "emerald"}
                  href="/stock/alertes"
                  badge={metrics.stock.openAlertsCount > 0 ? { text: "Critique", variant: "danger" } : undefined}
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  }
                />
                <ExecutiveKpiCard
                  label="Réapprovisionnements"
                  value={`${metrics.stock.pendingReplenishments} proposition(s)`}
                  subtitle="En attente de validation achat"
                  theme="amber"
                  href="/stock/alertes"
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  }
                />
                <ExecutiveKpiCard
                  label="Masse Salariale Brute"
                  value={formatDashboardMoney(metrics.rh.masseSalarialeBrute)}
                  subtitle={`${metrics.rh.totalActifs} contrats actifs déclarés`}
                  theme="emerald"
                  href="/rh/paie"
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                />
                <ExecutiveKpiCard
                  label="Notes de Frais à Valider"
                  value={`${metrics.notesFrais.rapportsEnAttenteCount} rapport(s)`}
                  subtitle={
                    metrics.notesFrais.montantEnAttente > 0
                      ? `Remboursement : ${formatDashboardMoney(metrics.notesFrais.montantEnAttente)}`
                      : "Aucun débours en attente"
                  }
                  theme="teal"
                  href="/notes-frais/validation"
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                    </svg>
                  }
                />
              </div>
            )}

            {/* 5. Executive Charts & Balance Âgée */}
            <ExecutiveChartsSection
              revenue={dashboard.revenue}
              agedBalance={dashboard.agedBalance}
              totalOverdueAmountTtc={dashboard.totalOverdueAmountTtc}
            />

            {/* 6. Operational Radar: Upcoming J+7 Invoices & Multi-Module Compliance */}
            <OperationalActionRadar
              upcomingInvoices={dashboard.upcomingDueInvoices}
              metrics={metrics}
            />

            {/* 7. Top Performers Panel: Top Clients & Top Articles */}
            <TopPerformersPanel
              topClients={dashboard.topClients}
              topArticles={dashboard.topArticles}
              totalRevenueHt={dashboard.revenue.revenueHt}
            />

            {/* 8. Full ERP Ecosystem Navigation Grid */}
            <ModuleEcosystemGrid />
          </>
        ) : null}
      </div>
    </RequireDashboardAccess>
  );
}
