"use client";

import React, { useEffect, useState } from "react";
import { rhApi } from "../services/rhApi.service";
import type { RhCyclePaie, RhEcritureComptablePaie } from "../types/rh.types";
import { useActionFeedback, useToast } from "@/shared/components/feedback";
import { BoltIcon, DocsIcon } from "@/icons";

export const EcrituresComptablesPaieView: React.FC = () => {
  const { runAction } = useActionFeedback();
  const toast = useToast();
  const [cycles, setCycles] = useState<RhCyclePaie[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");
  const [od, setOd] = useState<RhEcritureComptablePaie | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    rhApi.listCycles(2026).then((res) => {
      const cycs = Array.isArray(res) ? res : ((res as any)?.data || []);
      setCycles(cycs);
      if (cycs.length > 0) {
        setSelectedCycleId(cycs[0].id);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCycleId) {
      setLoading(true);
      rhApi
        .getOdPaie(selectedCycleId)
        .then(setOd)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedCycleId]);

  const handleGenerate = async () => {
    if (!selectedCycleId) {
      toast.warning("Sélection requise", "Veuillez choisir un cycle de paie.");
      return;
    }
    await runAction({
      confirm: {
        title: "Générer la pièce comptable d'OD ?",
        message: "Cette opération génère les lignes d'écritures SYSCOHADA (charges 64, dettes 421/431/447) pour le cycle sélectionné.",
        confirmLabel: "Générer l'OD",
        variant: "default",
      },
      loadingMessage: "Génération de la pièce d'OD en cours...",
      success: {
        title: "Écriture OD générée",
        message: "L'écriture comptable d'OD a été générée et équilibrée avec succès.",
      },
      error: {
        title: "Erreur de génération",
        message: "Impossible de générer l'OD de paie.",
      },
      action: async () => {
        setLoading(true);
        try {
          const res = await rhApi.generateOdPaie(selectedCycleId);
          setOd(res);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const safeCycles = Array.isArray(cycles) ? cycles : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Comptabilisation de la Paie (OD SYSCOHADA)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Génération automatique de l'écriture d'Opération Diverse (Classe 6 charges / Classes 42, 43, 44 tiers)
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !selectedCycleId}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <BoltIcon className="h-6 w-6 shrink-0" />
          )}
          <span>{loading ? "Génération..." : "Générer l'Écriture OD"}</span>
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cycle de Paie :</span>
          <select
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-bold text-gray-700 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            {safeCycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.codeCycle} - {c.etablissement?.raisonSociale} ({c.statut})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : od ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 dark:border-gray-800">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {od.libellePiece}
              </h2>
              <p className="text-xs text-gray-500">
                Journal : <strong>{od.journalCode}</strong> • Date pièce :{" "}
                {new Date(od.dateEcriture).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${od.estEquilibree
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                : "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
                }`}
            >
              {od.estEquilibree ? "Écriture Équilibrée ✓" : "Déséquilibrée ✗"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 bg-gray-50 text-gray-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-300">
                <tr>
                  <th className="py-3 px-4">Ligne</th>
                  <th className="py-3 px-4">Compte SYSCOHADA</th>
                  <th className="py-3 px-4">Libellé de l'Écriture</th>
                  <th className="py-3 px-4 text-right">Débit (FCFA)</th>
                  <th className="py-3 px-4 text-right">Crédit (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {od.lignes?.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="py-2.5 px-4 font-mono text-gray-400">{l.numeroLigne}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-gray-900 dark:text-white">
                      {l.compteNumero}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-gray-800 dark:text-gray-200">
                      {l.libelle}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                      {l.montantDebit > 0 ? formatCurrency(l.montantDebit) : ""}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                      {l.montantCredit > 0 ? formatCurrency(l.montantCredit) : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-300 bg-gray-50/80 font-bold dark:border-gray-700 dark:bg-gray-800/80 text-sm">
                <tr>
                  <td colSpan={3} className="py-3.5 px-4 text-right">
                    TOTAUX GÉNÉRAUX :
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-gray-900 dark:text-white">
                    {formatCurrency(od.montantTotalDebit)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-purple-600 dark:text-purple-400">
                    {formatCurrency(od.montantTotalCredit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm">Aucune écriture comptable générée pour ce cycle.</p>
          <button
            onClick={handleGenerate}
            className="mt-3 rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
          >
            Générer l'Écriture OD Maintenant
          </button>
        </div>
      )}
    </div>
  );
};
