"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fiscaliteApi } from "../services/fiscaliteApi.service";
import type { TaxContribuable, TaxRetenueAib } from "../types/fiscalite.types";

export const AibView: React.FC = () => {
  const [contribuable, setContribuable] = useState<TaxContribuable | null>(null);
  const [retenues, setRetenues] = useState<TaxRetenueAib[]>([]);
  const [recap, setRecap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulateur AIB
  const [simBase, setSimBase] = useState<number>(5000000);
  const [simNature, setSimNature] = useState<string>("PRESTATION_SERVICES");
  const [simResult, setSimResult] = useState<any>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const p = await fiscaliteApi.getMonProfil();
      setContribuable(p);
      if (p?.id) {
        const [list, rec] = await Promise.all([
          fiscaliteApi.listRetenuesAib(p.id),
          fiscaliteApi.getRecapitulatifAib(p.id, "2026"),
        ]);
        setRetenues(list);
        setRecap(rec);
      }
    } catch (err) {
      console.error("Erreur chargement AIB:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Simulateur initial
    handleSimulate(5000000, "PRESTATION_SERVICES");
  }, []);

  const handleSimulate = async (base: number, nature: string) => {
    try {
      const res = await fiscaliteApi.simulerAib({
        base,
        natureOperation: nature,
      });
      setSimResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold text-lg">
              AIB
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AIB &amp; Retenues à la Source
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Acompte sur Impôt assis sur les Bénéfices (CGI Bénin 2026 Art. 130-133) • Taux 1% (achats biens/marchandises) ou 5% (prestations services) • Imputable sur l&apos;IS dû.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/fiscalite"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            ← Tableau de Bord
          </Link>
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300 transition"
          >
            🖨 Imprimer Récapitulatif
          </button>
        </div>
      </div>

      {/* Cartes Synthèse Récapitulative */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total Retenues AIB Subies (Imputables sur IS)
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(recap?.totalSubi || 0)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Retenues déductibles du solde d&apos;IS de l&apos;exercice
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total Retenues AIB Opérées (À reverser DGI)
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-400">
            {formatCurrency(recap?.totalOpere || 0)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Prélevées sur les prestataires et fournisseurs
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Nombre d&apos;Opérations Enregistrées
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {recap?.nombreRetenues || retenues.length}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Opérations rattachées à la gestion 2026
          </p>
        </div>
      </div>

      {/* Grid 2 colonnes : Simulateur rapide & Registre des Retenues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulateur */}
        <div className="lg:col-span-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
            Simulateur de Retenue AIB
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nature de l&apos;opération
            </label>
            <select
              value={simNature}
              onChange={(e) => {
                setSimNature(e.target.value);
                handleSimulate(simBase, e.target.value);
              }}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="PRESTATION_SERVICES">Prestations de services (5%)</option>
              <option value="VENTE_BIENS">Vente / Achat de marchandises (1%)</option>
              <option value="NON_IMMATRICULE">Fournisseur non-immatriculé (5%)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Montant Brut de la Facture (FCFA)
            </label>
            <input
              type="number"
              value={simBase}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSimBase(val);
                handleSimulate(val, simNature);
              }}
              min={0}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white font-semibold"
            />
          </div>

          {simResult && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                <span>Taux applicable :</span>
                <span className="font-bold text-sm">{simResult.taux}%</span>
              </div>
              <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                <span>Montant de la retenue AIB :</span>
                <span className="font-bold text-base text-amber-800 dark:text-amber-300">
                  {formatCurrency(simResult.montantAib)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 pt-2 border-t border-amber-200 dark:border-amber-800">
                <span>Net à payer au prestataire :</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(simResult.netAPayer)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 pt-1">
                Base légale : {simResult.articleCgi || "CGI Bénin 2026 Art. 130"}
              </p>
            </div>
          )}
        </div>

        {/* Tableau des Retenues */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Registre des Retenues AIB Opérées &amp; Subies
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {retenues.length} ligne(s)
            </span>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
            </div>
          ) : retenues.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400 border border-dashed rounded-xl">
              Aucune retenue AIB enregistrée. Les événements d&apos;achats et de ventes avec retenue s&apos;afficheront ici automatiquement.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300">Sens</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300">Tiers &amp; IFU</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-600 dark:text-gray-300">Taux</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-300">Base Brut</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-300">Montant AIB</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-600 dark:text-gray-300">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800/60">
                  {retenues.map((r) => {
                    const isSubie = r.natureAib ? r.natureAib === "SUBIE" : (r.imputableIs ?? true);
                    return (
                      <tr key={r.id}>
                        <td className="px-3 py-2.5 font-medium">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              isSubie
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                            }`}
                          >
                            {isSubie ? "AIB Subie" : "AIB Opérée"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {r.tiersNom || (r.natureOperation ? r.natureOperation.replace(/_/g, " ") : "Tiers opérationnel")}
                          </p>
                          <p className="text-[11px] text-gray-500 font-mono">
                            {r.tiersIfu
                              ? `IFU : ${r.tiersIfu}`
                              : r.evenementSource?.referenceObjetSource
                              ? `Réf : ${r.evenementSource.referenceObjetSource}`
                              : r.evenementSourceId
                              ? `Réf : ${r.evenementSourceId}`
                              : "IFU : Non renseigné"}
                          </p>
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold text-gray-700 dark:text-gray-300">
                          {r.taux ?? r.tauxApplique ?? 1}%
                        </td>
                        <td className="px-3 py-2.5 text-right text-gray-700 dark:text-gray-300">
                          {formatCurrency(r.baseCalcul ?? r.base)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-gray-900 dark:text-white">
                          {formatCurrency(r.montantRetenu)}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {r.statut || r.periodeDeclarative || "VALIDE"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
