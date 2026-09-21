"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { rhApi } from "../services/rhApi.service";
import type { RhContrat, RhAmendmentType } from "../types/rh.types";
import { useActionFeedback, useToast } from "@/shared/components/feedback";

import { formatContractType } from "../utils/rhFormatters";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contrat: RhContrat | null;
  onSuccess: () => void;
}

export const ContratAvenantModal: React.FC<Props> = ({
  isOpen,
  onClose,
  contrat,
  onSuccess,
}) => {
  const { runAction } = useActionFeedback();
  const toast = useToast();

  const [formData, setFormData] = useState({
    numeroAvenant: "",
    dateNotification: new Date().toISOString().split("T")[0],
    dateEffet: new Date().toISOString().split("T")[0],
    typeModification: "SALAIRE" as RhAmendmentType,
    salaireBaseApres: 0,
    tempsTravailApres: 40,
    motifAvenant: "",
    fichierAvenantUrl: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contrat) {
      const nextNum = (contrat.avenants?.length || 0) + 1;
      setFormData({
        numeroAvenant: `AVN-${nextNum.toString().padStart(3, "0")}`,
        dateNotification: new Date().toISOString().split("T")[0],
        dateEffet: new Date().toISOString().split("T")[0],
        typeModification: "SALAIRE",
        salaireBaseApres: contrat.salaireBaseMensuel || 0,
        tempsTravailApres: contrat.dureeHebdoContrat || 40,
        motifAvenant: "Revalorisation salariale annuelle",
        fichierAvenantUrl: "",
      });
    }
  }, [contrat, isOpen]);

  if (!contrat) return null;

  const salaireAvant = contrat.salaireBaseMensuel || 0;
  const diffSalaire = formData.salaireBaseApres - salaireAvant;
  const pctSalaire =
    salaireAvant > 0
      ? new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(
          (diffSalaire / salaireAvant) * 100
        )
      : "0";

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: contrat.deviseCode || "XOF",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dateEffet) {
      toast.warning("Champs requis", "Veuillez renseigner la date d'effet de l'avenant.");
      return;
    }

    setLoading(true);
    await runAction({
      loadingMessage: "Création de l'avenant au contrat...",
      success: {
        title: "Avenant créé avec succès",
        message: `L'avenant ${formData.numeroAvenant} a été appliqué au contrat ${contrat.numeroContrat}.`,
      },
      error: {
        title: "Erreur lors de la création de l'avenant",
      },
      action: async () => {
        await rhApi.createAvenant(contrat.id, {
          numeroAvenant: formData.numeroAvenant.trim() || undefined,
          dateNotification: formData.dateNotification || undefined,
          dateEffet: formData.dateEffet,
          typeModification: formData.typeModification,
          salaireBaseApres:
            formData.typeModification === "SALAIRE" || diffSalaire !== 0
              ? Number(formData.salaireBaseApres)
              : undefined,
          tempsTravailApres:
            formData.typeModification === "DUREE_TRAVAIL"
              ? Number(formData.tempsTravailApres)
              : undefined,
          detailsModificationsJson: formData.motifAvenant ? { motif: formData.motifAvenant } : undefined,
          fichierAvenantUrl: formData.fichierAvenantUrl.trim() || undefined,
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
      className="max-w-2xl bg-white dark:bg-gray-900 rounded-2xl p-6"
    >
      <div className="border-b border-gray-100 pb-3 dark:border-gray-800 mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Créer un Avenant au Contrat</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rappel du contrat */}
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-850 border border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Salarié & Contrat
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {contrat.employe
                  ? `${contrat.employe.nom} ${contrat.employe.prenoms}`
                  : "Salarié"}
                <span className="ml-2 font-mono text-xs font-normal text-gray-500">
                  ({contrat.numeroContrat} - {formatContractType(contrat.typeContrat)})
                </span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Salaire de base actuel :</span>
              <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                {formatCurrency(salaireAvant)}
              </p>
            </div>
          </div>
        </div>

        {/* Ligne N° Avenant & Type */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              N° Avenant
            </label>
            <input
              type="text"
              value={formData.numeroAvenant}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, numeroAvenant: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-mono text-gray-900 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Objet Principal de l'Avenant
            </label>
            <select
              value={formData.typeModification}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  typeModification: e.target.value as RhAmendmentType,
                }))
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="SALAIRE">Revalorisation Salariale</option>
              <option value="POSTE">Changement de Poste / Promotion</option>
              <option value="DUREE_TRAVAIL">Modification Durée de Travail</option>
              <option value="LIEU_TRAVAIL">Mutation / Lieu de Travail</option>
              <option value="STATUT">Évolution de Statut / Catégorie</option>
              <option value="AUTRE">Autre Modification Contractuelle</option>
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Date d'Effet Légale *
            </label>
            <input
              type="date"
              value={formData.dateEffet}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dateEffet: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Date de Notification / Signature
            </label>
            <input
              type="date"
              value={formData.dateNotification}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dateNotification: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Revalorisation salariale */}
        <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4 dark:border-brand-900/50 dark:bg-brand-950/20">
          <label className="block text-xs font-bold text-brand-900 dark:text-brand-300 uppercase tracking-wider mb-1.5">
            Nouveau Salaire de Base Mensuel ({contrat.deviseCode || "XOF"})
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              step={5000}
              value={formData.salaireBaseApres}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  salaireBaseApres: Number(e.target.value),
                }))
              }
              className="w-full rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-base font-bold font-mono text-gray-900 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-brand-800 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {diffSalaire !== 0 && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-gray-500">Différentiel mensuel :</span>
              <span
                className={`font-mono font-bold ${
                  diffSalaire > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {diffSalaire > 0 ? "+" : ""}
                {formatCurrency(diffSalaire)} ({diffSalaire > 0 ? "+" : ""}
                {pctSalaire}%)
              </span>
            </div>
          )}
        </div>

        {/* Temps de travail si applicable */}
        {formData.typeModification === "DUREE_TRAVAIL" && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Nouvelle durée hebdomadaire (heures)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={formData.tempsTravailApres}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tempsTravailApres: Number(e.target.value),
                }))
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        )}

        {/* Motif / Objet détaillé */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Motif / Justification légale de l'avenant
          </label>
          <textarea
            rows={3}
            value={formData.motifAvenant}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, motifAvenant: e.target.value }))
            }
            placeholder="Ex : Promotion au poste de Chef d'équipe suite à l'entretien d'évaluation annuel..."
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-brand-600 focus:outline-hidden transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Appliquer l'Avenant"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
