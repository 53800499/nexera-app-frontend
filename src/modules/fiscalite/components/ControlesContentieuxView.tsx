"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fiscaliteApi } from "../services/fiscaliteApi.service";
import type { TaxContribuable, TaxControleFiscal, TaxReclamationContentieuse } from "../types/fiscalite.types";
import { ScaleJusticeIcon } from "./FiscaliteIcons";
import { ChevronLeftIcon, PlusIcon } from "@/icons";
import { useActionFeedback, useToast } from "@/shared/components/feedback";
import { FormErrorAlert, useFormError } from "./FormErrorAlert";

export const ControlesContentieuxView: React.FC = () => {
  const { showResult } = useActionFeedback();
  const toast = useToast();
  const { error: penError, captureError: capturePenError, clearError: clearPenError } = useFormError();
  const { error: controleError, captureError: captureControleError, clearError: clearControleError } = useFormError();
  const { error: recoursError, captureError: captureRecoursError, clearError: clearRecoursError } = useFormError();

  const [contribuable, setContribuable] = useState<TaxContribuable | null>(null);
  const [controles, setControles] = useState<TaxControleFiscal[]>([]);
  const [reclamations, setReclamations] = useState<TaxReclamationContentieuse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [showControleModal, setShowControleModal] = useState(false);
  const [ctrlType, setCtrlType] = useState<"SUR_PIECES" | "SUR_PLACE" | "PONCTUEL">("SUR_PIECES");
  const [ctrlDateAvis, setCtrlDateAvis] = useState("2026-03-01");
  const [ctrlDebut, setCtrlDebut] = useState("2024-01-01");
  const [ctrlFin, setCtrlFin] = useState("2025-12-31");
  const [ctrlService, setCtrlService] = useState("DGE Littoral - Brigade de Vérification");

  const [showRecoursModal, setShowRecoursModal] = useState(false);
  const [recoursType, setRecoursType] = useState<"RECLAMATION_PREALABLE" | "RECOURS_HIERARCHIQUE" | "RECOURS_JURIDICTIONNEL" | "DEMANDE_GRACIEUSE">("RECLAMATION_PREALABLE");
  const [recoursDateDepot, setRecoursDateDepot] = useState("2026-04-15");
  const [recoursObjet, setRecoursObjet] = useState("");

  // Simulateur de sanctions et pénalités
  const [penBase, setPenBase] = useState<number>(10000000);
  const [penType, setPenType] = useState<string>("RETARD_DECLARATION");
  const [penMois, setPenMois] = useState<number>(3);
  const [penMiseEnDemeure, setPenMiseEnDemeure] = useState(false);
  const [penMauvaiseFoi, setPenMauvaiseFoi] = useState(false);
  const [penResult, setPenResult] = useState<any>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const p = await fiscaliteApi.getMonProfil();
      setContribuable(p);
      if (p?.id) {
        const [ctrls, recls] = await Promise.all([
          fiscaliteApi.listControles(p.id),
          fiscaliteApi.listReclamations(p.id),
        ]);
        setControles(ctrls);
        setReclamations(recls);
      }
    } catch (err) {
      console.error("Erreur chargement contrôles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    handleCalculerPenalite(10000000, 3, false, false);
  }, []);

  const handleCreerControle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribuable?.id) return;
    clearControleError();
    setActionLoading(true);
    try {
      await fiscaliteApi.creerControle({
        taxContribuableId: contribuable.id,
        typeControle: ctrlType,
        dateAvisVerification: ctrlDateAvis,
        periodeControleeDebut: ctrlDebut,
        periodeControleeFin: ctrlFin,
        serviceEnCharge: ctrlService,
      });
      setShowControleModal(false);
      await loadData();
      await showResult({
        variant: "success",
        title: "Procédure de Contrôle Notifiée ✓",
        message: `La procédure (${ctrlType.replace(/_/g, " ")}) a été enregistrée. Le délai de réponse légal de 30 jours (CGI Art. 675) est désormais actif.`,
        closeLabel: "Fermer",
      });
    } catch (err: any) {
      captureControleError(err);
      toast.error("Erreur", err.message || "Impossible d'enregistrer le contrôle.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleIntroduireRecours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribuable?.id) return;
    clearRecoursError();
    setActionLoading(true);
    try {
      await fiscaliteApi.introduireRecours({
        taxContribuableId: contribuable.id,
        typeRecours: recoursType,
        dateDepot: recoursDateDepot,
        objet: recoursObjet,
      });
      setShowRecoursModal(false);
      await loadData();
      await showResult({
        variant: "success",
        title: "Recours Introduit avec Succès ✓",
        message: `Votre recours contentieux (${recoursType.replace(/_/g, " ")}) a été consigné. L'Administration dispose d'un délai légal de réponse de 3 mois.`,
        closeLabel: "Parfait",
      });
    } catch (err: any) {
      captureRecoursError(err);
      toast.error("Erreur", err.message || "Impossible d'introduire le recours.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCalculerPenalite = async (
    base: number,
    mois: number,
    miseEnDemeure: boolean,
    mauvaiseFoi: boolean
  ) => {
    clearPenError();
    try {
      const res = await fiscaliteApi.estimerPenalite({
        typePenalite: penType,
        baseCalcul: base,
        nbMoisRetard: mois,
        apresMiseEnDemeure: miseEnDemeure,
        mauvaiseFoi: mauvaiseFoi,
      });
      setPenResult(res);
    } catch (e: any) {
      capturePenError(e);
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
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold">
              <ScaleJusticeIcon className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Contrôles Fiscaux, Pénalités &amp; Contentieux
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Suivi des avis de vérification • Estimation des pénalités CGI Bénin 2026 (Art. 1092+) • Registre des recours contentieux.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              clearControleError();
              setShowControleModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 shadow-sm transition"
          >
            <PlusIcon className="h-4 w-4 shrink-0" />
            <span>Notifier Contrôle</span>
          </button>
          <button
            type="button"
            onClick={() => {
              clearRecoursError();
              setShowRecoursModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-amber-700 shadow-sm transition"
          >
            <PlusIcon className="h-4 w-4 shrink-0" />
            <span>Introduire Recours</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulateur de Pénalités (EF-033) */}
        <div className="lg:col-span-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
            Simulateur Sanctions &amp; Pénalités (CGI 2026)
          </h2>

          <FormErrorAlert error={penError} onClose={clearPenError} />

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Base des droits compromis ou éludés (FCFA)
            </label>
            <input
              type="number"
              value={penBase}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPenBase(val);
                handleCalculerPenalite(val, penMois, penMiseEnDemeure, penMauvaiseFoi);
              }}
              min={0}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nombre de mois de retard (Intérêt 1% / mois)
            </label>
            <input
              type="number"
              value={penMois}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPenMois(val);
                handleCalculerPenalite(penBase, val, penMiseEnDemeure, penMauvaiseFoi);
              }}
              min={1}
              max={48}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-2 pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={penMiseEnDemeure}
                onChange={(e) => {
                  setPenMiseEnDemeure(e.target.checked);
                  handleCalculerPenalite(penBase, penMois, e.target.checked, penMauvaiseFoi);
                }}
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Infraction après mise en demeure (+20%)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={penMauvaiseFoi}
                onChange={(e) => {
                  setPenMauvaiseFoi(e.target.checked);
                  handleCalculerPenalite(penBase, penMois, penMiseEnDemeure, e.target.checked);
                }}
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Manœuvres frauduleuses / mauvaise foi (+50%)</span>
            </label>
          </div>

          {penResult && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/40 dark:bg-rose-950/20 space-y-2">
              <div className="flex items-center justify-between text-xs text-rose-900 dark:text-rose-200">
                <span>Intérêts de retard (1%/mois) :</span>
                <span className="font-bold">{formatCurrency(penResult.interetRetard)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-rose-900 dark:text-rose-200">
                <span>Majoration légale appliquée :</span>
                <span className="font-bold">{formatCurrency(penResult.majoration)} ({penResult.tauxMajoration}%)</span>
              </div>
              <div className="flex items-center justify-between text-xs text-rose-950 dark:text-rose-100 pt-2 border-t border-rose-200 dark:border-rose-800 font-bold">
                <span>TOTAL SANCTION ESTIMÉE :</span>
                <span className="text-base text-rose-700 dark:text-rose-400">
                  {formatCurrency(penResult.totalPenalites)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 pt-1">
                Conforme CGI Bénin 2026 Art. 1092 à 1098. L&apos;évaluation sert d&apos;éclairage prévisionnel avant notification formelle.
              </p>
            </div>
          )}
        </div>

        {/* Procédures de Contrôle & Recours Contentieux */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vérifications de comptabilité (EF-034) */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Vérifications &amp; Contrôles Fiscaux en Cours ({controles.length})
              </h2>
              <button
                type="button"
                onClick={() => {
                  clearControleError();
                  setShowControleModal(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                <span>Enregistrer un avis</span>
              </button>
            </div>

            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
              </div>
            ) : controles.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 border border-dashed rounded-lg">
                Aucune procédure de vérification ou de contrôle notifiée par l&apos;Administration.
              </div>
            ) : (
              <div className="space-y-3">
                {controles.map((c) => (
                  <div key={c.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {c.typeControle} — Service : {c.serviceEnCharge || "DGE Littoral"}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        {c.statut}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Avis du {c.dateAvisVerification ? new Date(c.dateAvisVerification).toLocaleDateString("fr-FR") : "N/A"} • Période : {c.periodeControleeDebut ? new Date(c.periodeControleeDebut).getFullYear() : 2024} - {c.periodeControleeFin ? new Date(c.periodeControleeFin).getFullYear() : 2026}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recours & Réclamations Contentieuses (EF-035) */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Voies de Recours &amp; Réclamations Contentieuses ({reclamations.length})
              </h2>
              <button
                type="button"
                onClick={() => {
                  clearRecoursError();
                  setShowRecoursModal(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                <span>Nouveau recours</span>
              </button>
            </div>

            {reclamations.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 border border-dashed rounded-lg">
                Aucune réclamation contentieuse ou demande gracieuse introduite.
              </div>
            ) : (
              <div className="space-y-2">
                {reclamations.map((rec) => (
                  <div key={rec.id} className="p-3 border rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{rec.typeRecours}</p>
                      <p className="text-gray-500">{rec.objet}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {rec.statut}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Déclarer un Contrôle */}
      {showControleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Enregistrer un Avis de Contrôle Fiscal (CGI Art. 673+)
              </h3>
              <button
                onClick={() => setShowControleModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <FormErrorAlert error={controleError} onClose={clearControleError} />

            <form onSubmit={handleCreerControle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Type de procédure
                </label>
                <select
                  value={ctrlType}
                  onChange={(e) => setCtrlType(e.target.value as any)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="SUR_PIECES">Contrôle sur pièces (Vérification ponctuelle au bureau)</option>
                  <option value="SUR_PLACE">Vérification générale de comptabilité (Sur place en entreprise)</option>
                  <option value="PONCTUEL">Contrôle inopiné / Ponctuel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Date de notification de l&apos;Avis de Vérification
                </label>
                <input
                  type="date"
                  value={ctrlDateAvis}
                  onChange={(e) => setCtrlDateAvis(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Période vérifiée — Début
                  </label>
                  <input
                    type="date"
                    value={ctrlDebut}
                    onChange={(e) => setCtrlDebut(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Période vérifiée — Fin
                  </label>
                  <input
                    type="date"
                    value={ctrlFin}
                    onChange={(e) => setCtrlFin(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Service fiscal ou brigade en charge
                </label>
                <input
                  type="text"
                  value={ctrlService}
                  onChange={(e) => setCtrlService(e.target.value)}
                  placeholder="ex: Direction des Grandes Entreprises - Brigade 3"
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowControleModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 shadow-sm transition disabled:opacity-50"
                >
                  {actionLoading ? "Enregistrement..." : "Enregistrer la Procédure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Introduire un Recours */}
      {showRecoursModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Introduire un Recours Contentieux (CGI Art. 1105+)
              </h3>
              <button
                onClick={() => setShowRecoursModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <FormErrorAlert error={recoursError} onClose={clearRecoursError} />

            <form onSubmit={handleIntroduireRecours} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nature de la réclamation ou recours
                </label>
                <select
                  value={recoursType}
                  onChange={(e) => setRecoursType(e.target.value as any)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="RECLAMATION_PREALABLE">Réclamation préalable auprès du Directeur Général des Impôts</option>
                  <option value="RECOURS_HIERARCHIQUE">Recours hiérarchique auprès du Ministre de l&apos;Économie et des Finances</option>
                  <option value="RECOURS_JURIDICTIONNEL">Recours juridictionnel devant la Chambre Administrative</option>
                  <option value="DEMANDE_GRACIEUSE">Demande gracieuse en remise / modération de pénalités</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Date de dépôt du recours
                </label>
                <input
                  type="date"
                  value={recoursDateDepot}
                  onChange={(e) => setRecoursDateDepot(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Objet et motifs de la contestation *
                </label>
                <textarea
                  rows={4}
                  value={recoursObjet}
                  onChange={(e) => setRecoursObjet(e.target.value)}
                  required
                  placeholder="ex: Contestation de la remise en cause des amortissements dégressifs sur équipements industriels et demande d'abandon des majorations de mauvaise foi..."
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowRecoursModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 shadow-sm transition disabled:opacity-50"
                >
                  {actionLoading ? "Transmission..." : "Introduire le Recours"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
