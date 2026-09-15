"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fiscaliteApi } from "../services/fiscaliteApi.service";
import type { FiscaliteDashboardKpis } from "../types/fiscalite.types";

export const FiscaliteDashboardView: React.FC = () => {
  const [data, setData] = useState<FiscaliteDashboardKpis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fiscaliteApi
      .getDashboardKpis()
      .then((res) => setData(res))
      .catch((err) => console.error("Erreur chargement dashboard fiscal:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
      </div>
    );
  }

  const kpis = data?.kpis || {
    tvaNetteMois: 0,
    creditTvaReporte: 0,
    isEstime: 0,
    acomptesIsVerses: 0,
    acomptesIsRestants: 0,
    sourcesEnAttenteQualification: 0,
    prochainesEcheancesCount: 0,
    controlesEnCoursCount: 0,
    tauxEffectifEstime: 30,
  };

  return (
    <div className="space-y-6">
      {/* En-tête du Module Fiscalité (Ambre #BA7517) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold text-lg">
              M7
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Fiscalité & Déclarations Réparées
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Moteur fiscal multi-pays, veille réglementaire CGI Bénin 2026, déclarations TVA & AIB, calcul IS et export FEC homologué (Arrêté 1085-C).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/fiscalite/calendrier"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 transition"
          >
            <span>📅 Calendrier & Échéances</span>
          </Link>
          <Link
            href="/fiscalite/tva"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition"
          >
            <span>Déclarer la TVA</span>
          </Link>
          <Link
            href="/fiscalite/fec"
            className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300 transition"
          >
            <span>⚡ Exporter FEC</span>
          </Link>
        </div>
      </div>

      {/* Profil fiscal résumé */}
      {data?.contribuable && (
        <div className="rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/60 to-orange-50/40 p-4 dark:border-amber-900/40 dark:from-amber-950/20 dark:to-orange-950/10">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">Identifiant Fiscal Unique (IFU) :</span>
              <span className="rounded bg-white px-2 py-0.5 font-mono font-bold text-amber-800 shadow-sm dark:bg-gray-800 dark:text-amber-400">
                {data.contribuable.ifu}
              </span>
            </div>
            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
              <span>📍 Régime : <strong>{data.contribuable.regime}</strong></span>
              <span>🏢 Secteur : <strong>{data.contribuable.secteurActivite}</strong></span>
              <span>🏛 Centre : <strong>{data.contribuable.centreImpots || "DGE Littoral"}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 : TVA */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              TVA Nette (Dernière Période)
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold">
              %
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(kpis.tvaNetteMois)}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {kpis.creditTvaReporte > 0 ? (
                <span className="text-emerald-600 font-medium">
                  Crédit de TVA reporté : {formatCurrency(kpis.creditTvaReporte)}
                </span>
              ) : (
                "TVA exigible nette à payer au 10"
              )}
            </p>
          </div>
        </div>

        {/* Card 2 : IS */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Impôt sur les Sociétés Dû
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 font-bold">
              IS
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(kpis.isEstime)}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Acomptes versés : {formatCurrency(kpis.acomptesIsVerses)} • Reste : {formatCurrency(kpis.acomptesIsRestants)}
            </p>
          </div>
        </div>

        {/* Card 3 : Échéances */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Échéances à 30 Jours
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 font-bold">
              📅
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {kpis.prochainesEcheancesCount} échéance(s)
            </p>
            <p className="mt-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
              TVA, AIB, Patente & Acomptes consolidés
            </p>
          </div>
        </div>

        {/* Card 4 : Veille */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Veille Réglementaire
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 font-bold">
              ⚖
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {kpis.sourcesEnAttenteQualification} texte(s)
            </p>
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
              Circulaires DGI à qualifier / valider
            </p>
          </div>
        </div>
      </div>

      {/* Grid 2 colonnes : Prochaines échéances & Textes réglementaires */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Prochaines Échéances */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Échéancier Fiscal Imminent
            </h2>
            <Link
              href="/fiscalite/calendrier"
              className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              Voir tout l’agenda →
            </Link>
          </div>
          <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-700/50">
            {data?.prochainesEcheances && data.prochainesEcheances.length > 0 ? (
              data.prochainesEcheances.map((ech) => (
                <div key={ech.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {ech.taxType?.libelle || "Obligation Fiscale"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Date limite : {new Date(ech.dateLimite).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 dark:bg-amber-900/40 dark:text-amber-300">
                      À payer
                    </span>
                    {ech.montantEstime ? (
                      <p className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                        {formatCurrency(ech.montantEstime)}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Aucune échéance urgente à 30 jours.
              </p>
            )}
          </div>
        </div>

        {/* Textes Réglementaires & Veille DGI */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Veille Réglementaire & Circulaires DGI
            </h2>
            <Link
              href="/fiscalite/veille"
              className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              Gérer la veille →
            </Link>
          </div>
          <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-700/50">
            {data?.sourcesRecentes && data.sourcesRecentes.length > 0 ? (
              data.sourcesRecentes.map((s) => (
                <div key={s.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                      {s.reference}
                    </span>
                    <span className="text-[11px] rounded bg-gray-100 px-2 py-0.5 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {s.statutVeille}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {s.titre}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {s.resume || "En vigueur à compter du " + new Date(s.dateEntreeVigueur).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Toutes les sources réglementaires sont à jour.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
