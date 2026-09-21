"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { rhApi } from "../services/rhApi.service";
import type { RhContrat } from "../types/rh.types";
import {
  formatContractStatus,
  formatContractType,
  formatProbationStatus,
  formatAmendmentType,
  formatTerminationType,
} from "../utils/rhFormatters";
import { ErrorState } from "@/shared/components/feedback";
import { PencilIcon, FileIcon, TimeIcon, AlertIcon, DocsIcon, CheckCircleIcon, CloseIcon } from "@/icons";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contratId: string | null;
  onEdit?: (contrat: RhContrat) => void;
  onNewAvenant?: (contrat: RhContrat) => void;
  onManageEssai?: (contrat: RhContrat) => void;
  onRupture?: (contrat: RhContrat) => void;
  onSimulate?: (contrat: RhContrat) => void;
}

export const ContratDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  contratId,
  onEdit,
  onNewAvenant,
  onManageEssai,
  onRupture,
  onSimulate,
}) => {
  const [contrat, setContrats] = useState<RhContrat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"contrat" | "essai" | "avenants" | "rupture">("contrat");

  const loadContrat = () => {
    if (!contratId) return;
    setLoading(true);
    setError(null);
    rhApi
      .getContratById(contratId)
      .then((res) => {
        setContrats(res);
        setError(null);
      })
      .catch((err) => {
        console.warn("Erreur chargement détail contrat:", err);
        setError(err?.message || "Impossible de charger les détails du contrat.");
        setContrats(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen && contratId) {
      loadContrat();
    } else {
      setContrats(null);
      setError(null);
      setActiveTab("contrat");
    }
  }, [isOpen, contratId]);

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: contrat?.deviseCode || "XOF",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(val || 0);

  const formatNumber = (val?: number | null) =>
    new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(Number(val) || 0);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (statut?: string) => {
    switch (statut) {
      case "ACTIF":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "BROUILLON":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
      case "SUSPENDU":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "ROMPU":
      case "RESILIE":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      case "TERMINE":
      case "CLOTURE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const essai = contrat?.periodeEssai || (contrat?.periodesEssai && contrat.periodesEssai[0]);
  const avenants = contrat?.avenants || [];
  const rupture = contrat?.rupture;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl p-0 overflow-hidden bg-white dark:bg-gray-900 rounded-2xl"
    >
      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Chargement du dossier contractuel...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 space-y-4">
          <ErrorState
            title="Erreur de chargement du contrat"
            message={error}
            onRetry={loadContrat}
          />
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
            >
              Fermer
            </button>
          </div>
        </div>
      ) : !contrat ? (
        <div className="py-16 text-center text-gray-500">
          <p className="font-medium text-gray-700 dark:text-gray-300">Contrat introuvable</p>
          <button
            onClick={onClose}
            className="mt-4 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
          >
            Fermer
          </button>
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Header Bannière */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50 p-6 dark:border-gray-800 dark:from-gray-850 dark:via-gray-900 dark:to-gray-850">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 font-bold text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 text-xl shadow-xs">
                  {contrat.employe?.prenoms?.[0] || "C"}
                  {contrat.employe?.nom?.[0] || "T"}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {contrat.employe
                        ? `${contrat.employe.nom} ${contrat.employe.prenoms}`
                        : "Salarié"}
                    </h2>
                    <span className="font-mono text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                      {contrat.employe?.matricule}
                    </span>
                    {(() => {
                      const cBadge = formatContractStatus(contrat.statut);
                      return (
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cBadge.badgeClass}`}>
                          {cBadge.label}
                        </span>
                      );
                    })()}
                    <span className="rounded-md bg-brand-50 border border-brand-200/60 px-2 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-950/50 dark:border-brand-800 dark:text-brand-300">
                      {formatContractType(contrat.typeContrat)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                    {contrat.poste?.intitule || "Poste non défini"} •{" "}
                    <span className="text-gray-500 dark:text-gray-400">
                      {contrat.etablissement?.nom || "Établissement principal"}
                    </span>
                  </p>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">
                    N° Contrat : {contrat.numeroContrat}
                  </p>
                </div>
              </div>

              {/* Boutons d'actions rapides */}
              <div className="flex flex-wrap items-center gap-2">
                {onEdit && contrat.statut !== "ROMPU" && (
                  <button
                    onClick={() => onEdit(contrat)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750"
                  >
                    <PencilIcon className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                    <span>Modifier</span>
                  </button>
                )}
                {onNewAvenant && contrat.statut === "ACTIF" && (
                  <button
                    onClick={() => onNewAvenant(contrat)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-brand-600 transition-colors"
                  >
                    <DocsIcon className="h-3.5 w-3.5 shrink-0 text-white" />
                    <span>Nouvel Avenant</span>
                  </button>
                )}
                {onManageEssai && essai && essai.statutIssue === "EN_COURS" && (
                  <button
                    onClick={() => onManageEssai(contrat)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-amber-600 transition-colors"
                  >
                    <TimeIcon className="h-3.5 w-3.5 shrink-0 text-white" />
                    <span>Gérer l'Essai</span>
                  </button>
                )}
                {onRupture && contrat.statut === "ACTIF" && (
                  <button
                    onClick={() => onRupture(contrat)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                  >
                    <AlertIcon className="h-3.5 w-3.5 shrink-0 text-rose-700 dark:text-rose-300" />
                    <span>Rupture</span>
                  </button>
                )}
              </div>
            </div>

            {/* Onglets */}
            <div className="mt-6 flex gap-2 border-b border-gray-200 dark:border-gray-800 -mb-6">
              <button
                onClick={() => setActiveTab("contrat")}
                className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === "contrat"
                    ? "border-brand-500 text-brand-600 dark:text-brand-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <FileIcon className="h-4 w-4 shrink-0" />
                <span>Conditions Contractuelles</span>
              </button>
              <button
                onClick={() => setActiveTab("essai")}
                className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === "essai"
                    ? "border-brand-500 text-brand-600 dark:text-brand-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <TimeIcon className="h-4 w-4 shrink-0" />
                <span>Période d'Essai</span>
                {essai && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      essai.statutIssue === "EN_COURS"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {formatProbationStatus(essai.statutIssue).label}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("avenants")}
                className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === "avenants"
                    ? "border-brand-500 text-brand-600 dark:text-brand-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <DocsIcon className="h-4 w-4 shrink-0" />
                <span>Avenants & Carrière</span>
                <span className="rounded-full bg-brand-100 px-1.5 py-0.2 text-[10px] font-bold text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                  {avenants.length}
                </span>
              </button>
              {rupture && (
                <button
                  onClick={() => setActiveTab("rupture")}
                  className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === "rupture"
                      ? "border-rose-500 text-rose-600 dark:text-rose-400"
                      : "border-transparent text-rose-500 hover:text-rose-700 dark:text-rose-400"
                  }`}
                >
                  <AlertIcon className="h-4 w-4 shrink-0" />
                  <span>Rupture du Contrat</span>
                </button>
              )}
            </div>
          </div>

          {/* Contenu de l'onglet actif */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* ONGLET 1 : CONTRAT */}
            {activeTab === "contrat" && (
              <div className="space-y-6">
                {/* Rémunération & Durée */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Salaire de base mensuel
                    </span>
                    <p className="mt-1 text-2xl font-black font-mono text-gray-900 dark:text-white">
                      {formatCurrency(contrat.salaireBaseMensuel)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Brut soumis aux cotisations CNSS & ITS</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Durée hebdomadaire
                    </span>
                    <p className="mt-1 text-2xl font-black font-mono text-gray-900 dark:text-white">
                      {contrat.dureeHebdoContrat || 40} h
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Temps plein légal (Code du travail)</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Période du Contrat
                    </span>
                    <p className="mt-1 text-sm font-bold text-gray-800 dark:text-gray-200">
                      Du {formatDate(contrat.dateDebut)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {contrat.dateFinPrevue
                        ? `Jusqu'au ${formatDate(contrat.dateFinPrevue)}`
                        : "Durée Indéterminée (CDI)"}
                    </p>
                  </div>
                </div>

                {/* Détails complémentaires */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                    Paramètres & Clauses Contractuelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <span className="text-xs text-gray-400">Date de signature :</span>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {formatDate(contrat.dateSignature)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Établissement d'affectation :</span>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {contrat.etablissement?.nom || "Principal"} ({contrat.etablissement?.code || "HQ"})
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Poste & Fonction :</span>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {contrat.poste?.intitule || "—"} ({contrat.poste?.code || "—"})
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Convention Collective :</span>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {contrat.conventionCollective?.intitule || "Convention Collective Générale du Travail (CCGT Bénin)"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Clause d'exclusivité :</span>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        {contrat.clauseExclusivite ? (
                          <>
                            <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>Oui (Exclusivité totale)</span>
                          </>
                        ) : (
                          <>
                            <CloseIcon className="h-4 w-4 text-gray-400 shrink-0" />
                            <span>Non</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Clause de non-concurrence :</span>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        {contrat.clauseNonConcurrence ? (
                          <>
                            <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>Oui (Non-concurrence post-contrat)</span>
                          </>
                        ) : (
                          <>
                            <CloseIcon className="h-4 w-4 text-gray-400 shrink-0" />
                            <span>Non</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {contrat.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-xs text-gray-400">Notes & Observations :</span>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 italic">
                        {contrat.notes}
                      </p>
                    </div>
                  )}

                  {contrat.fichierContratUrl && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <a
                        href={contrat.fichierContratUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
                      >
                        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span>Consulter le contrat signé numérisé (PDF)</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Simulateur rapide */}
                {onSimulate && (
                  <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-brand-50 to-brand-100/50 p-4 dark:from-brand-950/40 dark:to-brand-900/20 border border-brand-200/50 dark:border-brand-800/50">
                    <div>
                      <p className="text-sm font-bold text-brand-900 dark:text-brand-200">
                        Estimation de l'indemnité de licenciement CCGT
                      </p>
                      <p className="text-xs text-brand-700 dark:text-brand-300">
                        Calculer l'indemnité selon le barème légal béninois basé sur le salaire de base et l'ancienneté.
                      </p>
                    </div>
                    <button
                      onClick={() => onSimulate(contrat)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <rect x="4" y="2" width="16" height="20" rx="2" />
                        <line x1="8" y1="6" x2="16" y2="6" />
                        <line x1="16" y1="14" x2="16" y2="18" />
                        <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" strokeWidth={3} strokeLinecap="round" />
                      </svg>
                      <span>Simuler CCGT</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ONGLET 2 : PÉRIODE D'ESSAI */}
            {activeTab === "essai" && (
              <div className="space-y-6">
                {!essai ? (
                  <div className="py-12 text-center text-gray-500">
                    <p className="text-sm">Aucune période d'essai stipulée dans ce contrat.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-2xs">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            Suivi de la Période d'Essai
                          </h4>
                          <p className="text-xs text-gray-400">
                            Réglementation Art. 19-24 du Code du Travail du Bénin
                          </p>
                        </div>
                        {(() => {
                          const pBadge = formatProbationStatus(essai.statutIssue);
                          return (
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${pBadge.badgeClass}`}>
                              {pBadge.label}
                            </span>
                          );
                        })()}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <span className="text-xs text-gray-400">Période initiale :</span>
                          <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                            Du {formatDate(essai.dateDebut)} au {formatDate(essai.dateFin)}
                          </p>
                          {essai.dureeJoursOuvres && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {essai.dureeJoursOuvres} jours ouvrés
                            </p>
                          )}
                        </div>

                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <span className="text-xs text-gray-400">Renouvellement écrit unique :</span>
                          <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                            {essai.estRenouvele
                              ? `Oui — du ${formatDate(essai.dateDebutRenouvellement)} au ${formatDate(
                                  essai.dateFinRenouvellement
                                )}`
                              : "Non renouvelé"}
                          </p>
                        </div>
                      </div>

                      {essai.motifRupture && (
                        <div className="mt-4 p-3 bg-rose-50 border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900 rounded-lg text-sm text-rose-800 dark:text-rose-300">
                          <span className="font-bold">Motif / Commentaire : </span>
                          {essai.motifRupture}
                        </div>
                      )}

                      {onManageEssai && essai.statutIssue === "EN_COURS" && (
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={() => onManageEssai(contrat)}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 shadow-xs transition-all"
                          >
                            <TimeIcon className="h-4 w-4 shrink-0 text-white" />
                            <span>Actionner l'Essai (Valider / Renouveler / Rompre)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ONGLET 3 : AVENANTS */}
            {activeTab === "avenants" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    Historique des Évolutions & Avenants
                  </h4>
                  {onNewAvenant && contrat.statut === "ACTIF" && (
                    <button
                      onClick={() => onNewAvenant(contrat)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 shadow-2xs"
                    >
                      + Créer un Avenant
                    </button>
                  )}
                </div>

                {avenants.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Aucun avenant enregistré
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Les augmentations de salaires, changements de poste ou modifications du temps de travail apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {avenants.map((av) => {
                      const diffSalaire =
                        av.salaireBaseApres && av.salaireBaseAvant
                          ? av.salaireBaseApres - av.salaireBaseAvant
                          : 0;
                      const pctSalaire =
                        av.salaireBaseAvant && diffSalaire
                          ? ((diffSalaire / av.salaireBaseAvant) * 100).toFixed(1)
                          : null;

                      return (
                        <div
                          key={av.id}
                          className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                                {av.numeroAvenant}
                              </span>
                              <span className="rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 text-xs font-bold">
                                {formatAmendmentType(av.typeModification)}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400 font-medium">
                              Effet au {formatDate(av.dateEffet)}
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {av.salaireBaseApres && (
                              <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <span className="text-xs text-gray-400">Évolution Salariale :</span>
                                <div className="flex items-baseline gap-2 mt-0.5">
                                  <span className="font-bold text-gray-900 dark:text-white font-mono">
                                    {formatCurrency(av.salaireBaseApres)}
                                  </span>
                                  {diffSalaire !== 0 && (
                                    <span
                                      className={`text-xs font-bold ${
                                        diffSalaire > 0
                                          ? "text-emerald-600 dark:text-emerald-400"
                                          : "text-rose-600 dark:text-rose-400"
                                      }`}
                                    >
                                      {diffSalaire > 0 ? "+" : ""}
                                      {formatCurrency(diffSalaire)} ({pctSalaire}%)
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {av.tempsTravailApres && (
                              <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <span className="text-xs text-gray-400">Temps de travail :</span>
                                <p className="font-bold text-gray-900 dark:text-white mt-0.5">
                                  {av.tempsTravailApres} h / semaine
                                </p>
                              </div>
                            )}
                          </div>

                          {av.detailsModificationsJson && (
                            <p className="mt-2 text-xs text-gray-500 italic">
                              {typeof av.detailsModificationsJson === "string"
                                ? av.detailsModificationsJson
                                : JSON.stringify(av.detailsModificationsJson)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ONGLET 4 : RUPTURE */}
            {activeTab === "rupture" && rupture && (
              <div className="space-y-4">
                <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900 dark:bg-rose-950/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-rose-900 dark:text-rose-200">
                        Données de Clôture & Rupture de Contrat
                      </h4>
                      <p className="text-xs text-rose-700 dark:text-rose-400">
                        Notifié le {formatDate(rupture.dateNotification)} • Effet le{" "}
                        {formatDate(rupture.dateEffet)}
                      </p>
                    </div>
                    <span className="rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-3 py-1 text-xs font-bold">
                      {formatTerminationType(rupture.typeRupture)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-rose-100 dark:border-rose-900">
                      <span className="text-xs text-gray-400">Préavis :</span>
                      <p className="font-bold text-gray-900 dark:text-white mt-0.5">
                        {rupture.dureePreavisJours} jours
                        {rupture.dispensePreavis ? " (Dispensé)" : ""}
                      </p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {formatCurrency(rupture.montantIndemnitePreavis)}
                      </p>
                    </div>

                    <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-rose-100 dark:border-rose-900">
                      <span className="text-xs text-gray-400">Indemnité Licenciement CCGT :</span>
                      <p className="font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                        {formatCurrency(rupture.montantIndemniteLicenciement)}
                      </p>
                      <p className="text-xs text-gray-400">Barème légal Bénin</p>
                    </div>

                    <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-rose-100 dark:border-rose-900">
                      <span className="text-xs text-gray-400">Congés Payés & Dommages :</span>
                      <p className="font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                        {formatCurrency(
                          (rupture.montantIndemniteCongesPayes || 0) +
                            (rupture.montantDommagesInterets || 0)
                        )}
                      </p>
                      <p className="text-xs text-gray-400">Solde de tout compte</p>
                    </div>
                  </div>

                  {rupture.motifDetaille && (
                    <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-lg border border-rose-100 dark:border-rose-900">
                      <span className="text-xs text-gray-400 font-bold">Motif légal :</span>
                      <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                        {rupture.motifDetaille}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pied de modal */}
          <div className="border-t border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-850 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
