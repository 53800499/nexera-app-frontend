"use client";

import React, { useEffect, useState } from "react";
import { useActionFeedback } from "@/shared/components/feedback";
import { comptabiliteApi } from "../services/comptabiliteApi.service";
import type {
  BalanceGeneraleResponse,
  ComptaExercice,
  LigneBalanceAuxiliaire,
} from "../types/comptabilite.types";
import { PlusIcon, EyeIcon, LinkIcon } from "./ComptaIcons";

export const BalancesView: React.FC = () => {
  const { showResult } = useActionFeedback();
  const [exercices, setExercices] = useState<ComptaExercice[]>([]);
  const [selectedExercice, setSelectedExercice] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"GENERALE" | "AUXILIAIRE">("GENERALE");
  const [balanceGenerale, setBalanceGenerale] = useState<BalanceGeneraleResponse | null>(null);
  const [balanceAuxiliaire, setBalanceAuxiliaire] = useState<LigneBalanceAuxiliaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Nouveau Tiers Auxiliaire
  const [showAddAuxModal, setShowAddAuxModal] = useState(false);
  const [comptesCollectifs, setComptesCollectifs] = useState<any[]>([]);
  const [selectedCollectifId, setSelectedCollectifId] = useState("");
  const [newAuxCode, setNewAuxCode] = useState("");
  const [newAuxIntitule, setNewAuxIntitule] = useState("");
  const [newAuxType, setNewAuxType] = useState<"CLIENT" | "FOURNISSEUR" | "SALARIE" | "AUTRE">("CLIENT");
  const [isSubmittingAux, setIsSubmittingAux] = useState(false);

  // Modals Détail
  const [detailLigneGen, setDetailLigneGen] = useState<any | null>(null);
  const [detailLigneAux, setDetailLigneAux] = useState<LigneBalanceAuxiliaire | null>(null);

  useEffect(() => {
    comptabiliteApi.getExercices().then((exs) => {
      setExercices(exs);
      const courant = exs.find((e) => e.statut === "OUVERT") || exs[0];
      if (courant) {
        setSelectedExercice(courant.id);
        chargerDonnees(courant.id);
      }
    });

    comptabiliteApi.getPlanComptable({ classe: 4, actif: true }).then((data) => {
      const cls = data.filter((c) => c.numero.startsWith("411") || c.numero.startsWith("401") || c.numero.startsWith("421"));
      setComptesCollectifs(cls);
      if (cls.length > 0) setSelectedCollectifId(cls[0].id);
    });
  }, []);

  const handleCreateAuxiliaire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollectifId || !newAuxCode.trim() || !newAuxIntitule.trim()) return;
    setIsSubmittingAux(true);
    try {
      await comptabiliteApi.createCompteAuxiliaire({
        compteCollectifId: selectedCollectifId,
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
      chargerDonnees();
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

  const chargerDonnees = async (exId?: string) => {
    const id = exId || selectedExercice;
    if (!id) return;
    setIsLoading(true);
    try {
      const [gen, aux] = await Promise.all([
        comptabiliteApi.getBalanceGenerale(id),
        comptabiliteApi.getBalanceAuxiliaire(id),
      ]);
      setBalanceGenerale(gen);
      setBalanceAuxiliaire(aux);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div className="space-y-6">
      {/* Title & Tabs */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Balances Comptables SYSCOHADA
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Contrôle d'équilibre à 6 colonnes et balance auxiliaire des comptes de tiers (EF-036, EF-037).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedExercice}
            onChange={(e) => {
              setSelectedExercice(e.target.value);
              chargerDonnees(e.target.value);
            }}
            className="rounded-lg border border-gray-300 bg-white p-2 text-xs font-semibold text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {exercices.map((ex) => (
              <option key={ex.id} value={ex.id}>
                Exercice {ex.annee} ({ex.statut})
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowAddAuxModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 transition"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Nouveau Tiers Auxiliaire
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            Imprimer
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab("GENERALE")}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${
              activeTab === "GENERALE"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Balance Générale (6 Colonnes)
          </button>
          <button
            onClick={() => setActiveTab("AUXILIAIRE")}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${
              activeTab === "AUXILIAIRE"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Balance Auxiliaire (Tiers Classe 4)
          </button>
        </nav>
      </div>

      {/* Tab 1: Balance Générale 6 colonnes */}
      {activeTab === "GENERALE" && (
        <div className="space-y-4">
          {/* Alerte d'équilibre */}
          {balanceGenerale && (
            <div
              className={`flex items-center justify-between rounded-xl border p-4 text-xs font-semibold ${
                balanceGenerale.estEquilibree
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{balanceGenerale.estEquilibree ? "✓" : "⚠"}</span>
                <span>
                  {balanceGenerale.estEquilibree
                    ? "Règle EF-037 respectée : La balance est strictement équilibrée (Total Débits = Total Crédits)."
                    : "Alerte bloquante : La balance présente un déséquilibre entre Débits et Crédits."}
                </span>
              </div>
              <span className="font-mono">
                Total Mouvements : {formatCurrency(balanceGenerale.totaux.mouvementsDebit)}
              </span>
            </div>
          )}

          {/* Table 6 colonnes */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-center font-bold text-gray-700 dark:border-gray-800 dark:bg-gray-800/80 dark:text-gray-300">
                  <th colSpan={2} className="py-2.5 px-4 text-left border-r border-gray-200 dark:border-gray-800">
                    Compte SYSCOHADA
                  </th>
                  <th colSpan={2} className="py-2.5 px-4 border-r border-gray-200 dark:border-gray-800">
                    Soldes Initiaux (À Nouveaux)
                  </th>
                  <th colSpan={2} className="py-2.5 px-4 border-r border-gray-200 dark:border-gray-800">
                    Mouvements de la Période
                  </th>
                  <th colSpan={2} className="py-2.5 px-4 border-r border-gray-200 dark:border-gray-800">
                    Soldes Clôture
                  </th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50/50 font-semibold text-gray-500 dark:border-gray-800 dark:bg-gray-800/40">
                  <th className="py-2 px-4">Numéro</th>
                  <th className="py-2 px-4 border-r border-gray-200 dark:border-gray-800">Intitulé</th>
                  <th className="py-2 px-4 text-right">Débit</th>
                  <th className="py-2 px-4 text-right border-r border-gray-200 dark:border-gray-800">Crédit</th>
                  <th className="py-2 px-4 text-right">Débit</th>
                  <th className="py-2 px-4 text-right border-r border-gray-200 dark:border-gray-800">Crédit</th>
                  <th className="py-2 px-4 text-right">Débit</th>
                  <th className="py-2 px-4 text-right border-r border-gray-200 dark:border-gray-800">Crédit</th>
                  <th className="py-2 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    </td>
                  </tr>
                ) : !balanceGenerale || balanceGenerale.lignes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-400">
                      Aucune donnée de balance pour cet exercice.
                    </td>
                  </tr>
                ) : (
                  balanceGenerale.lignes.map((l) => (
                    <tr key={l.compteId} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30">
                      <td className="py-2 px-4 font-mono font-bold text-gray-900 dark:text-white">
                        {l.numero}
                      </td>
                      <td className="py-2 px-4 border-r border-gray-200 text-gray-800 dark:border-gray-800 dark:text-gray-200">
                        {l.intitule}
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-gray-700 dark:text-gray-300">
                        {l.soldeInitialDebit > 0 ? formatCurrency(l.soldeInitialDebit) : "—"}
                      </td>
                      <td className="py-2 px-4 text-right font-mono border-r border-gray-200 text-gray-700 dark:border-gray-800 dark:text-gray-300">
                        {l.soldeInitialCredit > 0 ? formatCurrency(l.soldeInitialCredit) : "—"}
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-blue-600 dark:text-blue-400 font-semibold">
                        {l.mouvementsDebit > 0 ? formatCurrency(l.mouvementsDebit) : "—"}
                      </td>
                      <td className="py-2 px-4 text-right font-mono border-r border-gray-200 text-purple-600 dark:border-gray-800 dark:text-purple-400 font-semibold">
                        {l.mouvementsCredit > 0 ? formatCurrency(l.mouvementsCredit) : "—"}
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-gray-900 dark:text-white font-bold">
                        {l.soldeFinalDebit > 0 ? formatCurrency(l.soldeFinalDebit) : "—"}
                      </td>
                      <td className="py-2 px-4 text-right font-mono border-r border-gray-200 text-gray-900 dark:border-gray-800 dark:text-white font-bold">
                        {l.soldeFinalCredit > 0 ? formatCurrency(l.soldeFinalCredit) : "—"}
                      </td>
                      <td className="py-2 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setDetailLigneGen(l)}
                          title="Consulter les soldes du compte"
                          aria-label="Détail"
                          className="inline-flex items-center justify-center rounded-lg border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition shadow-xs"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {balanceGenerale && (
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-100/80 font-mono text-xs font-bold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    <td colSpan={2} className="py-3 px-4 border-r border-gray-300 dark:border-gray-700">
                      TOTAUX GÉNÉRAUX DE CONTRÔLE
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(balanceGenerale.totaux.soldeInitialDebit)}
                    </td>
                    <td className="py-3 px-4 text-right border-r border-gray-300 dark:border-gray-700">
                      {formatCurrency(balanceGenerale.totaux.soldeInitialCredit)}
                    </td>
                    <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400">
                      {formatCurrency(balanceGenerale.totaux.mouvementsDebit)}
                    </td>
                    <td className="py-3 px-4 text-right border-r border-gray-300 text-purple-600 dark:border-gray-700 dark:text-purple-400">
                      {formatCurrency(balanceGenerale.totaux.mouvementsCredit)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(balanceGenerale.totaux.soldeFinalDebit)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(balanceGenerale.totaux.soldeFinalCredit)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Balance Auxiliaire (Tiers classe 4) */}
      {activeTab === "AUXILIAIRE" && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/75 font-semibold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <th className="py-3 px-4">Code Auxiliaire</th>
                <th className="py-3 px-4">Raison Sociale / Tiers</th>
                <th className="py-3 px-4">Compte Collectif</th>
                <th className="py-3 px-4 text-right">Cumul Débit</th>
                <th className="py-3 px-4 text-right">Cumul Crédit</th>
                <th className="py-3 px-4 text-right">Solde Débiteur</th>
                <th className="py-3 px-4 text-right">Solde Créditeur</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  </td>
                </tr>
              ) : balanceAuxiliaire.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400">
                    Aucun mouvement sur les comptes auxiliaires de tiers pour cet exercice.
                  </td>
                </tr>
              ) : (
                balanceAuxiliaire.map((aux) => (
                  <tr key={aux.compteAuxiliaireId} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30">
                    <td className="py-2.5 px-4 font-mono font-bold text-gray-900 dark:text-white">
                      {aux.codeAuxiliaire}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-gray-800 dark:text-gray-200">
                      {aux.intituleAuxiliaire}
                    </td>
                    <td className="py-2.5 px-4 text-gray-600 dark:text-gray-400 font-mono">
                      {aux.compteCollectifNumero} — {aux.compteCollectifIntitule}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-gray-900 dark:text-white">
                      {formatCurrency(aux.totalDebit)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-gray-900 dark:text-white">
                      {formatCurrency(aux.totalCredit)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                      {aux.soldeDebit > 0 ? formatCurrency(aux.soldeDebit) : "—"}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                      {aux.soldeCredit > 0 ? formatCurrency(aux.soldeCredit) : "—"}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailLigneAux(aux)}
                          title="Consulter le détail du compte tiers"
                          aria-label="Détail"
                          className="inline-flex items-center justify-center rounded-lg border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition shadow-xs"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href="/comptabilite/lettrage"
                          title="Accéder au lettrage de ce compte tiers"
                          aria-label="Lettrer"
                          className="inline-flex items-center justify-center rounded-lg border border-blue-200 p-1.5 text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-900/60 dark:text-blue-400 dark:hover:bg-blue-950/40 transition shadow-xs"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Créer Nouveau Tiers Auxiliaire */}
      {showAddAuxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Nouveau Compte Auxiliaire de Tiers
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Rattachement d'un client, fournisseur ou salarié à son compte collectif classe 4.
            </p>

            <form onSubmit={handleCreateAuxiliaire} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Compte Collectif (Classe 4)
                </label>
                <select
                  required
                  value={selectedCollectifId}
                  onChange={(e) => setSelectedCollectifId(e.target.value)}
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
                  Raison Sociale / Intitulé du Tiers
                </label>
                <input
                  type="text"
                  required
                  value={newAuxIntitule}
                  onChange={(e) => setNewAuxIntitule(e.target.value)}
                  placeholder="Ex: Entreprise Martin & Cie"
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

      {/* Modal Détail Compte Balance Générale */}
      {detailLigneGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  COMPTE {detailLigneGen.numero}
                </span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {detailLigneGen.intitule}
                </h2>
              </div>
              <button
                onClick={() => setDetailLigneGen(null)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <span className="text-gray-500">Solde Initial Débit</span>
                <p className="mt-1 font-mono font-bold text-gray-900 dark:text-white">
                  {formatCurrency(detailLigneGen.soldeInitialDebit)}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <span className="text-gray-500">Solde Initial Crédit</span>
                <p className="mt-1 font-mono font-bold text-gray-900 dark:text-white">
                  {formatCurrency(detailLigneGen.soldeInitialCredit)}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50/60 p-3 dark:bg-blue-950/30">
                <span className="text-blue-700 dark:text-blue-300">Cumul Débit Mouvements</span>
                <p className="mt-1 font-mono font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(detailLigneGen.mouvementsDebit)}
                </p>
              </div>
              <div className="rounded-lg bg-purple-50/60 p-3 dark:bg-purple-950/30">
                <span className="text-purple-700 dark:text-purple-300">Cumul Crédit Mouvements</span>
                <p className="mt-1 font-mono font-bold text-purple-700 dark:text-purple-300">
                  {formatCurrency(detailLigneGen.mouvementsCredit)}
                </p>
              </div>
              <div className="col-span-2 rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                <span className="text-gray-500">Solde Net de Clôture</span>
                <p className="mt-1 font-mono text-sm font-bold text-gray-900 dark:text-white">
                  {detailLigneGen.soldeFinalDebit > 0
                    ? `DÉBITEUR : ${formatCurrency(detailLigneGen.soldeFinalDebit)}`
                    : detailLigneGen.soldeFinalCredit > 0
                    ? `CRÉDITEUR : ${formatCurrency(detailLigneGen.soldeFinalCredit)}`
                    : "SOLDE NUL (0 XOF)"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDetailLigneGen(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détail Tiers Balance Auxiliaire */}
      {detailLigneAux && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  TIERS {detailLigneAux.codeAuxiliaire}
                </span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {detailLigneAux.intituleAuxiliaire}
                </h2>
              </div>
              <button
                onClick={() => setDetailLigneAux(null)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <span className="text-gray-500">Compte Collectif de Rattachement</span>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white font-mono">
                  {detailLigneAux.compteCollectifNumero} — {detailLigneAux.compteCollectifIntitule}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-blue-50/60 p-3 dark:bg-blue-950/30">
                  <span className="text-blue-700 dark:text-blue-300">Cumul Débit</span>
                  <p className="mt-1 font-mono font-bold text-blue-700 dark:text-blue-300">
                    {formatCurrency(detailLigneAux.totalDebit)}
                  </p>
                </div>
                <div className="rounded-lg bg-purple-50/60 p-3 dark:bg-purple-950/30">
                  <span className="text-purple-700 dark:text-purple-300">Cumul Crédit</span>
                  <p className="mt-1 font-mono font-bold text-purple-700 dark:text-purple-300">
                    {formatCurrency(detailLigneAux.totalCredit)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                <span className="text-gray-500">Position Nette</span>
                <p className="mt-1 font-mono text-sm font-bold text-gray-900 dark:text-white">
                  {detailLigneAux.soldeDebit > 0
                    ? `Créance client / Solde débiteur : ${formatCurrency(detailLigneAux.soldeDebit)}`
                    : detailLigneAux.soldeCredit > 0
                    ? `Dette fournisseur / Solde créditeur : ${formatCurrency(detailLigneAux.soldeCredit)}`
                    : "Compte totalement lettré / Solde nul (0 XOF)"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
              <a
                href="/comptabilite/lettrage"
                className="rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-500/40 dark:text-blue-400"
              >
                Accéder au Lettrage
              </a>
              <button
                onClick={() => setDetailLigneAux(null)}
                className="rounded-lg bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
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
