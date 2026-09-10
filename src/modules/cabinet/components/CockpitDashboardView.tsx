"use client";

import React from "react";
import Link from "next/link";
import { useCabinetCockpit } from "../hooks/useCabinetCockpit";
import { ErrorState, LoadingBlock } from "@/shared/components/feedback";
import { RequireCabinetAccess } from "./RequireCabinetAccess";

export function CockpitDashboardView() {
  const { cockpitQuery } = useCabinetCockpit();
  const data = cockpitQuery.data;

  if (cockpitQuery.isLoading) {
    return <LoadingBlock label="Chargement du Cockpit Cabinet..." />;
  }

  if (cockpitQuery.isError || !data) {
    return (
      <ErrorState
        title="Erreur de chargement"
        message="Impossible de récupérer les indicateurs du cockpit cabinet."
      />
    );
  }

  const { kpis, missionsRecentes, pointsRevueRecents, mandatsRecents } = data;

  return (
    <RequireCabinetAccess>
      <div className="space-y-6">
        {/* EN-TÊTE COCKPIT */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cockpit Espace Cabinet
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supervision consolidée du portefeuille clients et pilotage multi-dossiers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/cabinet/dossiers"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              + Nouveau Mandat
            </Link>
          </div>
        </div>

        {/* CARTES KPIS CONSOLIDÉS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Dossiers Actifs
              </span>
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                📁
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-white">
              {kpis.totalMandatsActifs}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Sur {kpis.totalCollaborateurs} collaborateurs habilités
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs dark:border-amber-900/30 dark:bg-amber-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Missions en Retard
              </span>
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                ⚠️
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-amber-900 dark:text-amber-200">
              {kpis.missionsEnRetard}
            </p>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              Jalons d'échéances dépassés
            </p>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5 shadow-xs dark:border-rose-900/30 dark:bg-rose-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                Points de Revue Bloquants
              </span>
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                🚫
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-rose-900 dark:text-rose-200">
              {kpis.pointsRevueBloquants}
            </p>
            <p className="mt-1 text-xs text-rose-700 dark:text-rose-400">
              Anomalies à corriger avant visa
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs dark:border-emerald-900/30 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Honoraires en Attente
              </span>
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                💳
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-emerald-900 dark:text-emerald-200">
              {kpis.totalHonorairesEnAttente.toLocaleString("fr-FR")} <span className="text-sm font-normal">XOF</span>
            </p>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
              Notes émises à encaisser
            </p>
          </div>
        </div>

        {/* SECTION DOUBLE COLONNES : MISSIONS URGENTES & POINTS DE REVUE */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* MISSIONS URGENTES */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Missions & Échéances à venir
              </h2>
              <Link
                href="/cabinet/missions"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Voir tout ({missionsRecentes.length})
              </Link>
            </div>

            {missionsRecentes.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Aucune mission planifiée pour le moment.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {missionsRecentes.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {m.libelle}
                      </p>
                      <p className="text-xs text-gray-500">
                        Mandat : <span className="font-medium text-gray-700 dark:text-gray-300">{m.mandat?.typeMandat}</span> — Échéance : {m.dateEcheance ? new Date(m.dateEcheance).toLocaleDateString("fr-FR") : "Non définie"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        m.statut === "TERMINEE"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : m.statut === "EN_RETARD"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                      }`}
                    >
                      {m.statut}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* POINTS DE REVUE RÉCENTS */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Supervision & Points de Revue
              </h2>
              <Link
                href="/cabinet/supervision"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Accéder au Hub
              </Link>
            </div>

            {pointsRevueRecents.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Aucun point de revue ouvert. Félicitations !
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {pointsRevueRecents.map((p) => (
                  <div key={p.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                            p.niveau === "BLOQUANT"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                              : p.niveau === "A_CORRIGER"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          }`}
                        >
                          {p.niveau}
                        </span>
                        <span className="text-xs font-mono text-gray-400">
                          {p.moduleSource} / {p.objetType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-800 dark:text-gray-200 line-clamp-2">
                        {p.texte}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400">
                      {new Date(p.dateCreation).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DOSSIERS RÉCENTS DU PORTEFEUILLE */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Portefeuille de Mandats Récents
            </h2>
            <Link
              href="/cabinet/dossiers"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Gérer tout le portefeuille ({kpis.totalMandatsActifs})
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800">
                <tr>
                  <th className="py-3 pr-4">Type de Mandat</th>
                  <th className="py-3 px-4">Responsable Dossier</th>
                  <th className="py-3 px-4">Début</th>
                  <th className="py-3 px-4">Missions</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {mandatsRecents.map((mandat) => (
                  <tr key={mandat.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                      {mandat.typeMandat.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {mandat.collaborateurResponsable?.nomPrenoms || "Non assigné"}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(mandat.dateDebut).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {mandat._count?.missions ?? 0}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {mandat.statut}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <Link
                        href={`/cabinet/dossiers/${mandat.clientTenantId}`}
                        className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        Consulter →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RequireCabinetAccess>
  );
}
