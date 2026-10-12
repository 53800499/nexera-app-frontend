"use client";

import React, { useEffect, useState } from "react";
import { useActionFeedback } from "@/shared/components/feedback";
import { comptabiliteApi } from "../services/comptabiliteApi.service";
import type {
  ComptaCompte,
  ComptaCompteAuxiliaire,
} from "../types/comptabilite.types";
import { CheckStampIcon, PlusIcon, EyeIcon } from "./ComptaIcons";

export const LettrageView: React.FC = () => {
  const { showResult } = useActionFeedback();
  const [comptesCollectifs, setComptesCollectifs] = useState<ComptaCompte[]>([]);
  const [selectedCollectif, setSelectedCollectif] = useState<string>("");
  const [auxiliaires, setAuxiliaires] = useState<ComptaCompteAuxiliaire[]>([]);
  const [selectedAuxiliaire, setSelectedAuxiliaire] = useState<string>("");
  const [lignesNonLettrees, setLignesNonLettrees] = useState<any[]>([]);
  const [selectedLigneIds, setSelectedLigneIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal Nouveau Tiers
  const [showAddAuxModal, setShowAddAuxModal] = useState(false);
  const [newAuxCode, setNewAuxCode] = useState("");
  const [newAuxIntitule, setNewAuxIntitule] = useState("");
  const [newAuxType, setNewAuxType] = useState<"CLIENT" | "FOURNISSEUR" | "SALARIE" | "AUTRE">("CLIENT");
  const [isSubmittingAux, setIsSubmittingAux] = useState(false);

  // Modal Détail Ligne
  const [detailLigne, setDetailLigne] = useState<any | null>(null);

  useEffect(() => {
    // Charger les comptes de tiers classe 4
    comptabiliteApi.getPlanComptable({ classe: 4, actif: true }).then((data) => {
      const collectifs = data.filter((c) => c.numero.startsWith("411") || c.numero.startsWith("401") || c.numero.startsWith("421"));
      setComptesCollectifs(collectifs);
      if (collectifs.length > 0) {
        setSelectedCollectif(collectifs[0].id);
        chargerAuxiliaires(collectifs[0].id);
      }
    });
  }, []);

  const chargerAuxiliaires = async (collectifId: string) => {
    try {
      const auxs = await comptabiliteApi.getComptesAuxiliaires(collectifId);
      setAuxiliaires(auxs);
      if (auxs.length > 0) {
        setSelectedAuxiliaire(auxs[0].id);
        chargerLignes(auxs[0].id);
      } else {
        setSelectedAuxiliaire("");
        setLignesNonLettrees([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAuxiliaire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollectif || !newAuxCode.trim() || !newAuxIntitule.trim()) return;
    setIsSubmittingAux(true);
    try {
      await comptabiliteApi.createCompteAuxiliaire({
        compteCollectifId: selectedCollectif,
        codeAuxiliaire: newAuxCode.trim().toUpperCase(),
        intitule: newAuxIntitule.trim(),
        typeTiers: newAuxType,
      });
      setShowAddAuxModal(false);
      const code = newAuxCode.trim().toUpperCase();
      setNewAuxCode("");
      setNewAuxIntitule("");
      showResult({
        variant: "success",
        title: "Compte tiers créé",
        message: `Le compte tiers ${code} a été créé avec succès.`,
      });
      await chargerAuxiliaires(selectedCollectif);
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur création compte tiers",
        message: err.message || "Erreur lors de la création du compte tiers.",
      });
    } finally {
      setIsSubmittingAux(false);
    }
  };

  const chargerLignes = async (auxId: string) => {
    if (!auxId) return;
    setIsLoading(true);
    try {
      const data = await comptabiliteApi.getLignesNonLettrees(auxId);
      setLignesNonLettrees(data);
      setSelectedLigneIds([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLigne = (id: string) => {
    setSelectedLigneIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Calcul totaux sélectionnés
  const lignesSelectionnees = lignesNonLettrees.filter((l) => selectedLigneIds.includes(l.id));
  const totDebit = lignesSelectionnees.reduce((sum, l) => sum + Number(l.montantDebit || 0), 0);
  const totCredit = lignesSelectionnees.reduce((sum, l) => sum + Number(l.montantCredit || 0), 0);
  const ecart = Math.abs(totDebit - totCredit);
  const estEquilibre = ecart < 0.01 && selectedLigneIds.length >= 2;

  const handleLettrerManuel = async () => {
    if (!selectedAuxiliaire || selectedLigneIds.length < 2) return;
    setIsProcessing(true);
    try {
      await comptabiliteApi.lettrerManuel({
        compteAuxiliaireId: selectedAuxiliaire,
        ligneIds: selectedLigneIds,
      });
      showResult({
        variant: "success",
        title: "Lettrage effectué",
        message: "Les lignes sélectionnées ont été lettrées avec succès.",
      });
      chargerLignes(selectedAuxiliaire);
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur lettrage",
        message: err.message || "Erreur lors du lettrage manuel.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLettrerAuto = async () => {
    if (!selectedAuxiliaire) return;
    setIsProcessing(true);
    try {
      const res = await comptabiliteApi.lettrerAutomatique(selectedAuxiliaire);
      showResult({
        variant: "success",
        title: "Lettrage automatique terminé",
        message: `${res.nbRapprochements || 0} paire(s) rapprochée(s) automatiquement.`,
      });
      chargerLignes(selectedAuxiliaire);
    } catch (err: any) {
      showResult({
        variant: "error",
        title: "Erreur lettrage automatique",
        message: err.message || "Erreur lors du lettrage automatique.",
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
            Lettrage des Comptes de Tiers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Rapprochement des factures et règlements sur comptes clients (411) et fournisseurs (401) (EF-038).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLettrerAuto}
            disabled={isProcessing || !selectedAuxiliaire || lignesNonLettrees.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300 disabled:opacity-50"
          >
            <CheckStampIcon className="w-4 h-4" />
            Lettrage Automatique (1-Clic)
          </button>
          <button
            onClick={handleLettrerManuel}
            disabled={!estEquilibre || isProcessing}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 disabled:opacity-50"
          >
            Lettrer la Sélection ({selectedLigneIds.length})
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Compte Collectif de Tiers
          </label>
          <select
            value={selectedCollectif}
            onChange={(e) => {
              setSelectedCollectif(e.target.value);
              chargerAuxiliaires(e.target.value);
            }}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {comptesCollectifs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.numero} — {c.intitule}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Compte Auxiliaire (Tiers Spécifique)
            </label>
            {selectedCollectif && (
              <button
                type="button"
                onClick={() => setShowAddAuxModal(true)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                <PlusIcon className="w-3 h-3" />
                Nouveau Tiers
              </button>
            )}
          </div>
          <select
            value={selectedAuxiliaire}
            onChange={(e) => {
              setSelectedAuxiliaire(e.target.value);
              chargerLignes(e.target.value);
            }}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {auxiliaires.length === 0 ? (
              <option value="">Aucun tiers configuré sur ce compte collectif</option>
            ) : (
              auxiliaires.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.codeAuxiliaire} — {a.intitule} ({a.typeTiers})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Control Summary Banner */}
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {lignesNonLettrees.length} ligne(s) en attente de lettrage sur ce compte
          </span>
          <div className="mt-1 flex items-center gap-2">
            {selectedLigneIds.length >= 2 && (
              <span
                className={`rounded px-2 py-0.5 text-xs font-bold ${
                  estEquilibre
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {estEquilibre
                  ? "✓ Sélection parfaitement équilibrée"
                  : `Écart de solde : ${formatCurrency(ecart)}`}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs">
          <div>
            <span className="text-gray-500">Débit sélectionné : </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(totDebit)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Crédit sélectionné : </span>
            <span className="font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(totCredit)}
            </span>
          </div>
        </div>
      </div>

      {/* Unlettered Lines Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/75 font-semibold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <th className="py-3 px-4 w-10">Sélect.</th>
              <th className="py-3 px-4">Date Écriture</th>
              <th className="py-3 px-4">N° Écriture</th>
              <th className="py-3 px-4">Journal</th>
              <th className="py-3 px-4">Pièce</th>
              <th className="py-3 px-4">Libellé</th>
              <th className="py-3 px-4 text-right">Débit (Facture)</th>
              <th className="py-3 px-4 text-right">Crédit (Règlement)</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </td>
              </tr>
            ) : lignesNonLettrees.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-400">
                  Toutes les écritures de ce tiers sont lettrées ou aucun mouvement n'a été enregistré.
                </td>
              </tr>
            ) : (
              lignesNonLettrees.map((l) => {
                const isSelected = selectedLigneIds.includes(l.id);
                return (
                  <tr
                    key={l.id}
                    onClick={() => handleToggleLigne(l.id)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/30"
                        : "hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleLigne(l.id)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                      {new Date(l.ecriture?.dateEcriture).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-gray-700 dark:text-gray-300">
                      {l.ecriture?.numEcriture}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">
                      {l.ecriture?.journal?.codeJournal}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500">
                      {l.ecriture?.pieceRef || "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">
                      {l.libelleLigne || l.ecriture?.libelle}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-blue-600 dark:text-blue-400 font-bold">
                      {Number(l.montantDebit) > 0 ? formatCurrency(Number(l.montantDebit)) : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-purple-600 dark:text-purple-400 font-bold">
                      {Number(l.montantCredit) > 0 ? formatCurrency(Number(l.montantCredit)) : "—"}
                    </td>
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setDetailLigne(l)}
                        title="Consulter le détail de la ligne"
                        aria-label="Détail"
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition shadow-xs"
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Créer Nouveau Tiers */}
      {showAddAuxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Nouveau Compte Auxiliaire de Tiers
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Création rapide d'un tiers rattaché au compte collectif sélectionné.
            </p>

            <form onSubmit={handleCreateAuxiliaire} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Code Auxiliaire (ex: CL001, FO-TOTAL)
                </label>
                <input
                  type="text"
                  required
                  value={newAuxCode}
                  onChange={(e) => setNewAuxCode(e.target.value)}
                  placeholder="Ex: CL-001"
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 font-mono text-xs uppercase dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Raison Sociale / Nom
                </label>
                <input
                  type="text"
                  required
                  value={newAuxIntitule}
                  onChange={(e) => setNewAuxIntitule(e.target.value)}
                  placeholder="Ex: Cabinet Audit Bénin"
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Type de Tiers
                </label>
                <select
                  value={newAuxType}
                  onChange={(e: any) => setNewAuxType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="CLIENT">Client</option>
                  <option value="FOURNISSEUR">Fournisseur</option>
                  <option value="SALARIE">Salarié</option>
                  <option value="AUTRE">Autre tiers</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddAuxModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAux}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50"
                >
                  {isSubmittingAux ? "Création..." : "Créer le Tiers"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Détail Ligne Non Lettrée */}
      {detailLigne && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  ÉCRITURE {detailLigne.ecriture?.numEcriture || "BROUILLON"}
                </span>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  {detailLigne.libelleLigne || detailLigne.ecriture?.libelle}
                </h2>
              </div>
              <button
                onClick={() => setDetailLigne(null)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <span className="text-gray-500">Date d'opération</span>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {new Date(detailLigne.ecriture?.dateEcriture).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <span className="text-gray-500">Journal Comptable</span>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {detailLigne.ecriture?.journal?.codeJournal} — {detailLigne.ecriture?.journal?.libelle || "Journal"}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <span className="text-gray-500">Pièce Justificative Réf.</span>
                <p className="mt-1 font-mono font-semibold text-gray-900 dark:text-white">
                  {detailLigne.ecriture?.pieceRef || "—"}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <span className="text-gray-500">Nature</span>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {Number(detailLigne.montantDebit) > 0 ? "Facture émise / Débit" : "Règlement reçu / Crédit"}
                </p>
              </div>
              <div className="col-span-2 rounded-lg bg-blue-50/50 p-3 text-center dark:bg-blue-950/20">
                <span className="text-xs text-blue-700 dark:text-blue-300">Montant de la ligne :</span>
                <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(Number(detailLigne.montantDebit) || Number(detailLigne.montantCredit) || 0)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDetailLigne(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
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
