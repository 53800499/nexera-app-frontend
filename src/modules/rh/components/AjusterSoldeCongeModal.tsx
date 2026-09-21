"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/shared/components/feedback";
import { rhApi } from "../services/rhApi.service";
import type { RhSoldeConge } from "../types/rh.types";

interface AjusterSoldeCongeModalProps {
  isOpen: boolean;
  onClose: () => void;
  solde: RhSoldeConge | null;
  onSuccess: () => void;
}

export const AjusterSoldeCongeModal: React.FC<AjusterSoldeCongeModalProps> = ({
  isOpen,
  onClose,
  solde,
  onSuccess,
}) => {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    anneeReference: 2026,
    soldeDebutAnnee: 0,
    droitsAcquis: 24,
    droitsSupplementairesAnciennete: 0,
    droitsSupplementairesEnfants: 0,
    joursConsommes: 0,
    soldeReporte: 0,
    motif: "",
  });

  useEffect(() => {
    if (solde) {
      setForm({
        anneeReference: solde.anneeReference || 2026,
        soldeDebutAnnee: solde.soldeDebutAnnee ?? 0,
        droitsAcquis: solde.droitsAcquis ?? solde.droitsAcquisJours ?? 24,
        droitsSupplementairesAnciennete: solde.droitsSupplementairesAnciennete ?? 0,
        droitsSupplementairesEnfants: solde.droitsSupplementairesEnfants ?? 0,
        joursConsommes: solde.joursConsommes ?? solde.joursPris ?? 0,
        soldeReporte: solde.soldeReporte ?? 0,
        motif: "",
      });
    }
  }, [solde]);

  // Calcul dynamique des droits totaux et du solde restant
  const totalDroits = useMemo(() => {
    return (
      (Number(form.soldeDebutAnnee) || 0) +
      (Number(form.droitsAcquis) || 0) +
      (Number(form.droitsSupplementairesAnciennete) || 0) +
      (Number(form.droitsSupplementairesEnfants) || 0) +
      (Number(form.soldeReporte) || 0)
    );
  }, [
    form.soldeDebutAnnee,
    form.droitsAcquis,
    form.droitsSupplementairesAnciennete,
    form.droitsSupplementairesEnfants,
    form.soldeReporte,
  ]);

  const soldeRestantCalcule = useMemo(() => {
    const raw = Math.max(0, totalDroits - (Number(form.joursConsommes) || 0));
    return Math.round((raw + Number.EPSILON) * 100) / 100;
  }, [totalDroits, form.joursConsommes]);

  const formatDays = (val?: number | null) =>
    new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(Number(val) || 0);

  if (!solde) return null;

  const employeNom = solde.employe
    ? `${solde.employe.nom} ${solde.employe.prenoms} (${solde.employe.matricule})`
    : "Salarié";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.motif.trim()) {
      toast.warning("Motif obligatoire", "Veuillez renseigner le motif d'audit pour cette régularisation RH.");
      return;
    }

    try {
      setSubmitting(true);
      await rhApi.ajusterSoldeConge(solde.employeId, {
        anneeReference: form.anneeReference,
        soldeDebutAnnee: Number(form.soldeDebutAnnee) || 0,
        droitsAcquis: Number(form.droitsAcquis) || 0,
        droitsSupplementairesAnciennete: Number(form.droitsSupplementairesAnciennete) || 0,
        droitsSupplementairesEnfants: Number(form.droitsSupplementairesEnfants) || 0,
        joursConsommes: Number(form.joursConsommes) || 0,
        soldeReporte: Number(form.soldeReporte) || 0,
        motif: form.motif.trim(),
      });

      toast.success(
        "Compteur mis à jour",
        `Le solde de congés de ${solde.employe?.nom || "l'employé"} a été régularisé (${formatDays(soldeRestantCalcule)} jours disponibles).`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      console.warn("Erreur ajustement solde conge:", err);
      toast.error("Erreur", err.message || "Impossible de mettre à jour le compteur de congés.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* En-tête */}
        <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Régularisation du Compteur de Congés
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Salarié : <span className="font-semibold text-brand-600 dark:text-brand-400">{employeNom}</span> — Année de référence {form.anneeReference}
              </p>
            </div>
            <span className="rounded-xl bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              Audit RH
            </span>
          </div>
        </div>

        {/* Aperçu dynamique du solde */}
        <div className="grid grid-cols-3 gap-3 rounded-xl bg-gray-50/80 p-3.5 border border-gray-100 dark:bg-gray-800/40 dark:border-gray-800 text-center">
          <div>
            <span className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Total Droits Acquis</span>
            <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">{formatDays(totalDroits)} j</span>
          </div>
          <div>
            <span className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Jours Consommés</span>
            <span className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">{formatDays(form.joursConsommes)} j</span>
          </div>
          <div>
            <span className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Solde Restant Net</span>
            <span className="text-base font-bold font-mono text-brand-600 dark:text-brand-400">{formatDays(soldeRestantCalcule)} jours</span>
          </div>
        </div>

        {/* Champs de saisie */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Droits Acquis de Base (2 j/mois) *
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              required
              value={form.droitsAcquis}
              onChange={(e) => setForm({ ...form, droitsAcquis: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold focus:ring-2 focus:ring-brand-500 outline-hidden"
            />
            <p className="mt-1 text-[11px] text-gray-400">24 j pour 12 mois complets au Bénin (Art. 68)</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Reliquat Reporté de l'Année N-1
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={form.soldeReporte}
              onChange={(e) => setForm({ ...form, soldeReporte: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold focus:ring-2 focus:ring-brand-500 outline-hidden"
            />
            <p className="mt-1 text-[11px] text-gray-400">Jours non pris de l'exercice précédent</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Majoration Ancienneté (CCGT Bénin)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={form.droitsSupplementairesAnciennete}
              onChange={(e) => setForm({ ...form, droitsSupplementairesAnciennete: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold focus:ring-2 focus:ring-brand-500 outline-hidden"
            />
            <p className="mt-1 text-[11px] text-gray-400">+2j après 20 ans, +4j après 25 ans, +6j après 30 ans</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Majoration Charges de Famille
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={form.droitsSupplementairesEnfants}
              onChange={(e) => setForm({ ...form, droitsSupplementairesEnfants: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold focus:ring-2 focus:ring-brand-500 outline-hidden"
            />
            <p className="mt-1 text-[11px] text-gray-400">+2 jours par enfant à charge de moins de 14 ans</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Jours Consommés (Déjà pris) *
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              required
              value={form.joursConsommes}
              onChange={(e) => setForm({ ...form, joursConsommes: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold focus:ring-2 focus:ring-brand-500 outline-hidden"
            />
            <p className="mt-1 text-[11px] text-gray-400">Total des absences décomptées en {form.anneeReference}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Solde de Début d'Année
            </label>
            <input
              type="number"
              step="0.5"
              value={form.soldeDebutAnnee}
              onChange={(e) => setForm({ ...form, soldeDebutAnnee: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold focus:ring-2 focus:ring-brand-500 outline-hidden"
            />
            <p className="mt-1 text-[11px] text-gray-400">Base initiale au 1er janvier</p>
          </div>
        </div>

        {/* Motif d'audit */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Motif de la régularisation *
          </label>
          <textarea
            required
            rows={2}
            value={form.motif}
            onChange={(e) => setForm({ ...form, motif: e.target.value })}
            placeholder="Ex : Régularisation du reliquat 2025 non consommé, ajustement entrée en cours d'année..."
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <span>Enregistrer la Régularisation</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
