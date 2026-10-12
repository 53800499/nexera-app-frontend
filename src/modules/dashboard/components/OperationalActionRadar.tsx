"use client";

import Link from "next/link";
import React from "react";
import type { UpcomingDueInvoice } from "../types/dashboard.types";
import type { ExecutiveAuxiliaryMetrics } from "../hooks/useExecutiveAuxiliaryMetrics";
import { formatDashboardDate, formatDashboardMoneyPrecise } from "../utils/dashboardFormatters";

interface OperationalActionRadarProps {
  upcomingInvoices: UpcomingDueInvoice[];
  metrics: ExecutiveAuxiliaryMetrics;
}

export function OperationalActionRadar({
  upcomingInvoices,
  metrics,
}: OperationalActionRadarProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Factures à échéance J+7 */}
      <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
        <div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Échéances Imminentes (J+7)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Factures clients à encaisser sous 7 jours
                </p>
              </div>
            </div>

            <Link
              href="/factures"
              className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              Toutes les factures →
            </Link>
          </div>

          <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
            {upcomingInvoices.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Aucune facture en risque d&apos;échéance immédiate
                </p>
                <p className="text-xs text-gray-400">
                  Toutes les factures à venir sont dans les délais contractuels.
                </p>
              </div>
            ) : (
              upcomingInvoices.slice(0, 5).map((inv) => {
                const isOverdue = inv.daysUntilDue < 0;
                const isDueToday = inv.daysUntilDue === 0;
                const isUrgent = inv.daysUntilDue <= 2;

                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between py-3 transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-850/50"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                          isOverdue
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                            : isDueToday
                            ? "bg-amber-100 text-amber-800 animate-pulse dark:bg-amber-500/20 dark:text-amber-300"
                            : isUrgent
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {isOverdue
                          ? `Échu (${Math.abs(inv.daysUntilDue)}j)`
                          : isDueToday
                          ? "Aujourd'hui"
                          : `J+${inv.daysUntilDue}`}
                      </span>

                      <div>
                        <Link
                          href={`/factures/${inv.id}`}
                          className="text-xs font-bold text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                        >
                          {inv.number}
                        </Link>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[140px] sm:max-w-[200px]">
                          {inv.clientName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          {formatDashboardMoneyPrecise(inv.amountDue)}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Échéance : {formatDashboardDate(inv.dueDate)}
                        </p>
                      </div>

                      <Link
                        href={`/encaissements/nouveau?invoiceId=${inv.id}`}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                        title="Enregistrer l'encaissement"
                      >
                        Encaisser
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {upcomingInvoices.length > 5 && (
          <div className="border-t border-gray-100 pt-3 text-center dark:border-gray-800">
            <Link
              href="/encaissements/balance-agee"
              className="text-xs font-medium text-gray-500 hover:text-brand-600 dark:text-gray-400"
            >
              + {upcomingInvoices.length - 5} autres factures dans la balance âgée
            </Link>
          </div>
        )}
      </div>

      {/* 2. Centre de Conformité & Alertes Multi-Modules */}
      <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
        <div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Radar de Conformité & Risques
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Points d&apos;attention SYSCOHADA, Stocks & Fiscalité
                </p>
              </div>
            </div>

            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              Système Supervisé
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {/* Alerte Stock */}
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-850/40">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    metrics.stock.openAlertsCount > 0
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    Disponibilité des Stocks & Approvisionnement
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {metrics.stock.openAlertsCount > 0
                      ? `${metrics.stock.openAlertsCount} article(s) en alerte de seuil ou rupture`
                      : "Niveaux de stocks conformes aux seuils de sécurité"}
                  </p>
                </div>
              </div>

              <Link
                href="/stock/alertes"
                className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-white dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Gérer
              </Link>
            </div>

            {/* Alerte Comptabilité SYSCOHADA */}
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-850/40">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    metrics.comptabilite.ecrituresEnAttenteCount > 0
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    Contrôle Interne SYSCOHADA (Visa EF-008)
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {metrics.comptabilite.ecrituresEnAttenteCount > 0
                      ? `${metrics.comptabilite.ecrituresEnAttenteCount} écriture(s) en attente d'approbation responsable`
                      : "Toutes les écritures du journal sont validées"}
                  </p>
                </div>
              </div>

              <Link
                href="/comptabilite/validation"
                className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-white dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Valider
              </Link>
            </div>

            {/* Alerte Fiscalité DGI */}
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-850/40">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    Échéancier Fiscal DGI & Déclarations
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {metrics.fiscalite.prochainesEcheancesCount > 0
                      ? `${metrics.fiscalite.prochainesEcheancesCount} déclaration(s) fiscale(s) prévues ce mois`
                      : "Aucune échéance fiscale urgente sous 15 jours"}
                  </p>
                </div>
              </div>

              <Link
                href="/fiscalite/calendrier"
                className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-white dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Calendrier
              </Link>
            </div>

            {/* Notes de frais & RH */}
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-850/40">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    Workflow Social & Dépenses Opérationnelles
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {metrics.notesFrais.rapportsEnAttenteCount > 0
                      ? `${metrics.notesFrais.rapportsEnAttenteCount} note(s) de frais à valider`
                      : "Paie et notes de frais à jour"}
                  </p>
                </div>
              </div>

              <Link
                href="/notes-frais/validation"
                className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-white dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Approuver
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-3 text-right dark:border-gray-800">
          <Link
            href="/cabinet"
            className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            Accès Espace Supervision & Cabinet →
          </Link>
        </div>
      </div>
    </div>
  );
}
