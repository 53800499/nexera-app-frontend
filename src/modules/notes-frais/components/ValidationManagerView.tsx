"use client";

import React, { useState } from "react";
import { useRapportsFrais } from "../hooks/useNotesFrais";
import { ndfApi } from "../services/ndfApi.service";
import type { NdfRapportFrais } from "../types/notesFrais.types";
import {
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import {
  IconInboxCheck,
  IconShieldAlert,
  IconAlertTriangle,
  IconCheckCircle,
  IconSearch,
  IconPaperclip,
  IconClose,
  IconCheck,
} from "./NdfIcons";

export const ValidationManagerView: React.FC = () => {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );

  const { rapports, isLoading, validerRapport, rejeterRapport, isValidating, isRejecting } =
    useRapportsFrais({ statut: "EN_VALIDATION" });

  const [selectedRapport, setSelectedRapport] = useState<NdfRapportFrais | null>(null);
  const [commentaireApprobation, setCommentaireApprobation] = useState("");
  const [motifRejet, setMotifRejet] = useState("");
  const [isModalRejetOpen, setIsModalRejetOpen] = useState(false);

  const handleOpenReport = async (rap: NdfRapportFrais) => {
    try {
      const full = await ndfApi.getRapportById(rap.id);
      setSelectedRapport(full);
    } catch (err) {
      console.error(err);
      setSelectedRapport(rap);
    }
  };

  const handleApprouver = (id: string) => {
    const rapName = selectedRapport?.numeroRapport || "Rapport";
    void runAction({
      confirm: {
        title: "Approuver ce rapport de frais ?",
        message: `La note de frais « ${selectedRapport?.objet || ""} » (${formatCurrency(selectedRapport?.montantTotal)}) sera validée. Les écritures comptables d'engagement (SYSCOHADA) et l'ordre de remboursement seront automatiquement générés.`,
        confirmLabel: "Approuver et Valider",
        variant: "default",
      },
      loadingMessage: "Validation du rapport de frais...",
      success: {
        title: "Rapport validé avec succès",
        message: `${rapName} a été validé et transmis pour remboursement.`,
      },
      error: {
        title: "Échec de validation",
        message: "Le rapport n'a pas pu être validé.",
      },
      action: async () => {
        await validerRapport({ id, commentaire: commentaireApprobation || undefined });
        setSelectedRapport(null);
        setCommentaireApprobation("");
      },
    });
  };

  const handleRejeter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRapport || !motifRejet) return;

    const rapId = selectedRapport.id;
    const rapName = selectedRapport.numeroRapport;

    void runAction({
      loadingMessage: "Envoi du rejet...",
      success: {
        title: "Rapport rejeté",
        message: `Le rapport ${rapName} a été renvoyé au collaborateur avec le motif fourni.`,
      },
      error: {
        title: "Erreur lors du rejet",
        message: "Impossible de rejeter le rapport.",
      },
      action: async () => {
        await rejeterRapport({ id: rapId, motifRejet });
        setIsModalRejetOpen(false);
        setSelectedRapport(null);
        setMotifRejet("");
      },
    });
  };

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Validation des Notes de Frais (Espace Manager)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Contrôle hiérarchique, audit des anomalies IA et déclenchement automatique des écritures comptables
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Liste des rapports en attente */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Notes de frais à valider ({rapports.length})
          </h3>

          {isLoading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-900">
              Chargement des dossiers...
            </div>
          ) : rapports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">
              <IconInboxCheck className="mx-auto size-8 text-emerald-500 mb-2 opacity-80" />
              <span>Aucune note de frais en attente de validation.</span>
            </div>
          ) : (
            rapports.map((rap) => {
              const isSelected = selectedRapport?.id === rap.id;
              const hasBloquant = rap.anomalies?.some(
                (a) => a.regleDetection?.niveauSeverite === "BLOQUANT" && a.statut === "DETECTEE",
              );

              return (
                <div
                  key={rap.id}
                  onClick={() => handleOpenReport(rap)}
                  className={`cursor-pointer rounded-xl border p-4 transition shadow-sm ${
                    isSelected
                      ? "border-brand-500 bg-brand-50/30 dark:border-brand-500 dark:bg-brand-950/20"
                      : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                      {rap.numeroRapport}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(rap.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  <h4 className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {rap.objet}
                  </h4>

                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Salarié : {rap.employe ? `${rap.employe.nom} ${rap.employe.prenoms}` : "—"}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-xs dark:border-gray-800">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(rap.montantTotal)}
                    </span>
                    {hasBloquant ? (
                      <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
                        <IconShieldAlert className="size-3 text-rose-600 dark:text-rose-400" />
                        Anomalie bloquante
                      </span>
                    ) : rap.scoreRisqueIa && rap.scoreRisqueIa > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                        <IconAlertTriangle className="size-3 text-amber-600 dark:text-amber-400" />
                        Risque {rap.scoreRisqueIa}%
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                        <IconCheckCircle className="size-3 text-emerald-600 dark:text-emerald-400" />
                        Conforme
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Détail & Actions de Validation */}
        <div className="lg:col-span-7">
          {selectedRapport ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                <div>
                  <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                    {selectedRapport.numeroRapport}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedRapport.objet}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">Montant net à rembourser</span>
                  <p className="text-2xl font-black text-brand-600 dark:text-brand-400">
                    {formatCurrency(selectedRapport.montantTotal)}
                  </p>
                </div>
              </div>

              {/* Alertes d'anomalies sur ce rapport */}
              {selectedRapport.anomalies && selectedRapport.anomalies.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <h4 className="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-amber-900 dark:text-amber-200">
                    <IconSearch className="size-3.5 text-amber-700 dark:text-amber-300" />
                    Analyse IA & Risques de Conformité :
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-amber-900 dark:text-amber-300">
                    {selectedRapport.anomalies.map((a) => (
                      <li key={a.id} className="flex items-start gap-2">
                        <span>•</span>
                        <span>
                          <strong>[{a.regleDetection?.typeRegle}]</strong> {a.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Détail des dépenses */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Dépenses & Justificatifs rattachés ({selectedRapport.depenses?.length || 0})
                </h4>
                <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      <tr>
                        <th className="p-2.5 font-semibold">Date</th>
                        <th className="p-2.5 font-semibold">Catégorie</th>
                        <th className="p-2.5 font-semibold">Fournisseur</th>
                        <th className="p-2.5 font-semibold text-right">TTC</th>
                        <th className="p-2.5 font-semibold text-center">Paiement</th>
                        <th className="p-2.5 font-semibold text-center">Reçu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {selectedRapport.depenses?.map((d) => (
                        <tr key={d.id}>
                          <td className="p-2.5 text-gray-600 dark:text-gray-300">
                            {new Date(d.dateDepense).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="p-2.5 font-medium text-gray-900 dark:text-white">
                            {d.categorieDepense?.libelle}
                          </td>
                          <td className="p-2.5 text-gray-600 dark:text-gray-400">
                            {d.fournisseurLibelle || "—"}
                          </td>
                          <td className="p-2.5 text-right font-bold text-gray-900 dark:text-white">
                            {formatCurrency(d.montantTtc)}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px]">
                              {d.modePaiement}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            {d.justificatifs && d.justificatifs.length > 0 ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                                <IconPaperclip className="size-3" />
                                Oui
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-500 font-semibold">
                                <IconClose className="size-3" />
                                Non
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Formulaire de validation */}
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50 space-y-3">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Commentaire du valideur (Optionnel)
                </label>
                <input
                  type="text"
                  value={commentaireApprobation}
                  onChange={(e) => setCommentaireApprobation(e.target.value)}
                  placeholder="Ex: Conforme à la politique de voyage, approuvé."
                  className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsModalRejetOpen(true)}
                    disabled={isRejecting}
                    className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                  >
                    Rejeter la note
                  </button>
                  <button
                    onClick={() => handleApprouver(selectedRapport.id)}
                    disabled={isValidating}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <IconCheck className="size-4" />
                    <span>{isValidating ? "Validation en cours..." : "Approuver & Comptabiliser"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-900">
              Sélectionnez une note de frais dans la liste de gauche pour l'examiner et la valider.
            </div>
          )}
        </div>
      </div>

      {/* Modal Rejet Motivé */}
      {isModalRejetOpen && selectedRapport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Motif du rejet du rapport
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Le collaborateur sera notifié et invité à corriger les éléments mentionnés.
            </p>
            <form onSubmit={handleRejeter} className="mt-4 space-y-4">
              <div>
                <textarea
                  required
                  rows={4}
                  value={motifRejet}
                  onChange={(e) => setMotifRejet(e.target.value)}
                  placeholder="Ex: Justificatif manquant pour le dîner du 12/02, montant d'hébergement supérieur au plafond autorisé..."
                  className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalRejetOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isRejecting}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700"
                >
                  Confirmer le rejet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
