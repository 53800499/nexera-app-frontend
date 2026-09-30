"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fiscaliteApi } from "../services/fiscaliteApi.service";
import type { TaxContribuable, TaxDeclarationTva } from "../types/fiscalite.types";
import { PercentBadgeIcon, CreditCardIcon } from "./FiscaliteIcons";
import { ChevronLeftIcon, PlusIcon, CheckCircleIcon, DocsIcon } from "@/icons";
import { useActionFeedback, useToast } from "@/shared/components/feedback";
import { useFiscalitePdf } from "../pdf";
import { FiscalitePdfPreviewModal } from "./FiscalitePdfPreviewModal";
import { FormErrorAlert, useFormError } from "./FormErrorAlert";

export const TvaDeclarationsView: React.FC = () => {
  const { confirm, showResult } = useActionFeedback();
  const toast = useToast();
  const {
    isExporting,
    preview,
    closePreview,
    previewTva,
    downloadTva,
  } = useFiscalitePdf();

  const [contribuable, setContribuable] = useState<TaxContribuable | null>(null);
  const [declarations, setDeclarations] = useState<TaxDeclarationTva[]>([]);
  const [selectedDec, setSelectedDec] = useState<TaxDeclarationTva | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Gestion des erreurs de formulaire
  const { error: declarationError, captureError: captureDeclarationError, clearError: clearDeclarationError } = useFormError();
  const { error: ligneError, captureError: captureLigneError, clearError: clearLigneError } = useFormError();

  // Formulaire nouvelle déclaration
  const [newPeriode, setNewPeriode] = useState("2026-03");
  const [newDateLimite, setNewDateLimite] = useState("2026-04-10");
  const [newCreditAnterieur, setNewCreditAnterieur] = useState<number>(0);

  // Formulaire ajout de ligne manuelle
  const [showAddLigne, setShowAddLigne] = useState(false);
  const [ligneNature, setLigneNature] = useState<"VENTE_TAXABLE" | "ACHAT_DEDUCTIBLE" | "IMPORTATION" | "NOTE_FRAIS_DEDUCTIBLE">("VENTE_TAXABLE");
  const [ligneTaux, setLigneTaux] = useState(18);
  const [ligneBaseHt, setLigneBaseHt] = useState<number>(1000000);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const p = await fiscaliteApi.getMonProfil();
      setContribuable(p);
      if (p?.id) {
        const list = await fiscaliteApi.listDeclarationsTva(p.id);
        setDeclarations(list);
        if (list.length > 0) {
          const detailed = await fiscaliteApi.getDeclarationTva(list[0].id);
          setSelectedDec(detailed);
        }
      }
    } catch (err) {
      console.error("Erreur chargement TVA:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectDec = async (id: string) => {
    try {
      const detailed = await fiscaliteApi.getDeclarationTva(id);
      setSelectedDec(detailed);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDeclaration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribuable) return;
    clearDeclarationError();
    setActionLoading(true);
    try {
      await fiscaliteApi.createDeclarationTva({
        taxContribuableId: contribuable.id,
        periode: newPeriode,
        dateLimiteLegale: newDateLimite,
        creditTvaAnterieur: Number(newCreditAnterieur) || 0,
      });
      setIsCreating(false);
      await loadData();
      toast.success(
        "Déclaration créée",
        `La déclaration TVA pour la période ${newPeriode} a été initialisée.`
      );
    } catch (err: any) {
      captureDeclarationError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddLigne = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDec) return;
    clearLigneError();
    setActionLoading(true);
    try {
      const base = Number(ligneBaseHt) || 0;
      const tva = Math.round((base * (ligneTaux / 100)) * 100) / 100;
      const updated = await fiscaliteApi.addLigneTva(selectedDec.id, {
        nature: ligneNature,
        tauxApplique: ligneTaux,
        baseHorsTaxe: base,
        montantTva: tva,
      });
      setSelectedDec(updated);
      setShowAddLigne(false);
      await loadData();
      toast.success(
        "Ligne ajoutée",
        "La ligne de TVA a été ajoutée avec succès au calcul."
      );
    } catch (err: any) {
      captureLigneError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleValider = async (id: string) => {
    const confirmed = await confirm({
      title: "Valider la déclaration de TVA",
      message:
        "Confirmez-vous la validation définitive de cette déclaration de TVA ? Cette action verrouille les montants calculés pour cette période.",
      confirmLabel: "Valider la déclaration",
      variant: "warning",
    });
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await fiscaliteApi.validerDeclarationTva(id);
      await handleSelectDec(id);
      await loadData();
      await showResult({
        variant: "success",
        title: "Déclaration TVA Validée ✓",
        message: "La déclaration de TVA a été validée et verrouillée. Si une TVA nette est due, vous pouvez maintenant procéder au règlement auprès de la DGI.",
        closeLabel: "Compris",
      });
    } catch (err: any) {
      toast.error(
        "Erreur de validation",
        err.message || "Impossible de valider la déclaration de TVA."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayer = async (id: string) => {
    const confirmed = await confirm({
      title: "Enregistrer le paiement DGI",
      message:
        "Confirmez-vous l'enregistrement du règlement effectif de la TVA due auprès du Trésor Public / DGI ?",
      confirmLabel: "Confirmer le paiement",
      variant: "default",
    });
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await fiscaliteApi.marquerPayeeTva(id);
      await handleSelectDec(id);
      await loadData();
      await showResult({
        variant: "success",
        title: "Paiement TVA Enregistré ✓",
        message: "Le règlement de la TVA nette due a été enregistré avec succès. La déclaration est désormais marquée PAYEE. Conservez votre reçu de paiement DGI.",
        closeLabel: "OK",
      });
    } catch (err: any) {
      toast.error(
        "Erreur d'enregistrement",
        err.message || "Impossible d'enregistrer le paiement."
      );
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold">
              <PercentBadgeIcon className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Déclarations de TVA (Taxe sur la Valeur Ajoutée)
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            CGI Bénin 2026 Art. 241-259 • Taux normal 18% • Déclaration mensuelle au plus tard le 10 du mois suivant.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 shadow-sm transition"
          >
            <PlusIcon className="h-4 w-4 shrink-0" />
            <span>Nouvelle Déclaration Périodique</span>
          </button>
        </div>
      </div>

      {/* Bannière Règle Fiscale */}
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20 text-sm text-amber-900 dark:text-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold">EF-020 &amp; EF-021 :</span>
          <span>Alimentation continue par les ventes M2 et notes de frais M5. Si TVA déductible &gt; collectée, un crédit de TVA est reporté automatiquement sur le mois suivant.</span>
        </div>
        <span className="hidden sm:inline font-mono text-xs font-semibold px-2 py-1 bg-amber-200/60 dark:bg-amber-900/60 rounded">
          Taux : 18% standard
        </span>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne Gauche : Liste des Déclarations */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Historique des Déclarations
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {declarations.length} période(s)
              </span>
            </div>

            {declarations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Aucune déclaration enregistrée. Cliquez sur &quot;Nouvelle Déclaration&quot; pour amorcer la première période.
              </div>
            ) : (
              declarations.map((d) => {
                const isSelected = selectedDec?.id === d.id;
                const isCredit = d.tvaNetteDue < 0;
                return (
                  <div
                    key={d.id}
                    onClick={() => handleSelectDec(d.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition ${isSelected
                        ? "border-amber-500 bg-amber-50/40 shadow-sm dark:border-amber-500 dark:bg-amber-950/20"
                        : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-800/80"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 dark:text-white text-base">
                        Période {d.periode}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${d.statut === "PAYEE"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : d.statut === "VALIDEE"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          }`}
                      >
                        {d.statut}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Échéance : {new Date(d.dateLimiteLegale).toLocaleDateString("fr-FR")}</span>
                      <span>{d.lignes?.length || 0} écriture(s)</span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {isCredit ? "Crédit reportable :" : "Net à payer :"}
                      </span>
                      <span
                        className={`font-bold ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"
                          }`}
                      >
                        {formatCurrency(Math.abs(d.tvaNetteDue))}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Colonne Droite : Détail de la Déclaration Sélectionnée */}
          <div className="lg:col-span-2">
            {selectedDec ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 space-y-6">
                {/* En-tête détail */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Déclaration TVA — Période {selectedDec.periode}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Date limite de déclaration &amp; paiement :{" "}
                      <strong>{new Date(selectedDec.dateLimiteLegale).toLocaleDateString("fr-FR")}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {selectedDec.statut === "BROUILLON" && (
                      <>
                        <button
                          onClick={() => setShowAddLigne(true)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition"
                        >
                          <PlusIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>Ajouter Ligne</span>
                        </button>
                        <button
                          onClick={() => handleValider(selectedDec.id)}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition shadow-sm"
                        >
                          <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>Valider la déclaration</span>
                        </button>
                      </>
                    )}

                    {selectedDec.statut === "VALIDEE" && selectedDec.tvaNetteDue > 0 && (
                      <button
                        onClick={() => handlePayer(selectedDec.id)}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition shadow-sm"
                      >
                        <CreditCardIcon className="h-4 w-4 shrink-0" />
                        <span>Marquer comme payée à la DGI</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => previewTva(selectedDec, contribuable)}
                      disabled={isExporting}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition shadow-sm"
                      title="Aperçu avant impression de la déclaration e-TVA"
                    >
                      <DocsIcon className="h-3.5 w-3.5 text-teal-600" />
                      <span>Aperçu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadTva(selectedDec, contribuable)}
                      disabled={isExporting}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition shadow-sm"
                      title="Télécharger la déclaration officielle e-TVA en PDF"
                    >
                      <span>{isExporting ? "Export..." : "Déclaration (PDF)"}</span>
                    </button>
                  </div>
                </div>

                {/* KPI de la déclaration */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="rounded-lg bg-gray-50 p-3.5 dark:bg-gray-700/40">
                    <p className="text-xs text-gray-500 dark:text-gray-400">1. TVA Collectée</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                      {formatCurrency(selectedDec.tvaCollectee)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3.5 dark:bg-gray-700/40">
                    <p className="text-xs text-gray-500 dark:text-gray-400">2. TVA Déductible</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                      {formatCurrency(selectedDec.tvaDeductible)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3.5 dark:bg-gray-700/40">
                    <p className="text-xs text-gray-500 dark:text-gray-400">3. Crédit Antérieur</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                      {formatCurrency(selectedDec.creditTvaAnterieur)}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-3.5 ${selectedDec.tvaNetteDue < 0
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800"
                      }`}
                  >
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {selectedDec.tvaNetteDue < 0 ? "Crédit Reportable" : "TVA Nette Due"}
                    </p>
                    <p
                      className={`text-lg font-bold mt-1 ${selectedDec.tvaNetteDue < 0
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-amber-800 dark:text-amber-300"
                        }`}
                    >
                      {formatCurrency(Math.abs(selectedDec.tvaNetteDue))}
                    </p>
                  </div>
                </div>

                {/* Tableau des lignes détaillées */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                    Lignes d&apos;opérations sources &amp; déclaratives ({selectedDec.lignes?.length || 0})
                  </h3>

                  {selectedDec.lignes && selectedDec.lignes.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300">Nature</th>
                            <th className="px-3 py-2.5 text-center font-semibold text-gray-600 dark:text-gray-300">Taux</th>
                            <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-300">Base HT</th>
                            <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-300">Montant TVA</th>
                            <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300">Origine</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800/60">
                          {selectedDec.lignes.map((l) => (
                            <tr key={l.id}>
                              <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">
                                {l.nature === "VENTE_TAXABLE" && "Vente taxable"}
                                {l.nature === "ACHAT_DEDUCTIBLE" && "Achat déductible"}
                                {l.nature === "NOTE_FRAIS_DEDUCTIBLE" && "Note de frais déductible (M5)"}
                                {l.nature === "IMPORTATION" && "Importation directe"}
                              </td>
                              <td className="px-3 py-2.5 text-center text-gray-600 dark:text-gray-300">
                                {l.tauxApplique}%
                              </td>
                              <td className="px-3 py-2.5 text-right text-gray-700 dark:text-gray-300">
                                {formatCurrency(l.baseHorsTaxe)}
                              </td>
                              <td className="px-3 py-2.5 text-right font-bold text-gray-900 dark:text-white">
                                {formatCurrency(l.montantTva)}
                              </td>
                              <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">
                                {l.evenementSourceId ? "Automatique (flux continu)" : "Saisie manuelle"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic py-4 text-center border border-dashed rounded-lg">
                      Aucune ligne rattachée pour cette période. Vous pouvez ajouter une ligne manuelle ou émettre des factures dans le module Ventes pour l&apos;alimenter.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-800/80">
                Sélectionnez une déclaration dans la liste pour consulter le détail.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Création Déclaration */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Créer une déclaration de TVA
            </h3>
            <form onSubmit={handleCreateDeclaration} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Période (AAAA-MM)
                </label>
                <input
                  type="month"
                  value={newPeriode}
                  onChange={(e) => {
                    setNewPeriode(e.target.value);
                    const [y, m] = e.target.value.split("-").map(Number);
                    const nextM = m === 12 ? 1 : m + 1;
                    const nextY = m === 12 ? y + 1 : y;
                    setNewDateLimite(`${nextY}-${String(nextM).padStart(2, "0")}-10`);
                  }}
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Date limite légale (CGI Art. 250 : le 10 du mois M+1)
                </label>
                <input
                  type="date"
                  value={newDateLimite}
                  onChange={(e) => setNewDateLimite(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Crédit de TVA antérieur reporté (FCFA)
                </label>
                <input
                  type="number"
                  value={newCreditAnterieur}
                  onChange={(e) => setNewCreditAnterieur(Number(e.target.value))}
                  min={0}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                <span className="text-[11px] text-gray-500">
                  Laissé à 0, le système ira chercher automatiquement le crédit de la période précédente si elle existe.
                </span>
              </div>

              {/* Alerte d'erreur instructive */}
              <FormErrorAlert error={declarationError} onClose={clearDeclarationError} />

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); clearDeclarationError(); }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-medium text-white hover:bg-amber-700 shadow-sm disabled:opacity-60"
                >
                  {actionLoading ? "Création..." : "Créer la Déclaration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajout Ligne */}
      {showAddLigne && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Ajouter une ligne à la déclaration
            </h3>
            <form onSubmit={handleAddLigne} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nature de l&apos;opération
                </label>
                <select
                  value={ligneNature}
                  onChange={(e) => setLigneNature(e.target.value as any)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="VENTE_TAXABLE">Vente taxable (Collectée)</option>
                  <option value="ACHAT_DEDUCTIBLE">Achat ouvrant droit à déduction (Déductible)</option>
                  <option value="IMPORTATION">Importation déductible</option>
                  <option value="NOTE_FRAIS_DEDUCTIBLE">TVA sur Note de Frais (Déductible)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Taux appliqué (%)
                </label>
                <input
                  type="number"
                  value={ligneTaux}
                  onChange={(e) => setLigneTaux(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Base Hors Taxe (FCFA)
                </label>
                <input
                  type="number"
                  value={ligneBaseHt}
                  onChange={(e) => setLigneBaseHt(Number(e.target.value))}
                  min={0}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400 font-medium">
                  Montant TVA calculé : {formatCurrency(Math.round(ligneBaseHt * (ligneTaux / 100)))}
                </p>
              </div>

              {/* Alerte d'erreur instructive */}
              <FormErrorAlert error={ligneError} onClose={clearLigneError} />

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => { setShowAddLigne(false); clearLigneError(); }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-medium text-white hover:bg-amber-700 shadow-sm disabled:opacity-60"
                >
                  {actionLoading ? "Ajout..." : "Ajouter à la Déclaration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de prévisualisation et impression PDF intégré */}
      <FiscalitePdfPreviewModal preview={preview} onClose={closePreview} />
    </div>
  );
};
