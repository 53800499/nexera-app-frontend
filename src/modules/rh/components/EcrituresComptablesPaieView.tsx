"use client";

import React, { useEffect, useState } from "react";
import { rhApi } from "../services/rhApi.service";
import type {
  RhCyclePaie,
  RhSoldeToutCompte,
  RhEcritureComptablePaie,
} from "../types/rh.types";
import { useActionFeedback, useToast } from "@/shared/components/feedback";
import { BoltIcon, DocsIcon, UserCircleIcon, CheckCircleIcon, CloseIcon } from "@/icons";
import { getPayrollCycleStatusBadge } from "../utils/rhFormatters";

type OdTabType = "CYCLES" | "STC";

export const EcrituresComptablesPaieView: React.FC = () => {
  const { runAction } = useActionFeedback();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<OdTabType>("CYCLES");
  const [cycles, setCycles] = useState<RhCyclePaie[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");

  const [soldes, setSoldes] = useState<RhSoldeToutCompte[]>([]);
  const [selectedStcId, setSelectedStcId] = useState<string>("");

  const [od, setOd] = useState<RhEcritureComptablePaie | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = () => {
    setError(null);
    Promise.allSettled([
      rhApi.listCycles(2026),
      rhApi.listSoldesToutCompte(),
    ]).then(([cycsRes, soldesRes]) => {
      const cycs = cycsRes.status === "fulfilled" && Array.isArray(cycsRes.value)
        ? cycsRes.value
        : (cycsRes.status === "fulfilled" && (cycsRes.value as any)?.data) || [];
      const slds = soldesRes.status === "fulfilled" && Array.isArray(soldesRes.value)
        ? soldesRes.value
        : (soldesRes.status === "fulfilled" && (soldesRes.value as any)?.data) || [];

      if (cycsRes.status === "rejected" || soldesRes.status === "rejected") {
        const rejection = (cycsRes.status === "rejected" ? cycsRes : soldesRes) as PromiseRejectedResult;
        console.warn("Avertissement OD initial load:", rejection.reason?.message || rejection.reason);
        setError(rejection.reason?.message || "Serveur ou réseau indisponible.");
      }

      setCycles(cycs);
      setSoldes(slds);

      if (cycs.length > 0 && !selectedCycleId) {
        setSelectedCycleId(cycs[0].id);
      }
      if (slds.length > 0 && !selectedStcId) {
        setSelectedStcId(slds[0].id);
      }
    });
  };

  // Initial load
  useEffect(() => {
    // Check URL parameters for tab or stcId deep-linking
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const stcIdParam = params.get("stcId");
      if (tabParam === "stc" || stcIdParam) {
        setActiveTab("STC");
        if (stcIdParam) {
          setSelectedStcId(stcIdParam);
        }
      }
    }

    loadInitialData();
  }, []);

  // Fetch OD when cycle changes
  useEffect(() => {
    if (activeTab === "CYCLES" && selectedCycleId) {
      setLoading(true);
      rhApi
        .getOdPaie(selectedCycleId)
        .then((res) => setOd(res))
        .catch(() => setOd(null))
        .finally(() => setLoading(false));
    }
  }, [activeTab, selectedCycleId]);

  // Fetch OD when STC changes
  useEffect(() => {
    if (activeTab === "STC" && selectedStcId) {
      setLoading(true);
      rhApi
        .getOdStc(selectedStcId)
        .then((res) => setOd(res))
        .catch(() => setOd(null))
        .finally(() => setLoading(false));
    }
  }, [activeTab, selectedStcId]);

  const handleGenerate = async () => {
    if (activeTab === "CYCLES") {
      if (!selectedCycleId) {
        toast.warning("Sélection requise", "Veuillez choisir un cycle de paie.");
        return;
      }
      await runAction({
        confirm: {
          title: "Générer la pièce comptable d'OD du cycle ?",
          message:
            "Cette opération génère les lignes d'écritures SYSCOHADA (charges 64/66, dettes 421/431/447) pour le cycle sélectionné.",
          confirmLabel: "Générer l'OD Paie",
          variant: "default",
        },
        loadingMessage: "Génération de la pièce d'OD en cours...",
        success: {
          title: "Écriture OD générée",
          message: "L'écriture comptable d'OD de paie a été générée et équilibrée avec succès.",
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
    } else {
      if (!selectedStcId) {
        toast.warning("Sélection requise", "Veuillez choisir un solde de tout compte.");
        return;
      }
      await runAction({
        confirm: {
          title: "Générer la pièce comptable d'OD du STC ?",
          message:
            "Cette opération génère les écritures SYSCOHADA de rupture (salaires restant dus, indemnités de préavis/licenciement/congés au débit 66 et net à payer au crédit 421).",
          confirmLabel: "Générer l'OD STC",
          variant: "default",
        },
        loadingMessage: "Génération de la pièce d'OD STC...",
        success: {
          title: "Écriture OD STC générée",
          message: "L'écriture comptable d'OD de Solde de Tout Compte a été générée avec succès.",
        },
        error: {
          title: "Erreur de génération",
          message: "Impossible de générer l'OD du solde de tout compte.",
        },
        action: async () => {
          setLoading(true);
          try {
            const res = await rhApi.generateOdStc(selectedStcId);
            setOd(res);
          } finally {
            setLoading(false);
          }
        },
      });
    }
  };

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(val || 0);

  const safeCycles = Array.isArray(cycles) ? cycles : [];
  const safeSoldes = Array.isArray(soldes) ? soldes : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Écritures Comptables OD (SYSCOHADA)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Génération automatique des pièces d'Opérations Diverses : Salaires périodiques & Soldes de Tout Compte (STC)
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={
            loading ||
            (activeTab === "CYCLES" && !selectedCycleId) ||
            (activeTab === "STC" && !selectedStcId)
          }
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <BoltIcon className="h-5 w-5 shrink-0" />
          )}
          <span>
            {loading
              ? "Génération..."
              : activeTab === "CYCLES"
              ? "Générer l'OD du Cycle"
              : "Générer l'OD du STC"}
          </span>
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800 dark:border-warning-900/50 dark:bg-warning-950/50 dark:text-warning-300">
          <span>{error}</span>
          <button
            onClick={loadInitialData}
            className="ml-4 font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Réactualiser
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 text-sm font-semibold">
        <button
          onClick={() => {
            setActiveTab("CYCLES");
            setOd(null);
          }}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === "CYCLES"
              ? "text-brand-600 dark:text-brand-400 font-bold border-b-2 border-brand-500"
              : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Salaires & Charges Patronales (Cycles)
        </button>
        <button
          onClick={() => {
            setActiveTab("STC");
            setOd(null);
          }}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === "STC"
              ? "text-brand-600 dark:text-brand-400 font-bold border-b-2 border-brand-500"
              : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Soldes de Tout Compte (STC)
        </button>
      </div>

      {/* Context Selector Filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {activeTab === "CYCLES" ? (
          <div className="flex items-center gap-3 text-sm w-full sm:w-auto">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Cycle de Paie :
            </span>
            <select
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              {safeCycles.length === 0 && <option value="">Aucun cycle disponible</option>}
              {safeCycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codeCycle} - {c.etablissement?.raisonSociale} ({getPayrollCycleStatusBadge(c.statut).label})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm w-full sm:w-auto">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Collaborateur sortant (STC) :
            </span>
            <select
              value={selectedStcId}
              onChange={(e) => setSelectedStcId(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              {safeSoldes.length === 0 && <option value="">Aucun solde de tout compte enregistré</option>}
              {safeSoldes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.employe?.matricule} • {s.employe?.nom} {s.employe?.prenoms} ({formatCurrency(s.montantTotalNet)})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          Nomenclature : SYSCOHADA Révisé
        </div>
      </div>

      {/* OD Display */}
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
              <p className="text-xs text-gray-500 mt-0.5">
                Journal : <strong>{od.journalCode}</strong> • Date pièce :{" "}
                {new Date(od.dateEcriture).toLocaleDateString("fr-FR")}
                {od.employe && ` • Salarié : ${od.employe.matricule} - ${od.employe.nom} ${od.employe.prenoms}`}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                od.estEquilibree
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
              }`}
            >
              {od.estEquilibree ? (
                <>
                  <CheckCircleIcon className="h-4 w-4 shrink-0" />
                  <span>Écriture Équilibrée</span>
                </>
              ) : (
                <>
                  <CloseIcon className="h-4 w-4 shrink-0" />
                  <span>Déséquilibrée</span>
                </>
              )}
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
                  <tr
                    key={l.numeroLigne}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono text-gray-400">
                      {l.numeroLigne}
                    </td>
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
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900 shadow-2xs">
          <DocsIcon className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {activeTab === "CYCLES"
              ? "Aucune écriture comptable générée pour ce cycle de paie."
              : "Aucune écriture comptable générée pour ce solde de tout compte."}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {activeTab === "CYCLES"
              ? "Cliquez sur le bouton ci-dessous pour générer l'OD équilibrée de salaires."
              : "Cliquez sur le bouton ci-dessous pour générer l'OD équilibrée du départ collaborateur."}
          </p>
          <button
            onClick={handleGenerate}
            disabled={
              loading ||
              (activeTab === "CYCLES" && !selectedCycleId) ||
              (activeTab === "STC" && !selectedStcId)
            }
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-all shadow-xs"
          >
            <BoltIcon className="h-4 w-4 shrink-0" />
            <span>
              {activeTab === "CYCLES"
                ? "Générer l'Écriture OD du Cycle"
                : "Générer l'Écriture OD du STC"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
