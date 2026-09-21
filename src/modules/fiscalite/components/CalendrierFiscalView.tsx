"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fiscaliteApi } from "../services/fiscaliteApi.service";
import type { TaxContribuable, TaxEcheance } from "../types/fiscalite.types";

export const CalendrierFiscalView: React.FC = () => {
  const [contribuable, setContribuable] = useState<TaxContribuable | null>(null);
  const [echeances, setEcheances] = useState<TaxEcheance[]>([]);
  const [filterStatut, setFilterStatut] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const p = await fiscaliteApi.getMonProfil();
      setContribuable(p);
      if (p?.id) {
        const list = await fiscaliteApi.listEcheances(p.id);
        setEcheances(list);
      }
    } catch (err) {
      console.error("Erreur chargement calendrier fiscal:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncEcheances = async () => {
    if (!contribuable) return;
    setActionLoading(true);
    try {
      await fiscaliteApi.synchroniserEcheances(contribuable.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur de synchronisation du calendrier");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarquerPayee = async (id: string) => {
    if (!confirm("Marquer cette échéance comme réglée auprès de la DGI ?")) return;
    setActionLoading(true);
    try {
      await fiscaliteApi.marquerEcheancePayee(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur enregistrement paiement");
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const filtered = echeances.filter((e) => {
    if (filterStatut === "ALL") return true;
    return e.statut === filterStatut;
  });

  const countEnRetard = echeances.filter((e) => e.statut === "EN_RETARD").length;
  const countAPayer = echeances.filter((e) => e.statut === "A_PAYER" || e.statut === "A_DECLARER").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold text-lg">
              📅
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Calendrier Fiscal Consolidé &amp; Alertes
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Suivi des obligations fiscales et sociales au Bénin (CGI 2026) • Alertes J-30, J-15, J-7 et J-3 avant forclusion.
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
            onClick={handleSyncEcheances}
            disabled={actionLoading}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 shadow-sm transition"
          >
            🔄 Synchroniser les Échéances
          </button>
        </div>
      </div>

      {/* Cartes KPI Échéances */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Échéances à Déclarer / À Payer
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-400">
            {countAPayer}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            TVA au 10 du mois, AIB, Acomptes IS
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Échéances en Retard
          </p>
          <p className={`mt-2 text-2xl font-bold ${countEnRetard > 0 ? "text-rose-600" : "text-gray-900 dark:text-white"}`}>
            {countEnRetard}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Exposées aux pénalités et intérêts de retard (1%/mois)
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total des Échéances de l&apos;Année
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {echeances.length}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Consolidées avec la paie et les impôts indirects
          </p>
        </div>
      </div>

      {/* Barre de Filtres */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "A_DECLARER", "A_PAYER", "EN_RETARD", "PAYEE"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatut(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filterStatut === st
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {st === "ALL" && "Toutes les échéances"}
              {st === "A_DECLARER" && "À Déclarer"}
              {st === "A_PAYER" && "À Payer"}
              {st === "EN_RETARD" && "En Retard"}
              {st === "PAYEE" && "Payées"}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des Échéances */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center text-sm text-gray-500 dark:text-gray-400">
          Aucune échéance ne correspond aux critères sélectionnés. Cliquez sur &quot;Synchroniser les Échéances&quot; pour générer le calendrier de l&apos;exercice.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Obligation Fiscale</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Période</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Date Limite Légale</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-300">Montant Estimé</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-300">Statut</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800/60">
              {filtered.map((e) => {
                const dateLim = new Date(e.dateLimite);
                const isLate = e.statut === "EN_RETARD" || (!e.datePaiement && new Date() > dateLim && e.statut !== "PAYEE");
                return (
                  <tr key={e.id} className={isLate ? "bg-rose-50/40 dark:bg-rose-950/20" : ""}>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      <div>{e.taxType?.libelle || "Impôt / Taxe"}</div>
                      <span className="text-[11px] font-mono text-gray-500 font-normal">
                        {e.taxType?.texteReferenceDefaut || "CGI 2026"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {e.periodeOuExercice}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <span className={isLate ? "text-rose-600 font-bold" : "text-gray-900 dark:text-white"}>
                        {dateLim.toLocaleDateString("fr-FR")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                      {e.montantEstime ? formatCurrency(e.montantEstime) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          e.statut === "PAYEE"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : isLate
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        }`}
                      >
                        {isLate ? "EN RETARD" : e.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {e.statut !== "PAYEE" && (
                        <button
                          onClick={() => handleMarquerPayee(e.id)}
                          disabled={actionLoading}
                          className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-emerald-700 transition"
                        >
                          Marquer Payé
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
