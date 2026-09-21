"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fiscaliteApi } from "../services/fiscaliteApi.service";
import type { TaxContribuable, TaxExerciceFiscal } from "../types/fiscalite.types";

export const IsCalculView: React.FC = () => {
  const [contribuable, setContribuable] = useState<TaxContribuable | null>(null);
  const [exercices, setExercices] = useState<TaxExerciceFiscal[]>([]);
  const [selectedEx, setSelectedEx] = useState<TaxExerciceFiscal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Formulaire création exercice
  const [newDateDebut, setNewDateDebut] = useState("2026-01-01");
  const [newDateFin, setNewDateFin] = useState("2026-12-31");

  // Formulaire calcul & retraitements
  const [resComptable, setResComptable] = useState<number>(35000000);
  const [produitsEncaissables, setProduitsEncaissables] = useState<number>(280000000);
  const [showAddRetraitement, setShowAddRetraitement] = useState(false);
  const [retraitementSens, setRetraitementSens] = useState<"REINTEGRATION" | "DEDUCTION">("REINTEGRATION");
  const [retraitementLibelle, setRetraitementLibelle] = useState("Amendes et pénalités non déductibles (CGI Art. 47)");
  const [retraitementMontant, setRetraitementMontant] = useState<number>(1500000);
  const [retraitementBaseLegale, setRetraitementBaseLegale] = useState("CGI 2026 Art. 47 § 2");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const p = await fiscaliteApi.getMonProfil();
      setContribuable(p);
      if (p?.id) {
        const list = await fiscaliteApi.listExercicesIs(p.id);
        setExercices(list);
        if (list.length > 0) {
          const detailed = await fiscaliteApi.getExerciceIs(list[0].id);
          setSelectedEx(detailed);
          if (detailed.calculIs) {
            setResComptable(detailed.calculIs.resultatComptableNet || 0);
            setProduitsEncaissables(detailed.calculIs.produitsEncaissables || 0);
          }
        }
      }
    } catch (err) {
      console.error("Erreur chargement IS:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectExercice = async (id: string) => {
    try {
      const detailed = await fiscaliteApi.getExerciceIs(id);
      setSelectedEx(detailed);
      if (detailed.calculIs) {
        setResComptable(detailed.calculIs.resultatComptableNet || 0);
        setProduitsEncaissables(detailed.calculIs.produitsEncaissables || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateExercice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribuable) return;
    setActionLoading(true);
    try {
      await fiscaliteApi.createExerciceIs({
        taxContribuableId: contribuable.id,
        dateDebut: newDateDebut,
        dateFin: newDateFin,
      });
      setIsCreating(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur création exercice");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddRetraitement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEx) return;
    setActionLoading(true);
    try {
      await fiscaliteApi.addRetraitement(selectedEx.id, {
        sens: retraitementSens,
        libelle: retraitementLibelle,
        montant: Number(retraitementMontant),
        baseLegale: retraitementBaseLegale,
      });
      setShowAddRetraitement(false);
      await handleSelectExercice(selectedEx.id);
    } catch (err: any) {
      alert(err.message || "Erreur ajout retraitement");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRetraitement = async (id: string) => {
    if (!confirm("Supprimer ce retraitement fiscal ?")) return;
    try {
      await fiscaliteApi.deleteRetraitement(id);
      if (selectedEx) await handleSelectExercice(selectedEx.id);
    } catch (err: any) {
      alert(err.message || "Erreur suppression retraitement");
    }
  };

  const handleCalculerIs = async () => {
    if (!selectedEx) return;
    setActionLoading(true);
    try {
      await fiscaliteApi.calculerEtEnregistrerIs(selectedEx.id, {
        resultatComptableNet: Number(resComptable),
        produitsEncaissables: Number(produitsEncaissables),
      });
      await handleSelectExercice(selectedEx.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur calcul IS");
    } finally {
      setActionLoading(false);
    }
  };

  const handleValiderTransmissionM3 = async () => {
    if (!selectedEx) return;
    if (
      !confirm(
        "Confirmer la validation définitive du calcul d'IS et la transmission de l'OD comptable vers M3 (Débit 695 / Crédit 444) ?"
      )
    )
      return;
    setActionLoading(true);
    try {
      const res = await fiscaliteApi.validerIsTransmissionM3(selectedEx.id);
      alert(res.message || "Calcul validé et écriture transmise à M3 avec succès.");
      await handleSelectExercice(selectedEx.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur validation transmission M3");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayerAcompte = async (acompteId: string, montant: number) => {
    if (!confirm(`Enregistrer le règlement de cet acompte (${formatCurrency(montant)}) auprès de la DGI ?`)) return;
    setActionLoading(true);
    try {
      await fiscaliteApi.payerAcompteIs(acompteId, montant);
      if (selectedEx) await handleSelectExercice(selectedEx.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur enregistrement acompte");
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const calc = selectedEx?.calculIs;
  const retraitements = selectedEx?.retraitements || [];
  const acomptes = selectedEx?.acomptes || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold text-lg">
              IS
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Impôt sur les Sociétés (IS) &amp; Acomptes
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            CGI Bénin 2026 Art. 46-51 • Taux : 30% (activités générales) ou 25% (industries) • Minimum de perception : MAX(0,5% CA, 500 000 FCFA).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/fiscalite"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            ← Tableau de Bord
          </Link>
          <button
            onClick={() => setIsCreating(true)}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 shadow-sm transition"
          >
            + Nouvel Exercice Fiscal
          </button>
        </div>
      </div>

      {/* Bannière Règle Fiscale Bénin */}
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20 text-sm text-amber-900 dark:text-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold">EF-016 &amp; EF-045 :</span>
          <span>
            L&apos;IS dû est obligatoirement le maximum entre le taux proportionnel au résultat fiscal et le minimum de perception. La validation génère l&apos;écriture OD 695 / 444 vers M3.
          </span>
        </div>
        <span className="hidden sm:inline font-mono text-xs font-semibold px-2.5 py-1 bg-amber-200/60 dark:bg-amber-900/60 rounded">
          3 acomptes : 10 mai • 10 juil. • 10 oct.
        </span>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne Gauche : Liste des Exercices */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white pb-1">
              Exercices Fiscaux ({exercices.length})
            </h2>

            {exercices.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-sm text-gray-500">
                Aucun exercice fiscal ouvert. Cliquez sur &quot;Nouvel Exercice Fiscal&quot; pour démarrer.
              </div>
            ) : (
              exercices.map((ex) => {
                const isSelected = selectedEx?.id === ex.id;
                const annee = new Date(ex.dateDebut).getFullYear();
                return (
                  <div
                    key={ex.id}
                    onClick={() => handleSelectExercice(ex.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/40 shadow-sm dark:border-amber-500 dark:bg-amber-950/20"
                        : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-800/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 dark:text-white text-base">
                        Exercice {annee}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          ex.statut === "CLOTURE"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                            : ex.statut === "OUVERT"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {ex.statut}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Du {new Date(ex.dateDebut).toLocaleDateString("fr-FR")} au{" "}
                      {new Date(ex.dateFin).toLocaleDateString("fr-FR")}
                    </div>

                    {ex.calculIs && (
                      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-300">IS Dû Net :</span>
                        <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">
                          {formatCurrency(ex.calculIs.isDu)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Colonne Droite : Moteur de Calcul IS & Retraitements */}
          <div className="lg:col-span-2 space-y-6">
            {selectedEx ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 space-y-6">
                {/* En-tête de l'exercice sélectionné */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Calcul &amp; Retraitements Fiscaux — Exercice {new Date(selectedEx.dateDebut).getFullYear()}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Statut du calcul :{" "}
                      <span className="font-semibold text-amber-700 dark:text-amber-400">
                        {calc?.statutCalcul || "NON_CALCULE"}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCalculerIs}
                      disabled={actionLoading}
                      className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-medium text-white hover:bg-amber-700 transition shadow-sm"
                    >
                      ⚡ Recalculer l&apos;IS
                    </button>

                    {calc && calc.statutCalcul !== "VALIDE_DEFINITIF" && (
                      <button
                        onClick={handleValiderTransmissionM3}
                        disabled={actionLoading}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 transition shadow-sm"
                      >
                        ✓ Valider &amp; Transmettre à M3 (695 / 444)
                      </button>
                    )}
                  </div>
                </div>

                {/* Paramètres d'assiette */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Résultat comptable net avant impôt (M3)
                    </label>
                    <input
                      type="number"
                      value={resComptable}
                      onChange={(e) => setResComptable(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Produits encaissables (Assiette du minimum de perception)
                    </label>
                    <input
                      type="number"
                      value={produitsEncaissables}
                      onChange={(e) => setProduitsEncaissables(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>

                {/* Synthèse du calcul */}
                {calc && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/40">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Résultat Fiscal</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                        {formatCurrency(calc.resultatFiscal)}
                      </p>
                      <span className="text-[10px] text-gray-500">
                        {calc.tauxApplicable}% appliqué
                      </span>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/40">
                      <p className="text-xs text-gray-500 dark:text-gray-400">IS au Taux</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                        {formatCurrency(calc.isCalculeTaux)}
                      </p>
                      <span className="text-[10px] text-gray-500">Base résultat fiscal</span>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/40">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Minimum Perception</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                        {formatCurrency(calc.minimumPerceptionMontant)}
                      </p>
                      <span className="text-[10px] text-gray-500">
                        0,5% CA ou 500k min
                      </span>
                    </div>

                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3">
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                        {calc.appliqueMinimumPerception ? "IS Dû (Minimum)" : "IS Dû Net"}
                      </p>
                      <p className="text-xl font-bold text-amber-900 dark:text-amber-200 mt-1">
                        {formatCurrency(calc.isDu)}
                      </p>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400">
                        MAX(Taux, Minimum)
                      </span>
                    </div>
                  </div>
                )}

                {/* Section Retraitements Extracomptables (EF-017) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Retraitements Fiscaux Extracomptables (Réintégrations &amp; Déductions)
                    </h3>
                    <button
                      onClick={() => setShowAddRetraitement(true)}
                      className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
                    >
                      + Ajouter Retraitement
                    </button>
                  </div>

                  {retraitements.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic py-3 text-center border border-dashed rounded-lg">
                      Aucun retraitement fiscal. Le résultat fiscal correspond au résultat comptable.
                    </p>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Sens</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Libellé</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Base Légale</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">Montant</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-300">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800/60">
                          {retraitements.map((r) => (
                            <tr key={r.id}>
                              <td className="px-3 py-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                    r.sens === "REINTEGRATION"
                                      ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                  }`}
                                >
                                  {r.sens === "REINTEGRATION" ? "+ Réintégration" : "- Déduction"}
                                </span>
                              </td>
                              <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                                {r.libelle}
                              </td>
                              <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                                {r.baseLegale || "CGI 2026"}
                              </td>
                              <td className="px-3 py-2 text-right font-bold text-gray-900 dark:text-white">
                                {formatCurrency(r.montant)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  onClick={() => handleDeleteRetraitement(r.id)}
                                  className="text-rose-600 hover:text-rose-800 text-xs font-semibold"
                                >
                                  Supprimer
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Section Acomptes Provisionnels Trimestriels (EF-018) */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Échéancier des 3 Acomptes Provisionnels d&apos;IS (CGI Art. 51)
                  </h3>

                  {acomptes.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic py-3 text-center border border-dashed rounded-lg">
                      Les acomptes sont générés automatiquement lors du calcul de l&apos;IS.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {acomptes.map((ac) => {
                        const isPaye = ac.statut === "PAYE";
                        return (
                          <div
                            key={ac.id}
                            className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-gray-900 dark:text-white">
                                {ac.numeroAcompte === 1 && "1er Acompte (10 Mai)"}
                                {ac.numeroAcompte === 2 && "2e Acompte (10 Juillet)"}
                                {ac.numeroAcompte === 3 && "3e Acompte (10 Octobre)"}
                              </span>
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                  isPaye
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                }`}
                              >
                                {ac.statut}
                              </span>
                            </div>

                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatCurrency(ac.montantDu)}
                            </p>

                            <p className="text-xs text-gray-500">
                              Limite : {new Date(ac.dateEcheance).toLocaleDateString("fr-FR")}
                            </p>

                            {!isPaye && (
                              <button
                                onClick={() => handlePayerAcompte(ac.id, ac.montantDu)}
                                disabled={actionLoading}
                                className="w-full mt-2 rounded-lg bg-emerald-600 py-1 text-xs font-medium text-white hover:bg-emerald-700 transition"
                              >
                                Enregistrer Règlement
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-800/80">
                Sélectionnez un exercice fiscal pour accéder au calcul d&apos;IS et aux acomptes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Nouvel Exercice */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Créer un nouvel exercice fiscal
            </h3>
            <form onSubmit={handleCreateExercice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Date de début (Généralement 1er Janvier)
                </label>
                <input
                  type="date"
                  value={newDateDebut}
                  onChange={(e) => setNewDateDebut(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Date de clôture (Généralement 31 Décembre)
                </label>
                <input
                  type="date"
                  value={newDateFin}
                  onChange={(e) => setNewDateFin(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-medium text-white hover:bg-amber-700 shadow-sm"
                >
                  Ouvrir l&apos;Exercice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajout Retraitement */}
      {showAddRetraitement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Ajouter un retraitement fiscal
            </h3>
            <form onSubmit={handleAddRetraitement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Sens du retraitement
                </label>
                <select
                  value={retraitementSens}
                  onChange={(e) => setRetraitementSens(e.target.value as any)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="REINTEGRATION">+ Réintégration fiscale (Augmente le résultat)</option>
                  <option value="DEDUCTION">- Déduction extracomptable (Diminue le résultat)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Libellé du motif
                </label>
                <input
                  type="text"
                  value={retraitementLibelle}
                  onChange={(e) => setRetraitementLibelle(e.target.value)}
                  required
                  placeholder="Ex: Amendes et pénalités non déductibles"
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Base légale (CGI Bénin)
                </label>
                <input
                  type="text"
                  value={retraitementBaseLegale}
                  onChange={(e) => setRetraitementBaseLegale(e.target.value)}
                  placeholder="Ex: CGI 2026 Art. 47 § 2"
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Montant (FCFA)
                </label>
                <input
                  type="number"
                  value={retraitementMontant}
                  onChange={(e) => setRetraitementMontant(Number(e.target.value))}
                  min={1}
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddRetraitement(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-medium text-white hover:bg-amber-700 shadow-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
