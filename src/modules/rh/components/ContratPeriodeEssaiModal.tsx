"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { rhApi } from "../services/rhApi.service";
import type { RhContrat, RhProbationStatus } from "../types/rh.types";
import { useActionFeedback, useToast } from "@/shared/components/feedback";
import { formatContractType, formatProbationStatus } from "../utils/rhFormatters";
import { CheckCircleIcon, TimeIcon, CloseIcon } from "@/icons";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contrat: RhContrat | null;
  onSuccess: () => void;
}

export const ContratPeriodeEssaiModal: React.FC<Props> = ({
  isOpen,
  onClose,
  contrat,
  onSuccess,
}) => {
  const { runAction } = useActionFeedback();
  const toast = useToast();

  const [mode, setMode] = useState<"VALIDER" | "RENOUVELER" | "ROMPRE">("VALIDER");

  // Pour renouvellement
  const [dateDebutRenouv, setDateDebutRenouv] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dateFinRenouv, setDateFinRenouv] = useState("");
  const [motifRenouv, setMotifRenouv] = useState(
    "Renouvellement écrit unique convenu d'un commun accord (Art. 21 Code du Travail Bénin)"
  );

  // Pour rupture
  const [statutRupture, setStatutRupture] = useState<"ROMPUE_EMPLOYEUR" | "ROMPUE_SALARIE">(
    "ROMPUE_EMPLOYEUR"
  );
  const [dateNotificationRupture, setDateNotificationRupture] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [motifRupture, setMotifRupture] = useState("");

  const [loading, setLoading] = useState(false);

  if (!contrat) return null;
  const essai = contrat.periodeEssai || (contrat.periodesEssai && contrat.periodesEssai[0]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR");
    } catch {
      return dateStr;
    }
  };

  const handleValider = async () => {
    setLoading(true);
    await runAction({
      loadingMessage: "Validation de la période d'essai...",
      success: {
        title: "Embauche définitive confirmée",
        message: `La période d'essai de ${contrat.employe?.prenoms} ${contrat.employe?.nom} est validée avec succès.`,
      },
      error: { title: "Erreur lors de la validation de l'essai" },
      action: async () => {
        await rhApi.cloreEssai(contrat.id, {
          statutIssue: "VALIDEE" as RhProbationStatus,
        });
        onSuccess();
        onClose();
      },
    });
    setLoading(false);
  };

  const handleRenouveler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateFinRenouv) {
      toast.warning("Champs requis", "Veuillez spécifier la date d'échéance du renouvellement.");
      return;
    }
    if (essai?.estRenouvele) {
      toast.error(
        "Renouvellement impossible",
        "La période d'essai a déjà été renouvelée une fois (limite légale Art. 21 CT Bénin)."
      );
      return;
    }

    setLoading(true);
    await runAction({
      loadingMessage: "Enregistrement du renouvellement d'essai...",
      success: {
        title: "Période d'essai renouvelée",
        message: `Prolongation enregistrée jusqu'au ${formatDate(dateFinRenouv)}.`,
      },
      error: { title: "Erreur lors du renouvellement de l'essai" },
      action: async () => {
        await rhApi.renouvelerEssai(contrat.id, {
          dateDebutRenouvellement: dateDebutRenouv,
          dateFinRenouvellement: dateFinRenouv,
          motif: motifRenouv,
        });
        onSuccess();
        onClose();
      },
    });
    setLoading(false);
  };

  const handleRompre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motifRupture.trim()) {
      toast.warning("Champs requis", "Veuillez renseigner le motif de la rupture d'essai.");
      return;
    }

    setLoading(true);
    await runAction({
      loadingMessage: "Enregistrement de la rupture de la période d'essai...",
      success: {
        title: "Rupture de la période d'essai enregistrée",
        message: `Le contrat a été clôturé pour cause de rupture d'essai.`,
      },
      error: { title: "Erreur lors de la rupture de l'essai" },
      action: async () => {
        await rhApi.cloreEssai(contrat.id, {
          statutIssue: statutRupture as RhProbationStatus,
          dateNotificationRupture,
          motifRupture,
        });
        onSuccess();
        onClose();
      },
    });
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-xl bg-white dark:bg-gray-900 rounded-2xl p-6"
    >
      <div className="border-b border-gray-100 pb-3 dark:border-gray-800 mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Gestion de la Période d'Essai</h2>
      </div>
      <div className="space-y-5">
        {/* Rappel du contrat et de l'essai actuel */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-850">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Salarié & Contrat
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {contrat.employe
                  ? `${contrat.employe.nom} ${contrat.employe.prenoms}`
                  : "Salarié"}
              </p>
              <p className="text-xs text-gray-500 font-mono">
                {contrat.numeroContrat} • {formatContractType(contrat.typeContrat)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Statut de l'essai :</span>
              <span className="block font-bold text-xs text-amber-600 dark:text-amber-400">
                {essai ? formatProbationStatus(essai.statutIssue).label : "Non Définie"}
              </span>
            </div>
          </div>

          {essai && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Période initiale :</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  Du {formatDate(essai.dateDebut)} au {formatDate(essai.dateFin)}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Renouvellement légal :</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {essai.estRenouvele ? "Déjà renouvelé (1/1)" : "Non renouvelé (0/1)"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sélection du mode */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button
            type="button"
            onClick={() => setMode("VALIDER")}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "VALIDER"
                ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" />
            <span>Valider l'Essai</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("RENOUVELER")}
            disabled={essai?.estRenouvele}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "RENOUVELER"
                ? "bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-2xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 disabled:opacity-40"
            }`}
          >
            <TimeIcon className="h-3.5 w-3.5 shrink-0" />
            <span>Renouveler</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("ROMPRE")}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "ROMPRE"
                ? "bg-white dark:bg-gray-900 text-rose-600 dark:text-rose-400 shadow-2xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            <CloseIcon className="h-3.5 w-3.5 shrink-0" />
            <span>Rompre l'Essai</span>
          </button>
        </div>

        {/* CONTENU SELON MODE */}
        {mode === "VALIDER" && (
          <div className="space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-5 dark:border-emerald-900 dark:bg-emerald-950/20">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
              Confirmation de l'Embauche Définitive
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-300">
              La période d'essai est concluante. Cette action confirme le salarié dans son poste de façon définitive au titre de son contrat {formatContractType(contrat.typeContrat)}.
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleValider}
                disabled={loading}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                {loading ? "Confirmation..." : "Confirmer l'Embauche Définitive"}
              </button>
            </div>
          </div>
        )}

        {mode === "RENOUVELER" && (
          <form onSubmit={handleRenouveler} className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300">
              <span className="font-bold">Cadre juridique (Art. 21 CT Bénin) : </span>
              Le renouvellement de la période d'essai ne peut intervenir qu'une seule fois et doit obligatoirement faire l'objet d'un accord écrit notifié au salarié avant l'échéance initiale.
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Date Début Renouvellement
                </label>
                <input
                  type="date"
                  value={dateDebutRenouv}
                  onChange={(e) => setDateDebutRenouv(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Date Fin Prolongée *
                </label>
                <input
                  type="date"
                  value={dateFinRenouv}
                  onChange={(e) => setDateFinRenouv(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Motif légal du renouvellement
              </label>
              <textarea
                rows={2}
                value={motifRenouv}
                onChange={(e) => setMotifRenouv(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-brand-600 transition-all disabled:opacity-50"
              >
                {loading ? "Prolongation..." : "Enregistrer le Renouvellement"}
              </button>
            </div>
          </form>
        )}

        {mode === "ROMPRE" && (
          <form onSubmit={handleRompre} className="space-y-4">
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900 dark:bg-rose-950/20 text-xs text-rose-800 dark:text-rose-300">
              <span className="font-bold">Rupture de la période d'essai : </span>
              Pendant la période d'essai, chacune des parties peut mettre fin au contrat sans préavis ni indemnité de licenciement (sauf clause conventionnelle contraire). Le contrat sera clôturé en statut ROMPU.
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Initiative de la Rupture
                </label>
                <select
                  value={statutRupture}
                  onChange={(e) =>
                    setStatutRupture(
                      e.target.value as "ROMPUE_EMPLOYEUR" | "ROMPUE_SALARIE"
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="ROMPUE_EMPLOYEUR">Décision Employeur</option>
                  <option value="ROMPUE_SALARIE">Initiative Salarié (Démission essai)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Date de Notification
                </label>
                <input
                  type="date"
                  value={dateNotificationRupture}
                  onChange={(e) => setDateNotificationRupture(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Motif de la rupture d'essai *
              </label>
              <textarea
                rows={2}
                value={motifRupture}
                onChange={(e) => setMotifRupture(e.target.value)}
                placeholder="Ex : Compétences techniques insuffisantes par rapport aux exigences du poste..."
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-rose-700 transition-all disabled:opacity-50"
              >
                {loading ? "Traitement..." : "Confirmer la Rupture de l'Essai"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
