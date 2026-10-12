"use client";

import React, { useEffect, useState } from "react";
import { useActionFeedback } from "@/shared/components/feedback";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import { comptabiliteApi } from "../services/comptabiliteApi.service";
import type { ComptaEcriture } from "../types/comptabilite.types";
import { CheckStampIcon, CheckCircleIcon, XCircleIcon } from "./ComptaIcons";

export const ValidationWorkflowView: React.FC = () => {
  const { confirm, showResult } = useActionFeedback();
  const user = useAuthUser();
  const [enAttente, setEnAttente] = useState<ComptaEcriture[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeEcriture, setActiveEcriture] = useState<ComptaEcriture | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Rejet
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [motifRejet, setMotifRejet] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    chargerFile();
  }, []);

  const chargerFile = async () => {
    setIsLoading(true);
    try {
      const data = await comptabiliteApi.getEnAttenteValidation();
      setEnAttente(data);
      if (data.length > 0 && !activeEcriture) {
        setActiveEcriture(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === enAttente.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(enAttente.map((e) => e.id));
    }
  };

  const isAdmin = Boolean(
    user?.roles?.some((r: any) =>
      ['ADMIN', 'CEO', 'SUPER_ADMIN', 'admin', 'dirigeant', 'CABINET_ADMIN'].includes(
        typeof r === 'string' ? r : r?.code || r?.name || '',
      ),
    ) ||
    ['ADMIN', 'CEO', 'SUPER_ADMIN', 'admin', 'dirigeant', 'CABINET_ADMIN'].includes((user as any)?.role || ''),
  );

  const handleValiderUnique = async (ecriture: ComptaEcriture) => {
    if (ecriture.saisiPar === user?.id && !isAdmin) {
      showResult({
        variant: "error",
        title: "Séparation des tâches (EF-008)",
        message: "Vous ne pouvez pas valider votre propre saisie comptable. Un second regard par un superviseur est requis.",
      });
      return;
    }

    const confirmed = await confirm({
      title: "Valider l'écriture comptable",
      message: `Confirmez-vous la validation de l'écriture "${ecriture.pieceRef || ecriture.libelle}" ? Elle sera scellée et inaltérable.`,
      confirmLabel: "Valider et sceller",
      cancelLabel: "Annuler",
      variant: "default",
    });
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      await comptabiliteApi.deciderEcriture(ecriture.id, { decision: "VALIDEE" });
      setSelectedIds((prev) => prev.filter((i) => i !== ecriture.id));
      showResult({
        variant: "success",
        title: "Écriture validée",
        message: "L'écriture comptable a été validée avec succès.",
      });
      await chargerFile();
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur validation",
        message: err.message || "Erreur lors de la validation de l'écriture.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValiderLot = async () => {
    if (selectedIds.length === 0) return;

    // Vérifier séparation des tâches pour le lot si non administrateur
    if (!isAdmin) {
      const propreSaisie = enAttente.filter(
        (e) => selectedIds.includes(e.id) && e.saisiPar === user?.id,
      );
      if (propreSaisie.length > 0) {
        showResult({
          variant: "error",
          title: "Séparation des tâches (EF-008)",
          message: `Le lot sélectionné contient ${propreSaisie.length} écriture(s) dont vous êtes l'auteur. Veuillez les désélectionner.`,
        });
        return;
      }
    }

    const confirmed = await confirm({
      title: "Validation groupée par lot",
      message: `Confirmez-vous la validation définitive de ces ${selectedIds.length} écriture(s) en attente ?`,
      confirmLabel: `Valider (${selectedIds.length})`,
      cancelLabel: "Annuler",
      variant: "default",
    });
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const res = await comptabiliteApi.validerLot({
        ecritureIds: selectedIds,
        decision: "VALIDEE",
      });
      showResult({
        variant: "success",
        title: "Validation par lot terminée",
        message: `${res.results?.length || 0} écriture(s) ont été validées avec succès.`,
      });
      setSelectedIds([]);
      await chargerFile();
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur validation par lot",
        message: err.message || "Erreur lors de la validation du lot d'écritures.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmerRejet = async () => {
    if (!rejectingId || !motifRejet.trim()) {
      showResult({
        variant: "error",
        title: "Motif obligatoire (EF-029)",
        message: "Le motif de rejet est obligatoire pour expliciter les corrections requises.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await comptabiliteApi.deciderEcriture(rejectingId, {
        decision: "REJETEE",
        motifRejet: motifRejet.trim(),
      });
      setShowRejectModal(false);
      setRejectingId(null);
      setMotifRejet("");
      showResult({
        variant: "success",
        title: "Écriture rejetée",
        message: "L'écriture a été renvoyée à son auteur avec le motif de rejet spécifié.",
      });
      await chargerFile();
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur rejet écriture",
        message: err.message || "Erreur lors du rejet de l'écriture.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (val: number) =>
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
            Circuit de Validation des Écritures
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Contrôle d'imputations, règle EF-008 de séparation des tâches et attribution du N° séquentiel définitif.
          </p>
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={handleValiderLot}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-500 transition"
          >
            <CheckStampIcon className="w-4 h-4" />
            Valider la Sélection ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Main Grid: Queue on Left (2 cols), Details Drawer on Right (1 col) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Table de file d'attente (2 cols) */}
        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/75 p-3.5 dark:border-gray-800 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedIds.length === enAttente.length && enAttente.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {enAttente.length} écriture(s) en attente d'approbation
              </span>
            </div>
            <button
              onClick={chargerFile}
              className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Actualiser
            </button>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : enAttente.length === 0 ? (
              <div className="py-16 text-center">
                <CheckStampIcon className="mx-auto h-12 w-12 text-emerald-500 opacity-80" />
                <p className="mt-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                  File de validation vide
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Toutes les écritures manuelles et événements amont ont été examinés.
                </p>
              </div>
            ) : (
              enAttente.map((e) => {
                const totalDeb = e.lignes.reduce((s, l) => s + Number(l.montantDebit || 0), 0);
                const isSelected = selectedIds.includes(e.id);
                const isActive = activeEcriture?.id === e.id;
                const estAuteur = e.saisiPar === user?.id;

                return (
                  <div
                    key={e.id}
                    onClick={() => setActiveEcriture(e)}
                    className={`flex items-center justify-between p-4 cursor-pointer transition ${
                      isActive
                        ? "bg-blue-50/70 border-l-4 border-blue-600 dark:bg-blue-950/30"
                        : "hover:bg-gray-50/70 dark:hover:bg-gray-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(evt) => {
                          evt.stopPropagation();
                          handleToggleSelect(e.id);
                        }}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {e.journal?.codeJournal || "OD"}
                          </span>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                            {e.libelle}
                          </span>
                          {estAuteur && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Votre saisie (EF-008)
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] text-gray-500">
                          {new Date(e.dateEcriture).toLocaleDateString("fr-FR")} • Réf: {e.pieceRef || "—"} • Origine: {e.origine}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                        {formatCurrency(totalDeb)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(evt) => {
                            evt.stopPropagation();
                            handleValiderUnique(e);
                          }}
                          disabled={(estAuteur && !isAdmin) || isProcessing}
                          title={estAuteur && !isAdmin ? "EF-008 : Séparation des tâches (superviseur requis)" : "Valider et sceller l'écriture"}
                          aria-label="Valider l'écriture"
                          className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300 transition shadow-xs"
                        >
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(evt) => {
                            evt.stopPropagation();
                            setRejectingId(e.id);
                            setShowRejectModal(true);
                          }}
                          title="Rejeter l'écriture (avec motif)"
                          aria-label="Rejeter l'écriture"
                          className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300 transition shadow-xs"
                        >
                          <XCircleIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Détail de l'écriture active (1 col) */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {activeEcriture ? (
            <div className="space-y-4">
              <div className="pb-3 border-b border-gray-200 dark:border-gray-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Détail de la Pièce
                </span>
                <h3 className="mt-1 text-base font-bold text-gray-900 dark:text-white">
                  {activeEcriture.libelle}
                </h3>
                <p className="text-xs text-gray-500">
                  Journal {activeEcriture.journal?.libelle} ({activeEcriture.journal?.codeJournal})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Date :</span>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {new Date(activeEcriture.dateEcriture).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Pièce Réf :</span>
                  <p className="font-medium text-gray-800 dark:text-gray-200 font-mono">
                    {activeEcriture.pieceRef || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Saisi par :</span>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {activeEcriture.saisiPar}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Statut actuel :</span>
                  <p className="font-medium text-amber-600 dark:text-amber-400">
                    {activeEcriture.statut}
                  </p>
                </div>
              </div>

              {/* Lignes débit / crédit */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 pb-2">
                  Imputations Comptables SYSCOHADA :
                </h4>
                <div className="space-y-2">
                  {activeEcriture.lignes.map((l, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-gray-100 bg-gray-50/70 p-2 text-xs dark:border-gray-800 dark:bg-gray-800/40"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                          {l.compte?.numero || "Compte"} — {l.compte?.intitule}
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            Number(l.montantDebit) > 0
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-purple-600 dark:text-purple-400"
                          }`}
                        >
                          {Number(l.montantDebit) > 0
                            ? `D: ${formatCurrency(Number(l.montantDebit))}`
                            : `C: ${formatCurrency(Number(l.montantCredit))}`}
                        </span>
                      </div>
                      {l.libelleLigne && (
                        <p className="mt-1 text-[11px] text-gray-500">{l.libelleLigne}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingId(activeEcriture.id);
                    setShowRejectModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
                >
                  <XCircleIcon className="w-3.5 h-3.5" />
                  Rejeter
                </button>
                <button
                  type="button"
                  onClick={() => handleValiderUnique(activeEcriture)}
                  disabled={(activeEcriture.saisiPar === user?.id && !isAdmin) || isProcessing}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-500 disabled:opacity-50"
                >
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  Valider Définitivement
                </button>
              </div>
            </div>
          ) : (
            <p className="py-12 text-center text-xs text-gray-400">
              Sélectionnez une écriture pour afficher ses lignes détaillées.
            </p>
          )}
        </div>
      </div>

      {/* Modal Rejet */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Rejeter l'écriture comptable
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Règle EF-029 : Un motif précis de rejet est obligatoire pour traçabilité et correction.
            </p>

            <div className="mt-4">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Motif du rejet
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ex: Compte de TVA 443 manquant, pièce justificative illisible..."
                value={motifRejet}
                onChange={(e) => setMotifRejet(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingId(null);
                }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!motifRejet.trim() || isProcessing}
                onClick={handleConfirmerRejet}
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-rose-500 disabled:opacity-50"
              >
                Confirmer le Rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
