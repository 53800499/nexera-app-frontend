"use client";

import React, { useEffect, useState } from "react";
import { useActionFeedback } from "@/shared/components/feedback";
import { comptabiliteApi } from "../services/comptabiliteApi.service";
import type { ComptaExercice, ComptaFecExport } from "../types/comptabilite.types";
import { DocumentArrowDownIcon, EyeIcon } from "./ComptaIcons";

export const FecExportView: React.FC = () => {
  const { showResult } = useActionFeedback();
  const [exercices, setExercices] = useState<ComptaExercice[]>([]);
  const [selectedExercice, setSelectedExercice] = useState<string>("");
  const [format, setFormat] = useState<"CSV" | "TXT_TAB" | "TXT_PIPE">("CSV");
  const [motif, setMotif] = useState<"A_LA_DEMANDE" | "ARCHIVAGE" | "CONTROLE_FISCAL">("A_LA_DEMANDE");
  const [historique, setHistorique] = useState<ComptaFecExport[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [detailExport, setDetailExport] = useState<ComptaFecExport | null>(null);

  useEffect(() => {
    comptabiliteApi.getExercices().then((exs) => {
      setExercices(exs);
      if (exs.length > 0) {
        setSelectedExercice(exs[0].id);
        chargerHistorique(exs[0].id);
      }
    });
  }, []);

  const chargerHistorique = async (exId?: string) => {
    try {
      const data = await comptabiliteApi.getHistoriqueFec(exId);
      setHistorique(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenererFec = async () => {
    if (!selectedExercice) return;
    setIsExporting(true);
    try {
      const res = await comptabiliteApi.genererFec({
        exerciceId: selectedExercice,
        format,
        motifGeneration: motif,
      });

      // Téléchargement automatique du fichier généré
      const blob = new Blob([res.fileContent], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.nomFichier;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showResult({
        variant: "success",
        title: "Fichier FEC généré",
        message: `${res.nombreLignes} ligne(s) d'écritures exportées.\nEmpreinte SHA-256 : ${res.empreinteSha256?.substring(0, 32)}...`,
      });
      chargerHistorique(selectedExercice);
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur génération FEC",
        message: err.message || "Erreur lors de la génération du fichier FEC.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Export FEC (Arrêté N°1085/MEF/CAB/SGM/DGI/DLC)
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Fichier des Écritures Comptables dématérialisé pour la Direction Générale des Impôts (Bénin / UEMOA) (UC-18).
          </p>
        </div>
      </div>

      {/* Generation Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-base font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
          Paramètres de l'Export Légal
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Exercice Comptable
            </label>
            <select
              value={selectedExercice}
              onChange={(e) => {
                setSelectedExercice(e.target.value);
                chargerHistorique(e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {exercices.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  Exercice {ex.annee} ({ex.statut})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Format de Délimitation
            </label>
            <select
              value={format}
              onChange={(e: any) => setFormat(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="CSV">CSV standard (Séparateur point-virgule ';')</option>
              <option value="TXT_TAB">Texte tabulé (Séparateur tabulation '\t')</option>
              <option value="TXT_PIPE">Texte délimité par barre verticale '|'</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Motif de l'Export
            </label>
            <select
              value={motif}
              onChange={(e: any) => setMotif(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="A_LA_DEMANDE">À la demande / Contrôle interne</option>
              <option value="CONTROLE_FISCAL">Contrôle fiscal officiel DGI</option>
              <option value="ARCHIVAGE">Archivage annuel légal</option>
            </select>
          </div>
        </div>

        {/* Legal Checklist notice */}
        <div className="mt-6 rounded-lg bg-blue-50/50 p-4 border border-blue-200 dark:border-blue-900/40 dark:bg-blue-950/20 text-xs text-blue-950 dark:text-blue-300">
          <p className="font-bold">Normes de conformité Arrêté N°1085 :</p>
          <ul className="mt-1 list-disc list-inside space-y-1 text-[11px] text-gray-600 dark:text-gray-400">
            <li>18 champs obligatoires ordonnés (JournalCode à Idevise)</li>
            <li>Seules les écritures au statut VALIDEE sont intégrées (EF-034)</li>
            <li>Continuité séquentielle stricte du numéro d'écriture NumEcriture (EF-014)</li>
            <li>Calcul automatique de l'empreinte d'intégrité cryptographique SHA-256 (EF-056)</li>
            <li>Nommage légal : FEC_IFU_AAAAMMJJ.txt</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGenererFec}
            disabled={isExporting || !selectedExercice}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            {isExporting ? "Génération & Scellement..." : "Générer et Télécharger le FEC"}
          </button>
        </div>
      </div>

      {/* Historique des exports */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 bg-gray-50/75 p-4 font-bold text-xs uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
          Historique des Exports et Scellements FEC
        </div>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 dark:border-gray-800">
              <th className="py-2.5 px-4">Date Génération</th>
              <th className="py-2.5 px-4">Nom de Fichier</th>
              <th className="py-2.5 px-4">Format</th>
              <th className="py-2.5 px-4">Lignes</th>
              <th className="py-2.5 px-4">Motif</th>
              <th className="py-2.5 px-4">Empreinte SHA-256</th>
              <th className="py-2.5 px-4 text-center">Scellé</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {historique.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  Aucun export FEC archivé pour cet exercice.
                </td>
              </tr>
            ) : (
              historique.map((h) => (
                <tr key={h.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {new Date(h.genereLe).toLocaleString("fr-FR")}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {h.nomFichier}
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {h.format}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-gray-800 dark:text-gray-200">
                    {h.nombreLignes}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {h.motifGeneration}
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-gray-500 max-w-xs truncate" title={h.empreinteSha256}>
                    {h.empreinteSha256}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        h.scelle
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {h.scelle ? "Scellé (Archivé)" : "Non scellé"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setDetailExport(h)}
                      title="Consulter les détails du scellement et de l'archive FEC"
                      aria-label="Détail"
                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition shadow-xs"
                    >
                      <EyeIcon className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Détail Export FEC */}
      {detailExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  EXPORT FEC OFFICIEL
                </span>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  {detailExport.nomFichier}
                </h2>
              </div>
              <button
                onClick={() => setDetailExport(null)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <span className="text-gray-500">Date de génération</span>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {new Date(detailExport.genereLe).toLocaleString("fr-FR")}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <span className="text-gray-500">Nombre d'écritures</span>
                  <p className="mt-1 font-mono font-bold text-gray-900 dark:text-white">
                    {detailExport.nombreLignes} lignes
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <span className="text-gray-500">Format & Délimiteur</span>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {detailExport.format}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <span className="text-gray-500">Motif réglementaire</span>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {detailExport.motifGeneration}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <span className="text-gray-500">Empreinte Cryptographique d'Intégrité (SHA-256)</span>
                <p className="mt-1 font-mono text-[11px] text-gray-900 break-all select-all dark:text-gray-100">
                  {detailExport.empreinteSha256}
                </p>
              </div>

              <div className="rounded-lg bg-emerald-50/60 p-3 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300">
                <span className="font-bold">Garantie d'Intangibilité (Arrêté N°1085) :</span>
                <p className="mt-1 text-[11px]">
                  Fichier normalisé conforme à la nomenclature DGI Bénin / UEMOA. L'empreinte SHA-256 garantit qu'aucune ligne comptable n'a été altérée ou insérée a posteriori.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDetailExport(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
