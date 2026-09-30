"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fiscaliteApi } from "../services/fiscaliteApi.service";
import type { FiscaliteDashboardKpis } from "../types/fiscalite.types";
import {
  TaxBadgeIcon,
  CalendarIcon,
  FileAuditIcon,
  MapPinIcon,
  BuildingIcon,
  LandmarkIcon,
  PercentBadgeIcon,
  CalculatorIcon,
  ScaleJusticeIcon,
  WithholdingTaxIcon,
  LiasseFiscaleIcon,
} from "./FiscaliteIcons";

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
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold">
              <TaxBadgeIcon className="h-5 w-5" />
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
            <CalendarIcon className="h-4 w-4 shrink-0" />
            <span>Calendrier & Échéances</span>
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
            <FileAuditIcon className="h-4 w-4 shrink-0" />
            <span>Exporter FEC</span>
          </Link>
          <Link
            href="/aide"
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 transition"
            title="Consulter les guides pratiques et la réglementation fiscale"
          >
            <span>📖 Centre d&apos;Aide</span>
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
            <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-300">
              <span className="inline-flex items-center gap-1.5">
                <MapPinIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Régime : <strong>{data.contribuable.regime}</strong></span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BuildingIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Secteur : <strong>{data.contribuable.secteurActivite}</strong></span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <LandmarkIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Centre : <strong>{data.contribuable.centreImpots || "DGE Littoral"}</strong></span>
              </span>
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
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <PercentBadgeIcon className="h-4 w-4" />
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
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <CalculatorIcon className="h-4 w-4" />
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
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <CalendarIcon className="h-4 w-4" />
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
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
              <ScaleJusticeIcon className="h-4 w-4" />
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

      {/* Centre de Pilotage & Modules Fiscaux */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Espaces &amp; Déclarations Fiscales (SYSCOHADA &amp; CGI Bénin 2026)
          </h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            9 Modules Intégrés
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. TVA */}
          <Link
            href="/fiscalite/tva"
            className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-amber-400 hover:shadow-md transition dark:border-gray-800 dark:bg-gray-800/80"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                <PercentBadgeIcon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-bold text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                Accéder →
              </span>
            </div>
            <h3 className="mt-3 font-bold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 transition">
              Déclarations de TVA
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              Déclaration mensuelle au 10, taux standard 18%, crédit reportable et export PDF légal.
            </p>
          </Link>

          {/* 2. IS */}
          <Link
            href="/fiscalite/is"
            className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-amber-400 hover:shadow-md transition dark:border-gray-800 dark:bg-gray-800/80"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition">
                <CalculatorIcon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-bold text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                Accéder →
              </span>
            </div>
            <h3 className="mt-3 font-bold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 transition">
              Impôt sur les Sociétés (IS)
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              Retraitements extra-comptables, acomptes 1-2-3, transmission M3 et liquidation annuelle.
            </p>
          </Link>

          {/* 3. AIB */}
          <Link
            href="/fiscalite/aib"
            className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-amber-400 hover:shadow-md transition dark:border-gray-800 dark:bg-gray-800/80"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
                <WithholdingTaxIcon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-bold text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                Accéder →
              </span>
            </div>
            <h3 className="mt-3 font-bold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 transition">
              Retenues AIB à la Source
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              Retenues subies (imputables) &amp; opérées (1% ou 5%), simulateur et attestations PDF.
            </p>
          </Link>

          {/* 4. Calendrier */}
          <Link
            href="/fiscalite/calendrier"
            className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-amber-400 hover:shadow-md transition dark:border-gray-800 dark:bg-gray-800/80"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition">
                <CalendarIcon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-bold text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                Accéder →
              </span>
            </div>
            <h3 className="mt-3 font-bold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 transition">
              Calendrier Fiscal &amp; Alertes
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              Échéancier consolidé, alertes forclusion J-30 à J-3, synchronisation et acquittement.
            </p>
          </Link>

          {/* 5. Autres Taxes & Patente */}
          <Link
            href="/fiscalite/autres-taxes"
            className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-amber-400 hover:shadow-md transition dark:border-gray-800 dark:bg-gray-800/80"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition">
                <LandmarkIcon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-bold text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                Accéder →
              </span>
            </div>
            <h3 className="mt-3 font-bold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 transition">
              Autres Taxes &amp; Patente
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              Contribution des Patentes (CGI Art. 202), taxes locales et enregistrement de déclarations.
            </p>
          </Link>

          {/* 6. Liasse Fiscale */}
          <Link
            href="/fiscalite/liasse-fiscale"
            className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-amber-400 hover:shadow-md transition dark:border-gray-800 dark:bg-gray-800/80"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition">
                <LiasseFiscaleIcon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-bold text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                Accéder →
              </span>
            </div>
            <h3 className="mt-3 font-bold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 transition">
              Liasse Fiscale SYSCOHADA
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              États financiers Système Normal/SMT, visa expert-comptable (M6) et télédéclaration DGI.
            </p>
          </Link>

          {/* 7. Export FEC */}
          <Link
            href="/fiscalite/fec"
            className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-amber-400 hover:shadow-md transition dark:border-gray-800 dark:bg-gray-800/80"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition">
                <FileAuditIcon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-bold text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                Accéder →
              </span>
            </div>
            <h3 className="mt-3 font-bold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 transition">
              Export FEC (Arrêté 1085-C)
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              Audit 18 colonnes officiel, équilibre débit/crédit et génération conforme pour contrôle DGI.
            </p>
          </Link>

          {/* 8. Contrôles & Contentieux */}
          <Link
            href="/fiscalite/controles"
            className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-amber-400 hover:shadow-md transition dark:border-gray-800 dark:bg-gray-800/80"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition">
                <ScaleJusticeIcon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-bold text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                Accéder →
              </span>
            </div>
            <h3 className="mt-3 font-bold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 transition">
              Contrôles &amp; Contentieux
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              Avis de vérification, simulateur d&apos;amendes et pénalités CGI 2026, voies de recours DGI.
            </p>
          </Link>

          {/* 9. Veille & Référentiel */}
          <Link
            href="/fiscalite/veille"
            className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-amber-400 hover:shadow-md transition dark:border-gray-800 dark:bg-gray-800/80"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                <TaxBadgeIcon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-bold text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                Accéder →
              </span>
            </div>
            <h3 className="mt-3 font-bold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 transition">
              Veille &amp; Référentiel Légal
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              Sources réglementaires, double validation EF-008 des barèmes et taux CGI applicables.
            </p>
          </Link>
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
