"use client";

import React, { useEffect, useState } from "react";
import { useActionFeedback } from "@/shared/components/feedback";
import { comptabiliteApi } from "../services/comptabiliteApi.service";
import type {
  ComptaExercice,
  EtatFinancierResponse,
} from "../types/comptabilite.types";
import { ChartBarIcon, DocumentArrowDownIcon } from "./ComptaIcons";

export const EtatsFinanciersView: React.FC = () => {
  const { showResult } = useActionFeedback();
  const [exercices, setExercices] = useState<ComptaExercice[]>([]);
  const [selectedExercice, setSelectedExercice] = useState<string>("");
  const [systeme, setSysteme] = useState<"SN" | "SMT">("SN");
  const [etat, setEtat] = useState<EtatFinancierResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"BILAN" | "RESULTAT" | "FLUX">("BILAN");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    comptabiliteApi.getExercices().then((exs) => {
      setExercices(exs);
      const courant = exs.find((e) => e.statut === "OUVERT") || exs[0];
      if (courant) {
        setSelectedExercice(courant.id);
        genererEtat(courant.id, "PROVISOIRE");
      }
    });
  }, []);

  const genererEtat = async (exId: string, typeEdition: "PROVISOIRE" | "DEFINITIF") => {
    setIsGenerating(true);
    try {
      const res = await comptabiliteApi.genererEtatsFinanciers({
        exerciceId: exId,
        systemeRetenu: systeme,
        typeEdition,
      });
      setEtat(res);
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur calcul états financiers",
        message: err.message || "Erreur lors du calcul des états financiers.",
      });
    } finally {
      setIsGenerating(false);
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
      {/* Title & Actions */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            États Financiers Annuels SYSCOHADA
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Bilan, Compte de Résultat et Tableau des Flux de Trésorerie (AUDCIF / Bénin) (UC-17).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={systeme}
            onChange={(e: any) => {
              setSysteme(e.target.value);
              if (selectedExercice) genererEtat(selectedExercice, "PROVISOIRE");
            }}
            className="rounded-lg border border-gray-300 bg-white p-2 text-xs font-semibold text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="SN">Système Normal (SN)</option>
            <option value="SMT">Système Minimal de Trésorerie (SMT)</option>
          </select>

          <select
            value={selectedExercice}
            onChange={(e) => {
              setSelectedExercice(e.target.value);
              genererEtat(e.target.value, "PROVISOIRE");
            }}
            className="rounded-lg border border-gray-300 bg-white p-2 text-xs font-semibold text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {exercices.map((ex) => (
              <option key={ex.id} value={ex.id}>
                Exercice {ex.annee} ({ex.statut})
              </option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            Imprimer
          </button>
        </div>
      </div>

      {/* Tabs (Bilan / Compte de Résultat / TFT) */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab("BILAN")}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${
              activeTab === "BILAN"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Bilan Synthétique (Actif & Passif)
          </button>
          <button
            onClick={() => setActiveTab("RESULTAT")}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${
              activeTab === "RESULTAT"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Compte de Résultat (En Niveaux)
          </button>
          <button
            onClick={() => setActiveTab("FLUX")}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${
              activeTab === "FLUX"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Tableau des Flux de Trésorerie (TFT)
          </button>
        </nav>
      </div>

      {/* Content */}
      {isGenerating ? (
        <div className="py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-2 text-xs text-gray-500">Agrégation des comptes SYSCOHADA...</p>
        </div>
      ) : !etat ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-400 dark:border-gray-800 dark:bg-gray-900">
          Sélectionnez un exercice pour calculer les états financiers.
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: BILAN */}
          {activeTab === "BILAN" && (
            <div className="space-y-4">
              {/* Equilibrium check banner */}
              <div
                className={`flex items-center justify-between rounded-xl border p-4 text-xs font-semibold ${
                  etat.bilan.equilibre
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
                }`}
              >
                <span>
                  {etat.bilan.equilibre
                    ? "✓ Règle EF-062 respectée : Équilibre parfait du bilan (Total Actif = Total Passif)."
                    : `⚠ Alerte déséquilibre du bilan : Écart de ${formatCurrency(etat.bilan.ecart)}`}
                </span>
                <span className="font-mono">
                  Total Bilan : {formatCurrency(etat.bilan.actif.totalActif)}
                </span>
              </div>

              {/* Bilan 2 colonnes Actif / Passif */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* ACTIF */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="border-b border-gray-200 bg-blue-50/70 p-4 font-bold text-blue-950 dark:border-gray-800 dark:bg-blue-950/40 dark:text-blue-300">
                    ACTIF (Emplois)
                  </div>
                  <div className="p-4 space-y-3 font-mono text-xs">
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-700 dark:text-gray-300 font-sans">
                        Actif Immobilisé (Classe 2 nette)
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(etat.bilan.actif.actifImmobilise)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-700 dark:text-gray-300 font-sans">
                        Actif Circulant (Stocks 3 + Créances 4)
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(etat.bilan.actif.actifCirculant)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-700 dark:text-gray-300 font-sans">
                        Trésorerie Actif (Banque 521 + Caisse 531)
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(etat.bilan.actif.tresorerieActif)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 text-sm font-bold text-blue-600 dark:text-blue-400">
                      <span className="font-sans">TOTAL ACTIF</span>
                      <span>{formatCurrency(etat.bilan.actif.totalActif)}</span>
                    </div>
                  </div>
                </div>

                {/* PASSIF */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="border-b border-gray-200 bg-purple-50/70 p-4 font-bold text-purple-950 dark:border-gray-800 dark:bg-purple-950/40 dark:text-purple-300">
                    PASSIF (Ressources)
                  </div>
                  <div className="p-4 space-y-3 font-mono text-xs">
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-700 dark:text-gray-300 font-sans">
                        Capitaux Propres & Résultat Net (10 à 14)
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(etat.bilan.passif.capitauxPropres)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-700 dark:text-gray-300 font-sans">
                        Dettes Financières (Emprunts 16 à 18)
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(etat.bilan.passif.dettesFinancieres)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-700 dark:text-gray-300 font-sans">
                        Passif Circulant (Dettes Fournisseurs & Fiscales 4)
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(etat.bilan.passif.passifCirculant)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-700 dark:text-gray-300 font-sans">
                        Trésorerie Passif (Découverts bancaires 56)
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(etat.bilan.passif.tresoreriePassif)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 text-sm font-bold text-purple-600 dark:text-purple-400">
                      <span className="font-sans">TOTAL PASSIF</span>
                      <span>{formatCurrency(etat.bilan.passif.totalPassif)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPTE DE RÉSULTAT */}
          {activeTab === "RESULTAT" && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="border-b border-gray-200 bg-gray-50/80 p-4 font-bold text-gray-900 dark:border-gray-800 dark:bg-gray-800/60 dark:text-white">
                Compte de Résultat SYSCOHADA en Niveaux d'Activité
              </div>
              <div className="p-5 space-y-4 font-mono text-xs">
                {/* Exploitation */}
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/40 space-y-2">
                  <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-200">
                    <span className="font-sans">Produits d'Exploitation (Classe 70 à 75)</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      {formatCurrency(etat.compteResultat.produitsExploitation)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="font-sans">Charges d'Exploitation (Classe 60 à 65)</span>
                    <span>{formatCurrency(etat.compteResultat.chargesExploitation)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 font-bold text-sm">
                    <span className="font-sans">Résultat d'Exploitation</span>
                    <span className={etat.compteResultat.resultatExploitation >= 0 ? "text-emerald-600" : "text-rose-600"}>
                      {formatCurrency(etat.compteResultat.resultatExploitation)}
                    </span>
                  </div>
                </div>

                {/* Financier */}
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/40 space-y-2">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span className="font-sans">Produits Financiers (77)</span>
                    <span>{formatCurrency(etat.compteResultat.produitsFinanciers)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="font-sans">Charges Financières (67)</span>
                    <span>{formatCurrency(etat.compteResultat.chargesFinancieres)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 font-bold text-sm">
                    <span className="font-sans">Résultat Financier</span>
                    <span className={etat.compteResultat.resultatFinancier >= 0 ? "text-emerald-600" : "text-rose-600"}>
                      {formatCurrency(etat.compteResultat.resultatFinancier)}
                    </span>
                  </div>
                </div>

                {/* Activités Ordinaires */}
                <div className="flex justify-between px-4 py-3 rounded-lg bg-blue-50/50 font-bold text-sm text-blue-950 dark:bg-blue-950/30 dark:text-blue-300">
                  <span className="font-sans">Résultat des Activités Ordinaires (RAO)</span>
                  <span>{formatCurrency(etat.compteResultat.resultatActivitesOrdinaires)}</span>
                </div>

                {/* HAO & Impôts */}
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/40 space-y-2">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="font-sans">Résultat Hors Activités Ordinaires (HAO 8)</span>
                    <span>{formatCurrency(etat.compteResultat.resultatHao)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span className="font-sans">Impôts sur le Résultat (Compte 695 / M7)</span>
                    <span>- {formatCurrency(etat.compteResultat.impotSurResultat)}</span>
                  </div>
                </div>

                {/* RÉSULTAT NET DÉFINITIF */}
                <div className="flex justify-between p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white font-bold text-base shadow-md">
                  <span className="font-sans">RÉSULTAT NET DE L'EXERCICE</span>
                  <span>{formatCurrency(etat.compteResultat.resultatNet)}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TFT */}
          {activeTab === "FLUX" && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 p-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-200 dark:border-gray-800">
                Tableau des Flux de Trésorerie SYSCOHADA (TFT)
              </h2>
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="font-sans text-gray-700 dark:text-gray-300">
                    Trésorerie Nette au 1er Janvier (Début d'exercice)
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(etat.fluxTresorerie.tresorerieNetteDebut)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="font-sans text-gray-700 dark:text-gray-300">
                    Flux Net de Trésorerie généré par l'activité
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(etat.fluxTresorerie.variationTresorerie)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="font-sans">Trésorerie Nette au 31 Décembre (Fin d'exercice)</span>
                  <span>{formatCurrency(etat.fluxTresorerie.tresorerieNetteFin)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
