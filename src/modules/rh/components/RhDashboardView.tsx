"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { rhApi } from "../services/rhApi.service";
import type { RhDashboardSummary } from "../types/rh.types";
import { GroupIcon, DollarLineIcon, BoxIcon, CalenderIcon } from "@/icons";
import { getPayrollCycleStatusBadge } from "../utils/rhFormatters";
import { ErrorState } from "@/shared/components/feedback";

export const RhDashboardView: React.FC = () => {
  const [data, setData] = useState<RhDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await rhApi.getDashboardSummary();
      setData(res);
    } catch (err: any) {
      console.warn("Erreur chargement dashboard RH:", err?.message || err);
      setError(
        err?.message ||
          "Serveur ou réseau indisponible. Impossible de charger le tableau de bord RH.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(val || 0);

  if (loading && !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="py-8">
        <ErrorState
          title="Serveur ou réseau indisponible"
          message={error}
          onRetry={fetchDashboard}
        />
      </div>
    );
  }

  const kpi = data?.kpi;
  const alertes = data?.alertes;
  const dernierCycle = data?.dernierCycle;

  return (
    <div className="space-y-6">
      {/* En-tête avec raccourcis */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ressources Humaines & Paie
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Conformité Code du Travail & CGI 2026 (Bénin / Zone UEMOA - SYSCOHADA)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/rh/employes"
            className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-600 transition-colors"
          >
            + Nouveau Salarié
          </Link>
          <Link
            href="/rh/paie"
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cycles de Paie
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800 dark:border-warning-900/50 dark:bg-warning-950/50 dark:text-warning-300">
          <span>{error}</span>
          <button
            onClick={fetchDashboard}
            className="ml-4 font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Réactualiser
          </button>
        </div>
      )}

      {/* Cartes KPI Principales */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Effectifs */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Effectif Total Actif
            </span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <GroupIcon className="h-6 w-6 shrink-0" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {kpi?.totalActifs || 0}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              / {kpi?.totalEmployes || 0} inscrits
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {kpi?.totalContratsActifs || 0} contrats actifs en cours
          </div>
        </div>

        {/* Masse Salariale */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Masse Salariale Brute
            </span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <DollarLineIcon className="h-5 w-5 shrink-0" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(kpi?.masseSalarialeBrute)}
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Net à payer : <strong className="text-gray-900 dark:text-white">{formatCurrency(kpi?.totalNetAPayer)}</strong>
          </div>
        </div>

        {/* Charges Sociales & Fiscales */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Cotisations & Impôts (ITS/CNSS)
            </span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <BoxIcon className="h-5 w-5 shrink-0" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency((kpi?.totalIts || 0) + (kpi?.totalCnss || 0) + (kpi?.totalVps || 0))}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>ITS: {formatCurrency(kpi?.totalIts)}</span>
            <span>VPS (4%): {formatCurrency(kpi?.totalVps)}</span>
          </div>
        </div>

        {/* Congés & Absences */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Congés & Absences
            </span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <CalenderIcon className="h-5 w-5 shrink-0" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {kpi?.absencesEnAttente || 0}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              en attente de validation
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {kpi?.employesEnCongeAujourdhui || 0} salarié(s) en congé aujourd’hui
          </div>
        </div>
      </div>

      {/* Alertes Échéances Contrats & Essais */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contrats à terme sous 30 jours */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              Contrats à terme sous 30 jours ({alertes?.contratsExpirantBientot.length || 0})
            </h2>
            <Link href="/rh/contrats" className="text-xs font-medium text-brand-500 hover:underline">
              Gérer
            </Link>
          </div>

          {alertes?.contratsExpirantBientot && alertes.contratsExpirantBientot.length > 0 ? (
            <div className="space-y-3">
              {alertes.contratsExpirantBientot.map((c) => (
                <div
                  key={c.contratId}
                  className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/50 p-3 dark:border-amber-950/50 dark:bg-amber-950/20"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {c.employeNom}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Matricule: {c.matricule} • N° {c.numeroContrat}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                      Fin le {new Date(c.dateFinPrevue).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
              Aucun contrat n'arrive à expiration dans les 30 prochains jours.
            </p>
          )}
        </div>

        {/* Périodes d'essai à échéance */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
              Périodes d’essai à échéance ({alertes?.essaisExpirantBientot.length || 0})
            </h2>
            <Link href="/rh/contrats" className="text-xs font-medium text-brand-500 hover:underline">
              Gérer
            </Link>
          </div>

          {alertes?.essaisExpirantBientot && alertes.essaisExpirantBientot.length > 0 ? (
            <div className="space-y-3">
              {alertes.essaisExpirantBientot.map((e) => (
                <div
                  key={e.contratId}
                  className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-950/50 dark:bg-blue-950/20"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {e.employeNom}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Matricule: {e.matricule} • {e.estRenouvele ? "2ème essai (renouvelé)" : "1er essai"}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      Échéance: {new Date(e.dateFinEssai).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
              Aucune période d’essai n’arrive à échéance imminente.
            </p>
          )}
        </div>
      </div>

      {/* Dernier Cycle de Paie & Répartitions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Statut Paie */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Dernier Cycle de Paie
          </h2>
          {dernierCycle ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Période</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {dernierCycle.mois.toString().padStart(2, "0")} / {dernierCycle.annee}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Code Cycle</span>
                <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
                  {dernierCycle.codeCycle}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Statut</span>
                {(() => {
                  const sBadge = getPayrollCycleStatusBadge(dernierCycle.statut);
                  return (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${sBadge.badgeClass}`}>
                      {sBadge.label}
                    </span>
                  );
                })()}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Bulletins générés</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {dernierCycle.nombreBulletins} salariés
                </span>
              </div>
              <Link
                href={`/rh/paie/${dernierCycle.id}`}
                className="mt-2 block w-full rounded-xl bg-brand-500/10 py-2.5 text-center text-sm font-medium text-brand-600 hover:bg-brand-500/20 dark:bg-brand-400/10 dark:text-brand-400"
              >
                Ouvrir le cycle de paie →
              </Link>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Aucun cycle de paie ouvert.</p>
          )}
        </div>

        {/* Répartition par Département */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Répartition des Effectifs par Département
          </h2>
          {data?.repartition.parDepartement && data.repartition.parDepartement.length > 0 ? (
            <div className="space-y-4">
              {data.repartition.parDepartement.map((dept) => {
                const percentage = Math.round(
                  (dept.count / Math.max(1, kpi?.totalActifs || 1)) * 100,
                );
                return (
                  <div key={dept.departementId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {dept.libelle}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {dept.count} salarié(s) ({percentage} %)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Aucun département configuré ou affecté.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
