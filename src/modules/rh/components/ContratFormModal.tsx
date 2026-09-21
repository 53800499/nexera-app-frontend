"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { rhApi } from "../services/rhApi.service";
import type { RhEmploye, RhEtablissement, RhPoste, RhContrat } from "../types/rh.types";
import { useActionFeedback, useToast } from "@/shared/components/feedback";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialEmployeId?: string;
  initialContrat?: RhContrat | null;
}

export const ContratFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployeId,
  initialContrat,
}) => {
  const { runAction } = useActionFeedback();
  const toast = useToast();
  const isEdit = Boolean(initialContrat);

  const [employes, setEmployes] = useState<RhEmploye[]>([]);
  const [etablissements, setEtablissements] = useState<RhEtablissement[]>([]);
  const [postes, setPostes] = useState<RhPoste[]>([]);

  const [formData, setFormData] = useState({
    employeId: "",
    etablissementId: "",
    posteId: "",
    typeContrat: "CDI",
    dateDebut: new Date().toISOString().split("T")[0],
    dateFinPrevue: "",
    salaireBaseMensuel: 0,
    periodeEssaiMois: 3,
    statut: "ACTIF",
    dureeHebdoContrat: 40,
    tauxRisqueAt: "" as number | string,
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDependencies = async () => {
    try {
      const [empsRes, etabsRes, postsRes] = await Promise.allSettled([
        rhApi.listEmployes(),
        rhApi.listEtablissements(),
        rhApi.listPostes(),
      ]);
      const emps = empsRes.status === "fulfilled"
        ? (Array.isArray(empsRes.value) ? empsRes.value : ((empsRes.value as any)?.data || []))
        : [];
      const etabs = etabsRes.status === "fulfilled"
        ? (Array.isArray(etabsRes.value) ? etabsRes.value : ((etabsRes.value as any)?.data || []))
        : [];
      const psts = postsRes.status === "fulfilled"
        ? (Array.isArray(postsRes.value) ? postsRes.value : ((postsRes.value as any)?.data || []))
        : [];
      setEmployes(emps);
      setEtablissements(etabs);
      setPostes(psts);

      if (initialContrat) {
        setFormData({
          employeId: initialContrat.employeId || "",
          etablissementId: initialContrat.etablissementId || (etabs[0]?.id ?? ""),
          posteId: initialContrat.posteId || (psts[0]?.id ?? ""),
          typeContrat: initialContrat.typeContrat || "CDI",
          dateDebut: initialContrat.dateDebut ? initialContrat.dateDebut.split("T")[0] : "",
          dateFinPrevue: initialContrat.dateFinPrevue ? initialContrat.dateFinPrevue.split("T")[0] : "",
          salaireBaseMensuel: initialContrat.salaireBaseMensuel || 0,
          periodeEssaiMois: 0,
          statut: initialContrat.statut || "ACTIF",
          dureeHebdoContrat: initialContrat.dureeHebdoContrat || 40,
          tauxRisqueAt:
            initialContrat.tauxRisqueAt !== undefined && initialContrat.tauxRisqueAt !== null
              ? initialContrat.tauxRisqueAt
              : "",
          notes: initialContrat.notes || "",
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          employeId: initialEmployeId || prev.employeId || (emps[0]?.id ?? ""),
          etablissementId: prev.etablissementId || (etabs[0]?.id ?? ""),
          posteId: prev.posteId || (psts[0]?.id ?? ""),
        }));
      }
    } catch (err) {
      console.warn("Erreur chargement dépendances contrat:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDependencies();
      if (initialEmployeId && !initialContrat) {
        setFormData((prev) => ({ ...prev, employeId: initialEmployeId }));
      }
    }
  }, [isOpen, initialEmployeId, initialContrat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeId || !formData.etablissementId || !formData.posteId) {
      toast.warning("Champs requis", "Veuillez sélectionner le salarié, l'établissement et le poste.");
      return;
    }

    setLoading(true);
    try {
      await runAction({
        loadingMessage: isEdit
          ? "Mise à jour du contrat de travail..."
          : "Création du contrat de travail en cours...",
        success: {
          title: isEdit ? "Contrat mis à jour" : "Contrat de travail créé",
          message: isEdit
            ? `Les modifications du contrat ${initialContrat?.numeroContrat} ont été enregistrées.`
            : `Le contrat ${formData.typeContrat} a été généré et rattaché au salarié.`,
        },
        error: {
          title: isEdit ? "Erreur de mise à jour" : "Erreur de création",
        },
        action: async () => {
          if (isEdit && initialContrat) {
            await rhApi.updateContrat(initialContrat.id, {
              statut: formData.statut as any,
              dateFinPrevue: formData.dateFinPrevue || undefined,
              salaireBaseMensuel: Number(formData.salaireBaseMensuel),
              dureeHebdoContrat: Number(formData.dureeHebdoContrat),
              tauxRisqueAt:
                formData.tauxRisqueAt !== "" && formData.tauxRisqueAt !== null
                  ? Number(formData.tauxRisqueAt)
                  : undefined,
              posteId: formData.posteId || undefined,
              notes: formData.notes.trim() || undefined,
            });
          } else {
            const payload = {
              employeId: formData.employeId,
              etablissementId: formData.etablissementId,
              posteId: formData.posteId || undefined,
              typeContrat: formData.typeContrat as any,
              dateDebut: formData.dateDebut,
              dateFinPrevue:
                formData.typeContrat !== "CDI" && formData.dateFinPrevue
                  ? formData.dateFinPrevue
                  : undefined,
              salaireBaseMensuel: Number(formData.salaireBaseMensuel) || 0,
              dureeHebdoContrat: Number(formData.dureeHebdoContrat) || 40,
              tauxRisqueAt:
                formData.tauxRisqueAt !== "" && formData.tauxRisqueAt !== null
                  ? Number(formData.tauxRisqueAt)
                  : undefined,
              periodeEssaiMois: Number(formData.periodeEssaiMois) || 0,
              notes: formData.notes.trim() || undefined,
            };
            await rhApi.createContrat(payload);
          }
          onSuccess();
          onClose();
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const safeEmployes = Array.isArray(employes) ? employes : [];
  const safeEtablissements = Array.isArray(etablissements) ? etablissements : [];
  const safePostes = Array.isArray(postes) ? postes : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEdit
              ? `Modifier le Contrat (${initialContrat?.numeroContrat})`
              : "Nouveau Contrat de Travail"}
          </h2>
          <p className="text-xs text-gray-500">
            {isEdit
              ? "Mise à jour des paramètres contractuels, de la rémunération ou du poste"
              : "Génération du numéro de contrat CTR-XXXXXX et intégration automatique à la paie"}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Salarié Bénéficiaire *
            </label>
            <select
              required
              value={formData.employeId}
              onChange={(e) => setFormData({ ...formData, employeId: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            >
              <option value="">-- Sélectionner un salarié --</option>
              {safeEmployes.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.matricule} - {emp.nom} {emp.prenoms}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Type de Contrat *
            </label>
            <select
              value={formData.typeContrat}
              onChange={(e) => setFormData({ ...formData, typeContrat: e.target.value as any })}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            >
              <option value="CDI">CDI (Durée Indéterminée)</option>
              <option value="CDD">CDD (Durée Déterminée)</option>
              <option value="STAGE">Stage Professionnel</option>
              <option value="APPRENTISSAGE">Contrat d'Apprentissage</option>
              <option value="INTERIM">Mission Intérim</option>
              <option value="CONSULTANT">Prestation / Consultant</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Établissement *
            </label>
            <select
              value={formData.etablissementId}
              onChange={(e) => setFormData({ ...formData, etablissementId: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            >
              {safeEtablissements.map((etab) => (
                <option key={etab.id} value={etab.id}>
                  {etab.raisonSociale} ({etab.paysCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Poste / Emploi *
            </label>
            <select
              value={formData.posteId}
              onChange={(e) => setFormData({ ...formData, posteId: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            >
              {safePostes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.intitule} ({p.departement?.libelle || "Département"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Salaire de Base Mensuel Brut (FCFA) *
            </label>
            <input
              type="number"
              min={52000}
              step={1000}
              required
              value={formData.salaireBaseMensuel}
              onChange={(e) => setFormData({ ...formData, salaireBaseMensuel: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono font-bold focus:ring-2 focus:ring-brand-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Date d'effet (Début) *
            </label>
            <input
              type="date"
              required
              value={formData.dateDebut}
              onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            />
          </div>

          {formData.typeContrat === "CDD" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Date de fin prévue (Terme CDD) *
              </label>
              <input
                type="date"
                required
                value={formData.dateFinPrevue}
                onChange={(e) => setFormData({ ...formData, dateFinPrevue: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Période d'essai initiale (Mois)
            </label>
            <input
              type="number"
              min={0}
              max={6}
              value={formData.periodeEssaiMois}
              onChange={(e) => setFormData({ ...formData, periodeEssaiMois: parseInt(e.target.value, 10) || 0 })}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Taux de Risque AT/MP (%)
            </label>
            <input
              type="number"
              min={0}
              max={20}
              step={0.1}
              placeholder="Ex: 2.0 (laisser vide pour taux standard)"
              value={formData.tauxRisqueAt}
              onChange={(e) => setFormData({ ...formData, tauxRisqueAt: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono focus:ring-2 focus:ring-brand-500 outline-hidden"
            />
            <p className="text-2xs text-gray-400 mt-1">
              Cotisation patronale spécifique CNSS. Laisser vide pour hériter du poste ou du pays.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-brand-600 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            <span>
              {loading
                ? isEdit
                  ? "Enregistrement..."
                  : "Création en cours..."
                : isEdit
                ? "Enregistrer les modifications"
                : "Établir le Contrat"}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
