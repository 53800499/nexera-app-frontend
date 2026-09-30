"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fiscaliteApi } from "../services/fiscaliteApi.service";
import type {
  TaxBareme,
  TaxParametrePays,
  TaxRegimeImposition,
  TaxSourceReglementaire,
  TaxType,
} from "../types/fiscalite.types";
import { ScrollLegalIcon } from "./FiscaliteIcons";
import {
  ChevronLeftIcon,
  PlusIcon,
  CheckCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashBinIcon,
  CopyIcon,
  CloseIcon,
} from "@/icons";
import { useActionFeedback, useToast } from "@/shared/components/feedback";
import { FormErrorAlert, useFormError } from "./FormErrorAlert";

export const VeilleReferentielView: React.FC = () => {
  const { confirm, showResult } = useActionFeedback();
  const toast = useToast();

  // Données
  const [sources, setSources] = useState<TaxSourceReglementaire[]>([]);
  const [baremes, setBaremes] = useState<TaxBareme[]>([]);
  const [parametres, setParametres] = useState<TaxParametrePays[]>([]);
  const [regimes, setRegimes] = useState<TaxRegimeImposition[]>([]);
  const [types, setTypes] = useState<TaxType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Sous-menus (Onglets)
  const [activeTab, setActiveTab] = useState<"VEILLE" | "BAREMES" | "PARAMETRES" | "REGIMES">("VEILLE");

  // Filtres & Recherche
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVeilleStatut, setFilterVeilleStatut] = useState<string>("ALL");
  const [filterBaremeStatut, setFilterBaremeStatut] = useState<string>("ALL");
  const [filterBaremeType, setFilterBaremeType] = useState<string>("ALL");
  const [filterParamType, setFilterParamType] = useState<string>("ALL");

  // --- Modals : SOURCES RÉGLEMENTAIRES ---
  const [showAddSource, setShowAddSource] = useState(false);
  const [editingSource, setEditingSource] = useState<TaxSourceReglementaire | null>(null);
  const [viewingSource, setViewingSource] = useState<TaxSourceReglementaire | null>(null);
  const [qualifyingSource, setQualifyingSource] = useState<TaxSourceReglementaire | null>(null);

  // State formulaire source
  const [sourceForm, setSourceForm] = useState({
    paysCode: "BJ",
    typeSource: "CIRCULAIRE",
    reference: "Circulaire DGI n° 008/2026",
    titre: "Précisions sur les déductions TVA relatives aux prestations numériques",
    datePublication: "2026-03-01",
    dateEntreeVigueur: "2026-03-15",
    resume: "Modalités d'application des retenues TVA sur prestations transfrontalières.",
    statutVeille: "A_QUALIFIER",
  });

  // --- Modals : BARÈMES FISCAUX ---
  const [showAddBareme, setShowAddBareme] = useState(false);
  const [editingBareme, setEditingBareme] = useState<TaxBareme | null>(null);
  const [viewingBareme, setViewingBareme] = useState<TaxBareme | null>(null);

  // State formulaire barème
  const [baremeForm, setBaremeForm] = useState({
    taxTypeId: "",
    sourceReglementaireId: "",
    libelle: "",
    secteurActivite: "",
    tauxDefaut: 18,
    dateDebutValidite: "2026-01-01",
    dateFinValidite: "",
    statut: "BROUILLON",
  });

  // --- Modals : PARAMÈTRES PAYS ---
  const [showAddParametre, setShowAddParametre] = useState(false);
  const [editingParametre, setEditingParametre] = useState<TaxParametrePays | null>(null);
  const [viewingParametre, setViewingParametre] = useState<TaxParametrePays | null>(null);

  // State formulaire paramètre
  const [parametreForm, setParametreForm] = useState({
    paysCode: "BJ",
    codeParametre: "",
    libelle: "",
    typeValeur: "NUMERIQUE",
    valeur: "",
    unite: "FCFA",
    sourceReglementaireId: "",
    dateDebutValidite: "2026-01-01",
    dateFinValidite: "",
  });

  // --- Modals : RÉGIMES D'IMPOSITION ---
  const [showAddRegime, setShowAddRegime] = useState(false);
  const [editingRegime, setEditingRegime] = useState<TaxRegimeImposition | null>(null);
  const [viewingRegime, setViewingRegime] = useState<TaxRegimeImposition | null>(null);

  // State formulaire régime
  const [regimeForm, setRegimeForm] = useState({
    paysCode: "BJ",
    code: "",
    libelle: "",
    seuilChiffreAffairesMax: 50000000,
    obligationComptable: "COMPTABILITE_SIMPLIFIEE",
    dateDebutValidite: "2026-01-01",
    dateFinValidite: "",
  });

  // Gestion des erreurs formulaires
  const { error: formError, captureError: captureFormError, clearError: clearFormError } = useFormError();

  // Chargement global des données
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [s, b, p, r, t] = await Promise.all([
        fiscaliteApi.listSources("BJ"),
        fiscaliteApi.listBaremes(undefined, "BJ"),
        fiscaliteApi.listParametres("BJ"),
        fiscaliteApi.listRegimes("BJ"),
        fiscaliteApi.listTypes("BJ"),
      ]);
      setSources(s);
      setBaremes(b);
      setParametres(p);
      setRegimes(r);
      setTypes(t);
    } catch (err) {
      console.error("Erreur chargement référentiel:", err);
      toast.error("Chargement référentiel", "Impossible de récupérer les données du référentiel fiscal.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ----------------------------------------------------
  // GESTION : SOURCES RÉGLEMENTAIRES (VEILLE)
  // ----------------------------------------------------

  const openCreateSourceModal = () => {
    clearFormError();
    setSourceForm({
      paysCode: "BJ",
      typeSource: "CIRCULAIRE",
      reference: "",
      titre: "",
      datePublication: new Date().toISOString().slice(0, 10),
      dateEntreeVigueur: new Date().toISOString().slice(0, 10),
      resume: "",
      statutVeille: "A_QUALIFIER",
    });
    setShowAddSource(true);
  };

  const openEditSourceModal = (s: TaxSourceReglementaire) => {
    clearFormError();
    setEditingSource(s);
    setSourceForm({
      paysCode: s.paysCode,
      typeSource: s.typeSource,
      reference: s.reference,
      titre: s.titre,
      datePublication: s.datePublication ? s.datePublication.slice(0, 10) : "",
      dateEntreeVigueur: s.dateEntreeVigueur ? s.dateEntreeVigueur.slice(0, 10) : "",
      resume: s.resume || "",
      statutVeille: s.statutVeille,
    });
  };

  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFormError();
    setActionLoading(true);
    try {
      if (editingSource) {
        await fiscaliteApi.updateSource(editingSource.id, {
          reference: sourceForm.reference,
          titre: sourceForm.titre,
          typeSource: sourceForm.typeSource as any,
          datePublication: sourceForm.datePublication,
          dateEntreeVigueur: sourceForm.dateEntreeVigueur,
          resume: sourceForm.resume,
          statutVeille: sourceForm.statutVeille as any,
        });
        toast.success("Source mise à jour", "Le texte réglementaire a été modifié avec succès.");
        setEditingSource(null);
      } else {
        await fiscaliteApi.createSource({
          paysCode: sourceForm.paysCode,
          typeSource: sourceForm.typeSource,
          reference: sourceForm.reference,
          titre: sourceForm.titre,
          datePublication: sourceForm.datePublication,
          dateEntreeVigueur: sourceForm.dateEntreeVigueur,
          resume: sourceForm.resume,
        });
        toast.success("Source enregistrée", "Le texte réglementaire a été ajouté à la veille fiscale.");
        setShowAddSource(false);
      }
      await loadData();
    } catch (err: any) {
      captureFormError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSource = async (source: TaxSourceReglementaire) => {
    const confirmed = await confirm({
      title: "Supprimer cette source réglementaire ?",
      message: `Êtes-vous sûr de vouloir supprimer la source « ${source.reference} — ${source.titre} » ? Cette action désactivera le texte dans le registre.`,
      confirmLabel: "Supprimer",
      cancelLabel: "Annuler",
      variant: "danger",
    });
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await fiscaliteApi.deleteSource(source.id);
      toast.success("Source supprimée", "Le texte réglementaire a été retiré de la veille.");
      await loadData();
    } catch (err: any) {
      toast.error("Erreur suppression", err.message || "Impossible de supprimer la source.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyQualification = async (sourceId: string, statut: string, resume?: string) => {
    setActionLoading(true);
    try {
      await fiscaliteApi.qualifierSource(sourceId, {
        statutVeille: statut,
        resume: resume || undefined,
      });
      toast.success("Statut mis à jour", `Le texte est désormais qualifié : ${statut.replace(/_/g, " ")}.`);
      setQualifyingSource(null);
      await loadData();
    } catch (err: any) {
      toast.error("Qualification source", err.message || "Erreur qualification source");
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // GESTION : BARÈMES FISCAUX
  // ----------------------------------------------------

  const openCreateBaremeModal = () => {
    clearFormError();
    setBaremeForm({
      taxTypeId: types[0]?.id || "",
      sourceReglementaireId: sources[0]?.id || "",
      libelle: "",
      secteurActivite: "",
      tauxDefaut: 18,
      dateDebutValidite: new Date().toISOString().slice(0, 10),
      dateFinValidite: "",
      statut: "BROUILLON",
    });
    setShowAddBareme(true);
  };

  const openEditBaremeModal = (b: TaxBareme) => {
    clearFormError();
    setEditingBareme(b);
    setBaremeForm({
      taxTypeId: b.taxTypeId,
      sourceReglementaireId: b.sourceReglementaireId,
      libelle: b.libelle,
      secteurActivite: b.secteurActivite || "",
      tauxDefaut: b.tauxDefaut ?? 0,
      dateDebutValidite: b.dateDebutValidite ? b.dateDebutValidite.slice(0, 10) : "",
      dateFinValidite: b.dateFinValidite ? b.dateFinValidite.slice(0, 10) : "",
      statut: b.statut,
    });
  };

  const handleSaveBareme = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFormError();
    setActionLoading(true);
    try {
      if (editingBareme) {
        await fiscaliteApi.updateBareme(editingBareme.id, {
          libelle: baremeForm.libelle,
          secteurActivite: baremeForm.secteurActivite || undefined,
          tauxDefaut: Number(baremeForm.tauxDefaut),
          dateDebutValidite: baremeForm.dateDebutValidite,
          dateFinValidite: baremeForm.dateFinValidite || undefined,
          sourceReglementaireId: baremeForm.sourceReglementaireId || undefined,
        });
        toast.success("Barème modifié", "Les paramètres du barème fiscal ont été mis à jour.");
        setEditingBareme(null);
      } else {
        await fiscaliteApi.createBareme({
          taxTypeId: baremeForm.taxTypeId,
          sourceReglementaireId: baremeForm.sourceReglementaireId,
          libelle: baremeForm.libelle,
          secteurActivite: baremeForm.secteurActivite || undefined,
          tauxDefaut: Number(baremeForm.tauxDefaut),
          dateDebutValidite: baremeForm.dateDebutValidite,
          dateFinValidite: baremeForm.dateFinValidite || undefined,
        });
        toast.success("Barème créé", "Le barème fiscal a été enregistré au statut Brouillon.");
        setShowAddBareme(false);
      }
      await loadData();
    } catch (err: any) {
      captureFormError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleValiderBareme = async (id: string) => {
    const confirmed = await confirm({
      title: "Approuver et activer ce barème fiscal ?",
      message:
        "Conformément à la règle de double validation EF-008, l'approbation de ce barème activera immédiatement les taux pour tous les calculs fiscaux du système.",
      confirmLabel: "Approuver & Activer",
      cancelLabel: "Annuler",
      variant: "warning",
    });
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await fiscaliteApi.validerBareme(id, false);
      await showResult({
        variant: "success",
        title: "Barème Fiscal Activé ✓",
        message:
          "Le barème a été approuvé conformément à la règle EF-008. Les nouveaux taux sont immédiatement effectifs.",
        closeLabel: "Parfait",
      });
      await loadData();
    } catch (err: any) {
      toast.error("Validation barème", err.message || "Erreur validation barème");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicateBareme = async (b: TaxBareme) => {
    const confirmed = await confirm({
      title: "Dupliquer ce barème fiscal ?",
      message: `Une copie de « ${b.libelle} » sera créée au statut BROUILLON avec toutes ses tranches associées pour une nouvelle période.`,
      confirmLabel: "Dupliquer",
      cancelLabel: "Annuler",
      variant: "default",
    });
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await fiscaliteApi.duplicateBareme(b.id);
      toast.success("Barème dupliqué", "La copie du barème fiscal a été générée.");
      await loadData();
    } catch (err: any) {
      toast.error("Erreur duplication", err.message || "Impossible de dupliquer le barème.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBareme = async (b: TaxBareme) => {
    const confirmed = await confirm({
      title: "Supprimer ce barème fiscal ?",
      message: `Êtes-vous certain de vouloir supprimer le barème « ${b.libelle} » ?`,
      confirmLabel: "Supprimer",
      cancelLabel: "Annuler",
      variant: "danger",
    });
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await fiscaliteApi.deleteBareme(b.id);
      toast.success("Barème supprimé", "Le barème a été supprimé.");
      await loadData();
    } catch (err: any) {
      toast.error("Erreur suppression", err.message || "Impossible de supprimer le barème.");
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // GESTION : PARAMÈTRES PAYS
  // ----------------------------------------------------

  const openCreateParametreModal = () => {
    clearFormError();
    setParametreForm({
      paysCode: "BJ",
      codeParametre: "",
      libelle: "",
      typeValeur: "NUMERIQUE",
      valeur: "",
      unite: "FCFA",
      sourceReglementaireId: sources[0]?.id || "",
      dateDebutValidite: new Date().toISOString().slice(0, 10),
      dateFinValidite: "",
    });
    setShowAddParametre(true);
  };

  const openEditParametreModal = (p: TaxParametrePays) => {
    clearFormError();
    setEditingParametre(p);
    setParametreForm({
      paysCode: p.paysCode,
      codeParametre: p.codeParametre || p.code || "",
      libelle: p.libelle,
      typeValeur: p.typeValeur || "NUMERIQUE",
      valeur: p.valeur || String(p.valeurNumerique ?? p.valeurTexte ?? ""),
      unite: p.unite || "",
      sourceReglementaireId: p.sourceReglementaireId || "",
      dateDebutValidite: p.dateDebutValidite ? p.dateDebutValidite.slice(0, 10) : "",
      dateFinValidite: p.dateFinValidite ? p.dateFinValidite.slice(0, 10) : "",
    });
  };

  const handleSaveParametre = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFormError();
    setActionLoading(true);
    try {
      if (editingParametre) {
        await fiscaliteApi.updateParametre(editingParametre.id, {
          libelle: parametreForm.libelle,
          typeValeur: parametreForm.typeValeur,
          valeur: parametreForm.valeur,
          unite: parametreForm.unite || undefined,
          sourceReglementaireId: parametreForm.sourceReglementaireId || undefined,
          dateDebutValidite: parametreForm.dateDebutValidite,
          dateFinValidite: parametreForm.dateFinValidite || undefined,
        });
        toast.success("Paramètre mis à jour", "La valeur du paramètre pays a été mise à jour.");
        setEditingParametre(null);
      } else {
        await fiscaliteApi.createParametre({
          paysCode: parametreForm.paysCode,
          codeParametre: parametreForm.codeParametre.toUpperCase().replace(/\s+/g, "_"),
          libelle: parametreForm.libelle,
          typeValeur: parametreForm.typeValeur,
          valeur: parametreForm.valeur,
          unite: parametreForm.unite || undefined,
          sourceReglementaireId: parametreForm.sourceReglementaireId || undefined,
          dateDebutValidite: parametreForm.dateDebutValidite,
          dateFinValidite: parametreForm.dateFinValidite || undefined,
        });
        toast.success("Paramètre créé", "Le nouveau paramètre fiscal national a été enregistré.");
        setShowAddParametre(false);
      }
      await loadData();
    } catch (err: any) {
      captureFormError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteParametre = async (p: TaxParametrePays) => {
    const confirmed = await confirm({
      title: "Supprimer ce paramètre fiscal ?",
      message: `Voulez-vous supprimer le paramètre « ${p.codeParametre || p.code} — ${p.libelle} » ?`,
      confirmLabel: "Supprimer",
      cancelLabel: "Annuler",
      variant: "danger",
    });
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await fiscaliteApi.deleteParametre(p.id);
      toast.success("Paramètre supprimé", "Le paramètre a été supprimé.");
      await loadData();
    } catch (err: any) {
      toast.error("Erreur suppression", err.message || "Impossible de supprimer le paramètre.");
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // GESTION : RÉGIMES D'IMPOSITION
  // ----------------------------------------------------

  const openCreateRegimeModal = () => {
    clearFormError();
    setRegimeForm({
      paysCode: "BJ",
      code: "",
      libelle: "",
      seuilChiffreAffairesMax: 50000000,
      obligationComptable: "COMPTABILITE_SIMPLIFIEE",
      dateDebutValidite: new Date().toISOString().slice(0, 10),
      dateFinValidite: "",
    });
    setShowAddRegime(true);
  };

  const openEditRegimeModal = (r: TaxRegimeImposition) => {
    clearFormError();
    setEditingRegime(r);
    setRegimeForm({
      paysCode: r.paysCode,
      code: r.code,
      libelle: r.libelle,
      seuilChiffreAffairesMax: r.seuilChiffreAffairesMax ?? 0,
      obligationComptable: r.obligationComptable || "COMPTABILITE_SIMPLIFIEE",
      dateDebutValidite: r.dateDebutValidite ? r.dateDebutValidite.slice(0, 10) : "",
      dateFinValidite: "",
    });
  };

  const handleSaveRegime = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFormError();
    setActionLoading(true);
    try {
      if (editingRegime) {
        await fiscaliteApi.updateRegime(editingRegime.id, {
          libelle: regimeForm.libelle,
          seuilChiffreAffairesMax: Number(regimeForm.seuilChiffreAffairesMax),
          obligationComptable: regimeForm.obligationComptable,
          dateDebutValidite: regimeForm.dateDebutValidite,
          dateFinValidite: regimeForm.dateFinValidite || undefined,
        });
        toast.success("Régime mis à jour", "Le régime d'imposition a été modifié.");
        setEditingRegime(null);
      } else {
        await fiscaliteApi.createRegime({
          paysCode: regimeForm.paysCode,
          code: regimeForm.code.toUpperCase().trim(),
          libelle: regimeForm.libelle,
          seuilChiffreAffairesMax: Number(regimeForm.seuilChiffreAffairesMax),
          obligationComptable: regimeForm.obligationComptable,
          dateDebutValidite: regimeForm.dateDebutValidite,
          dateFinValidite: regimeForm.dateFinValidite || undefined,
        });
        toast.success("Régime créé", "Le régime d'imposition a été enregistré.");
        setShowAddRegime(false);
      }
      await loadData();
    } catch (err: any) {
      captureFormError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRegime = async (r: TaxRegimeImposition) => {
    const confirmed = await confirm({
      title: "Supprimer ce régime d'imposition ?",
      message: `Voulez-vous supprimer le régime « ${r.code} — ${r.libelle} » ?`,
      confirmLabel: "Supprimer",
      cancelLabel: "Annuler",
      variant: "danger",
    });
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await fiscaliteApi.deleteRegime(r.id);
      toast.success("Régime supprimé", "Le régime a été supprimé.");
      await loadData();
    } catch (err: any) {
      toast.error("Erreur suppression", err.message || "Impossible de supprimer le régime.");
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // FILTRAGE LOCAL
  // ----------------------------------------------------

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      const matchSearch =
        searchQuery === "" ||
        s.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.resume && s.resume.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatut = filterVeilleStatut === "ALL" || s.statutVeille === filterVeilleStatut;
      return matchSearch && matchStatut;
    });
  }, [sources, searchQuery, filterVeilleStatut]);

  const filteredBaremes = useMemo(() => {
    return baremes.filter((b) => {
      const matchSearch =
        searchQuery === "" ||
        b.libelle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.taxType?.code && b.taxType.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.secteurActivite && b.secteurActivite.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatut = filterBaremeStatut === "ALL" || b.statut === filterBaremeStatut;
      const matchType = filterBaremeType === "ALL" || b.taxTypeId === filterBaremeType;

      return matchSearch && matchStatut && matchType;
    });
  }, [baremes, searchQuery, filterBaremeStatut, filterBaremeType]);

  const filteredParametres = useMemo(() => {
    return parametres.filter((p) => {
      const code = p.codeParametre || p.code || "";
      const matchSearch =
        searchQuery === "" ||
        code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.libelle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.valeur.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = filterParamType === "ALL" || p.typeValeur === filterParamType;
      return matchSearch && matchType;
    });
  }, [parametres, searchQuery, filterParamType]);

  const filteredRegimes = useMemo(() => {
    return regimes.filter((r) => {
      return (
        searchQuery === "" ||
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.libelle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.obligationComptable.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [regimes, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold shadow-sm">
              <ScrollLegalIcon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Veille Réglementaire &amp; Référentiel Fiscal
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                CGI Bénin 2026 • Gestion du changement légal (EF-002) • Double contrôle (EF-008) • Actions &amp; Gestion centralisée.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/fiscalite"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition shadow-sm"
          >
            <ChevronLeftIcon className="h-4 w-4 shrink-0" />
            <span>Tableau de Bord</span>
          </Link>

          {/* Boutons d'ajout contextuels selon l'onglet actif */}
          {activeTab === "VEILLE" && (
            <button
              onClick={openCreateSourceModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 shadow-sm transition"
            >
              <PlusIcon className="h-4 w-4 shrink-0" />
              <span>+ Enregistrer une Circulaire / Texte</span>
            </button>
          )}

          {activeTab === "BAREMES" && (
            <button
              onClick={openCreateBaremeModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 shadow-sm transition"
            >
              <PlusIcon className="h-4 w-4 shrink-0" />
              <span>+ Nouveau Barème Fiscal</span>
            </button>
          )}

          {activeTab === "PARAMETRES" && (
            <button
              onClick={openCreateParametreModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 shadow-sm transition"
            >
              <PlusIcon className="h-4 w-4 shrink-0" />
              <span>+ Nouveau Paramètre Pays</span>
            </button>
          )}

          {activeTab === "REGIMES" && (
            <button
              onClick={openCreateRegimeModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 shadow-sm transition"
            >
              <PlusIcon className="h-4 w-4 shrink-0" />
              <span>+ Nouveau Régime d'Imposition</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation par Sous-menus / Onglets */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto pb-px">
        <button
          onClick={() => {
            setActiveTab("VEILLE");
            setSearchQuery("");
          }}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
            activeTab === "VEILLE"
              ? "border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400"
              : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          Sources Légales &amp; Veille ({sources.length})
        </button>

        <button
          onClick={() => {
            setActiveTab("BAREMES");
            setSearchQuery("");
          }}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
            activeTab === "BAREMES"
              ? "border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400"
              : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          Barèmes Fiscaux Versionnés ({baremes.length})
        </button>

        <button
          onClick={() => {
            setActiveTab("PARAMETRES");
            setSearchQuery("");
          }}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
            activeTab === "PARAMETRES"
              ? "border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400"
              : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          Paramètres Fiscaux Pays ({parametres.length})
        </button>

        <button
          onClick={() => {
            setActiveTab("REGIMES");
            setSearchQuery("");
          }}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
            activeTab === "REGIMES"
              ? "border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400"
              : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          Régimes d'Imposition ({regimes.length})
        </button>
      </div>

      {/* Barre de Recherche et Filtres Dynamiques */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex-1 min-w-[260px]">
          <input
            type="text"
            placeholder="Rechercher par référence, titre, code, libellé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>

        {/* Filtres contextuels selon l'onglet */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === "VEILLE" && (
            <select
              value={filterVeilleStatut}
              onChange={(e) => setFilterVeilleStatut(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <option value="ALL">Tous les statuts de veille</option>
              <option value="A_QUALIFIER">À Qualifier</option>
              <option value="QUALIFIEE">Qualifiée</option>
              <option value="PARAMETRAGE_EN_COURS">Paramétrage en cours</option>
              <option value="APPLIQUEE">Appliquée</option>
              <option value="SANS_IMPACT_LOGICIEL">Sans impact logiciel</option>
            </select>
          )}

          {activeTab === "BAREMES" && (
            <>
              <select
                value={filterBaremeStatut}
                onChange={(e) => setFilterBaremeStatut(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ACTIF">Actif</option>
                <option value="BROUILLON">Brouillon</option>
                <option value="REMPLACE">Remplacé / Obsolète</option>
              </select>

              <select
                value={filterBaremeType}
                onChange={(e) => setFilterBaremeType(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value="ALL">Tous les types d'impôt</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code} — {t.libelle}
                  </option>
                ))}
              </select>
            </>
          )}

          {activeTab === "PARAMETRES" && (
            <select
              value={filterParamType}
              onChange={(e) => setFilterParamType(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <option value="ALL">Tous types de valeur</option>
              <option value="NUMERIQUE">Numérique</option>
              <option value="POURCENTAGE">Pourcentage</option>
              <option value="TEXTE">Texte</option>
              <option value="BOOLEEN">Booléen</option>
            </select>
          )}
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* SOUS-MENU 1 : VEILLE RÉGLEMENTAIRE & CIRCULAIRES         */}
          {/* ======================================================== */}
          {activeTab === "VEILLE" && (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left">Référence</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Titre &amp; Objet</th>
                    <th className="px-4 py-3 text-left">Publication</th>
                    <th className="px-4 py-3 text-left">Vigueur</th>
                    <th className="px-4 py-3 text-center">Statut Veille</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800/60">
                  {filteredSources.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        Aucun texte réglementaire ne correspond aux critères de recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredSources.map((s) => (
                      <tr key={s.id} className="hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition">
                        <td className="px-4 py-3 font-mono font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                          {s.reference}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {s.typeSource}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium max-w-sm">
                          <div className="font-semibold line-clamp-1">{s.titre}</div>
                          {s.resume && (
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                              {s.resume}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {s.datePublication ? new Date(s.datePublication).toLocaleDateString("fr-FR") : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                          {s.dateEntreeVigueur ? new Date(s.dateEntreeVigueur).toLocaleDateString("fr-FR") : "—"}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              s.statutVeille === "APPLIQUEE"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : s.statutVeille === "QUALIFIEE"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                                : s.statutVeille === "PARAMETRAGE_EN_COURS"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                                : s.statutVeille === "SANS_IMPACT_LOGICIEL"
                                ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                            }`}
                          >
                            {s.statutVeille.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="Consulter le texte"
                              onClick={() => setViewingSource(s)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40 dark:hover:text-amber-400 transition"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              title="Qualifier la veille fiscale"
                              onClick={() => setQualifyingSource(s)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/40 dark:hover:text-purple-400 transition"
                            >
                              <ScrollLegalIcon className="h-4 w-4" />
                            </button>
                            <button
                              title="Modifier la source"
                              onClick={() => openEditSourceModal(s)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              title="Supprimer la source"
                              onClick={() => handleDeleteSource(s)}
                              disabled={actionLoading}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                            >
                              <TrashBinIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ======================================================== */}
          {/* SOUS-MENU 2 : BARÈMES FISCAUX ACTIFS                    */}
          {/* ======================================================== */}
          {activeTab === "BAREMES" && (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left">Impôt</th>
                    <th className="px-4 py-3 text-left">Libellé Barème</th>
                    <th className="px-4 py-3 text-center">Taux Défaut</th>
                    <th className="px-4 py-3 text-left">Source Légale</th>
                    <th className="px-4 py-3 text-left">Validité</th>
                    <th className="px-4 py-3 text-center">Statut</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800/60">
                  {filteredBaremes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        Aucun barème fiscal actif ne correspond aux critères de recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredBaremes.map((b) => (
                      <tr key={b.id} className="hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition">
                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          <span className="font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                            {b.taxType?.code || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">
                          <div>{b.libelle}</div>
                          {b.secteurActivite && (
                            <span className="text-[10px] text-gray-500">Secteur : {b.secteurActivite}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          {b.tauxDefaut !== undefined && b.tauxDefaut !== null ? `${b.tauxDefaut}%` : "Tranches"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-[11px] whitespace-nowrap">
                          {b.sourceReglementaire?.reference || "CGI 2026"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {b.dateDebutValidite ? new Date(b.dateDebutValidite).toLocaleDateString("fr-FR") : "—"}
                          {b.dateFinValidite ? ` → ${new Date(b.dateFinValidite).toLocaleDateString("fr-FR")}` : ""}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.statut === "ACTIF"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : b.statut === "BROUILLON"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {b.statut}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="Consulter le barème & les tranches"
                              onClick={() => setViewingBareme(b)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40 dark:hover:text-amber-400 transition"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {b.statut === "BROUILLON" && (
                              <button
                                title="Approuver & Activer (EF-008)"
                                onClick={() => handleValiderBareme(b.id)}
                                disabled={actionLoading}
                                className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 transition"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              title="Dupliquer le barème pour un nouvel exercice"
                              onClick={() => handleDuplicateBareme(b)}
                              disabled={actionLoading}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 transition"
                            >
                              <CopyIcon className="h-4 w-4" />
                            </button>
                            <button
                              title="Modifier le barème"
                              onClick={() => openEditBaremeModal(b)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              title="Supprimer le barème"
                              onClick={() => handleDeleteBareme(b)}
                              disabled={actionLoading}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                            >
                              <TrashBinIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ======================================================== */}
          {/* SOUS-MENU 3 : PARAMÈTRES FISCAUX PAYS                    */}
          {/* ======================================================== */}
          {activeTab === "PARAMETRES" && (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left">Code Paramètre</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-center">Type</th>
                    <th className="px-4 py-3 text-right">Valeur Actuelle</th>
                    <th className="px-4 py-3 text-left">Source Légale</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800/60">
                  {filteredParametres.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        Aucun paramètre fiscal pays ne correspond à la sélection.
                      </td>
                    </tr>
                  ) : (
                    filteredParametres.map((p) => (
                      <tr key={p.id} className="hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition">
                        <td className="px-4 py-3 font-mono font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                          {p.codeParametre || p.code}
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">
                          {p.libelle}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-500 whitespace-nowrap">
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-[10px] font-mono">
                            {p.typeValeur || "NUMERIQUE"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          {p.valeurNumerique !== null && p.valeurNumerique !== undefined
                            ? `${p.valeurNumerique.toLocaleString("fr-FR")} ${p.unite || ""}`
                            : `${p.valeur || p.valeurTexte || "—"} ${p.unite || ""}`}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-[11px] whitespace-nowrap">
                          {p.sourceReglementaire?.reference || "CGI Bénin 2026"}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="Consulter le paramètre"
                              onClick={() => setViewingParametre(p)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40 dark:hover:text-amber-400 transition"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              title="Modifier la valeur"
                              onClick={() => openEditParametreModal(p)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              title="Supprimer le paramètre"
                              onClick={() => handleDeleteParametre(p)}
                              disabled={actionLoading}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                            >
                              <TrashBinIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ======================================================== */}
          {/* SOUS-MENU 4 : RÉGIMES D'IMPOSITION                       */}
          {/* ======================================================== */}
          {activeTab === "REGIMES" && (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left">Code Régime</th>
                    <th className="px-4 py-3 text-left">Libellé</th>
                    <th className="px-4 py-3 text-right">Seuil CA Max</th>
                    <th className="px-4 py-3 text-left">Obligation Comptable</th>
                    <th className="px-4 py-3 text-left">Validité</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800/60">
                  {filteredRegimes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        Aucun régime d'imposition enregistré.
                      </td>
                    </tr>
                  ) : (
                    filteredRegimes.map((r) => (
                      <tr key={r.id} className="hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition">
                        <td className="px-4 py-3 font-mono font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                          {r.code}
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">
                          {r.libelle}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          {r.seuilChiffreAffairesMax
                            ? `${r.seuilChiffreAffairesMax.toLocaleString("fr-FR")} FCFA`
                            : "Illimité"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {r.obligationComptable.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {r.dateDebutValidite ? new Date(r.dateDebutValidite).toLocaleDateString("fr-FR") : "—"}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="Consulter le régime"
                              onClick={() => setViewingRegime(r)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40 dark:hover:text-amber-400 transition"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              title="Modifier le régime"
                              onClick={() => openEditRegimeModal(r)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              title="Supprimer le régime"
                              onClick={() => handleDeleteRegime(r)}
                              disabled={actionLoading}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                            >
                              <TrashBinIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ======================================================== */}
      {/* MODAL : CRÉER / MODIFIER SOURCE RÉGLEMENTAIRE            */}
      {/* ======================================================== */}
      {(showAddSource || editingSource) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ScrollLegalIcon className="h-5 w-5 text-amber-600" />
                <span>{editingSource ? "Modifier la source réglementaire" : "Enregistrer une source légale / circulaire"}</span>
              </h3>
              <button
                onClick={() => {
                  setShowAddSource(false);
                  setEditingSource(null);
                  clearFormError();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSource} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Type de source *
                  </label>
                  <select
                    value={sourceForm.typeSource}
                    onChange={(e) => setSourceForm({ ...sourceForm, typeSource: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="CIRCULAIRE">Circulaire DGI</option>
                    <option value="NOTE_ADMINISTRATIVE">Note de service / Administrative</option>
                    <option value="ARRETE">Arrêté Ministériel</option>
                    <option value="LOI_FINANCES">Loi de finances</option>
                    <option value="CODE_GENERAL_IMPOTS">Code Général des Impôts</option>
                    <option value="DECISION_JUSTICE">Décision de justice</option>
                    <option value="AUTRE">Autre source légale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Référence formelle *
                  </label>
                  <input
                    type="text"
                    value={sourceForm.reference}
                    onChange={(e) => setSourceForm({ ...sourceForm, reference: e.target.value })}
                    placeholder="Ex: Circulaire N°008/2026/DGI"
                    required
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Titre &amp; Objet du texte *
                </label>
                <input
                  type="text"
                  value={sourceForm.titre}
                  onChange={(e) => setSourceForm({ ...sourceForm, titre: e.target.value })}
                  placeholder="Intitulé officiel ou résumé thématique"
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Date de publication *
                  </label>
                  <input
                    type="date"
                    value={sourceForm.datePublication}
                    onChange={(e) => setSourceForm({ ...sourceForm, datePublication: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Entrée en vigueur *
                  </label>
                  <input
                    type="date"
                    value={sourceForm.dateEntreeVigueur}
                    onChange={(e) => setSourceForm({ ...sourceForm, dateEntreeVigueur: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {editingSource && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Statut de veille
                  </label>
                  <select
                    value={sourceForm.statutVeille}
                    onChange={(e) => setSourceForm({ ...sourceForm, statutVeille: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="A_QUALIFIER">À Qualifier</option>
                    <option value="QUALIFIEE">Qualifiée</option>
                    <option value="PARAMETRAGE_EN_COURS">Paramétrage en cours</option>
                    <option value="APPLIQUEE">Appliquée</option>
                    <option value="SANS_IMPACT_LOGICIEL">Sans impact logiciel</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Résumé analytique &amp; Impacts fiscaux
                </label>
                <textarea
                  value={sourceForm.resume}
                  onChange={(e) => setSourceForm({ ...sourceForm, resume: e.target.value })}
                  rows={3}
                  placeholder="Points clés, articles modifiés, impacts sur la TVA, retenues ou IS..."
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <FormErrorAlert error={formError} onClose={clearFormError} />

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSource(false);
                    setEditingSource(null);
                    clearFormError();
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 shadow-sm disabled:opacity-60"
                >
                  {actionLoading ? "Enregistrement..." : editingSource ? "Mettre à jour la source" : "Enregistrer la Source"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL : QUALIFIER SOURCE DE VEILLE                       */}
      {/* ======================================================== */}
      {qualifyingSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
              Qualifier la Veille Réglementaire
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Texte : <span className="font-mono font-bold text-amber-600">{qualifyingSource.reference}</span> — {qualifyingSource.titre}
            </p>

            <div className="space-y-2 mb-4">
              {[
                { key: "QUALIFIEE", label: "Qualifiée (Impact identifié)", desc: "Des règles de calcul ou barèmes doivent être ajustés." },
                { key: "PARAMETRAGE_EN_COURS", label: "Paramétrage en cours", desc: "Configuration des barèmes ou taux en cours." },
                { key: "APPLIQUEE", label: "Appliquée", desc: "Les changements légaux sont déployés et actifs." },
                { key: "SANS_IMPACT_LOGICIEL", label: "Sans impact logiciel", desc: "Mesure administrative sans incidence sur les calculs." },
                { key: "A_QUALIFIER", label: "Remettre à qualifier", desc: "Nécessite une analyse fiscale complémentaire." },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleApplyQualification(qualifyingSource.id, opt.key)}
                  disabled={actionLoading}
                  className={`w-full text-left p-3 rounded-xl border transition flex flex-col ${
                    qualifyingSource.statutVeille === opt.key
                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500"
                  }`}
                >
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{opt.label}</span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setQualifyingSource(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL : VOIR SOURCE EN DÉTAIL                            */}
      {/* ======================================================== */}
      {viewingSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                  {viewingSource.reference}
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                  {viewingSource.titre}
                </h3>
              </div>
              <button
                onClick={() => setViewingSource(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Type de source</span>
                <span className="font-semibold text-gray-900 dark:text-white">{viewingSource.typeSource}</span>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Statut veille</span>
                <span className="font-bold text-amber-600">{viewingSource.statutVeille.replace(/_/g, " ")}</span>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Date publication</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {viewingSource.datePublication ? new Date(viewingSource.datePublication).toLocaleDateString("fr-FR") : "—"}
                </span>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Date entrée en vigueur</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {viewingSource.dateEntreeVigueur ? new Date(viewingSource.dateEntreeVigueur).toLocaleDateString("fr-FR") : "—"}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3 text-xs">
              <span className="text-gray-500 dark:text-gray-400 block text-[11px] mb-1">Résumé &amp; Portée</span>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                {viewingSource.resume || "Aucun résumé renseigné pour ce texte."}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  const s = viewingSource;
                  setViewingSource(null);
                  openEditSourceModal(s);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => setViewingSource(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL : CRÉER / MODIFIER BARÈME FISCAL                   */}
      {/* ======================================================== */}
      {(showAddBareme || editingBareme) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {editingBareme ? "Modifier le barème fiscal" : "Nouveau barème fiscal versionné"}
              </h3>
              <button
                onClick={() => {
                  setShowAddBareme(false);
                  setEditingBareme(null);
                  clearFormError();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBareme} className="space-y-3.5">
              {!editingBareme && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Type d'Impôt *
                    </label>
                    <select
                      value={baremeForm.taxTypeId}
                      onChange={(e) => setBaremeForm({ ...baremeForm, taxTypeId: e.target.value })}
                      required
                      className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="">Sélectionner un impôt</option>
                      {types.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.code} — {t.libelle}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Source Réglementaire *
                    </label>
                    <select
                      value={baremeForm.sourceReglementaireId}
                      onChange={(e) => setBaremeForm({ ...baremeForm, sourceReglementaireId: e.target.value })}
                      required
                      className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="">Sélectionner une source</option>
                      {sources.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.reference}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Libellé du Barème *
                </label>
                <input
                  type="text"
                  value={baremeForm.libelle}
                  onChange={(e) => setBaremeForm({ ...baremeForm, libelle: e.target.value })}
                  placeholder="Ex: Barème IS Bénin 2026 — Secteur industriel"
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Secteur d'Activité
                  </label>
                  <input
                    type="text"
                    value={baremeForm.secteurActivite}
                    onChange={(e) => setBaremeForm({ ...baremeForm, secteurActivite: e.target.value })}
                    placeholder="industriel, commerce, services..."
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Taux par Défaut (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={baremeForm.tauxDefaut}
                    onChange={(e) => setBaremeForm({ ...baremeForm, tauxDefaut: Number(e.target.value) })}
                    required
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Date début validité *
                  </label>
                  <input
                    type="date"
                    value={baremeForm.dateDebutValidite}
                    onChange={(e) => setBaremeForm({ ...baremeForm, dateDebutValidite: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Date fin validité
                  </label>
                  <input
                    type="date"
                    value={baremeForm.dateFinValidite}
                    onChange={(e) => setBaremeForm({ ...baremeForm, dateFinValidite: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <FormErrorAlert error={formError} onClose={clearFormError} />

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBareme(false);
                    setEditingBareme(null);
                    clearFormError();
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 shadow-sm disabled:opacity-60"
                >
                  {actionLoading ? "Enregistrement..." : editingBareme ? "Mettre à jour" : "Créer le Barème"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL : VOIR BARÈME EN DÉTAIL                            */}
      {/* ======================================================== */}
      {viewingBareme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                  {viewingBareme.taxType?.code || "IMPÔT"}
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                  {viewingBareme.libelle}
                </h3>
              </div>
              <button
                onClick={() => setViewingBareme(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Taux par défaut</span>
                <span className="text-base font-bold text-gray-900 dark:text-white">
                  {viewingBareme.tauxDefaut !== undefined && viewingBareme.tauxDefaut !== null
                    ? `${viewingBareme.tauxDefaut}%`
                    : "Par tranches"}
                </span>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Statut</span>
                <span className="font-bold text-emerald-600">{viewingBareme.statut}</span>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Source légale</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">
                  {viewingBareme.sourceReglementaire?.reference || "CGI 2026"}
                </span>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Secteur d'activité</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {viewingBareme.secteurActivite || "Général / Tous"}
                </span>
              </div>
            </div>

            {/* Tranches si disponibles */}
            {viewingBareme.tranches && viewingBareme.tranches.length > 0 && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-xs">
                <span className="font-semibold text-gray-800 dark:text-gray-200 block mb-2">
                  Tranches Progressives ({viewingBareme.tranches.length})
                </span>
                <div className="space-y-1">
                  {viewingBareme.tranches.map((t) => (
                    <div key={t.id} className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800 text-[11px]">
                      <span>De {t.borneMin.toLocaleString("fr-FR")} à {t.borneMax ? t.borneMax.toLocaleString("fr-FR") : "∞"}</span>
                      <span className="font-bold">{t.taux !== undefined ? `${t.taux}%` : `${t.montantFixe} FCFA`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  const b = viewingBareme;
                  setViewingBareme(null);
                  openEditBaremeModal(b);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => setViewingBareme(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL : CRÉER / MODIFIER PARAMÈTRE PAYS                  */}
      {/* ======================================================== */}
      {(showAddParametre || editingParametre) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {editingParametre ? "Modifier le paramètre pays" : "Nouveau paramètre fiscal national"}
              </h3>
              <button
                onClick={() => {
                  setShowAddParametre(false);
                  setEditingParametre(null);
                  clearFormError();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveParametre} className="space-y-3.5">
              {!editingParametre && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Code Paramètre *
                  </label>
                  <input
                    type="text"
                    value={parametreForm.codeParametre}
                    onChange={(e) => setParametreForm({ ...parametreForm, codeParametre: e.target.value })}
                    placeholder="Ex: TAUX_PENALITE_RETARD_TVA"
                    required
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs uppercase font-mono dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description / Libellé *
                </label>
                <input
                  type="text"
                  value={parametreForm.libelle}
                  onChange={(e) => setParametreForm({ ...parametreForm, libelle: e.target.value })}
                  placeholder="Ex: Taux mensuel des pénalités de retard"
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Type de valeur *
                  </label>
                  <select
                    value={parametreForm.typeValeur}
                    onChange={(e) => setParametreForm({ ...parametreForm, typeValeur: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="NUMERIQUE">Numérique</option>
                    <option value="POURCENTAGE">Pourcentage</option>
                    <option value="TEXTE">Texte</option>
                    <option value="BOOLEEN">Booléen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Valeur *
                  </label>
                  <input
                    type="text"
                    value={parametreForm.valeur}
                    onChange={(e) => setParametreForm({ ...parametreForm, valeur: e.target.value })}
                    placeholder="50000000 ou 18..."
                    required
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Unité
                  </label>
                  <input
                    type="text"
                    value={parametreForm.unite}
                    onChange={(e) => setParametreForm({ ...parametreForm, unite: e.target.value })}
                    placeholder="FCFA, %, jours..."
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Source Réglementaire Rattachée
                </label>
                <select
                  value={parametreForm.sourceReglementaireId}
                  onChange={(e) => setParametreForm({ ...parametreForm, sourceReglementaireId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">CGI Bénin 2026 (Par défaut)</option>
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.reference} — {s.titre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Date début validité *
                  </label>
                  <input
                    type="date"
                    value={parametreForm.dateDebutValidite}
                    onChange={(e) => setParametreForm({ ...parametreForm, dateDebutValidite: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Date fin validité
                  </label>
                  <input
                    type="date"
                    value={parametreForm.dateFinValidite}
                    onChange={(e) => setParametreForm({ ...parametreForm, dateFinValidite: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <FormErrorAlert error={formError} onClose={clearFormError} />

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddParametre(false);
                    setEditingParametre(null);
                    clearFormError();
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 shadow-sm disabled:opacity-60"
                >
                  {actionLoading ? "Enregistrement..." : editingParametre ? "Mettre à jour" : "Créer le Paramètre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL : VOIR PARAMÈTRE EN DÉTAIL                         */}
      {/* ======================================================== */}
      {viewingParametre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                  {viewingParametre.codeParametre || viewingParametre.code}
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                  {viewingParametre.libelle}
                </h3>
              </div>
              <button
                onClick={() => setViewingParametre(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 p-4 text-center">
              <span className="text-xs text-amber-800 dark:text-amber-300 block mb-1">Valeur paramétrée</span>
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {viewingParametre.valeurNumerique !== null && viewingParametre.valeurNumerique !== undefined
                  ? `${viewingParametre.valeurNumerique.toLocaleString("fr-FR")} ${viewingParametre.unite || ""}`
                  : `${viewingParametre.valeur || viewingParametre.valeurTexte || "—"} ${viewingParametre.unite || ""}`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Type de valeur</span>
                <span className="font-semibold text-gray-900 dark:text-white">{viewingParametre.typeValeur || "NUMERIQUE"}</span>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Source légale</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {viewingParametre.sourceReglementaire?.reference || "CGI Bénin 2026"}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  const p = viewingParametre;
                  setViewingParametre(null);
                  openEditParametreModal(p);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => setViewingParametre(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL : CRÉER / MODIFIER RÉGIME D'IMPOSITION             */}
      {/* ======================================================== */}
      {(showAddRegime || editingRegime) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {editingRegime ? "Modifier le régime d'imposition" : "Nouveau régime d'imposition"}
              </h3>
              <button
                onClick={() => {
                  setShowAddRegime(false);
                  setEditingRegime(null);
                  clearFormError();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRegime} className="space-y-3.5">
              {!editingRegime && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Code Régime *
                  </label>
                  <input
                    type="text"
                    value={regimeForm.code}
                    onChange={(e) => setRegimeForm({ ...regimeForm, code: e.target.value })}
                    placeholder="Ex: RSI, RNI, TPS..."
                    required
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs uppercase font-mono dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Libellé du Régime *
                </label>
                <input
                  type="text"
                  value={regimeForm.libelle}
                  onChange={(e) => setRegimeForm({ ...regimeForm, libelle: e.target.value })}
                  placeholder="Ex: Régime Simplifié d'Imposition (RSI)"
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Seuil Chiffre d'Affaires Max (FCFA)
                  </label>
                  <input
                    type="number"
                    value={regimeForm.seuilChiffreAffairesMax}
                    onChange={(e) => setRegimeForm({ ...regimeForm, seuilChiffreAffairesMax: Number(e.target.value) })}
                    placeholder="50000000"
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Obligation Comptable *
                  </label>
                  <select
                    value={regimeForm.obligationComptable}
                    onChange={(e) => setRegimeForm({ ...regimeForm, obligationComptable: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="COMPTABILITE_COMPLETE">Comptabilité Complète (Système Normal)</option>
                    <option value="COMPTABILITE_SIMPLIFIEE">Comptabilité Simplifiée (Système Allégé)</option>
                    <option value="DECLARATION_FORFAITAIRE">Déclaration Forfaitaire / TPS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Date début validité *
                  </label>
                  <input
                    type="date"
                    value={regimeForm.dateDebutValidite}
                    onChange={(e) => setRegimeForm({ ...regimeForm, dateDebutValidite: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Date fin validité
                  </label>
                  <input
                    type="date"
                    value={regimeForm.dateFinValidite}
                    onChange={(e) => setRegimeForm({ ...regimeForm, dateFinValidite: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <FormErrorAlert error={formError} onClose={clearFormError} />

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddRegime(false);
                    setEditingRegime(null);
                    clearFormError();
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 shadow-sm disabled:opacity-60"
                >
                  {actionLoading ? "Enregistrement..." : editingRegime ? "Mettre à jour" : "Créer le Régime"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL : VOIR RÉGIME EN DÉTAIL                            */}
      {/* ======================================================== */}
      {viewingRegime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                  {viewingRegime.code}
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                  {viewingRegime.libelle}
                </h3>
              </div>
              <button
                onClick={() => setViewingRegime(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Seuil CA Max</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {viewingRegime.seuilChiffreAffairesMax
                    ? `${viewingRegime.seuilChiffreAffairesMax.toLocaleString("fr-FR")} FCFA`
                    : "Sans plafond"}
                </span>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Obligation Comptable</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {viewingRegime.obligationComptable.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  const r = viewingRegime;
                  setViewingRegime(null);
                  openEditRegimeModal(r);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => setViewingRegime(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
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
