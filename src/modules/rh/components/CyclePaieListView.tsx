"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { rhApi } from "../services/rhApi.service";
import type { RhCyclePaie, RhEtablissement } from "../types/rh.types";
import { Modal } from "@/components/ui/modal";
import { useActionFeedback, useToast } from "@/shared/components/feedback";
import { PlusIcon, CalenderIcon } from "@/icons";

export const CyclePaieListView: React.FC = () => {
  const { runAction } = useActionFeedback();
  const toast = useToast();
  const [cycles, setCycles] = useState<RhCyclePaie[]>([]);
  const [etablissements, setEtablissements] = useState<RhEtablissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [annee, setAnnee] = useState(2026);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);

  const [openForm, setOpenForm] = useState({
    etablissementId: "",
    annee: 2026,
    mois: new Date().getMonth() + 1,
    datePaiementPrevue: "",
  });

  const fetchCycles = async () => {
    try {
      setLoading(true);
      const res = await rhApi.listCycles(annee);
      setCycles(Array.isArray(res) ? res : ((res as any)?.data || []));
    } catch (err) {
      console.error("Erreur chargement cycles:", err);
      setCycles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEtablissements = async () => {
    try {
      const res = await rhApi.listEtablissements();
      const etabs = Array.isArray(res) ? res : ((res as any)?.data || []);
      setEtablissements(etabs);
      if (etabs.length > 0) {
        setOpenForm((prev) => ({ ...prev, etablissementId: prev.etablissementId || etabs[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCycles();
    fetchEtablissements();
  }, [annee]);

  useEffect(() => {
    if (isOpenModalOpen) {
      fetchEtablissements();
    }
  }, [isOpenModalOpen]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openForm.etablissementId) {
      toast.warning("Sélection requise", "Veuillez sélectionner un établissement.");
      return;
    }
    setIsSubmitting(true);
    try {
      await runAction({
        loadingMessage: "Ouverture du cycle de paie en cours...",
        success: {
          title: "Cycle de paie ouvert",
          message: `Le cycle pour le mois ${openForm.mois}/${openForm.annee} a été initialisé.`,
        },
        error: {
          title: "Erreur d'ouverture",
          message: "Impossible d'ouvrir ce cycle. Un cycle existe peut-être déjà pour cette période.",
        },
        action: async () => {
          const payload = {
            etablissementId: openForm.etablissementId,
            annee: Number(openForm.annee),
            mois: Number(openForm.mois),
            datePaiementPrevue: openForm.datePaiementPrevue?.trim() ? openForm.datePaiementPrevue.trim() : undefined,
          };
          await rhApi.openCycle(payload);
          setIsOpenModalOpen(false);
          await fetchCycles();
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeCycles = Array.isArray(cycles) ? cycles : [];
  const safeEtablissements = Array.isArray(etablissements) ? etablissements : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cycles de Paie Mensuels
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Calcul de la paie en 1-clic, saisie des variables et génération des bulletins
          </p>
        </div>
        <button
          onClick={() => setIsOpenModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all active:scale-[0.98]"
        >
          <PlusIcon className="h-4 w-4 shrink-0 stroke-2" />
          <span>Ouvrir un Nouveau Cycle</span>
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Année fiscale :</span>
          <select
            value={annee}
            onChange={(e) => setAnnee(parseInt(e.target.value, 10))}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-2xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value={2026}>2026 (CGI 2026)</option>
            <option value={2025}>2025</option>
          </select>
        </div>
        <div className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {safeCycles.length} cycle(s) en {annee}
        </div>
      </div>

      {/* Grille des Cycles */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <p className="mt-2 text-xs text-gray-400">Chargement des cycles de paie...</p>
          </div>
        ) : safeCycles.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-xs">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <CalenderIcon className="h-6 w-6 shrink-0 text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">Aucun cycle de paie ouvert pour {annee}</p>
            <p className="mt-1 text-xs text-gray-400">Ouvrez le premier cycle pour lancer le calcul des bulletins.</p>
            <button
              onClick={() => setIsOpenModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-600 shadow-2xs"
            >
              <PlusIcon className="h-3.5 w-3.5 shrink-0" />
              <span>Ouvrir un Nouveau Cycle</span>
            </button>
          </div>
        ) : (
          safeCycles.map((cycle) => (
            <div
              key={cycle.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                  <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                    {cycle.codeCycle}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      cycle.statut === "VALIDE" || cycle.statut === "CLOTURE"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : cycle.statut === "CALCULE"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                    }`}
                  >
                    {cycle.statut}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Établissement :</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {cycle.etablissement?.raisonSociale}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Période :</span>
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {cycle.dateDebut ? new Date(cycle.dateDebut).toLocaleDateString("fr-FR") : "-"} au{" "}
                      {cycle.dateFin ? new Date(cycle.dateFin).toLocaleDateString("fr-FR") : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bulletins :</span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      {cycle._count?.bulletinsPaie || 0} salarié(s)
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/rh/paie/${cycle.id}`}
                className="mt-6 block w-full rounded-xl bg-gray-50 py-2.5 text-center text-sm font-semibold text-brand-600 hover:bg-brand-500 hover:text-white dark:bg-gray-800 dark:text-brand-400 dark:hover:bg-brand-500 dark:hover:text-white transition-colors"
              >
                Gérer le Cycle & Calculer →
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Modal Ouverture de Cycle */}
      <Modal isOpen={isOpenModalOpen} onClose={() => setIsOpenModalOpen(false)} className="max-w-md p-6">
        <form onSubmit={handleOpenCycle} className="space-y-4">
          <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Ouvrir un Cycle de Paie
            </h2>
            <p className="text-xs text-gray-500">
              Initialisation des bulletins de paie et intégration des pointages
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Établissement *</label>
            <select
              required
              value={openForm.etablissementId}
              onChange={(e) => setOpenForm({ ...openForm, etablissementId: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            >
              {safeEtablissements.map((etab) => (
                <option key={etab.id} value={etab.id}>
                  {etab.raisonSociale} ({etab.paysCode})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Mois *</label>
              <select
                value={openForm.mois}
                onChange={(e) => setOpenForm({ ...openForm, mois: parseInt(e.target.value, 10) })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              >
                {[
                  "01 - Janvier",
                  "02 - Février",
                  "03 - Mars",
                  "04 - Avril",
                  "05 - Mai",
                  "06 - Juin",
                  "07 - Juillet",
                  "08 - Août",
                  "09 - Septembre",
                  "10 - Octobre",
                  "11 - Novembre",
                  "12 - Décembre",
                ].map((m, i) => (
                  <option key={i + 1} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Année *</label>
              <input
                type="number"
                value={openForm.annee}
                onChange={(e) => setOpenForm({ ...openForm, annee: parseInt(e.target.value, 10) })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold focus:ring-2 focus:ring-brand-500 outline-hidden"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Date Prévisionnelle de Virement / Paiement (Optionnel)
            </label>
            <input
              type="date"
              value={openForm.datePaiementPrevue}
              onChange={(e) => setOpenForm({ ...openForm, datePaiementPrevue: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsOpenModalOpen(false)}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 shadow-xs disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isSubmitting && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <span>{isSubmitting ? "Ouverture en cours..." : "Créer le Cycle"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
