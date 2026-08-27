"use client";

import React, { useState } from "react";
import { useEmployes } from "@/modules/rh/hooks/useEmployes";
import { useMissions, useRapportsFrais } from "../hooks/useNotesFrais";
import type { NdfRapportFrais } from "../types/notesFrais.types";
import { ndfApi } from "../services/ndfApi.service";
import {
  useActionFeedback,
  useActionFeedbackStore,
} from "@/shared/components/feedback";
import { IconClose, IconChartBar } from "./NdfIcons";

export const RapportsFraisView: React.FC = () => {
  const { runAction } = useActionFeedback();
  const isBusy = useActionFeedbackStore(
    (state) => state.loadingCount > 0 || state.isRedirecting,
  );

  const { rapports, isLoading, createRapport, soumettreRapport, isCreating, isSubmitting } =
    useRapportsFrais();
  const { employes } = useEmployes();
  const { missions, avances } = useMissions();

  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState<NdfRapportFrais | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Form State
  const [employeRefId, setEmployeRefId] = useState("");
  const [objet, setObjet] = useState("");
  const [periodeDebut, setPeriodeDebut] = useState(new Date().toISOString().split("T")[0]);
  const [periodeFin, setPeriodeFin] = useState(new Date().toISOString().split("T")[0]);
  const [missionId, setMissionId] = useState("");
  const [avanceFraisId, setAvanceFraisId] = useState("");

  const handleOpenDetails = async (id: string) => {
    try {
      const full = await ndfApi.getRapportById(id);
      setSelectedRapport(full);
      setIsDetailsOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeRefId || !objet) return;

    void runAction({
      loadingMessage: "Création du rapport de frais...",
      success: {
        title: "Rapport de frais créé",
        message: objet,
      },
      error: {
        title: "Erreur de création",
        message: "Impossible de créer le rapport de frais.",
      },
      action: async () => {
        await createRapport({
          employeRefId,
          objet,
          periodeDebut,
          periodeFin,
          missionId: missionId || undefined,
          avanceFraisId: avanceFraisId || undefined,
        });
        setIsModalCreateOpen(false);
        setObjet("");
      },
    });
  };

  const handleSoumettre = (id: string, numero?: string) => {
    void runAction({
      confirm: {
        title: "Soumettre ce rapport de frais ?",
        message:
          "Le rapport sera transmis à votre responsable pour validation. L'audit IA détectera automatiquement d'éventuelles anomalies ou dépassements de politique.",
        confirmLabel: "Soumettre pour validation",
        variant: "default",
      },
      loadingMessage: "Audit IA et soumission...",
      success: {
        title: "Rapport soumis avec succès",
        message: numero ? `Rapport ${numero} en attente de validation.` : "Rapport transmis pour validation.",
      },
      error: {
        title: "Échec de la soumission",
        message: "Le rapport n'a pas pu être soumis pour validation.",
      },
      action: async () => {
        await soumettreRapport(id);
        if (selectedRapport?.id === id) {
          const full = await ndfApi.getRapportById(id);
          setSelectedRapport(full);
        }
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
            Rapports de Frais
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Regroupement mensuel ou par mission, soumission au workflow hiérarchique et suivi de remboursement
          </p>
        </div>
        <button
          onClick={() => {
            if (employes.length > 0 && !employeRefId) setEmployeRefId(employes[0].id);
            setIsModalCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-brand-600 transition"
        >
          <span>+ Créer un Rapport</span>
        </button>
      </div>

      {/* Tableau des Rapports */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/50 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-semibold">N° Rapport</th>
                <th className="px-4 py-3 font-semibold">Salarié</th>
                <th className="px-4 py-3 font-semibold">Objet / Motif</th>
                <th className="px-4 py-3 font-semibold">Période</th>
                <th className="px-4 py-3 font-semibold text-right">Montant Total</th>
                <th className="px-4 py-3 font-semibold text-right">TVA Déductible</th>
                <th className="px-4 py-3 font-semibold text-center">Score Risque IA</th>
                <th className="px-4 py-3 font-semibold text-center">Statut</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    Chargement des rapports de frais...
                  </td>
                </tr>
              ) : rapports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    Aucun rapport de frais créé. Cliquez sur "+ Créer un Rapport" pour commencer.
                  </td>
                </tr>
              ) : (
                rapports.map((rap) => (
                  <tr key={rap.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-mono font-semibold text-brand-600 dark:text-brand-400">
                      {rap.numeroRapport}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {rap.employe ? `${rap.employe.nom} ${rap.employe.prenoms}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {rap.objet}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(rap.periodeDebut).toLocaleDateString("fr-FR")} au {new Date(rap.periodeFin).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                      {formatCurrency(rap.montantTotal)}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatCurrency(rap.montantTvaRecuperableTotal)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {rap.scoreRisqueIa !== null && rap.scoreRisqueIa !== undefined ? (
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-bold ${
                            rap.scoreRisqueIa > 50
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          }`}
                        >
                          {rap.scoreRisqueIa}%
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          rap.statut === "VALIDE"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : rap.statut === "REMBOURSE"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                            : rap.statut === "EN_VALIDATION"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                            : rap.statut === "REJETE"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {rap.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetails(rap.id)}
                          className="text-xs font-medium text-brand-600 hover:text-brand-700"
                        >
                          Détails 360°
                        </button>
                        {(rap.statut === "BROUILLON" || rap.statut === "REJETE") && (
                          <button
                            type="button"
                            onClick={() => handleSoumettre(rap.id, rap.numeroRapport)}
                            disabled={isBusy}
                            className="rounded bg-brand-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                          >
                            Soumettre
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Créer Rapport */}
      {isModalCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Nouveau Rapport de Frais
              </h3>
              <button
                onClick={() => setIsModalCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <IconClose className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Salarié déclarant *
                </label>
                <select
                  required
                  value={employeRefId}
                  onChange={(e) => setEmployeRefId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Sélectionnez un salarié...</option>
                  {employes.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.matricule} - {emp.nom} {emp.prenoms}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Objet / Intitulé du rapport *
                </label>
                <input
                  type="text"
                  required
                  value={objet}
                  onChange={(e) => setObjet(e.target.value)}
                  placeholder="Ex: Frais de déplacement Cotonou - Parakou Février 2026"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Début Période *
                  </label>
                  <input
                    type="date"
                    required
                    value={periodeDebut}
                    onChange={(e) => setPeriodeDebut(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Fin Période *
                  </label>
                  <input
                    type="date"
                    required
                    value={periodeFin}
                    onChange={(e) => setPeriodeFin(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Ordre de Mission Associé (Optionnel)
                </label>
                <select
                  value={missionId}
                  onChange={(e) => setMissionId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Aucune mission rattachée</option>
                  {missions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.objet} ({m.lieuDestination || "Bénin"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Avance de Trésorerie à Imputer (Optionnel)
                </label>
                <select
                  value={avanceFraisId}
                  onChange={(e) => setAvanceFraisId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Aucune avance à imputer</option>
                  {avances.map((a) => (
                    <option key={a.id} value={a.id}>
                      Avance du {new Date(a.dateVersement).toLocaleDateString("fr-FR")} - {formatCurrency(a.montant)} (Statut: {a.statut})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalCreateOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-brand-600 disabled:opacity-50"
                >
                  {isCreating ? "Création..." : "Créer le rapport"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Détails 360° & Écritures Comptables M3 */}
      {isDetailsOpen && selectedRapport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                  {selectedRapport.numeroRapport}
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedRapport.objet}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <IconClose className="size-5" />
              </button>
            </div>

            {/* Infos Clés */}
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
              <div>
                <span className="text-xs text-gray-500">Salarié :</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedRapport.employe?.nom} {selectedRapport.employe?.prenoms}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Montant Total :</span>
                <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
                  {formatCurrency(selectedRapport.montantTotal)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Statut :</span>
                <div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      selectedRapport.statut === "VALIDE"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : selectedRapport.statut === "REMBOURSE"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        : selectedRapport.statut === "EN_VALIDATION"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        : selectedRapport.statut === "REJETE"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {selectedRapport.statut}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Avance Déduite :</span>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {formatCurrency(selectedRapport.avanceFrais?.montant || selectedRapport.avanceSurMission?.montantAvance)}
                </p>
              </div>
            </div>

            {/* Lignes de Dépenses */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Dépenses rattachées au rapport ({selectedRapport.depenses?.length || 0})
              </h4>
              <div className="mt-2 overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    <tr>
                      <th className="p-2.5 font-semibold">Date</th>
                      <th className="p-2.5 font-semibold">Catégorie</th>
                      <th className="p-2.5 font-semibold">Fournisseur</th>
                      <th className="p-2.5 font-semibold text-right">TTC</th>
                      <th className="p-2.5 font-semibold text-right">TVA</th>
                      <th className="p-2.5 font-semibold text-center">Paiement</th>
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
                        <td className="p-2.5 text-right text-emerald-600 font-medium">
                          {formatCurrency(d.montantTva || 0)}
                        </td>
                        <td className="p-2.5 text-center">{d.modePaiement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Écritures Comptables M3 Générées Automatiquement */}
            {selectedRapport.ecrituresComptables && selectedRapport.ecrituresComptables.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 dark:text-white inline-flex items-center gap-2">
                  <IconChartBar className="size-4 text-brand-600 dark:text-brand-400" />
                  <span>Écritures Comptables Générées (Intégration M3 SYSCOHADA)</span>
                </h4>
                <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50/40 p-3 dark:border-blue-900/40 dark:bg-blue-950/20">
                  {selectedRapport.ecrituresComptables.map((ecr: any) => (
                    <div key={ecr.id} className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-blue-900 dark:text-blue-300">
                        <span>Pièce : {ecr.typeEcriture} ({new Date(ecr.dateEcriture).toLocaleDateString("fr-FR")})</span>
                        <span>Statut : {ecr.statut}</span>
                      </div>
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300">
                            <th className="pb-1">Compte SYSCOHADA</th>
                            <th className="pb-1">Libellé écriture</th>
                            <th className="pb-1 text-right">Débit</th>
                            <th className="pb-1 text-right">Crédit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-100 dark:divide-blue-900/50">
                          {ecr.lignes?.map((l: any) => (
                            <tr key={l.id}>
                              <td className="py-1 font-mono font-bold text-gray-800 dark:text-gray-200">
                                {l.compteSyscohada}
                              </td>
                              <td className="py-1 text-gray-700 dark:text-gray-300">{l.libelle}</td>
                              <td className="py-1 text-right font-medium text-gray-900 dark:text-white">
                                {l.sens === "DEBIT" ? formatCurrency(l.montant) : "—"}
                              </td>
                              <td className="py-1 text-right font-medium text-gray-900 dark:text-white">
                                {l.sens === "CREDIT" ? formatCurrency(l.montant) : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions de clôture du modal */}
            <div className="mt-6 flex justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
              {(selectedRapport.statut === "BROUILLON" || selectedRapport.statut === "REJETE") ? (
                <button
                  onClick={() => handleSoumettre(selectedRapport.id)}
                  disabled={isSubmitting}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-600 disabled:opacity-50"
                >
                  {isSubmitting ? "Audit IA en cours..." : "Soumettre pour validation manager"}
                </button>
              ) : <div />}
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
