"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useNdfDashboard, useNdfIa, useRapportsFrais } from "../hooks/useNotesFrais";
import {
  DollarLineIcon,
  DocsIcon,
  CalenderIcon,
  FileIcon,
  GroupIcon,
} from "@/icons";
import { IconShieldAlert, IconAlertTriangle } from "./NdfIcons";

export const NdfDashboardView: React.FC = () => {
  const { stats, isLoading, refetch } = useNdfDashboard();
  const { anomalies, traiterAnomalie, isResolvingAnomalie } = useNdfIa();
  const [selectedAnomalie, setSelectedAnomalie] = useState<string | null>(null);

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête & Actions rapides */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notes de Frais & Déplacements (M5)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestion intelligente des dépenses, barèmes fiscaux Bénin 2026, détection IA et intégration SYSCOHADA / Paie
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/notes-frais/mes-depenses"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-brand-600 transition"
          >
            <span>+ Saisir une dépense</span>
          </Link>
          <Link
            href="/notes-frais/rapports"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition"
          >
            <span>Mes Rapports</span>
          </Link>
          <Link
            href="/notes-frais/validation"
            className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300 transition"
          >
            <span>À Valider ({stats?.nombreRapportsEnAttenteValidation || 0})</span>
          </Link>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Dépenses du mois
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <DollarLineIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats?.totalDepensesMoisEnCours)}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Total cumulé engagé ce mois
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              En attente de validation
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <DocsIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats?.nombreRapportsEnAttenteValidation || 0}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Rapports soumis au circuit d'approbation
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              À rembourser
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <DollarLineIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(stats?.montantEnAttenteRemboursement)}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Rapports validés prêts pour virement/paie
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Alertes & Anomalies IA
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
              <FileIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats?.nombreAnomaliesDetectees || 0}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Doublons, seuil espèces ou plafonds
            </p>
          </div>
        </div>
      </div>

      {/* Alertes d'anomalies en temps réel */}
      {anomalies && anomalies.filter((a) => a.statut === "DETECTEE").length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5 dark:border-rose-900/50 dark:bg-rose-950/20">
          <div className="flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 font-semibold text-rose-900 dark:text-rose-200">
              <IconAlertTriangle className="size-4 text-rose-600 dark:text-rose-400" />
              <span>Anomalies détectées par le moteur d'Intelligence Artificielle</span>
            </h3>
            <span className="text-xs font-medium text-rose-700 dark:text-rose-300">
              {anomalies.filter((a) => a.statut === "DETECTEE").length} alerte(s) à traiter
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {anomalies
              .filter((a) => a.statut === "DETECTEE")
              .slice(0, 3)
              .map((anom) => (
                <div
                  key={anom.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg bg-white p-3 shadow-sm dark:bg-gray-900 gap-2 border border-rose-100 dark:border-rose-900/30"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
                        {anom.regleDetection?.typeRegle || "RISQUE"}
                      </span>
                      <span className="text-xs text-gray-500">
                        Score risque: {anom.scoreRisque}%
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">
                      {anom.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        traiterAnomalie({
                          id: anom.id,
                          statut: "ECARTEE_FAUX_POSITIF",
                          motif: "Justifié par l'utilisateur",
                        })
                      }
                      disabled={isResolvingAnomalie}
                      className="rounded border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Écarter
                    </button>
                    <button
                      onClick={() =>
                        traiterAnomalie({
                          id: anom.id,
                          statut: "CONFIRMEE",
                          motif: "Anomalie confirmée",
                        })
                      }
                      disabled={isResolvingAnomalie}
                      className="rounded bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-700"
                    >
                      Confirmer le blocage
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Grid 2 colonnes : Répartition par Catégorie & 5 Dernières dépenses */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Répartition par catégorie */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-1">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Répartition des Frais par Catégorie
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Dépenses du mois en cours
          </p>

          <div className="mt-4 space-y-4">
            {stats?.repartitionParCategorie && stats.repartitionParCategorie.length > 0 ? (
              stats.repartitionParCategorie.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.categorie}
                    </span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {formatCurrency(item.montant)} ({item.pourcentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${Math.min(item.pourcentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-gray-400">
                Aucune dépense enregistrée ce mois
              </div>
            )}
          </div>
        </div>

        {/* Dernières dépenses */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Dernières Dépenses Enregistrées
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Flux en temps réel des reçus et justificatifs
              </p>
            </div>
            <Link
              href="/notes-frais/mes-depenses"
              className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Voir tout $\rightarrow$
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <tr>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Salarié</th>
                  <th className="pb-3 font-semibold">Catégorie</th>
                  <th className="pb-3 font-semibold">Commerçant</th>
                  <th className="pb-3 font-semibold text-right">Montant TTC</th>
                  <th className="pb-3 font-semibold text-center">Paiement</th>
                  <th className="pb-3 font-semibold text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {stats?.dernieresDepenses && stats.dernieresDepenses.length > 0 ? (
                  stats.dernieresDepenses.map((dep) => (
                    <tr key={dep.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <td className="py-3 text-gray-600 dark:text-gray-300">
                        {new Date(dep.dateDepense).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-3 font-medium text-gray-900 dark:text-white">
                        {dep.rapportFrais?.employe
                          ? `${dep.rapportFrais.employe.nom} ${dep.rapportFrais.employe.prenoms}`
                          : "—"}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-300">
                        {dep.categorieDepense?.libelle || "Frais"}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {dep.fournisseurLibelle || "—"}
                      </td>
                      <td className="py-3 text-right font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(dep.montantTtc)}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                            dep.modePaiement === "ESPECES"
                              ? dep.depasseSeuilEspeceLegal
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          }`}
                        >
                          {dep.modePaiement === "ESPECES"
                            ? "Espèces"
                            : dep.modePaiement === "CARTE_AFFAIRE"
                            ? "Carte Affaire"
                            : "Carte Perso"}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            dep.statut === "VALIDEE"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : dep.statut === "REJETEE"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {dep.statut}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-400">
                      Aucune dépense récente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
