"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { rhApi } from "../services/rhApi.service";
import type { RhCyclePaie, RhRubriquePaie } from "../types/rh.types";
import { BulletinPaieDetailModal } from "./BulletinPaieDetailModal";
import { Modal } from "@/components/ui/modal";
import { useActionFeedback, useToast } from "@/shared/components/feedback";
import { BoltIcon, LockIcon, FileIcon, DocsIcon, DownloadIcon, EyeIcon } from "@/icons";
import { useBulletinPdf } from "../pdf/useBulletinPdf";

interface Props {
  cycleId: string;
}

export const CyclePaieDetailView: React.FC<Props> = ({ cycleId }) => {
  const { runAction } = useActionFeedback();
  const toast = useToast();
  const { downloadPdf, isExporting: isExportingPdf } = useBulletinPdf();
  const [cycle, setCycle] = useState<RhCyclePaie | null>(null);
  const [rubriques, setRubriques] = useState<RhRubriquePaie[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [selectedBulletinId, setSelectedBulletinId] = useState<string | null>(null);
  const [isBulletinModalOpen, setIsBulletinModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"bulletins" | "variables" | "quotient" | "od">("bulletins");

  // Modal Variable
  const [isVarModalOpen, setIsVarModalOpen] = useState(false);
  const [varForm, setVarForm] = useState({
    employeId: "",
    rubriquePaieId: "",
    montant: 50000,
    commentaire: "",
  });

  // Modal 13e Mois / Rémunération Exceptionnelle
  const [isExcepModalOpen, setIsExcepModalOpen] = useState(false);
  const [excepForm, setExcepForm] = useState({
    employeId: "",
    typeRemuneration: "TREIZIEME_MOIS",
    montantBrut: 350000,
    anneeConcernee: 2026,
    tauxAbattementApplique: 25,
  });

  const loadCycle = async () => {
    try {
      setLoading(true);
      const [res, rubs] = await Promise.all([
        rhApi.getCycleById(cycleId),
        rhApi.listRubriques("BJ"),
      ]);
      const rubsList = Array.isArray(rubs) ? rubs : ((rubs as any)?.data || []);
      setCycle(res);
      setRubriques(rubsList);
      const emps = res?.bulletinsPaie?.map((b: any) => b.employe).filter(Boolean) || [];
      if (emps.length > 0) {
        setVarForm((prev) => ({ ...prev, employeId: prev.employeId || emps[0].id }));
        setExcepForm((prev) => ({ ...prev, employeId: prev.employeId || emps[0].id }));
      }
      if (rubsList.length > 0) {
        setVarForm((prev) => ({ ...prev, rubriquePaieId: prev.rubriquePaieId || rubsList[0].id }));
      }
    } catch (err) {
      console.error("Erreur chargement cycle:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCycle();
  }, [cycleId]);

  useEffect(() => {
    if (isVarModalOpen || isExcepModalOpen) {
      loadCycle();
    }
  }, [isVarModalOpen, isExcepModalOpen]);

  const handleCalculate = async () => {
    await runAction({
      confirm: {
        title: "Calculer la paie du cycle ?",
        message: "Cette opération recalcule tous les salaires bruts, retenues ITS/CNSS et charges patronales pour l'ensemble des collaborateurs éligibles.",
        confirmLabel: "Lancer le calcul (1-Clic)",
        variant: "default",
      },
      loadingMessage: "Calcul du moteur de paie en cours...",
      success: {
        title: "Calcul de paie terminé",
        message: "Tous les bulletins de salaire ont été actualisés avec succès.",
      },
      error: {
        title: "Erreur de calcul",
        message: "Le calcul de paie n'a pas pu aboutir. Vérifiez les paramètres et contrats.",
      },
      action: async () => {
        setCalculating(true);
        try {
          await rhApi.calculateCycle(cycleId);
          await loadCycle();
        } finally {
          setCalculating(false);
        }
      },
    });
  };

  const [isOperating, setIsOperating] = useState(false);

  const handleValidate = async () => {
    setIsOperating(true);
    try {
      await runAction({
        confirm: {
          title: "Valider et clôturer ce cycle de paie ?",
          message: "Cette action verrouille définitivement la période et fige les bulletins de salaire. Aucune modification ultérieure ne sera possible.",
          confirmLabel: "Clôturer le cycle",
          variant: "warning",
        },
        loadingMessage: "Clôture du cycle en cours...",
        success: {
          title: "Cycle de paie clôturé",
          message: `Le cycle ${cycle?.codeCycle || ""} a été validé et verrouillé avec succès.`,
        },
        error: {
          title: "Erreur de clôture",
          message: "Impossible de valider le cycle. Vérifiez que la paie a bien été calculée au préalable.",
        },
        action: async () => {
          await rhApi.validateCycle(cycleId);
          await loadCycle();
        },
      });
    } finally {
      setIsOperating(false);
    }
  };

  const handleGenerateOd = async () => {
    setIsOperating(true);
    try {
      await runAction({
        confirm: {
          title: "Générer la pièce d'OD de paie ?",
          message: "Génère l'écriture comptable d'Opérations Diverses équilibrée (SYSCOHADA classe 6 / 42 / 43 / 44).",
          confirmLabel: "Générer l'OD",
          variant: "default",
        },
        loadingMessage: "Génération de la pièce comptable...",
        success: {
          title: "Écriture comptable générée",
          message: "La pièce d'OD de paie a été générée et équilibrée avec succès.",
        },
        error: {
          title: "Erreur de génération",
          message: "Impossible de générer l'écriture comptable d'OD.",
        },
        action: async () => {
          await rhApi.generateOdPaie(cycleId);
          await loadCycle();
          setActiveTab("od");
        },
      });
    } finally {
      setIsOperating(false);
    }
  };

  const handleGenerateDeclarations = async () => {
    setIsOperating(true);
    try {
      await runAction({
        confirm: {
          title: "Générer les déclarations officielles M7 ?",
          message: "Compile les bordereaux déclaratifs mensuels ITS, VPS (DGI) et cotisations CNSS pour ce cycle.",
          confirmLabel: "Générer les déclarations",
          variant: "default",
        },
        loadingMessage: "Compilation des bordereaux fiscaux et sociaux...",
        success: {
          title: "Déclarations générées",
          message: "Les bordereaux ITS, VPS et CNSS sont prêts pour la télé-déclaration.",
        },
        error: {
          title: "Erreur de génération",
          message: "Impossible de générer les déclarations fiscales et sociales.",
        },
        action: async () => {
          await rhApi.generateDeclarations(cycleId);
          await loadCycle();
        },
      });
    } finally {
      setIsOperating(false);
    }
  };

  const handleSaveVariable = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOperating(true);
    try {
      await runAction({
        loadingMessage: "Enregistrement de l'élément variable...",
        success: {
          title: "Élément variable enregistré",
          message: "L'élément variable a été affecté au salarié pour ce cycle de paie.",
        },
        error: {
          title: "Erreur d'enregistrement",
          message: "Impossible d'enregistrer l'élément variable.",
        },
        action: async () => {
          await rhApi.saveVariable(cycleId, varForm);
          setIsVarModalOpen(false);
          await loadCycle();
        },
      });
    } finally {
      setIsOperating(false);
    }
  };

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(val || 0);

  if (loading || !cycle) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  // Agréger les totaux des bulletins
  const totalBrut = cycle.bulletinsPaie?.reduce((s, b) => s + b.totalSalaireBrut, 0) || 0;
  const totalNet = cycle.bulletinsPaie?.reduce((s, b) => s + b.netAPayer, 0) || 0;
  const totalIts = cycle.bulletinsPaie?.reduce((s, b) => s + b.montantImpotSalaire, 0) || 0;
  const totalCnss = cycle.bulletinsPaie?.reduce((s, b) => s + b.montantCnssSalariale + b.montantCnssPatronale, 0) || 0;
  const totalVps = cycle.bulletinsPaie?.reduce((s, b) => s + b.montantVpsPatronale, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/rh/paie" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              ← Retour aux cycles de paie
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Cycle de Paie • {cycle.codeCycle}
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-semibold ${cycle.statut === "VALIDE"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                : cycle.statut === "CALCULE"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                }`}
            >
              {cycle.statut}
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {cycle.etablissement?.raisonSociale} • Période du{" "}
            {cycle.dateDebut ? new Date(cycle.dateDebut).toLocaleDateString("fr-FR") : "-"} au{" "}
            {cycle.dateFin ? new Date(cycle.dateFin).toLocaleDateString("fr-FR") : "-"}
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCalculate}
            disabled={calculating || isOperating || cycle.statut === "VALIDE"}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {calculating ? (
              <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <BoltIcon className="h-6 w-6 shrink-0" />
            )}
            <span>{calculating ? "Calcul en cours..." : "Calculer la Paie (1-Clic)"}</span>
          </button>

          <button
            onClick={handleValidate}
            disabled={calculating || isOperating || cycle.statut !== "CALCULE"}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {isOperating ? (
              <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <LockIcon className="h-6 w-6 shrink-0" />
            )}
            <span>Valider & Clôturer</span>
          </button>

          <button
            onClick={handleGenerateOd}
            disabled={calculating || isOperating}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750 transition-colors shadow-xs"
          >
            <FileIcon className="h-6 w-6 shrink-0" />
            <span>Générer OD Paie</span>
          </button>

          <button
            onClick={handleGenerateDeclarations}
            disabled={calculating || isOperating}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750 transition-colors shadow-xs"
          >
            <DocsIcon className="h-6 w-6 shrink-0" />
            <span>Déclarations M7</span>
          </button>
        </div>
      </div>

      {/* Cartes KPI du Cycle */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs text-gray-500">Masse Brute</span>
          <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(totalBrut)}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs text-emerald-600 font-semibold">Net à Payer</span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalNet)}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs text-gray-500">ITS Bénin 2026</span>
          <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(totalIts)}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs text-gray-500">CNSS (3.6% + 17.4%)</span>
          <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(totalCnss)}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs text-gray-500">VPS (4 %)</span>
          <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(totalVps)}
          </div>
        </div>
      </div>

      {/* Onglets Sous-sections */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        {[
          { id: "bulletins", label: `Bulletins de Paie (${cycle.bulletinsPaie?.length || 0})` },
          { id: "variables", label: `Variables du Mois (${cycle.elementsVariables?.length || 0})` },
          { id: "od", label: "Écriture Comptable OD (SYSCOHADA)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`border-b-2 px-5 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
              ? "border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu Tab 1 : Bulletins */}
      {activeTab === "bulletins" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4">Salarié</th>
                <th className="px-6 py-4">N° Bulletin</th>
                <th className="px-6 py-4 text-right">Salaire Brut</th>
                <th className="px-6 py-4 text-right">CNSS Salariale (3.6%)</th>
                <th className="px-6 py-4 text-right">ITS Bénin 2026</th>
                <th className="px-6 py-4 text-right">Net à Payer</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {cycle.bulletinsPaie && cycle.bulletinsPaie.length > 0 ? (
                cycle.bulletinsPaie.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {b.employe?.nom} {b.employe?.prenoms}
                      </div>
                      <div className="text-xs text-gray-500">{b.employe?.matricule}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-medium text-gray-900 dark:text-white">
                      {b.numeroBulletin}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                      {formatCurrency(b.totalSalaireBrut)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-red-600">
                      {formatCurrency(b.montantCnssSalariale)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-red-600">
                      {formatCurrency(b.montantImpotSalaire)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(b.netAPayer)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBulletinId(b.id);
                            setIsBulletinModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-100 dark:bg-brand-950/50 dark:text-brand-400 shadow-2xs transition-colors"
                        >
                          <EyeIcon className="h-3.5 w-3.5" />
                          <span>Voir</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadPdf({ ...b, cyclePaie: cycle })}
                          disabled={isExportingPdf}
                          title="Télécharger le bulletin PDF"
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750 shadow-2xs transition-colors"
                        >
                          <DownloadIcon className="h-3.5 w-3.5 text-brand-600" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    Aucun bulletin calculé. Cliquez sur <strong>"Calculer la Paie (1-Clic)"</strong> pour générer tous les bulletins du cycle.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Contenu Tab 2 : Variables */}
      {activeTab === "variables" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsVarModalOpen(true)}
              className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-brand-600"
            >
              + Ajouter une Prime / Retenue Variable
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4">Salarié</th>
                  <th className="px-6 py-4">Rubrique</th>
                  <th className="px-6 py-4">Montant</th>
                  <th className="px-6 py-4">Commentaire</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {cycle.elementsVariables && cycle.elementsVariables.length > 0 ? (
                  cycle.elementsVariables.map((v) => (
                    <tr key={v.id}>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {v.employe?.nom} {v.employe?.prenoms} ({v.employe?.matricule})
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">
                        {v.rubriquePaie?.code} - {v.rubriquePaie?.libelle}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                        {formatCurrency(v.montant)}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">{v.commentaire || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      Aucun élément variable saisi pour ce cycle.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contenu Tab 3 : Écriture Comptable OD */}
      {activeTab === "od" && (
        <div className="space-y-4">
          {cycle.ecrituresComptables && cycle.ecrituresComptables.length > 0 ? (
            cycle.ecrituresComptables.map((ecr) => (
              <div
                key={ecr.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-4"
              >
                <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                      {ecr.libellePiece}
                    </h3>
                    <div className="text-xs text-gray-500">
                      Journal {ecr.journalCode} • Date : {new Date(ecr.dateEcriture).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-bold ${ecr.estEquilibree
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
                      }`}
                  >
                    {ecr.estEquilibree ? "Équilibrée ✓ (Débit = Crédit)" : "Déséquilibrée ✗"}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="py-2.5 px-3">Compte (SYSCOHADA)</th>
                        <th className="py-2.5 px-3">Libellé</th>
                        <th className="py-2.5 px-3 text-right">Débit (FCFA)</th>
                        <th className="py-2.5 px-3 text-right">Crédit (FCFA)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-800">
                      {ecr.lignes?.map((l) => (
                        <tr key={l.id}>
                          <td className="py-2 px-3 font-mono font-bold">{l.compteNumero}</td>
                          <td className="py-2 px-3">{l.libelle}</td>
                          <td className="py-2 px-3 text-right font-mono font-semibold">
                            {l.montantDebit > 0 ? formatCurrency(l.montantDebit) : ""}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-purple-600">
                            {l.montantCredit > 0 ? formatCurrency(l.montantCredit) : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t font-bold">
                      <tr>
                        <td colSpan={2} className="py-3 px-3 text-right">TOTAUX :</td>
                        <td className="py-3 px-3 text-right font-mono">{formatCurrency(ecr.montantTotalDebit)}</td>
                        <td className="py-3 px-3 text-right font-mono text-purple-600">{formatCurrency(ecr.montantTotalCredit)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900">
              <p>Aucune écriture comptable générée pour ce cycle.</p>
              <button
                onClick={handleGenerateOd}
                className="mt-3 rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
              >
                Générer l'OD de Paie SYSCOHADA
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Visualisation Bulletin OHADA */}
      <BulletinPaieDetailModal
        bulletinId={selectedBulletinId}
        isOpen={isBulletinModalOpen}
        onClose={() => {
          setIsBulletinModalOpen(false);
          setSelectedBulletinId(null);
        }}
      />

      {/* Modal Saisie Variable */}
      <Modal isOpen={isVarModalOpen} onClose={() => setIsVarModalOpen(false)} className="max-w-md p-6">
        <form onSubmit={handleSaveVariable} className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-3 dark:border-gray-800">
            Ajouter un Élément Variable
          </h2>
          <div>
            <label className="block text-xs font-medium mb-1">Salarié *</label>
            <select
              required
              value={varForm.employeId}
              onChange={(e) => setVarForm({ ...varForm, employeId: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">-- Choisir salarié --</option>
              {cycle.bulletinsPaie?.map((b) => (
                <option key={b.employeId} value={b.employeId}>
                  {b.employe?.matricule} - {b.employe?.nom} {b.employe?.prenoms}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Rubrique de Paie *</label>
            <select
              required
              value={varForm.rubriquePaieId}
              onChange={(e) => setVarForm({ ...varForm, rubriquePaieId: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">-- Choisir la rubrique --</option>
              {rubriques.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} - {r.libelle} ({r.typeRubrique})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Montant (FCFA) *</label>
            <input
              type="number"
              min={0}
              required
              value={varForm.montant}
              onChange={(e) => setVarForm({ ...varForm, montant: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:bg-gray-800 dark:border-gray-700 font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Commentaire</label>
            <input
              type="text"
              value={varForm.commentaire}
              onChange={(e) => setVarForm({ ...varForm, commentaire: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:bg-gray-800 dark:border-gray-700"
              placeholder="Ex: Prime de performance projet"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <button
              type="button"
              disabled={isOperating}
              onClick={() => setIsVarModalOpen(false)}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isOperating}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 shadow-xs disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isOperating && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <span>{isOperating ? "Enregistrement..." : "Enregistrer"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
