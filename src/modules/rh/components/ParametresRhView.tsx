"use client";

import React, { useEffect, useState } from "react";
import { rhApi } from "../services/rhApi.service";
import type {
  RhDepartement,
  RhEtablissement,
  RhPoste,
  RhRubriquePaie,
} from "../types/rh.types";
import { formatRubricType, formatRubricSens } from "../utils/rhFormatters";
import { Modal } from "@/components/ui/modal";
import { useActionFeedback, useToast } from "@/shared/components/feedback";
import {
  EyeIcon,
  PencilIcon,
  TrashBinIcon,
  PlusIcon,
  InfoIcon,
  BoxIcon,
  FolderIcon,
  DocsIcon,
  CheckCircleIcon,
  CloseIcon,
  DollarLineIcon,
  UserCircleIcon,
} from "@/icons";

export const ParametresRhView: React.FC = () => {
  const { runAction } = useActionFeedback();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<
    "etablissements" | "departements" | "postes" | "baremes" | "rubriques"
  >("etablissements");

  const [etablissements, setEtablissements] = useState<RhEtablissement[]>([]);
  const [departements, setDepartements] = useState<RhDepartement[]>([]);
  const [postes, setPostes] = useState<RhPoste[]>([]);
  const [rubriques, setRubriques] = useState<RhRubriquePaie[]>([]);
  const [baremes, setBaremes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------------- MODAL DETAILS ----------------
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsType, setDetailsType] = useState<"etablissement" | "departement" | "poste" | "rubrique" | null>(null);
  const [detailsData, setDetailsData] = useState<any>(null);

  // ---------------- MODAL ETABLISSEMENT ----------------
  const [isEtabModalOpen, setIsEtabModalOpen] = useState(false);
  const [editingEtabId, setEditingEtabId] = useState<string | null>(null);
  const [etabForm, setEtabForm] = useState({
    code: "",
    raisonSociale: "",
    identifiantFiscal: "",
    numeroEmployeurSecuSociale: "",
    adresse: "",
    ville: "Cotonou",
    paysCode: "BJ",
    estSiege: false,
  });

  // ---------------- MODAL DEPARTEMENT ----------------
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptForm, setDeptForm] = useState({
    etablissementId: "",
    code: "",
    libelle: "",
    departementParentId: "",
  });

  // ---------------- MODAL POSTE ----------------
  const [isPosteModalOpen, setIsPosteModalOpen] = useState(false);
  const [editingPosteId, setEditingPosteId] = useState<string | null>(null);
  const [posteForm, setPosteForm] = useState({
    code: "",
    intitule: "",
    departementId: "",
    description: "",
    salaireMinConseille: 150000,
    salaireMaxConseille: 500000,
  });

  // ---------------- MODAL RUBRIQUE ----------------
  const [isRubriqueModalOpen, setIsRubriqueModalOpen] = useState(false);
  const [editingRubriqueId, setEditingRubriqueId] = useState<string | null>(null);
  const [rubriqueForm, setRubriqueForm] = useState({
    code: "",
    libelle: "",
    typeRubrique: "PRIME",
    sensDefaut: "GAIN",
    assujettiIts: true,
    assujettiCnss: true,
    assujettiVps: true,
    compteComptableCharge: "641100",
    compteComptableTiers: "422000",
    ordreAffichage: 100,
  });

  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [etabsRes, deptsRes, ptsRes, rubsRes, barsRes] = await Promise.allSettled([
        rhApi.listEtablissements(),
        rhApi.listDepartements(),
        rhApi.listPostes(),
        rhApi.listRubriques("BJ"),
        rhApi.listTaxBrackets("BJ"),
      ]);

      const etabs = etabsRes.status === "fulfilled" ? etabsRes.value : [];
      const depts = deptsRes.status === "fulfilled" ? deptsRes.value : [];
      const pts = ptsRes.status === "fulfilled" ? ptsRes.value : [];
      const rubs = rubsRes.status === "fulfilled" ? rubsRes.value : [];
      const bars = barsRes.status === "fulfilled" ? barsRes.value : [];

      const rejections = [etabsRes, deptsRes, ptsRes, rubsRes, barsRes].filter(
        (r) => r.status === "rejected",
      ) as PromiseRejectedResult[];

      if (rejections.length > 0) {
        const msg = rejections[0].reason?.message || "Serveur ou réseau indisponible";
        console.warn("Avertissement chargement paramètres RH:", msg);
        setError(
          msg.includes("indisponible") || msg.includes("fetch")
            ? "Serveur ou réseau indisponible. Certaines données n'ont pas pu être actualisées."
            : msg,
        );
      }

      const safeEtabs = Array.isArray(etabs) ? etabs : ((etabs as any)?.data || []);
      const safeDepts = Array.isArray(depts) ? depts : ((depts as any)?.data || []);
      const safePts = Array.isArray(pts) ? pts : ((pts as any)?.data || []);
      const safeRubs = Array.isArray(rubs) ? rubs : ((rubs as any)?.data || []);
      const safeBars = Array.isArray(bars) ? bars : ((bars as any)?.data || []);

      setEtablissements(safeEtabs);
      setDepartements(safeDepts);
      setPostes(safePts);
      setRubriques(safeRubs);
      setBaremes(safeBars);
      if (safeEtabs.length > 0) setDeptForm((prev) => ({ ...prev, etablissementId: prev.etablissementId || safeEtabs[0].id }));
      if (safeDepts.length > 0) setPosteForm((prev) => ({ ...prev, departementId: prev.departementId || safeDepts[0].id }));
    } catch (err: any) {
      console.warn("Erreur chargement paramètres:", err?.message || err);
      setError(err?.message || "Serveur ou réseau indisponible.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isDeptModalOpen || isPosteModalOpen || isRubriqueModalOpen || isEtabModalOpen) {
      loadData();
    }
  }, [isDeptModalOpen, isPosteModalOpen, isRubriqueModalOpen, isEtabModalOpen]);

  // ==========================================
  // HANDLERS DETAILS
  // ==========================================
  const openDetails = (type: "etablissement" | "departement" | "poste" | "rubrique", data: any) => {
    setDetailsType(type);
    setDetailsData(data);
    setIsDetailsModalOpen(true);
  };

  // ==========================================
  // HANDLERS ETABLISSEMENTS
  // ==========================================
  const openCreateEtabModal = () => {
    setEditingEtabId(null);
    setEtabForm({
      code: "",
      raisonSociale: "",
      identifiantFiscal: "",
      numeroEmployeurSecuSociale: "",
      adresse: "",
      ville: "Cotonou",
      paysCode: "BJ",
      estSiege: false,
    });
    setIsEtabModalOpen(true);
  };

  const openEditEtabModal = (etab: RhEtablissement) => {
    setEditingEtabId(etab.id);
    setEtabForm({
      code: etab.code,
      raisonSociale: etab.raisonSociale,
      identifiantFiscal: etab.identifiantFiscal || etab.ifu || "",
      numeroEmployeurSecuSociale: etab.numeroEmployeurSecuSociale || etab.numeroCnss || "",
      adresse: etab.adresse || "",
      ville: etab.ville || "Cotonou",
      paysCode: etab.paysCode || "BJ",
      estSiege: !!etab.estSiege,
    });
    setIsEtabModalOpen(true);
  };

  const handleSaveEtab = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingEtabId;
    setIsSubmitting(true);
    try {
      await runAction({
        loadingMessage: isEdit ? "Mise à jour de l'établissement..." : "Création de l'établissement en cours...",
        success: {
          title: isEdit ? "Établissement mis à jour" : "Établissement créé avec succès",
          message: `${etabForm.raisonSociale} (${etabForm.code}) a été enregistré.`,
        },
        error: {
          title: isEdit ? "Erreur de mise à jour" : "Erreur de création",
          message: "Impossible d'enregistrer l'établissement. Vérifiez les informations saisies.",
        },
        action: async () => {
          const payload = {
            code: etabForm.code.trim(),
            raisonSociale: etabForm.raisonSociale.trim(),
            identifiantFiscal: etabForm.identifiantFiscal.trim() || undefined,
            numeroEmployeurSecuSociale: etabForm.numeroEmployeurSecuSociale.trim() || undefined,
            adresse: etabForm.adresse.trim() || undefined,
            ville: etabForm.ville.trim() || "Cotonou",
            paysCode: etabForm.paysCode || "BJ",
            estSiege: etabForm.estSiege,
          };

          if (isEdit) {
            await rhApi.updateEtablissement(editingEtabId!, payload);
          } else {
            const created = await rhApi.createEtablissement(payload);
            if (created?.id) {
              setDeptForm((prev) => ({ ...prev, etablissementId: created.id }));
            }
          }
          setIsEtabModalOpen(false);
          await loadData();
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEtab = async (etab: RhEtablissement) => {
    await runAction({
      confirm: {
        title: `Supprimer l'établissement ${etab.raisonSociale} ?`,
        message: "Cette action est irréversible. L'établissement ne pourra être supprimé s'il comporte des contrats ou départements rattachés.",
        confirmLabel: "Supprimer",
        variant: "danger",
      },
      loadingMessage: "Suppression de l'établissement...",
      success: {
        title: "Établissement supprimé",
        message: `${etab.raisonSociale} a été retiré.`,
      },
      error: {
        title: "Impossible de supprimer",
        message: "L'établissement possède des contrats actifs ou des départements liés.",
      },
      action: async () => {
        await rhApi.deleteEtablissement(etab.id);
        await loadData();
      },
    });
  };

  // ==========================================
  // HANDLERS DÉPARTEMENTS
  // ==========================================
  const openCreateDeptModal = () => {
    setEditingDeptId(null);
    setDeptForm({
      etablissementId: safeEtablissements[0]?.id ?? "",
      code: "",
      libelle: "",
      departementParentId: "",
    });
    setIsDeptModalOpen(true);
  };

  const openEditDeptModal = (dept: RhDepartement) => {
    setEditingDeptId(dept.id);
    setDeptForm({
      etablissementId: dept.etablissementId || safeEtablissements[0]?.id || "",
      code: dept.code,
      libelle: dept.libelle,
      departementParentId: dept.departementParentId || "",
    });
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingDeptId;
    const targetEtabId = deptForm.etablissementId || (safeEtablissements[0]?.id ?? "");
    if (!targetEtabId) {
      toast.warning("Action requise", "Veuillez d'abord créer un établissement.");
      return;
    }
    setIsSubmitting(true);
    try {
      await runAction({
        loadingMessage: isEdit ? "Mise à jour du département..." : "Création du département en cours...",
        success: {
          title: isEdit ? "Département mis à jour" : "Département créé avec succès",
          message: `${deptForm.libelle} (${deptForm.code}) a été enregistré.`,
        },
        error: {
          title: "Erreur d'enregistrement",
          message: "Impossible d'enregistrer le département. Vérifiez les informations saisies.",
        },
        action: async () => {
          const payload = {
            etablissementId: targetEtabId,
            code: deptForm.code.trim(),
            libelle: deptForm.libelle.trim(),
            departementParentId: deptForm.departementParentId.trim() || undefined,
          };

          if (isEdit) {
            await rhApi.updateDepartement(editingDeptId!, payload);
          } else {
            const created = await rhApi.createDepartement(payload);
            if (created?.id) {
              setPosteForm((prev) => ({ ...prev, departementId: created.id }));
            }
          }
          setIsDeptModalOpen(false);
          await loadData();
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDept = async (dept: RhDepartement) => {
    await runAction({
      confirm: {
        title: `Supprimer le département ${dept.libelle} ?`,
        message: "Cette action supprimera le département. Impossible si des postes ou salariés y sont rattachés.",
        confirmLabel: "Supprimer",
        variant: "danger",
      },
      loadingMessage: "Suppression du département...",
      success: {
        title: "Département supprimé",
        message: `${dept.libelle} a été retiré.`,
      },
      error: {
        title: "Impossible de supprimer",
        message: "Le département comporte encore des postes rattachés.",
      },
      action: async () => {
        await rhApi.deleteDepartement(dept.id);
        await loadData();
      },
    });
  };

  // ==========================================
  // HANDLERS POSTES & EMPLOIS
  // ==========================================
  const openCreatePosteModal = () => {
    setEditingPosteId(null);
    setPosteForm({
      code: "",
      intitule: "",
      departementId: safeDepartements[0]?.id ?? "",
      description: "",
      salaireMinConseille: 150000,
      salaireMaxConseille: 500000,
    });
    setIsPosteModalOpen(true);
  };

  const openEditPosteModal = (poste: RhPoste) => {
    setEditingPosteId(poste.id);
    setPosteForm({
      code: poste.code,
      intitule: poste.intitule,
      departementId: poste.departementId,
      description: poste.description || "",
      salaireMinConseille: poste.salaireMinConseille || 150000,
      salaireMaxConseille: poste.salaireMaxConseille || 500000,
    });
    setIsPosteModalOpen(true);
  };

  const handleSavePoste = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingPosteId;
    const targetDeptId = posteForm.departementId || (safeDepartements[0]?.id ?? "");
    if (!targetDeptId) {
      toast.warning("Action requise", "Veuillez d'abord créer un département.");
      return;
    }
    setIsSubmitting(true);
    try {
      await runAction({
        loadingMessage: isEdit ? "Mise à jour du poste..." : "Création du poste en cours...",
        success: {
          title: isEdit ? "Poste mis à jour" : "Poste créé avec succès",
          message: `${posteForm.intitule} (${posteForm.code}) a été enregistré.`,
        },
        error: {
          title: "Erreur d'enregistrement",
          message: "Impossible d'enregistrer le poste. Vérifiez les informations saisies.",
        },
        action: async () => {
          const payload = {
            departementId: targetDeptId,
            code: posteForm.code.trim(),
            intitule: posteForm.intitule.trim(),
            description: posteForm.description.trim() || undefined,
            salaireMinConseille: Number(posteForm.salaireMinConseille) || undefined,
            salaireMaxConseille: Number(posteForm.salaireMaxConseille) || undefined,
          };

          if (isEdit) {
            await rhApi.updatePoste(editingPosteId!, payload);
          } else {
            await rhApi.createPoste(payload);
          }
          setIsPosteModalOpen(false);
          await loadData();
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePoste = async (poste: RhPoste) => {
    await runAction({
      confirm: {
        title: `Supprimer le poste ${poste.intitule} ?`,
        message: "Cette action supprimera le poste de travail. Impossible si des contrats actifs y sont rattachés.",
        confirmLabel: "Supprimer",
        variant: "danger",
      },
      loadingMessage: "Suppression du poste...",
      success: {
        title: "Poste supprimé",
        message: `${poste.intitule} a été retiré.`,
      },
      error: {
        title: "Impossible de supprimer",
        message: "Le poste est associé à des contrats de travail en cours.",
      },
      action: async () => {
        await rhApi.deletePoste(poste.id);
        await loadData();
      },
    });
  };

  // ==========================================
  // HANDLERS RUBRIQUES DE PAIE
  // ==========================================
  const openCreateRubriqueModal = () => {
    setEditingRubriqueId(null);
    setRubriqueForm({
      code: "",
      libelle: "",
      typeRubrique: "PRIME",
      sensDefaut: "GAIN",
      assujettiIts: true,
      assujettiCnss: true,
      assujettiVps: true,
      compteComptableCharge: "641100",
      compteComptableTiers: "422000",
      ordreAffichage: 100,
    });
    setIsRubriqueModalOpen(true);
  };

  const openEditRubriqueModal = (rub: RhRubriquePaie) => {
    setEditingRubriqueId(rub.id);
    setRubriqueForm({
      code: rub.code,
      libelle: rub.libelle,
      typeRubrique: rub.typeRubrique,
      sensDefaut: rub.sensDefaut || "GAIN",
      assujettiIts: !!rub.assujettiIts,
      assujettiCnss: !!rub.assujettiCnss,
      assujettiVps: !!rub.assujettiVps,
      compteComptableCharge: rub.compteComptableCharge || "641100",
      compteComptableTiers: rub.compteComptableTiers || "422000",
      ordreAffichage: rub.ordreAffichage || 100,
    });
    setIsRubriqueModalOpen(true);
  };

  const handleSaveRubrique = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingRubriqueId;
    setIsSubmitting(true);
    try {
      await runAction({
        loadingMessage: isEdit ? "Mise à jour de la rubrique..." : "Création de la rubrique...",
        success: {
          title: isEdit ? "Rubrique mise à jour" : "Rubrique créée",
          message: `${rubriqueForm.libelle} (${rubriqueForm.code}) a été enregistrée.`,
        },
        error: {
          title: "Erreur d'enregistrement",
          message: "Impossible d'enregistrer la rubrique de paie.",
        },
        action: async () => {
          const payload = {
            paysCode: "BJ",
            code: rubriqueForm.code.trim().toUpperCase(),
            libelle: rubriqueForm.libelle.trim(),
            typeRubrique: rubriqueForm.typeRubrique,
            sensDefaut: rubriqueForm.sensDefaut,
            assujettiIts: rubriqueForm.assujettiIts,
            assujettiCnss: rubriqueForm.assujettiCnss,
            assujettiVps: rubriqueForm.assujettiVps,
            compteComptableCharge: rubriqueForm.compteComptableCharge.trim() || undefined,
            compteComptableTiers: rubriqueForm.compteComptableTiers.trim() || undefined,
            ordreAffichage: Number(rubriqueForm.ordreAffichage) || 100,
          };

          if (isEdit) {
            await rhApi.updateRubrique(editingRubriqueId!, payload);
          } else {
            await rhApi.createRubrique(payload);
          }
          setIsRubriqueModalOpen(false);
          await loadData();
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRubrique = async (rub: RhRubriquePaie) => {
    await runAction({
      confirm: {
        title: `Désactiver la rubrique ${rub.libelle} ?`,
        message: "Cette rubrique ne sera plus disponible pour les nouveaux bulletins ou variables de paie.",
        confirmLabel: "Désactiver",
        variant: "danger",
      },
      loadingMessage: "Désactivation de la rubrique...",
      success: {
        title: "Rubrique désactivée",
        message: `${rub.libelle} a été désactivée.`,
      },
      error: {
        title: "Erreur",
        message: "Impossible de désactiver la rubrique.",
      },
      action: async () => {
        await rhApi.deleteRubrique(rub.id);
        await loadData();
      },
    });
  };

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(val || 0);

  const formatNumber = (val?: number | null) =>
    new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(Number(val) || 0);

  const safeEtablissements = Array.isArray(etablissements) ? etablissements : [];
  const safeDepartements = Array.isArray(departements) ? departements : [];
  const safePostes = Array.isArray(postes) ? postes : [];
  const safeRubriques = Array.isArray(rubriques) ? rubriques : [];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Paramètres & Organisation RH
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Structure juridique, organigramme, référentiels de postes, barèmes ITS Bénin 2026 et rubriques SYSCOHADA.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800 dark:border-warning-900/50 dark:bg-warning-950/50 dark:text-warning-300">
          <span>{error}</span>
          <button
            onClick={loadData}
            className="ml-4 font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Réactualiser
          </button>
        </div>
      )}

      {/* Onglets */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "etablissements", label: "Établissements & Sites" },
            { id: "departements", label: "Départements & Services" },
            { id: "postes", label: "Postes & Emplois" },
            { id: "baremes", label: "Barèmes Fiscaux (ITS)" },
            { id: "rubriques", label: "Rubriques de Paie" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === tab.id
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 1. ÉTABLISSEMENTS */}
      {activeTab === "etablissements" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openCreateEtabModal}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4 shrink-0 stroke-2" />
              <span>Nouvel Établissement</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Raison Sociale</th>
                    <th className="px-6 py-4">Identifiant Fiscal (IFU)</th>
                    <th className="px-6 py-4">N° Employeur CNSS</th>
                    <th className="px-6 py-4">Localisation</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                        <p className="mt-2 text-xs text-gray-400">Chargement des établissements...</p>
                      </td>
                    </tr>
                  ) : safeEtablissements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                          <BoxIcon className="h-6 w-6 shrink-0 text-gray-400" />
                        </div>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">Aucun établissement configuré</p>
                        <button
                          onClick={openCreateEtabModal}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
                        >
                          <PlusIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>Nouvel Établissement</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    safeEtablissements.map((etab) => (
                      <tr key={etab.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                          {etab.code}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          {etab.raisonSociale}
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">
                          {etab.identifiantFiscal || etab.ifu ? (
                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono dark:bg-gray-800">
                              {etab.identifiantFiscal || etab.ifu}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Non renseigné</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">
                          {etab.numeroEmployeurSecuSociale || etab.numeroCnss ? (
                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono dark:bg-gray-800">
                              {etab.numeroEmployeurSecuSociale || etab.numeroCnss}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Non renseigné</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {etab.ville || "Cotonou"}, {etab.paysCode}
                        </td>
                        <td className="px-6 py-4">
                          {etab.estSiege ? (
                            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800 dark:bg-brand-950/50 dark:text-brand-300">
                              Siège Social
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              Site / Agence
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openDetails("etablissement", etab)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-500 hover:bg-gray-200 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                              title="Voir les détails 360°"
                            >
                              <EyeIcon className="h-5 w-5 shrink-0" />
                            </button>
                            <button
                              onClick={() => openEditEtabModal(etab)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-purple-500 hover:bg-purple-200 hover:text-purple-600 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                              title="Modifier"
                            >
                              <PencilIcon className="h-5 w-5 shrink-0" />
                            </button>
                            <button
                              onClick={() => handleDeleteEtab(etab)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/30 transition-colors"
                              title="Supprimer"
                            >
                              <TrashBinIcon className="h-5 w-5 shrink-0" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. DÉPARTEMENTS */}
      {activeTab === "departements" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openCreateDeptModal}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4 shrink-0 stroke-2" />
              <span>Nouveau Département</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Libellé</th>
                    <th className="px-6 py-4">Département Parent</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                        <p className="mt-2 text-xs text-gray-400">Chargement des départements...</p>
                      </td>
                    </tr>
                  ) : safeDepartements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                          <FolderIcon className="h-6 w-6 shrink-0 text-gray-400" />
                        </div>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">Aucun département configuré</p>
                        <button
                          onClick={openCreateDeptModal}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
                        >
                          <PlusIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>Nouveau Département</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    safeDepartements.map((dept) => (
                      <tr key={dept.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                          {dept.code}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          {dept.libelle}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {dept.parentDepartement?.libelle || "— (Racine)"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                            Actif
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openDetails("departement", dept)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-500 hover:bg-gray-200 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                              title="Voir les détails"
                            >
                              <EyeIcon className="h-5 w-5 shrink-0" />
                            </button>
                            <button
                              onClick={() => openEditDeptModal(dept)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-purple-500 hover:bg-purple-200 hover:text-purple-600 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                              title="Modifier"
                            >
                              <PencilIcon className="h-5 w-5 shrink-0" />
                            </button>
                            <button
                              onClick={() => handleDeleteDept(dept)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/30 transition-colors"
                              title="Supprimer"
                            >
                              <TrashBinIcon className="h-5 w-5 shrink-0" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. POSTES & EMPLOIS */}
      {activeTab === "postes" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openCreatePosteModal}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4 shrink-0 stroke-2" />
              <span>Nouveau Poste</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Intitulé du Poste</th>
                    <th className="px-6 py-4">Département</th>
                    <th className="px-6 py-4 text-right">Fourchette Salariale Conseillée</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                        <p className="mt-2 text-xs text-gray-400">Chargement des postes...</p>
                      </td>
                    </tr>
                  ) : safePostes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                          <DocsIcon className="h-6 w-6 shrink-0 text-gray-400" />
                        </div>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">Aucun poste configuré</p>
                        <button
                          onClick={openCreatePosteModal}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
                        >
                          <PlusIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>Nouveau Poste</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    safePostes.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                          {p.code}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          {p.intitule}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                          {p.departement?.libelle || "-"}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs">
                          {p.salaireMinConseille && p.salaireMaxConseille && p.salaireMaxConseille > 0 ? (
                            <span className="font-bold text-gray-900 dark:text-white">
                              {formatCurrency(p.salaireMinConseille)} - {formatCurrency(p.salaireMaxConseille)}
                            </span>
                          ) : p.salaireMinConseille && p.salaireMinConseille > 0 ? (
                            <span className="font-bold text-gray-900 dark:text-white">
                              Dès {formatCurrency(p.salaireMinConseille)}
                            </span>
                          ) : (
                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-sans text-gray-500 italic dark:bg-gray-800 dark:text-gray-400">
                              Grille conventionnelle
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                            Actif
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openDetails("poste", p)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-500 hover:bg-gray-200 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                              title="Voir les détails"
                            >
                              <EyeIcon className="h-5 w-5 shrink-0" />
                            </button>
                            <button
                              onClick={() => openEditPosteModal(p)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-purple-500 hover:bg-purple-200 hover:text-purple-600 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                              title="Modifier"
                            >
                              <PencilIcon className="h-5 w-5 shrink-0" />
                            </button>
                            <button
                              onClick={() => handleDeletePoste(p)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/30 transition-colors"
                              title="Supprimer"
                            >
                              <TrashBinIcon className="h-5 w-5 shrink-0" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. BARÈMES ITS DYNAMIQUES */}
      {activeTab === "baremes" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 text-xs text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300">
            <InfoIcon className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <strong>Barème légal officiel :</strong> Les tranches et taux ci-dessous proviennent directement de la base de données (RhBaremeIts &amp; RhBaremeItsTranche) et s'appliquent de manière progressive sur le revenu net imposable.
            </div>
          </div>

          {baremes.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              Aucun barème d'impôt configuré en base de données.
            </div>
          ) : (
            baremes.map((b) => (
              <div key={b.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {b.libelle}
                    </h3>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      {b.paysCode}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {b.modeCalcul}
                    </span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                      <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                        <tr>
                          <th className="px-6 py-4">N° Tranche</th>
                          <th className="px-6 py-4">Limite Inférieure</th>
                          <th className="px-6 py-4">Limite Supérieure</th>
                          <th className="px-6 py-4 text-right">Taux Marginal ITS</th>
                          <th className="px-6 py-4 text-right">Déduction Fixe</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                        {(b.tranches || []).map((t: any) => (
                          <tr key={t.id || t.numeroTranche}>
                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                              Tranche {t.numeroTranche}
                            </td>
                            <td className="px-6 py-4 font-mono">
                              {formatNumber(t.limiteInferieure)} FCFA
                            </td>
                            <td className="px-6 py-4 font-mono">
                              {t.limiteSuperieure !== null && t.limiteSuperieure !== undefined
                                ? `${formatNumber(t.limiteSuperieure)} FCFA`
                                : 'Au-delà (Illimité)'}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-brand-600 dark:text-brand-400">
                              {formatNumber(t.taux)} %
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-gray-600 dark:text-gray-400">
                              {formatNumber(t.montantDeductionFixe)} FCFA
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. RUBRIQUES DE PAIE */}
      {activeTab === "rubriques" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openCreateRubriqueModal}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4 shrink-0 stroke-2" />
              <span>Nouvelle Rubrique</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Libellé</th>
                    <th className="px-6 py-4">Type de Rubrique</th>
                    <th className="px-6 py-4">Sens</th>
                    <th className="px-6 py-4">Assujettissements</th>
                    <th className="px-6 py-4">Compte SYSCOHADA</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                        <p className="mt-2 text-xs text-gray-400">Chargement des rubriques...</p>
                      </td>
                    </tr>
                  ) : safeRubriques.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                          <DocsIcon className="h-6 w-6 shrink-0 text-gray-400" />
                        </div>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">Aucune rubrique configurée</p>
                        <button
                          onClick={openCreateRubriqueModal}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
                        >
                          <PlusIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>Nouvelle Rubrique</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    safeRubriques.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-3 font-mono font-bold text-gray-900 dark:text-white">
                          {r.code}
                        </td>
                        <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                          {r.libelle}
                        </td>
                        <td className="px-6 py-3 font-medium text-brand-600 dark:text-brand-400">
                          {formatRubricType(r.typeRubrique)}
                        </td>
                        <td className="px-6 py-3">
                          {(() => {
                            const sensBadge = formatRubricSens(r.sensDefaut);
                            return (
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${sensBadge.badgeClass}`}>
                                {sensBadge.label}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-3">
                          {r.assujettiIts ? <span className="mr-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">ITS</span> : null}
                          {r.assujettiCnss ? <span className="mr-1 rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">CNSS</span> : null}
                          {r.assujettiVps ? <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">VPS</span> : null}
                        </td>
                        <td className="px-6 py-3 font-mono font-semibold">
                          {r.compteComptableCharge || r.compteComptableTiers || "-"}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openDetails("rubrique", r)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-500 hover:bg-gray-200 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                              title="Voir les détails"
                            >
                              <EyeIcon className="h-5 w-5 shrink-0" />
                            </button>
                            <button
                              onClick={() => openEditRubriqueModal(r)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-500 hover:bg-gray-200 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                              title="Modifier"
                            >
                              <PencilIcon className="h-5 w-5 shrink-0" />
                            </button>
                            <button
                              onClick={() => handleDeleteRubrique(r)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/30 transition-colors"
                              title="Désactiver"
                            >
                              <TrashBinIcon className="h-5 w-5 shrink-0" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALE DÉTAILS 360°                                        */}
      {/* ========================================================= */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} className="max-w-lg p-6">
        {detailsData && (
          <div className="space-y-5">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Fiche Détaillée
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {detailsType === "etablissement" && detailsData.raisonSociale}
                  {detailsType === "departement" && detailsData.libelle}
                  {detailsType === "poste" && detailsData.intitule}
                  {detailsType === "rubrique" && detailsData.libelle}
                </h2>
                <p className="font-mono text-xs text-gray-500">
                  Code : {detailsData.code}
                </p>
              </div>
            </div>

            {/* Détail Établissement */}
            {detailsType === "etablissement" && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                  <span className="text-gray-500">Raison Sociale</span>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">{detailsData.raisonSociale}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                  <span className="text-gray-500">Statut du Site</span>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {detailsData.estSiege ? "Siège Social Principal" : "Site / Établissement Secondaire"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                  <span className="text-gray-500">Identifiant Fiscal (IFU)</span>
                  <p className="mt-1 font-mono font-bold text-gray-900 dark:text-white">
                    {detailsData.identifiantFiscal || detailsData.ifu || "Non renseigné"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                  <span className="text-gray-500">N° Employeur Sécurité Sociale (CNSS)</span>
                  <p className="mt-1 font-mono font-bold text-gray-900 dark:text-white">
                    {detailsData.numeroEmployeurSecuSociale || detailsData.numeroCnss || "Non renseigné"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                  <span className="text-gray-500">Ville / Pays</span>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {detailsData.ville || "Cotonou"}, {detailsData.paysCode}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                  <span className="text-gray-500">Adresse géographique</span>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">
                    {detailsData.adresse || "Non renseignée"}
                  </p>
                </div>
                {detailsData._count && (
                  <div className="col-span-2 rounded-xl border border-brand-100 bg-brand-50/30 p-3 dark:border-brand-900/30 dark:bg-brand-950/20">
                    <span className="text-gray-500">Statistiques rattachées</span>
                    <div className="mt-2 flex gap-6 font-semibold text-gray-900 dark:text-white">
                      <div>Départements : {detailsData._count.departements ?? 0}</div>
                      <div>Contrats actifs : {detailsData._count.contrats ?? 0}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Détail Département */}
            {detailsType === "departement" && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                  <span className="text-gray-500">Libellé</span>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">{detailsData.libelle}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                  <span className="text-gray-500">Établissement</span>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {detailsData.etablissement?.raisonSociale || "Établissement Principal"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                  <span className="text-gray-500">Direction / Parent</span>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {detailsData.parentDepartement?.libelle || "Direction Principale (Racine)"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                  <span className="text-gray-500">Statut</span>
                  <p className="mt-1 font-semibold text-emerald-600">Actif</p>
                </div>
              </div>
            )}

            {/* Détail Poste */}
            {detailsType === "poste" && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                    <span className="text-gray-500">Intitulé</span>
                    <p className="mt-1 font-semibold text-gray-900 dark:text-white">{detailsData.intitule}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                    <span className="text-gray-500">Département</span>
                    <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                      {detailsData.departement?.libelle || "-"}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                  <span className="text-gray-500">Fourchette Salariale Conseillée (Min - Max)</span>
                  <p className="mt-1 font-mono text-sm font-bold text-brand-600 dark:text-brand-400">
                    {detailsData.salaireMinConseille && detailsData.salaireMaxConseille
                      ? `${formatCurrency(detailsData.salaireMinConseille)} - ${formatCurrency(detailsData.salaireMaxConseille)}`
                      : "Selon grille conventionnelle"}
                  </p>
                </div>
                {detailsData.description && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                    <span className="text-gray-500">Missions & Description</span>
                    <p className="mt-1 leading-relaxed text-gray-700 dark:text-gray-300">
                      {detailsData.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Détail Rubrique */}
            {detailsType === "rubrique" && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                    <span className="text-gray-500">Type de Rubrique</span>
                    <p className="mt-1 font-semibold text-gray-900 dark:text-white">{formatRubricType(detailsData.typeRubrique)}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                    <span className="text-gray-500">Sens par Défaut</span>
                    <p className="mt-1 font-semibold text-gray-900 dark:text-white">{formatRubricSens(detailsData.sensDefaut).label}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                    <span className="text-gray-500">Compte Charge SYSCOHADA</span>
                    <p className="mt-1 font-mono font-bold text-gray-900 dark:text-white">
                      {detailsData.compteComptableCharge || "Non spécifié"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                    <span className="text-gray-500">Compte Tiers SYSCOHADA</span>
                    <p className="mt-1 font-mono font-bold text-gray-900 dark:text-white">
                      {detailsData.compteComptableTiers || "Non spécifié"}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                  <span className="text-gray-500">Assujettissements fiscaux & sociaux</span>
                  <div className="mt-2 flex gap-3">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${detailsData.assujettiIts ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" : "bg-gray-100 text-gray-400 line-through dark:bg-gray-800"}`}>
                      {detailsData.assujettiIts ? <CheckCircleIcon className="h-3 w-3 shrink-0" /> : <CloseIcon className="h-3 w-3 shrink-0" />}
                      <span>ITS</span>
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${detailsData.assujettiCnss ? "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300" : "bg-gray-100 text-gray-400 line-through dark:bg-gray-800"}`}>
                      {detailsData.assujettiCnss ? <CheckCircleIcon className="h-3 w-3 shrink-0" /> : <CloseIcon className="h-3 w-3 shrink-0" />}
                      <span>CNSS</span>
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${detailsData.assujettiVps ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" : "bg-gray-100 text-gray-400 line-through dark:bg-gray-800"}`}>
                      {detailsData.assujettiVps ? <CheckCircleIcon className="h-3 w-3 shrink-0" /> : <CloseIcon className="h-3 w-3 shrink-0" />}
                      <span>VPS</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="rounded-xl bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Établissement */}
      <Modal isOpen={isEtabModalOpen} onClose={() => setIsEtabModalOpen(false)} className="max-w-md p-6">
        <form onSubmit={handleSaveEtab} className="space-y-4">
          <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingEtabId ? "Modifier l'Établissement" : "Nouvel Établissement"}
            </h2>
            <p className="text-xs text-gray-500">
              Site, siège social ou succursale de l'entreprise
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Code Établissement *</label>
            <input
              type="text"
              required
              value={etabForm.code}
              onChange={(e) => setEtabForm({ ...etabForm, code: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              placeholder="Ex: SIEGE"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Raison Sociale *</label>
            <input
              type="text"
              required
              value={etabForm.raisonSociale}
              onChange={(e) => setEtabForm({ ...etabForm, raisonSociale: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              placeholder="Ex: NEXERA BENIN SARL"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Identifiant Fiscal (IFU)</label>
              <input
                type="text"
                value={etabForm.identifiantFiscal}
                onChange={(e) => setEtabForm({ ...etabForm, identifiantFiscal: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden font-mono"
                placeholder="0202612345678"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">N° Employeur CNSS</label>
              <input
                type="text"
                value={etabForm.numeroEmployeurSecuSociale}
                onChange={(e) => setEtabForm({ ...etabForm, numeroEmployeurSecuSociale: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden font-mono"
                placeholder="CNSS-100234"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Ville</label>
              <input
                type="text"
                value={etabForm.ville}
                onChange={(e) => setEtabForm({ ...etabForm, ville: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
                placeholder="Cotonou"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Pays</label>
              <select
                value={etabForm.paysCode}
                onChange={(e) => setEtabForm({ ...etabForm, paysCode: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              >
                <option value="BJ">Bénin (BJ)</option>
                <option value="CI">Côte d'Ivoire (CI)</option>
                <option value="SN">Sénégal (SN)</option>
                <option value="TG">Togo (TG)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Adresse</label>
            <input
              type="text"
              value={etabForm.adresse}
              onChange={(e) => setEtabForm({ ...etabForm, adresse: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              placeholder="Ex: Boulevard de la Marina, Cotonou"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="estSiege"
              checked={etabForm.estSiege}
              onChange={(e) => setEtabForm({ ...etabForm, estSiege: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="estSiege" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Définir comme Siège Social principal
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsEtabModalOpen(false)}
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
              <span>{isSubmitting ? "Enregistrement..." : editingEtabId ? "Enregistrer" : "Créer"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Département */}
      <Modal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} className="max-w-md p-6">
        <form onSubmit={handleSaveDept} className="space-y-4">
          <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingDeptId ? "Modifier le Département" : "Nouveau Département"}
            </h2>
            <p className="text-xs text-gray-500">
              Direction, service ou division organisationnelle
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Établissement de rattachement *</label>
            <select
              required
              value={deptForm.etablissementId}
              onChange={(e) => setDeptForm({ ...deptForm, etablissementId: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            >
              {safeEtablissements.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.raisonSociale} ({e.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Code *</label>
            <input
              type="text"
              required
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              placeholder="Ex: DSI"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Libellé *</label>
            <input
              type="text"
              required
              value={deptForm.libelle}
              onChange={(e) => setDeptForm({ ...deptForm, libelle: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              placeholder="Ex: Direction des Systèmes d'Information"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Département Parent (Optionnel)</label>
            <select
              value={deptForm.departementParentId}
              onChange={(e) => setDeptForm({ ...deptForm, departementParentId: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            >
              <option value="">-- Aucun (Direction Principale) --</option>
              {safeDepartements
                .filter((d) => !editingDeptId || d.id !== editingDeptId)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.libelle} ({d.code})
                  </option>
                ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsDeptModalOpen(false)}
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
              <span>{isSubmitting ? "Enregistrement..." : editingDeptId ? "Enregistrer" : "Créer"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Poste */}
      <Modal isOpen={isPosteModalOpen} onClose={() => setIsPosteModalOpen(false)} className="max-w-md p-6">
        <form onSubmit={handleSavePoste} className="space-y-4">
          <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingPosteId ? "Modifier le Poste / Emploi" : "Nouveau Poste / Emploi"}
            </h2>
            <p className="text-xs text-gray-500">
              Définition du poste, rattachement et grille salariale conseillée
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Département *</label>
            <select
              required
              value={posteForm.departementId}
              onChange={(e) => setPosteForm({ ...posteForm, departementId: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            >
              {safeDepartements.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.libelle}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Code *</label>
            <input
              type="text"
              required
              value={posteForm.code}
              onChange={(e) => setPosteForm({ ...posteForm, code: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              placeholder="Ex: DEV-FS"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Intitulé du Poste *</label>
            <input
              type="text"
              required
              value={posteForm.intitule}
              onChange={(e) => setPosteForm({ ...posteForm, intitule: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              placeholder="Ex: Développeur Full Stack"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description / Missions (Optionnel)</label>
            <textarea
              rows={2}
              value={posteForm.description}
              onChange={(e) => setPosteForm({ ...posteForm, description: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden resize-none"
              placeholder="Responsabilités et missions principales du poste..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Salaire Min Conseillé (FCFA)</label>
              <input
                type="number"
                min={0}
                step={5000}
                value={posteForm.salaireMinConseille}
                onChange={(e) => setPosteForm({ ...posteForm, salaireMinConseille: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Salaire Max Conseillé (FCFA)</label>
              <input
                type="number"
                min={0}
                step={5000}
                value={posteForm.salaireMaxConseille}
                onChange={(e) => setPosteForm({ ...posteForm, salaireMaxConseille: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-semibold"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsPosteModalOpen(false)}
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
              <span>{isSubmitting ? "Enregistrement..." : editingPosteId ? "Enregistrer" : "Créer"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Rubrique */}
      <Modal isOpen={isRubriqueModalOpen} onClose={() => setIsRubriqueModalOpen(false)} className="max-w-lg p-6">
        <form onSubmit={handleSaveRubrique} className="space-y-4">
          <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingRubriqueId ? "Modifier la Rubrique de Paie" : "Nouvelle Rubrique de Paie"}
            </h2>
            <p className="text-xs text-gray-500">
              Paramétrage des gains, primes, indemnités, avantages ou retenues
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Code Rubrique *</label>
              <input
                type="text"
                required
                value={rubriqueForm.code}
                onChange={(e) => setRubriqueForm({ ...rubriqueForm, code: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden font-mono"
                placeholder="Ex: PRIME_RESP"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Type de Rubrique *</label>
              <select
                value={rubriqueForm.typeRubrique}
                onChange={(e) => setRubriqueForm({ ...rubriqueForm, typeRubrique: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              >
                <option value="SALAIRE_BASE">Salaire de base</option>
                <option value="PRIME">Prime (Rendement, Assiduité...)</option>
                <option value="INDEMNITE">Indemnité (Transport, Logement...)</option>
                <option value="HEURES_SUPP">Heures Supplémentaires</option>
                <option value="AVANTAGE_NATURE">Avantage en nature</option>
                <option value="RETENUE">Retenue Diverse</option>
                <option value="ACOMPTE">Acompte / Prêt</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Libellé complet *</label>
            <input
              type="text"
              required
              value={rubriqueForm.libelle}
              onChange={(e) => setRubriqueForm({ ...rubriqueForm, libelle: e.target.value })}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              placeholder="Ex: Prime de Responsabilité & Suivi Projet"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Sens par Défaut</label>
              <select
                value={rubriqueForm.sensDefaut}
                onChange={(e) => setRubriqueForm({ ...rubriqueForm, sensDefaut: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
              >
                <option value="GAIN">GAIN (Ajout au Brut)</option>
                <option value="RETENUE">RETENUE (Déduction du Net)</option>
                <option value="NEUTRE">NEUTRE (Information)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Ordre d'affichage</label>
              <input
                type="number"
                value={rubriqueForm.ordreAffichage}
                onChange={(e) => setRubriqueForm({ ...rubriqueForm, ordreAffichage: parseInt(e.target.value, 10) || 100 })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono"
              />
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Assujettissements fiscaux & sociaux (Bénin 2026)</p>
            <div className="flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rubriqueForm.assujettiIts}
                  onChange={(e) => setRubriqueForm({ ...rubriqueForm, assujettiIts: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Assujetti ITS</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rubriqueForm.assujettiCnss}
                  onChange={(e) => setRubriqueForm({ ...rubriqueForm, assujettiCnss: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Assujetti CNSS</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rubriqueForm.assujettiVps}
                  onChange={(e) => setRubriqueForm({ ...rubriqueForm, assujettiVps: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Assujetti VPS</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Compte Charge SYSCOHADA</label>
              <input
                type="text"
                value={rubriqueForm.compteComptableCharge}
                onChange={(e) => setRubriqueForm({ ...rubriqueForm, compteComptableCharge: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono"
                placeholder="641100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Compte Tiers SYSCOHADA</label>
              <input
                type="text"
                value={rubriqueForm.compteComptableTiers}
                onChange={(e) => setRubriqueForm({ ...rubriqueForm, compteComptableTiers: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono"
                placeholder="422000"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsRubriqueModalOpen(false)}
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
              <span>{isSubmitting ? "Enregistrement..." : editingRubriqueId ? "Enregistrer" : "Créer"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
