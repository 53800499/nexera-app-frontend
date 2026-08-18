"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { rhApi } from "../services/rhApi.service";
import type { RhEmploye, RhEtablissement, RhPoste } from "../types/rh.types";
import { useActionFeedback, useToast } from "@/shared/components/feedback";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialEmployeId?: string;
}

export const ContratFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployeId,
}) => {
  const { runAction } = useActionFeedback();
  const toast = useToast();
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
    salaireBaseMensuel: 350000,
    periodeEssaiMois: 3,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDependencies = async () => {
    try {
      const [empsRes, etabsRes, postsRes] = await Promise.all([
        rhApi.listEmployes(),
        rhApi.listEtablissements(),
        rhApi.listPostes(),
      ]);
      const emps = Array.isArray(empsRes) ? empsRes : ((empsRes as any)?.data || []);
      const etabs = Array.isArray(etabsRes) ? etabsRes : ((etabsRes as any)?.data || []);
      const psts = Array.isArray(postsRes) ? postsRes : ((postsRes as any)?.data || []);
      setEmployes(emps);
      setEtablissements(etabs);
      setPostes(psts);
      setFormData((prev) => ({
        ...prev,
        employeId: initialEmployeId || prev.employeId || (emps[0]?.id ?? ""),
        etablissementId: prev.etablissementId || (etabs[0]?.id ?? ""),
        posteId: prev.posteId || (psts[0]?.id ?? ""),
      }));
    } catch (err) {
      console.error("Erreur chargement dépendances contrat:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDependencies();
      if (initialEmployeId) {
        setFormData((prev) => ({ ...prev, employeId: initialEmployeId }));
      }
    }
  }, [isOpen, initialEmployeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeId || !formData.etablissementId || !formData.posteId) {
      toast.warning("Champs requis", "Veuillez sélectionner le salarié, l'établissement et le poste.");
      return;
    }

    setLoading(true);
    try {
      await runAction({
        loadingMessage: "Création du contrat de travail en cours...",
        success: {
          title: "Contrat de travail créé",
          message: `Le contrat ${formData.typeContrat} a été généré et rattaché au salarié.`,
        },
        error: {
          title: "Erreur de création",
          message: "Impossible de créer le contrat de travail.",
        },
        action: async () => {
          const payload = {
            employeId: formData.employeId,
            etablissementId: formData.etablissementId,
            posteId: formData.posteId || undefined,
            typeContrat: formData.typeContrat,
            dateDebut: formData.dateDebut,
            dateFinPrevue: formData.typeContrat !== "CDI" && formData.dateFinPrevue ? formData.dateFinPrevue : undefined,
            salaireBaseMensuel: Number(formData.salaireBaseMensuel) || 0,
            periodeEssaiMois: Number(formData.periodeEssaiMois) || 0,
          };
          await rhApi.createContrat(payload);
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
            Nouveau Contrat de Travail
          </h2>
          <p className="text-xs text-gray-500">
            Génération du numéro de contrat CTR-XXXXXX et intégration automatique à la paie
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
            <span>{loading ? "Création en cours..." : "Établir le Contrat"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
