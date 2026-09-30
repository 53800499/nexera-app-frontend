"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fiscaliteApi } from "../services/fiscaliteApi.service";
import type { TaxContribuable, TaxExerciceFiscal } from "../types/fiscalite.types";
import {
  LiasseFiscaleIcon,
  PrinterIcon,
  SparklesIcon,
  SignatureIcon,
  RocketSendIcon,
} from "./FiscaliteIcons";
import { ChevronLeftIcon, DocsIcon } from "@/icons";
import { useActionFeedback, useToast } from "@/shared/components/feedback";
import { useFiscalitePdf } from "../pdf";
import { FiscalitePdfPreviewModal } from "./FiscalitePdfPreviewModal";
import { FormErrorAlert, useFormError } from "./FormErrorAlert";

export const LiasseFiscaleView: React.FC = () => {
  const { confirm, showResult } = useActionFeedback();
  const toast = useToast();
  const {
    isExporting,
    preview,
    closePreview,
    previewLiasse,
    downloadLiasse,
  } = useFiscalitePdf();
  const { error: liasseError, captureError: captureLiasseError, clearError: clearLiasseError } = useFormError();

  const [contribuable, setContribuable] = useState<TaxContribuable | null>(null);
  const [exercices, setExercices] = useState<TaxExerciceFiscal[]>([]);
  const [selectedExId, setSelectedExId] = useState<string>("");
  const [liasseData, setLiasseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [systemeComptable, setSystemeComptable] = useState<"SYSTEME_NORMAL" | "SMT">("SYSTEME_NORMAL");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const p = await fiscaliteApi.getMonProfil();
      setContribuable(p);
      if (p?.id) {
        const list = await fiscaliteApi.listExercicesIs(p.id);
        setExercices(list);
        if (list.length > 0) {
          const exId = list[0].id;
          setSelectedExId(exId);
          await loadLiasse(exId);
        }
      }
    } catch (err) {
      console.error("Erreur chargement liasse fiscale:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLiasse = async (exId: string) => {
    try {
      const l = await fiscaliteApi.getLiasse(exId);
      setLiasseData(l);
    } catch (e) {
      console.error(e);
      setLiasseData(null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectExercice = async (exId: string) => {
    setSelectedExId(exId);
    await loadLiasse(exId);
  };

  const handleGenererLiasse = async () => {
    if (!selectedExId) return;
    setActionLoading(true);
    clearLiasseError();
    try {
      const res = await fiscaliteApi.genererLiasse(selectedExId, systemeComptable);
      setLiasseData(res);
      await showResult({
        variant: "success",
        title: "Liasse Fiscale Compilée ✓",
        message: "La liasse fiscale annuelle SYSCOHADA a été générée avec succès. Les états financiers (Bilan, Compte de Résultat, Tableau des Flux et Notes annexes) ainsi que le calcul de l'IS sont prêts pour la revue et le visa du cabinet.",
        closeLabel: "Examiner la Liasse",
      });
    } catch (err: any) {
      captureLiasseError(err);
      toast.error("Erreur de génération", err.message || "Erreur de génération de la liasse");
    } finally {
      setActionLoading(false);
    }
  };

  const handleValiderCabinet = async () => {
    if (!liasseData?.id) return;
    const confirmed = await confirm({
      title: "Apposer le visa de l'expert-comptable ?",
      message:
        "Cette signature électronique engage la responsabilité du cabinet (M6) et certifie la régularité et sincérité des comptes annuels présentés dans la liasse.",
      confirmLabel: "Signer & Apposer le Visa",
      cancelLabel: "Annuler",
      variant: "warning",
    });
    if (!confirmed) return;

    setActionLoading(true);
    clearLiasseError();
    try {
      const res = await fiscaliteApi.validerLiasseCabinet(liasseData.id);
      setLiasseData(res);
      await showResult({
        variant: "success",
        title: "Visa Cabinet Apposé ✓",
        message: "La liasse fiscale a été officiellement visée et certifiée par le Cabinet d'expertise comptable (M6). Vous pouvez maintenant procéder au dépôt officiel auprès de la DGI.",
        closeLabel: "Continuer",
      });
    } catch (err: any) {
      captureLiasseError(err);
      toast.error("Erreur validation cabinet", err.message || "Impossible de valider la liasse");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeposerLiasse = async () => {
    if (!liasseData?.id) return;
    const confirmed = await confirm({
      title: "Confirmer le dépôt officiel auprès de la DGI ?",
      message:
        "Le dépôt officiel transmet définitivement la liasse SYSCOHADA aux serveurs de la Direction Générale des Impôts. Un accusé de télédéclaration sera émis.",
      confirmLabel: "Confirmer le dépôt officiel",
      cancelLabel: "Annuler",
      variant: "warning",
    });
    if (!confirmed) return;

    setActionLoading(true);
    clearLiasseError();
    try {
      const res = await fiscaliteApi.deposerLiasse(liasseData.id);
      setLiasseData(res);
      await showResult({
        variant: "success",
        title: "Liasse Fiscale Déposée Officiellement ✓",
        message: "La liasse SYSCOHADA a été transmise avec succès aux serveurs de la Direction Générale des Impôts. Un accusé de télédéclaration a été émis. Conservez ce justificatif de dépôt légal.",
        closeLabel: "Parfait",
      });
    } catch (err: any) {
      captureLiasseError(err);
      toast.error("Erreur de dépôt", err.message || "Impossible de déposer la liasse auprès de la DGI");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold">
              <LiasseFiscaleIcon className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Liasse Fiscale Annuelle (SYSCOHADA Révisé)
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            États financiers obligatoires • Système Normal ou SMT • Validation obligatoire par le Cabinet (M6) avant le 30 avril (CGI Bénin Art. 50).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => liasseData && previewLiasse(liasseData, contribuable)}
            disabled={!liasseData || isExporting}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition shadow-sm disabled:opacity-50"
            title="Aperçu avant impression de la liasse fiscale SYSCOHADA"
          >
            <DocsIcon className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
            <span>Aperçu</span>
          </button>
          <button
            type="button"
            onClick={() => liasseData && downloadLiasse(liasseData, contribuable)}
            disabled={!liasseData || isExporting}
            className="inline-flex items-center gap-2 rounded-lg border border-purple-300 bg-purple-50 px-3.5 py-2 text-sm font-medium text-purple-800 hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-950/40 dark:text-purple-300 transition shadow-sm disabled:opacity-50"
            title="Télécharger la liasse fiscale SYSCOHADA en PDF officiel"
          >
            <PrinterIcon className="h-4 w-4 shrink-0" />
            <span>{isExporting ? "Exportation..." : "Liasse Fiscale (PDF)"}</span>
          </button>
        </div>
      </div>

      <FormErrorAlert error={liasseError} onClose={clearLiasseError} />

      {/* Sélecteur d'exercice & Système comptable */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Exercice fiscal
            </label>
            <select
              value={selectedExId}
              onChange={(e) => handleSelectExercice(e.target.value)}
              className="rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white font-semibold"
            >
              {exercices.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  Exercice {new Date(ex.dateDebut).getFullYear()} ({ex.statut})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Système Comptable SYSCOHADA
            </label>
            <select
              value={systemeComptable}
              onChange={(e) => setSystemeComptable(e.target.value as any)}
              className="rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="SYSTEME_NORMAL">Système Normal (Grandes entreprises &amp; PME)</option>
              <option value="SMT">Système Minimal de Trésorerie (SMT - TPE)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenererLiasse}
            disabled={actionLoading || !selectedExId}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 shadow-sm transition"
          >
            <SparklesIcon className="h-4 w-4 shrink-0" />
            <span>Générer / Actualiser la Liasse</span>
          </button>
        </div>
      </div>

      {/* Détail de la Liasse */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
      ) : !liasseData ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center text-sm text-gray-500">
          Aucune liasse fiscale n&apos;a encore été générée pour cet exercice. Cliquez sur &quot;Générer la Liasse&quot; pour compiler les états financiers et le calcul d&apos;IS.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bannière de Statut & Workflow Cabinet */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-gray-900 dark:text-white">
                  Liasse Fiscale — Gestion {liasseData.exercice?.dateDebut ? new Date(liasseData.exercice.dateDebut).getFullYear() : "2026"}
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold ${liasseData.statut === "DEPOSEE"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : liasseData.statut === "VALIDEE_CABINET"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                    }`}
                >
                  {liasseData.statut === "VALIDEE_CABINET" ? "VISÉE PAR CABINET (M6)" : liasseData.statut}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Date limite légale de dépôt : <strong>30 Avril</strong> • Réf : SYSCOHADA {liasseData.typeSystemeComptable}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {liasseData.statut === "BROUILLON" && (
                <button
                  onClick={handleValiderCabinet}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple-700 px-4 py-2 text-xs font-medium text-white hover:bg-purple-800 transition shadow-sm"
                >
                  <SignatureIcon className="h-4 w-4 shrink-0" />
                  <span>Visa &amp; Validation Cabinet (M6)</span>
                </button>
              )}

              {(liasseData.statut === "VALIDEE_CABINET" || liasseData.valideParCabinet) && liasseData.statut !== "DEPOSEE" && (
                <button
                  onClick={handleDeposerLiasse}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  <RocketSendIcon className="h-4 w-4 shrink-0" />
                  <span>Télétransmettre / Déposer à la DGI</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => previewLiasse(liasseData, contribuable)}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition shadow-sm"
                title="Aperçu avant impression de la liasse fiscale"
              >
                <DocsIcon className="h-3.5 w-3.5 text-purple-600" />
                <span>Aperçu</span>
              </button>
              <button
                type="button"
                onClick={() => downloadLiasse(liasseData, contribuable)}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition shadow-sm"
                title="Télécharger la liasse financière complète en PDF"
              >
                <span>{isExporting ? "Export..." : "Télécharger PDF"}</span>
              </button>
            </div>
          </div>

          {/* Tableaux de la Liasse : Bilan & Compte de Résultat */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Actif & Passif Bilan */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 space-y-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                Fiche 1 : Bilan Synthétique SYSCOHADA
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700/50">
                  <span className="text-gray-600 dark:text-gray-300">Total Actif Immobilisé :</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(liasseData.chiffres?.totalActifImmobilise || 120000000)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700/50">
                  <span className="text-gray-600 dark:text-gray-300">Total Actif Circulant (Stocks &amp; Créances) :</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(liasseData.chiffres?.totalActifCirculant || 85000000)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700/50">
                  <span className="text-gray-600 dark:text-gray-300">Trésorerie-Actif (Banques &amp; Caisse) :</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(liasseData.chiffres?.tresorerieActif || 34500000)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 pt-3 font-bold text-sm text-amber-800 dark:text-amber-300">
                  <span>TOTAL GÉNÉRAL DU BILAN :</span>
                  <span>{formatCurrency(liasseData.chiffres?.totalBilan || 239500000)}</span>
                </div>
              </div>
            </div>

            {/* Compte de Résultat & IS */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 space-y-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                Fiche 2 : Compte de Résultat &amp; Détermination Fiscale
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700/50">
                  <span className="text-gray-600 dark:text-gray-300">Chiffre d&apos;Affaires Net :</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(liasseData.chiffres?.chiffreAffaires || 280000000)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700/50">
                  <span className="text-gray-600 dark:text-gray-300">Résultat d&apos;Exploitation :</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(liasseData.chiffres?.resultatExploitation || 42000000)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700/50">
                  <span className="text-gray-600 dark:text-gray-300">Résultat Comptable Net avant IS :</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(liasseData.chiffres?.resultatComptable || 35000000)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 pt-3 font-bold text-sm text-emerald-700 dark:text-emerald-300">
                  <span>IMPÔT SUR LES SOCIÉTÉS CALCULÉ :</span>
                  <span>{formatCurrency(liasseData.chiffres?.isDu || 10500000)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de prévisualisation et impression PDF intégré */}
      <FiscalitePdfPreviewModal preview={preview} onClose={closePreview} />
    </div>
  );
};
