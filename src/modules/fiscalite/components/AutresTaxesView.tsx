"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fiscaliteApi } from "../services/fiscaliteApi.service";
import type { TaxContribuable, TaxDeclarationGenerique, TaxType } from "../types/fiscalite.types";
import { LandmarkIcon } from "./FiscaliteIcons";
import { ChevronLeftIcon, PlusIcon, CheckCircleIcon, EyeIcon, TrashBinIcon, DollarLineIcon, CloseIcon, PaperPlaneIcon } from "@/icons";
import { useActionFeedback, useToast } from "@/shared/components/feedback";
import { FormErrorAlert, useFormError } from "./FormErrorAlert";

export const AutresTaxesView: React.FC = () => {
  const { confirm, showResult } = useActionFeedback();
  const toast = useToast();
  const { error: simError, captureError: captureSimError, clearError: clearSimError } = useFormError();
  const { error: formError, captureError: captureFormError, clearError: clearFormError } = useFormError();

  const [contribuable, setContribuable] = useState<TaxContribuable | null>(null);
  const [declarations, setDeclarations] = useState<TaxDeclarationGenerique[]>([]);
  const [taxTypes, setTaxTypes] = useState<TaxType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewingDeclaration, setViewingDeclaration] = useState<TaxDeclarationGenerique | null>(null);

  // Modal Déclaration
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formTaxTypeId, setFormTaxTypeId] = useState("");
  const [formPeriode, setFormPeriode] = useState("2026");
  const [formBase, setFormBase] = useState<number>(0);
  const [formMontant, setFormMontant] = useState<number>(0);
  const [formDateLimite, setFormDateLimite] = useState("2026-01-31");
  const [formLibelle, setFormLibelle] = useState("");

  // Simulateur Patente (CGI Art. 202)
  const [patenteCa, setPatenteCa] = useState<number>(150000000);
  const [patenteZone, setPatenteZone] = useState<"ZONE_1" | "ZONE_2">("ZONE_1");
  const [patenteSimResult, setPatenteSimResult] = useState<any>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const p = await fiscaliteApi.getMonProfil();
      setContribuable(p);
      const types = await fiscaliteApi.listTypes("BJ");
      setTaxTypes(types);
      if (types.length > 0 && !formTaxTypeId) {
        const patenteType = types.find((t) => t.code === "PATENTE" || t.code === "PATENTE_COMMERCIALE");
        setFormTaxTypeId(patenteType ? patenteType.id : types[0].id);
      }
      if (p?.id) {
        const list = await fiscaliteApi.listDeclarationsGeneriques(p.id);
        setDeclarations(list);
      }
    } catch (err) {
      console.error("Erreur chargement autres taxes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    handleSimulatePatente(150000000, "ZONE_1");
  }, []);

  const handleSimulatePatente = async (ca: number, zone: string) => {
    clearSimError();
    try {
      const res = await fiscaliteApi.simulerPatente({
        chiffreAffaires: ca,
        zoneAdministrative: zone,
      });
      setPatenteSimResult(res);
    } catch (e: any) {
      captureSimError(e);
      console.error(e);
    }
  };

  const handlePreFillPatente = () => {
    const patenteType = taxTypes.find((t) => t.code === "PATENTE" || t.code === "PATENTE_COMMERCIALE") || taxTypes[0];
    if (patenteType) setFormTaxTypeId(patenteType.id);
    setFormPeriode("2026");
    setFormBase(patenteCa);
    setFormMontant(patenteSimResult?.totalPatente || 0);
    setFormDateLimite("2026-01-31");
    setFormLibelle(`Contribution des Patentes 2026 (${patenteZone === "ZONE_1" ? "1ère Zone" : "2ème Zone"})`);
    setShowCreateModal(true);
  };

  const handleCreerDeclaration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribuable?.id || !formTaxTypeId) return;
    clearFormError();
    setActionLoading(true);
    try {
      await fiscaliteApi.creerDeclarationGenerique({
        taxContribuableId: contribuable.id,
        taxTypeId: formTaxTypeId,
        periodeOuExercice: formPeriode,
        baseImposable: formBase > 0 ? formBase : undefined,
        montantCalcule: formMontant,
        dateLimiteLegale: formDateLimite,
        libelleLigne: formLibelle || undefined,
      });
      setShowCreateModal(false);
      await loadData();
      await showResult({
        variant: "success",
        title: "Déclaration de Taxe Enregistrée ✓",
        message: `La déclaration pour la période/exercice ${formPeriode} a été enregistrée avec succès. Montant dû : ${formatCurrency(formMontant)}.`,
        closeLabel: "Fermer",
      });
    } catch (err: any) {
      captureFormError(err);
      toast.error("Erreur d'enregistrement", err.message || "Impossible d'enregistrer la déclaration.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleValiderDeclaration = async (d: TaxDeclarationGenerique) => {
    const confirmed = await confirm({
      title: "Valider cette déclaration de taxe ?",
      message: `La déclaration ${d.taxType?.libelle || "de taxe"} pour la période ${d.periodeOuExercice} (Montant : ${formatCurrency(d.montantCalcule)}) passera au statut VALIDÉE.`,
      confirmLabel: "Valider la déclaration",
      cancelLabel: "Annuler",
      variant: "default",
    });
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await fiscaliteApi.validerDeclarationGenerique(d.id);
      toast.success("Déclaration validée", "La déclaration est maintenant prête pour télépaiement ou déclaration.");
      await loadData();
      if (viewingDeclaration && viewingDeclaration.id === d.id) {
        setViewingDeclaration((prev) => (prev ? { ...prev, statut: "VALIDEE" } : null));
      }
    } catch (err: any) {
      toast.error("Erreur validation", err.message || "Impossible de valider la déclaration.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclarerDeclaration = async (d: TaxDeclarationGenerique) => {
    const confirmed = await confirm({
      title: "Confirmer la transmission / déclaration ?",
      message: `Confirmez que la déclaration de ${d.taxType?.libelle || "taxe"} d'un montant de ${formatCurrency(d.montantCalcule)} a été officiellement transmise aux services fiscaux (DGI).`,
      confirmLabel: "Marquer comme Déclarée",
      cancelLabel: "Annuler",
      variant: "default",
    });
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await fiscaliteApi.declarerDeclarationGenerique(d.id);
      toast.success("Déclaration transmise", "Le statut de la déclaration est désormais DÉCLARÉE.");
      await loadData();
      if (viewingDeclaration && viewingDeclaration.id === d.id) {
        setViewingDeclaration((prev) => (prev ? { ...prev, statut: "DECLAREE" } : null));
      }
    } catch (err: any) {
      toast.error("Erreur transmission", err.message || "Impossible de marquer la déclaration comme transmise.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayerDeclaration = async (d: TaxDeclarationGenerique) => {
    const confirmed = await confirm({
      title: "Confirmer le paiement de cette taxe ?",
      message: `Enregistrez le règlement effectif de ${formatCurrency(d.montantCalcule)} auprès du Trésor Public / DGI pour la période ${d.periodeOuExercice}.`,
      confirmLabel: "Confirmer le paiement",
      cancelLabel: "Annuler",
      variant: "default",
    });
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await fiscaliteApi.marquerPayeeDeclarationGenerique(d.id);
      toast.success("Taxe acquittée", "La déclaration est désormais marquée PAYÉE.");
      await loadData();
      if (viewingDeclaration && viewingDeclaration.id === d.id) {
        setViewingDeclaration((prev) => (prev ? { ...prev, statut: "PAYEE" } : null));
      }
    } catch (err: any) {
      toast.error("Erreur règlement", err.message || "Impossible d'enregistrer le paiement.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSupprimerDeclaration = async (d: TaxDeclarationGenerique) => {
    const confirmed = await confirm({
      title: "Supprimer cette déclaration de taxe ?",
      message: `Êtes-vous sûr de vouloir supprimer la déclaration de ${d.taxType?.libelle || "taxe"} pour la période ${d.periodeOuExercice} ?`,
      confirmLabel: "Supprimer",
      cancelLabel: "Annuler",
      variant: "danger",
    });
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await fiscaliteApi.supprimerDeclarationGenerique(d.id);
      toast.success("Déclaration supprimée", "La déclaration a été retirée.");
      await loadData();
      if (viewingDeclaration && viewingDeclaration.id === d.id) {
        setViewingDeclaration(null);
      }
    } catch (err: any) {
      toast.error("Erreur suppression", err.message || "Impossible de supprimer la déclaration.");
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
              <LandmarkIcon className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Autres Taxes &amp; Contribution des Patentes
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Moteur fiscal générique (EF-001) • Contribution des Patentes (CGI Bénin Art. 202) • Taxe Professionnelle Synthétique (TPS) • Taxes locales.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              clearFormError();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 shadow-sm transition"
          >
            <PlusIcon className="h-4 w-4 shrink-0" />
            <span>Déclarer une Taxe</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulateur Patente */}
        <div className="lg:col-span-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
            Simulateur Contribution des Patentes
          </h2>

          <FormErrorAlert error={simError} onClose={clearSimError} />

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Chiffre d&apos;Affaires Annuel HT (FCFA)
            </label>
            <input
              type="number"
              value={patenteCa}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPatenteCa(val);
                handleSimulatePatente(val, patenteZone);
              }}
              min={0}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Zone administrative de l&apos;établissement (CGI Art. 202)
            </label>
            <select
              value={patenteZone}
              onChange={(e) => {
                const z = e.target.value as any;
                setPatenteZone(z);
                handleSimulatePatente(patenteCa, z);
              }}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="ZONE_1">1ère Zone (Cotonou, Porto-Novo, Parakou, Abomey-Calavi)</option>
              <option value="ZONE_2">2ème Zone (Autres communes du Bénin)</option>
            </select>
          </div>

          {patenteSimResult && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                <span>Droit Fixe de base :</span>
                <span className="font-bold">{formatCurrency(patenteSimResult.droitFixe)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                <span>Droit Proportionnel :</span>
                <span className="font-bold">{formatCurrency(patenteSimResult.droitProportionnel)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 pt-2 border-t border-amber-200 dark:border-amber-800">
                <span className="font-semibold">Total Patente Annuelle :</span>
                <span className="font-bold text-base text-amber-800 dark:text-amber-300">
                  {formatCurrency(patenteSimResult.totalPatente)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 pt-1">
                Échéance légale de paiement : au plus tard le 31 janvier de chaque année.
              </p>
              <button
                type="button"
                onClick={handlePreFillPatente}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700 shadow-sm transition"
              >
                <CheckCircleIcon className="h-4 w-4 shrink-0" />
                <span>Enregistrer cette Patente en Déclaration</span>
              </button>
            </div>
          )}
        </div>

        {/* Historique des Déclarations Génériques */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Déclarations Génériques Enregistrées
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {declarations.length} déclaration(s)
            </span>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
            </div>
          ) : declarations.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400 border border-dashed rounded-xl">
              Aucune déclaration de taxe générique enregistrée. Les déclarations de taxe foncière, droits d&apos;enregistrement et redevances s&apos;afficheront ici.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 font-semibold text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="px-3 py-2.5 text-left">Type de Taxe</th>
                    <th className="px-3 py-2.5 text-left">Exercice / Période</th>
                    <th className="px-3 py-2.5 text-right">Base Imposable</th>
                    <th className="px-3 py-2.5 text-right">Montant Dû</th>
                    <th className="px-3 py-2.5 text-center">Statut</th>
                    <th className="px-3 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800/60">
                  {declarations.map((d) => (
                    <tr key={d.id} className="hover:bg-amber-50/20 dark:hover:bg-amber-950/10 transition">
                      <td className="px-3 py-2.5 font-bold text-gray-900 dark:text-white">
                        {d.taxType?.libelle || "Taxe locale"}
                      </td>
                      <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300 font-mono">
                        {d.periodeOuExercice}
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-700 dark:text-gray-300">
                        {d.baseImposable ? formatCurrency(d.baseImposable) : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-gray-900 dark:text-white">
                        {formatCurrency(d.montantCalcule)}
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.statut === "PAYEE"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : d.statut === "VALIDEE"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                              : d.statut === "DECLAREE"
                              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300"
                              : d.statut === "EN_RETARD"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          }`}
                        >
                          {d.statut}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Consulter les détails"
                            onClick={() => setViewingDeclaration(d)}
                            className="rounded-lg p-1 text-gray-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40 dark:hover:text-amber-400 transition"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {d.statut === "BROUILLON" && (
                            <button
                              title="Valider la déclaration"
                              onClick={() => handleValiderDeclaration(d)}
                              disabled={actionLoading}
                              className="rounded-lg p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                          {d.statut === "VALIDEE" && (
                            <button
                              title="Télétransmettre / Marquer déclarée"
                              onClick={() => handleDeclarerDeclaration(d)}
                              disabled={actionLoading}
                              className="rounded-lg p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                            >
                              <PaperPlaneIcon className="h-4 w-4" />
                            </button>
                          )}
                          {d.statut !== "PAYEE" && (
                            <button
                              title="Marquer comme payée"
                              onClick={() => handlePayerDeclaration(d)}
                              disabled={actionLoading}
                              className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                            >
                              <DollarLineIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            title="Supprimer la déclaration"
                            onClick={() => handleSupprimerDeclaration(d)}
                            disabled={actionLoading}
                            className="rounded-lg p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                          >
                            <TrashBinIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Création Déclaration Générique */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Enregistrer une Déclaration de Taxe Générique
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <FormErrorAlert error={formError} onClose={clearFormError} />

            <form onSubmit={handleCreerDeclaration} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Type d&apos;impôt ou taxe
                </label>
                <select
                  value={formTaxTypeId}
                  onChange={(e) => setFormTaxTypeId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  {taxTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.libelle} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Exercice ou Période
                  </label>
                  <input
                    type="text"
                    value={formPeriode}
                    onChange={(e) => setFormPeriode(e.target.value)}
                    required
                    placeholder="ex: 2026 ou 2026-T1"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Date Limite Légale
                  </label>
                  <input
                    type="date"
                    value={formDateLimite}
                    onChange={(e) => setFormDateLimite(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Base Imposable (FCFA)
                  </label>
                  <input
                    type="number"
                    value={formBase}
                    onChange={(e) => setFormBase(Number(e.target.value))}
                    min={0}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Montant Dû (FCFA) *
                  </label>
                  <input
                    type="number"
                    value={formMontant}
                    onChange={(e) => setFormMontant(Number(e.target.value))}
                    required
                    min={0}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm font-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Libellé / Précisions administratives
                </label>
                <input
                  type="text"
                  value={formLibelle}
                  onChange={(e) => setFormLibelle(e.target.value)}
                  placeholder="ex: Contribution des Patentes Établissement Principal Cotonou"
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 shadow-sm transition disabled:opacity-50"
                >
                  {actionLoading ? "Enregistrement..." : "Enregistrer la Déclaration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Consultation Détail Déclaration Générique */}
      {viewingDeclaration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                  <LandmarkIcon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {viewingDeclaration.taxType?.libelle || "Déclaration Générique"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Code : <span className="font-mono font-semibold">{viewingDeclaration.taxType?.code || "TAXE"}</span> • Période : {viewingDeclaration.periodeOuExercice}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingDeclaration(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-gray-700/60 dark:bg-gray-900/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Statut actuel :</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    viewingDeclaration.statut === "PAYEE"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : viewingDeclaration.statut === "VALIDEE"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                      : viewingDeclaration.statut === "DECLAREE"
                      ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300"
                      : viewingDeclaration.statut === "EN_RETARD"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                  }`}
                >
                  {viewingDeclaration.statut}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Date Limite Légale :</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {viewingDeclaration.dateLimiteLegale
                    ? new Date(viewingDeclaration.dateLimiteLegale).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "Non spécifiée"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Base Imposable :</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {viewingDeclaration.baseImposable ? formatCurrency(viewingDeclaration.baseImposable) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-bold text-gray-700 dark:text-gray-300">Montant Dû / Calculé :</span>
                <span className="font-bold text-base text-amber-600 dark:text-amber-400">
                  {formatCurrency(viewingDeclaration.montantCalcule)}
                </span>
              </div>
            </div>

            {/* Lignes de décomposition */}
            {viewingDeclaration.lignes && viewingDeclaration.lignes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Détail des Lignes / Postes de calcul
                </h4>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold">
                      <tr>
                        <th className="px-3 py-1.5 text-left">Libellé</th>
                        <th className="px-3 py-1.5 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800/60">
                      {viewingDeclaration.lignes.map((l, idx) => (
                        <tr key={l.id || idx}>
                          <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{l.libelle}</td>
                          <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(l.montant)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions dans la modale */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => handleSupprimerDeclaration(viewingDeclaration)}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30 transition"
              >
                <TrashBinIcon className="h-3.5 w-3.5" />
                <span>Supprimer</span>
              </button>

              <div className="flex items-center gap-2">
                {viewingDeclaration.statut === "BROUILLON" && (
                  <button
                    type="button"
                    onClick={() => handleValiderDeclaration(viewingDeclaration)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition"
                  >
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                    <span>Valider</span>
                  </button>
                )}

                {viewingDeclaration.statut === "VALIDEE" && (
                  <button
                    type="button"
                    onClick={() => handleDeclarerDeclaration(viewingDeclaration)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition"
                  >
                    <PaperPlaneIcon className="h-3.5 w-3.5" />
                    <span>Déclarer DGI</span>
                  </button>
                )}

                {viewingDeclaration.statut !== "PAYEE" && (
                  <button
                    type="button"
                    onClick={() => handlePayerDeclaration(viewingDeclaration)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
                  >
                    <DollarLineIcon className="h-3.5 w-3.5" />
                    <span>Marquer Payée</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setViewingDeclaration(null)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
