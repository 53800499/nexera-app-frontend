"use client";

import React, { useEffect, useState } from "react";
import { rhApi } from "../services/rhApi.service";
import type {
  RhBaremeIts,
  RhBaremeItsTranche,
  RhTauxChargeSociale,
  RhBaremeAvantageNature,
  RhParametrePays,
  SimulationFiscalResult,
  RhItsCalculationMode,
  RhAssiettePeriodicity,
  RhAssietteType,
  RhSocialChargeShare,
  RhBenefitInKindType,
  RhCountryParamValueType,
} from "../types/rh.types";
import { Modal } from "@/components/ui/modal";
import { useActionFeedback, useToast } from "@/shared/components/feedback";
import {
  PlusIcon,
  PencilIcon,
  TrashBinIcon,
  CopyIcon,
  InfoIcon,
  CheckCircleIcon,
  CloseIcon,
  DollarLineIcon,
  PieChartIcon,
  BoltIcon,
  DocsIcon,
  TableIcon,
  BoxIcon,
} from "@/icons";

interface BaremesFiscauxParamViewProps {
  onRefreshParent?: () => void;
}

export const BaremesFiscauxParamView: React.FC<BaremesFiscauxParamViewProps> = ({
  onRefreshParent,
}) => {
  const { runAction } = useActionFeedback();
  const toast = useToast();

  const [activeSubTab, setActiveSubTab] = useState<
    "its" | "charges" | "avantages" | "parametres" | "simulateur"
  >("its");

  const [paysCode, setPaysCode] = useState<string>("BJ");
  const [includeExpired, setIncludeExpired] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Données
  const [baremesIts, setBaremesIts] = useState<RhBaremeIts[]>([]);
  const [chargesSociales, setChargesSociales] = useState<RhTauxChargeSociale[]>([]);
  const [avantagesNature, setAvantagesNature] = useState<RhBaremeAvantageNature[]>([]);
  const [parametresPays, setParametresPays] = useState<RhParametrePays[]>([]);

  // ---------------- MODALE BAREME ITS ----------------
  const [isBaremeModalOpen, setIsBaremeModalOpen] = useState(false);
  const [editingBaremeId, setEditingBaremeId] = useState<string | null>(null);
  const [baremeForm, setBaremeForm] = useState<{
    codeImpot: string;
    libelle: string;
    modeCalcul: RhItsCalculationMode;
    periodiciteAssiette: RhAssiettePeriodicity;
    dateDebutValidite: string;
    dateFinValidite: string;
  }>({
    codeImpot: "ITS",
    libelle: "",
    modeCalcul: "PROGRESSIF_PAR_TRANCHE",
    periodiciteAssiette: "MENSUELLE",
    dateDebutValidite: "2026-01-01",
    dateFinValidite: "",
  });

  // ---------------- MODALE DUPLICATION BAREME ----------------
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateTargetBareme, setDuplicateTargetBareme] = useState<RhBaremeIts | null>(null);
  const [duplicateForm, setDuplicateForm] = useState({
    nouveauLibelle: "",
    nouvelleDateDebut: "",
    nouvelleDateFin: "",
  });

  // ---------------- MODALE TRANCHE FISCALE ----------------
  const [isTrancheModalOpen, setIsTrancheModalOpen] = useState(false);
  const [targetBaremeForTranche, setTargetBaremeForTranche] = useState<string | null>(null);
  const [editingTrancheId, setEditingTrancheId] = useState<string | null>(null);
  const [trancheForm, setTrancheForm] = useState({
    numeroTranche: 1,
    limiteInferieure: 0,
    limiteSuperieure: 50000 as number | null,
    isIllimitee: false,
    taux: 0,
    montantDeductionFixe: 0,
  });

  // ---------------- MODALE CHARGE SOCIALE / VPS ----------------
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [editingChargeId, setEditingChargeId] = useState<string | null>(null);
  const [chargeForm, setChargeForm] = useState<{
    code: string;
    libelle: string;
    typeAssiette: RhAssietteType;
    partSalariale: RhSocialChargeShare;
    tauxSalarial: number;
    tauxPatronal: number;
    plafondMensuel: string | number;
    plancherMensuel: string | number;
    organismeCollecteur: string;
    dateDebutValidite: string;
    dateFinValidite: string;
    actif: boolean;
  }>({
    code: "",
    libelle: "",
    typeAssiette: "SALAIRE_BRUT",
    partSalariale: "PATRONALE",
    tauxSalarial: 0,
    tauxPatronal: 4.0,
    plafondMensuel: "",
    plancherMensuel: "",
    organismeCollecteur: "DGI Bénin",
    dateDebutValidite: "2026-01-01",
    dateFinValidite: "",
    actif: true,
  });

  // ---------------- MODALE AVANTAGE EN NATURE ----------------
  const [isAvantageModalOpen, setIsAvantageModalOpen] = useState(false);
  const [editingAvantageId, setEditingAvantageId] = useState<string | null>(null);
  const [avantageForm, setAvantageForm] = useState<{
    typeAvantage: RhBenefitInKindType;
    modeValeur: "POURCENTAGE" | "FORFAIT_FIXE";
    tauxPourcentage: number;
    montantFixe: number;
    description: string;
    dateDebutValidite: string;
    dateFinValidite: string;
  }>({
    typeAvantage: "LOGEMENT",
    modeValeur: "POURCENTAGE",
    tauxPourcentage: 15,
    montantFixe: 0,
    description: "",
    dateDebutValidite: "2026-01-01",
    dateFinValidite: "",
  });

  // ---------------- MODALE PARAMÈTRE PAYS ----------------
  const [isParamModalOpen, setIsParamModalOpen] = useState(false);
  const [editingParamId, setEditingParamId] = useState<string | null>(null);
  const [paramForm, setParamForm] = useState<{
    codeParametre: string;
    libelle: string;
    typeValeur: RhCountryParamValueType;
    valeurTexte: string;
    valeurNumerique: number;
    dateDebutValidite: string;
  }>({
    codeParametre: "",
    libelle: "",
    typeValeur: "NOMBRE",
    valeurTexte: "",
    valeurNumerique: 52000,
    dateDebutValidite: "2026-01-01",
  });

  // ---------------- ÉTAT SIMULATEUR FISCAL EN DIRECT ----------------
  const [simulBrut, setSimulBrut] = useState<number>(350000);
  const [simulBaremeId, setSimulBaremeId] = useState<string>("");
  const [simulMois, setSimulMois] = useState<number>(1);
  const [simulInclureCnss, setSimulInclureCnss] = useState<boolean>(true);
  const [simulInclureVps, setSimulInclureVps] = useState<boolean>(true);
  const [simulInclureOrtb, setSimulInclureOrtb] = useState<boolean>(true);
  const [simulTauxVps, setSimulTauxVps] = useState<number>(4.0);
  const [simulationResult, setSimulationResult] = useState<SimulationFiscalResult | null>(null);
  const [simulLoading, setSimulLoading] = useState<boolean>(false);

  // =========================================================================
  // CHARGEMENT INITIAL DES DONNÉES
  // =========================================================================
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [barsRes, chargesRes, avsRes, paramsRes] = await Promise.allSettled([
        rhApi.listTaxBrackets(paysCode, includeExpired),
        rhApi.listSocialCharges(paysCode, true),
        rhApi.listAvantagesNature(paysCode),
        rhApi.listCountryParams(paysCode),
      ]);

      const bars = barsRes.status === "fulfilled" ? barsRes.value : [];
      const charges = chargesRes.status === "fulfilled" ? chargesRes.value : [];
      const avs = avsRes.status === "fulfilled" ? avsRes.value : [];
      const params = paramsRes.status === "fulfilled" ? paramsRes.value : [];

      setBaremesIts(Array.isArray(bars) ? bars : []);
      setChargesSociales(Array.isArray(charges) ? charges : []);
      setAvantagesNature(Array.isArray(avs) ? avs : []);
      setParametresPays(Array.isArray(params) ? params : []);

      if (bars.length > 0 && !simulBaremeId) {
        setSimulBaremeId(bars[0].id);
      }
    } catch (err: any) {
      console.warn("Erreur chargement référentiel barèmes:", err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [paysCode, includeExpired]);

  // Déclencher simulation automatique à la saisie
  useEffect(() => {
    if (activeSubTab === "simulateur" && simulBrut > 0) {
      handleRunSimulation();
    }
  }, [
    simulBrut,
    simulBaremeId,
    simulMois,
    simulInclureCnss,
    simulInclureVps,
    simulInclureOrtb,
    simulTauxVps,
    activeSubTab,
  ]);

  // =========================================================================
  // HANDLERS BAREME ITS
  // =========================================================================
  const openCreateBaremeModal = () => {
    setEditingBaremeId(null);
    setBaremeForm({
      codeImpot: "ITS",
      libelle: `Barème Progressif ITS Bénin ${new Date().getFullYear()} (CGI Art. 125)`,
      modeCalcul: "PROGRESSIF_PAR_TRANCHE",
      periodiciteAssiette: "MENSUELLE",
      dateDebutValidite: `${new Date().getFullYear()}-01-01`,
      dateFinValidite: "",
    });
    setIsBaremeModalOpen(true);
  };

  const openEditBaremeModal = (b: RhBaremeIts) => {
    setEditingBaremeId(b.id);
    setBaremeForm({
      codeImpot: b.codeImpot,
      libelle: b.libelle,
      modeCalcul: b.modeCalcul,
      periodiciteAssiette: b.periodiciteAssiette,
      dateDebutValidite: b.dateDebutValidite ? b.dateDebutValidite.substring(0, 10) : "",
      dateFinValidite: b.dateFinValidite ? b.dateFinValidite.substring(0, 10) : "",
    });
    setIsBaremeModalOpen(true);
  };

  const handleSaveBareme = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingBaremeId;
    await runAction({
      loadingMessage: isEdit ? "Modification du barème..." : "Création du barème fiscal...",
      success: {
        title: isEdit ? "Barème modifié" : "Barème ITS créé",
        message: `${baremeForm.libelle} enregistré avec succès.`,
      },
      error: {
        title: "Erreur",
        message: "Impossible d'enregistrer le barème fiscal.",
      },
      action: async () => {
        const payload: any = {
          codeImpot: baremeForm.codeImpot.trim().toUpperCase(),
          libelle: baremeForm.libelle.trim(),
          modeCalcul: baremeForm.modeCalcul,
          periodiciteAssiette: baremeForm.periodiciteAssiette,
          dateDebutValidite: new Date(baremeForm.dateDebutValidite).toISOString(),
          dateFinValidite: baremeForm.dateFinValidite
            ? new Date(baremeForm.dateFinValidite).toISOString()
            : null,
        };

        if (isEdit) {
          await rhApi.updateBaremeIts(editingBaremeId!, payload);
        } else {
          payload.paysCode = paysCode;
          await rhApi.createBaremeIts(payload);
        }
        setIsBaremeModalOpen(false);
        await loadAllData();
        onRefreshParent?.();
      },
    });
  };

  const handleDeleteBareme = async (b: RhBaremeIts) => {
    await runAction({
      confirm: {
        title: `Supprimer le barème ${b.libelle} ?`,
        message:
          "Attention : la suppression supprimera également toutes les tranches associées. Assurez-vous qu'aucune paie en cours n'utilise ce barème.",
        confirmLabel: "Supprimer définitivement",
        variant: "danger",
      },
      loadingMessage: "Suppression du barème...",
      success: {
        title: "Barème supprimé",
        message: "Le barème et ses tranches ont été supprimés.",
      },
      error: { title: "Erreur", message: "Impossible de supprimer ce barème." },
      action: async () => {
        await rhApi.deleteBaremeIts(b.id);
        await loadAllData();
        onRefreshParent?.();
      },
    });
  };

  // --- DUPLICATION BAREME ---
  const openDuplicateModal = (b: RhBaremeIts) => {
    setDuplicateTargetBareme(b);
    const nextYear = new Date().getFullYear() + 1;
    setDuplicateForm({
      nouveauLibelle: `${b.libelle.replace(/\d{4}/, String(nextYear))}`,
      nouvelleDateDebut: `${nextYear}-01-01`,
      nouvelleDateFin: `${nextYear}-12-31`,
    });
    setIsDuplicateModalOpen(true);
  };

  const handleDuplicateBareme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicateTargetBareme) return;
    await runAction({
      loadingMessage: "Duplication du barème fiscal et de ses tranches...",
      success: {
        title: "Barème dupliqué",
        message: `Le nouveau barème pour ${duplicateForm.nouvelleDateDebut} est actif.`,
      },
      error: { title: "Erreur", message: "Impossible de dupliquer le barème." },
      action: async () => {
        await rhApi.duplicateBaremeIts(duplicateTargetBareme.id, {
          nouveauLibelle: duplicateForm.nouveauLibelle.trim(),
          nouvelleDateDebut: new Date(duplicateForm.nouvelleDateDebut).toISOString(),
          nouvelleDateFin: duplicateForm.nouvelleDateFin
            ? new Date(duplicateForm.nouvelleDateFin).toISOString()
            : undefined,
        });
        setIsDuplicateModalOpen(false);
        await loadAllData();
        onRefreshParent?.();
      },
    });
  };

  // --- TRANCHES FISCALES ---
  const openAddTrancheModal = (baremeId: string) => {
    setTargetBaremeForTranche(baremeId);
    setEditingTrancheId(null);
    const bareme = baremesIts.find((b) => b.id === baremeId);
    const tranches = bareme?.tranches || [];
    const nextNum = tranches.length > 0 ? Math.max(...tranches.map((t) => t.numeroTranche)) + 1 : 1;
    const lastSup = tranches.length > 0 ? tranches[tranches.length - 1].limiteSuperieure || 0 : 0;

    setTrancheForm({
      numeroTranche: nextNum,
      limiteInferieure: lastSup ? lastSup + 1 : 0,
      limiteSuperieure: lastSup ? lastSup + 100000 : 50000,
      isIllimitee: false,
      taux: 10,
      montantDeductionFixe: 0,
    });
    setIsTrancheModalOpen(true);
  };

  const openEditTrancheModal = (baremeId: string, t: RhBaremeItsTranche) => {
    setTargetBaremeForTranche(baremeId);
    setEditingTrancheId(t.id);
    setTrancheForm({
      numeroTranche: t.numeroTranche,
      limiteInferieure: t.limiteInferieure,
      limiteSuperieure: t.limiteSuperieure,
      isIllimitee: t.limiteSuperieure === null,
      taux: t.taux,
      montantDeductionFixe: t.montantDeductionFixe || 0,
    });
    setIsTrancheModalOpen(true);
  };

  const handleSaveTranche = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBaremeForTranche) return;
    const isEdit = !!editingTrancheId;

    await runAction({
      loadingMessage: isEdit ? "Modification de la tranche..." : "Ajout de la tranche fiscale...",
      success: {
        title: isEdit ? "Tranche modifiée" : "Tranche fiscale ajoutée",
        message: `Tranche ${trancheForm.numeroTranche} enregistrée avec succès.`,
      },
      error: { title: "Erreur", message: "Impossible d'enregistrer la tranche fiscale." },
      action: async () => {
        const payload = {
          numeroTranche: Number(trancheForm.numeroTranche),
          limiteInferieure: Number(trancheForm.limiteInferieure),
          limiteSuperieure: trancheForm.isIllimitee ? null : Number(trancheForm.limiteSuperieure),
          taux: Number(trancheForm.taux),
          montantDeductionFixe: Number(trancheForm.montantDeductionFixe) || 0,
        };

        if (isEdit) {
          await rhApi.updateBaremeTranche(editingTrancheId!, payload);
        } else {
          await rhApi.addBaremeTranche(targetBaremeForTranche, payload);
        }
        setIsTrancheModalOpen(false);
        await loadAllData();
        onRefreshParent?.();
      },
    });
  };

  const handleDeleteTranche = async (t: RhBaremeItsTranche) => {
    await runAction({
      confirm: {
        title: `Supprimer la tranche n°${t.numeroTranche} ?`,
        message: "Cette suppression affectera le calcul progressif de l'ITS.",
        confirmLabel: "Supprimer",
        variant: "danger",
      },
      loadingMessage: "Suppression de la tranche...",
      success: { title: "Tranche supprimée", message: `Tranche ${t.numeroTranche} supprimée.` },
      error: { title: "Erreur", message: "Impossible de supprimer la tranche." },
      action: async () => {
        await rhApi.deleteBaremeTranche(t.id);
        await loadAllData();
        onRefreshParent?.();
      },
    });
  };

  // =========================================================================
  // HANDLERS CHARGES SOCIALES & PATRONALES
  // =========================================================================
  const openCreateChargeModal = () => {
    setEditingChargeId(null);
    setChargeForm({
      code: "VPS_PATRONAL",
      libelle: "Versement Patronal sur Salaires (VPS 4% CGI 2026)",
      typeAssiette: "SALAIRE_BRUT",
      partSalariale: "PATRONALE",
      tauxSalarial: 0,
      tauxPatronal: 4.0,
      plafondMensuel: "",
      plancherMensuel: "",
      organismeCollecteur: "DGI Bénin",
      dateDebutValidite: "2026-01-01",
      dateFinValidite: "",
      actif: true,
    });
    setIsChargeModalOpen(true);
  };

  const openEditChargeModal = (c: RhTauxChargeSociale) => {
    setEditingChargeId(c.id);
    setChargeForm({
      code: c.code,
      libelle: c.libelle,
      typeAssiette: c.typeAssiette,
      partSalariale: c.partSalariale,
      tauxSalarial: c.tauxSalarial,
      tauxPatronal: c.tauxPatronal,
      plafondMensuel: c.plafondMensuel || "",
      plancherMensuel: c.plancherMensuel || "",
      organismeCollecteur: c.organismeCollecteur || "",
      dateDebutValidite: c.dateDebutValidite ? c.dateDebutValidite.substring(0, 10) : "",
      dateFinValidite: c.dateFinValidite ? c.dateFinValidite.substring(0, 10) : "",
      actif: c.actif,
    });
    setIsChargeModalOpen(true);
  };

  const handleSaveCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingChargeId;

    await runAction({
      loadingMessage: isEdit ? "Modification de la cotisation..." : "Création de la cotisation...",
      success: {
        title: isEdit ? "Cotisation modifiée" : "Cotisation créée",
        message: `${chargeForm.libelle} enregistrée avec succès.`,
      },
      error: { title: "Erreur", message: "Impossible d'enregistrer la cotisation sociale/fiscale." },
      action: async () => {
        const payload: any = {
          code: chargeForm.code.trim().toUpperCase(),
          libelle: chargeForm.libelle.trim(),
          typeAssiette: chargeForm.typeAssiette,
          partSalariale: chargeForm.partSalariale,
          tauxSalarial: Number(chargeForm.tauxSalarial) || 0,
          tauxPatronal: Number(chargeForm.tauxPatronal) || 0,
          plafondMensuel: chargeForm.plafondMensuel !== "" ? Number(chargeForm.plafondMensuel) : null,
          plancherMensuel: chargeForm.plancherMensuel !== "" ? Number(chargeForm.plancherMensuel) : null,
          organismeCollecteur: chargeForm.organismeCollecteur.trim() || undefined,
          dateDebutValidite: new Date(chargeForm.dateDebutValidite).toISOString(),
          dateFinValidite: chargeForm.dateFinValidite
            ? new Date(chargeForm.dateFinValidite).toISOString()
            : null,
          actif: chargeForm.actif,
        };

        if (isEdit) {
          await rhApi.updateSocialCharge(editingChargeId!, payload);
        } else {
          payload.paysCode = paysCode;
          await rhApi.createSocialCharge(payload);
        }
        setIsChargeModalOpen(false);
        await loadAllData();
        onRefreshParent?.();
      },
    });
  };

  const handleDeleteCharge = async (c: RhTauxChargeSociale) => {
    await runAction({
      confirm: {
        title: `Supprimer la cotisation ${c.libelle} ?`,
        message: "Attention : cette règle ne sera plus appliquée aux nouveaux cycles de paie.",
        confirmLabel: "Supprimer",
        variant: "danger",
      },
      loadingMessage: "Suppression de la cotisation...",
      success: { title: "Cotisation supprimée", message: `${c.code} a été supprimée.` },
      error: { title: "Erreur", message: "Impossible de supprimer la cotisation." },
      action: async () => {
        await rhApi.deleteSocialCharge(c.id);
        await loadAllData();
        onRefreshParent?.();
      },
    });
  };

  // =========================================================================
  // HANDLERS AVANTAGES EN NATURE
  // =========================================================================
  const openCreateAvantageModal = () => {
    setEditingAvantageId(null);
    setAvantageForm({
      typeAvantage: "LOGEMENT",
      modeValeur: "POURCENTAGE",
      tauxPourcentage: 15,
      montantFixe: 0,
      description: "Logement de fonction (15 % du salaire de base)",
      dateDebutValidite: "2026-01-01",
      dateFinValidite: "",
    });
    setIsAvantageModalOpen(true);
  };

  const openEditAvantageModal = (av: RhBaremeAvantageNature) => {
    setEditingAvantageId(av.id);
    const hasTaux = av.tauxPourcentage !== null && av.tauxPourcentage !== undefined && av.tauxPourcentage > 0;
    setAvantageForm({
      typeAvantage: av.typeAvantage,
      modeValeur: hasTaux ? "POURCENTAGE" : "FORFAIT_FIXE",
      tauxPourcentage: av.tauxPourcentage || 0,
      montantFixe: av.montantFixe || 0,
      description: av.description || "",
      dateDebutValidite: av.dateDebutValidite ? av.dateDebutValidite.substring(0, 10) : "",
      dateFinValidite: av.dateFinValidite ? av.dateFinValidite.substring(0, 10) : "",
    });
    setIsAvantageModalOpen(true);
  };

  const handleSaveAvantage = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingAvantageId;

    await runAction({
      loadingMessage: isEdit ? "Modification de l'avantage..." : "Création de la règle d'avantage...",
      success: {
        title: isEdit ? "Avantage modifié" : "Avantage en nature créé",
        message: "Règle forfaitaire enregistrée.",
      },
      error: { title: "Erreur", message: "Impossible d'enregistrer l'avantage en nature." },
      action: async () => {
        const isPourcent = avantageForm.modeValeur === "POURCENTAGE";
        const payload: any = {
          typeAvantage: avantageForm.typeAvantage,
          tauxPourcentage: isPourcent ? Number(avantageForm.tauxPourcentage) : null,
          montantFixe: !isPourcent ? Number(avantageForm.montantFixe) : null,
          description: avantageForm.description.trim() || undefined,
          dateDebutValidite: new Date(avantageForm.dateDebutValidite).toISOString(),
          dateFinValidite: avantageForm.dateFinValidite
            ? new Date(avantageForm.dateFinValidite).toISOString()
            : null,
        };

        if (isEdit) {
          await rhApi.updateAvantageNature(editingAvantageId!, payload);
        } else {
          payload.paysCode = paysCode;
          await rhApi.createAvantageNature(payload);
        }
        setIsAvantageModalOpen(false);
        await loadAllData();
        onRefreshParent?.();
      },
    });
  };

  const handleDeleteAvantage = async (av: RhBaremeAvantageNature) => {
    await runAction({
      confirm: {
        title: "Supprimer cette évaluation d'avantage en nature ?",
        message: "L'évaluation forfaitaire sera retirée du référentiel.",
        confirmLabel: "Supprimer",
        variant: "danger",
      },
      loadingMessage: "Suppression en cours...",
      success: { title: "Supprimé", message: "Avantage en nature supprimé." },
      error: { title: "Erreur", message: "Impossible de supprimer." },
      action: async () => {
        await rhApi.deleteAvantageNature(av.id);
        await loadAllData();
        onRefreshParent?.();
      },
    });
  };

  // =========================================================================
  // HANDLERS PARAMÈTRES PAYS
  // =========================================================================
  const openCreateParamModal = () => {
    setEditingParamId(null);
    setParamForm({
      codeParametre: "SMIG_MENSUEL",
      libelle: "Salaire Minimum Interprofessionnel Garanti (SMIG)",
      typeValeur: "NOMBRE",
      valeurTexte: "",
      valeurNumerique: 52000,
      dateDebutValidite: "2026-01-01",
    });
    setIsParamModalOpen(true);
  };

  const openEditParamModal = (p: RhParametrePays) => {
    setEditingParamId(p.id);
    setParamForm({
      codeParametre: p.codeParametre,
      libelle: p.libelle,
      typeValeur: p.typeValeur,
      valeurTexte: p.valeurTexte || "",
      valeurNumerique: p.valeurNumerique || 0,
      dateDebutValidite: p.dateDebutValidite ? p.dateDebutValidite.substring(0, 10) : "",
    });
    setIsParamModalOpen(true);
  };

  const handleSaveParam = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingParamId;

    await runAction({
      loadingMessage: isEdit ? "Modification du paramètre..." : "Création du paramètre légal...",
      success: {
        title: isEdit ? "Paramètre modifié" : "Paramètre créé",
        message: `${paramForm.libelle} enregistré.`,
      },
      error: { title: "Erreur", message: "Impossible d'enregistrer le paramètre légal." },
      action: async () => {
        const payload: any = {
          codeParametre: paramForm.codeParametre.trim().toUpperCase(),
          libelle: paramForm.libelle.trim(),
          typeValeur: paramForm.typeValeur,
          valeurTexte: paramForm.typeValeur === "TEXTE" ? paramForm.valeurTexte : undefined,
          valeurNumerique: paramForm.typeValeur === "NOMBRE" ? Number(paramForm.valeurNumerique) : undefined,
          dateDebutValidite: new Date(paramForm.dateDebutValidite).toISOString(),
        };

        if (isEdit) {
          await rhApi.updateCountryParam(editingParamId!, payload);
        } else {
          payload.paysCode = paysCode;
          await rhApi.createCountryParam(payload);
        }
        setIsParamModalOpen(false);
        await loadAllData();
        onRefreshParent?.();
      },
    });
  };

  const handleDeleteParam = async (p: RhParametrePays) => {
    await runAction({
      confirm: {
        title: `Supprimer le paramètre ${p.libelle} ?`,
        message: "Cette règle légale ne sera plus disponible dans les modules RH.",
        confirmLabel: "Supprimer",
        variant: "danger",
      },
      loadingMessage: "Suppression du paramètre...",
      success: { title: "Paramètre supprimé", message: `${p.codeParametre} supprimé.` },
      error: { title: "Erreur", message: "Impossible de supprimer ce paramètre." },
      action: async () => {
        await rhApi.deleteCountryParam(p.id);
        await loadAllData();
        onRefreshParent?.();
      },
    });
  };

  // =========================================================================
  // HANDLER SIMULATION FISCALE
  // =========================================================================
  const handleRunSimulation = async () => {
    if (simulBrut <= 0) return;
    try {
      setSimulLoading(true);
      const res = await rhApi.simulateFiscalCalculation({
        salaireBrut: simulBrut,
        baremeItsId: simulBaremeId || undefined,
        paysCode,
        mois: simulMois,
        inclureCnss: simulInclureCnss,
        inclureVps: simulInclureVps,
        inclureOrtb: simulInclureOrtb,
        tauxVps: simulTauxVps,
      });
      setSimulationResult(res);
    } catch (err: any) {
      console.warn("Erreur simulation:", err?.message || err);
    } finally {
      setSimulLoading(false);
    }
  };

  // =========================================================================
  // FORMATTEURS
  // =========================================================================
  const formatMoney = (val?: number | null) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Number(val) || 0);

  const formatNumber = (val?: number | null) =>
    new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(Number(val) || 0);

  const getTrancheColorBadge = (num: number) => {
    const colors = [
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200",
      "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200",
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200",
      "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200",
      "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200",
      "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200",
    ];
    return colors[(num - 1) % colors.length];
  };

  const getAvantageLabel = (type: string) => {
    switch (type) {
      case "LOGEMENT":
        return "Logement de fonction";
      case "DOMESTIQUE":
        return "Personnel domestique";
      case "EAU_ELECTRICITE":
        return "Eau & Électricité";
      case "TELEPHONE":
        return "Téléphone & Internet";
      case "NOURRITURE":
        return "Nourriture & Repas";
      case "VEHICULE":
        return "Véhicule professionnel";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. CARTOUCHE D'EN-TÊTE FISCALE */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
            <DollarLineIcon className="h-6 w-6 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Barèmes Fiscaux &amp; Cotisations Sociales RH
              </h2>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                CGI 2026 Conforme
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Paramétrage dynamique multi-pays de l'ITS progressif, des cotisations CNSS, du VPS et simulateur temps réel.
            </p>
          </div>
        </div>

        {/* Sélecteur Pays & Options */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-300">
            <span className="text-base">🇧🇯</span>
            <span>Bénin (XOF)</span>
          </div>

          <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={includeExpired}
              onChange={(e) => setIncludeExpired(e.target.checked)}
              className="h-4 w-4 rounded-sm border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
            />
            <span>Historique archivé</span>
          </label>

          <button
            onClick={loadAllData}
            className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
            title="Rafraîchir les barèmes"
          >
            Actualiser
          </button>
        </div>
      </div>

      {/* 2. SOUS-ONGLETS DE NAVIGATION FISCALE */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {[
            { id: "its", label: "1. Barèmes ITS Progressifs", count: baremesIts.length },
            { id: "charges", label: "2. Cotisations Sociales & VPS", count: chargesSociales.length },
            { id: "avantages", label: "3. Avantages en Nature (Art. 123)", count: avantagesNature.length },
            { id: "parametres", label: "4. Paramètres & SMIG", count: parametresPays.length },
            { id: "simulateur", label: "5. Simulateur Fiscal en Direct", badge: "Live" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`whitespace-nowrap border-b-2 py-3 px-1 text-xs font-semibold transition-all flex items-center gap-2 ${
                activeSubTab === tab.id
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                    activeSubTab === tab.id
                      ? "bg-brand-100 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ========================================================= */}
      {/* SOUS-ONGLET 1 : BARÈMES ITS PROGRESSIFS                   */}
      {/* ========================================================= */}
      {activeSubTab === "its" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <InfoIcon className="h-4 w-4 shrink-0 text-brand-500" />
              <span>
                Conformément à l'Article 125 du CGI Bénin 2026, l'ITS est liquidé mensuellement par tranche successive.
              </span>
            </div>
            <button
              onClick={openCreateBaremeModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 transition-all active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4 shrink-0 stroke-2" />
              <span>Nouveau Barème Fiscal</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              <p className="mt-2 text-xs text-gray-400">Chargement des barèmes d'imposition...</p>
            </div>
          ) : baremesIts.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
              <BoxIcon className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 font-semibold text-gray-700 dark:text-gray-300">
                Aucun barème d'impôt ITS configuré
              </p>
              <button
                onClick={openCreateBaremeModal}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
              >
                <PlusIcon className="h-4 w-4 shrink-0" />
                <span>Créer le barème ITS 2026</span>
              </button>
            </div>
          ) : (
            baremesIts.map((b) => {
              const isCurrentlyActive =
                new Date(b.dateDebutValidite) <= new Date() &&
                (!b.dateFinValidite || new Date(b.dateFinValidite) >= new Date());

              return (
                <div
                  key={b.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900"
                >
                  {/* Entête du Barème */}
                  <div className="border-b border-gray-100 bg-gray-50/75 p-5 dark:border-gray-800 dark:bg-gray-800/40">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            {b.libelle}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              isCurrentlyActive
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {isCurrentlyActive ? "Actif & En Vigueur" : "Archivé / Futur"}
                          </span>
                          <span className="rounded-md bg-brand-50 px-2 py-0.5 font-mono text-[11px] font-bold text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                            {b.codeImpot}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            Pays : <strong>{b.paysCode}</strong> ({b.pays?.libelle || "Bénin"})
                          </span>
                          <span>
                            Périodicité : <strong>{b.periodiciteAssiette}</strong>
                          </span>
                          <span>
                            Début d'effet : <strong>{b.dateDebutValidite ? b.dateDebutValidite.substring(0, 10) : "-"}</strong>
                          </span>
                          {b.dateFinValidite && (
                            <span>
                              Fin d'effet : <strong>{b.dateFinValidite.substring(0, 10)}</strong>
                            </span>
                          )}
                          <span>
                            Nombre de tranches : <strong>{b.tranches?.length || 0}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Actions sur le Barème */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openAddTrancheModal(b.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:border-brand-900/50 dark:bg-brand-950/40 dark:text-brand-300"
                          title="Ajouter une tranche"
                        >
                          <PlusIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>Ajouter Tranche</span>
                        </button>
                        <button
                          onClick={() => openDuplicateModal(b)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          title="Dupliquer pour une nouvelle année"
                        >
                          <CopyIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>Dupliquer</span>
                        </button>
                        <button
                          onClick={() => openEditBaremeModal(b)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                          title="Modifier les métadonnées"
                        >
                          <PencilIcon className="h-4 w-4 shrink-0" />
                        </button>
                        <button
                          onClick={() => handleDeleteBareme(b)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                          title="Supprimer ce barème"
                        >
                          <TrashBinIcon className="h-4 w-4 shrink-0" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tableau des tranches progressives */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-gray-100 bg-gray-50/50 uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-800/30">
                        <tr>
                          <th className="px-5 py-3 font-semibold">Tranche</th>
                          <th className="px-5 py-3 font-semibold">Fourchette d'imposition (FCFA)</th>
                          <th className="px-5 py-3 font-semibold">Amplitude</th>
                          <th className="px-5 py-3 text-right font-semibold">Taux Marginal ITS</th>
                          <th className="px-5 py-3 text-right font-semibold">Déduction Fixe (R*t - D)</th>
                          <th className="px-5 py-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium dark:divide-gray-800">
                        {(b.tranches || []).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-gray-400">
                              Aucune tranche configurée dans ce barème.
                            </td>
                          </tr>
                        ) : (
                          (b.tranches || []).map((t) => {
                            const isIllimite = t.limiteSuperieure === null || t.limiteSuperieure === undefined;
                            const amplitude = isIllimite ? "Illimitée" : formatNumber(t.limiteSuperieure! - t.limiteInferieure);

                            return (
                              <tr key={t.id || t.numeroTranche} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                                <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-white">
                                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold ${getTrancheColorBadge(t.numeroTranche)}`}>
                                    Tranche {t.numeroTranche}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 font-mono text-gray-800 dark:text-gray-200">
                                  {formatNumber(t.limiteInferieure)} FCFA{" → "}
                                  {isIllimite ? (
                                    <span className="font-sans font-bold text-brand-600 dark:text-brand-400">
                                      Au-delà (Illimité)
                                    </span>
                                  ) : (
                                    `${formatNumber(t.limiteSuperieure)} FCFA`
                                  )}
                                </td>
                                <td className="px-5 py-3.5 font-mono text-gray-500">
                                  {amplitude} {isIllimite ? "" : "FCFA"}
                                </td>
                                <td className="px-5 py-3.5 text-right font-mono text-sm font-extrabold text-brand-600 dark:text-brand-400">
                                  {formatNumber(t.taux)} %
                                </td>
                                <td className="px-5 py-3.5 text-right font-mono text-gray-600 dark:text-gray-400">
                                  {formatMoney(t.montantDeductionFixe)}
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => openEditTrancheModal(b.id, t)}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                                      title="Modifier cette tranche"
                                    >
                                      <PencilIcon className="h-3.5 w-3.5 shrink-0" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTranche(t)}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                                      title="Supprimer cette tranche"
                                    >
                                      <TrashBinIcon className="h-3.5 w-3.5 shrink-0" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SOUS-ONGLET 2 : COTISATIONS SOCIALES & VPS               */}
      {/* ========================================================= */}
      {activeSubTab === "charges" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <InfoIcon className="h-4 w-4 shrink-0 text-brand-500" />
              <span>
                Cotisations CNSS (Salariale 3,6% ; Patronale 17,4%) et Versement Patronal sur Salaires VPS (4% / 2%).
              </span>
            </div>
            <button
              onClick={openCreateChargeModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 transition-all active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4 shrink-0 stroke-2" />
              <span>Nouvelle Cotisation</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-100 bg-gray-50/75 uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/40">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Code</th>
                    <th className="px-5 py-3 font-semibold">Libellé de la Cotisation</th>
                    <th className="px-5 py-3 font-semibold">Assiette de Calcul</th>
                    <th className="px-5 py-3 text-right font-semibold">Part Salariale</th>
                    <th className="px-5 py-3 text-right font-semibold">Part Patronale</th>
                    <th className="px-5 py-3 font-semibold">Organisme Collecteur</th>
                    <th className="px-5 py-3 font-semibold">Statut</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                  {chargesSociales.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        Aucune cotisation configurée.
                      </td>
                    </tr>
                  ) : (
                    chargesSociales.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                        <td className="px-5 py-3.5 font-mono font-bold text-gray-900 dark:text-white">
                          {c.code}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">
                          {c.libelle}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-gray-600 dark:text-gray-400">
                          {c.typeAssiette}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                          {c.tauxSalarial > 0 ? `${formatNumber(c.tauxSalarial)} %` : "-"}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                          {c.tauxPatronal > 0 ? `${formatNumber(c.tauxPatronal)} %` : "-"}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">
                          {c.organismeCollecteur || "-"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              c.actif
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {c.actif ? "Actif" : "Désactivé"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditChargeModal(c)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                              title="Modifier"
                            >
                              <PencilIcon className="h-3.5 w-3.5 shrink-0" />
                            </button>
                            <button
                              onClick={() => handleDeleteCharge(c)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                              title="Supprimer"
                            >
                              <TrashBinIcon className="h-3.5 w-3.5 shrink-0" />
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
      {/* SOUS-ONGLET 3 : AVANTAGES EN NATURE (CGI Art. 123)       */}
      {/* ========================================================= */}
      {activeSubTab === "avantages" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <InfoIcon className="h-4 w-4 shrink-0 text-brand-500" />
              <span>
                Barème forfaitaire mensuel selon la catégorie du bénéficiaire (CGI Bénin 2026 Art. 123).
              </span>
            </div>
            <button
              onClick={openCreateAvantageModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 transition-all active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4 shrink-0 stroke-2" />
              <span>Nouvel Avantage</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {avantagesNature.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-500">Aucun barème forfaitaire d'avantage en nature configuré.</p>
              </div>
            ) : (
              avantagesNature.map((av) => (
                <div
                  key={av.id}
                  className="relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-all hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                        {getAvantageLabel(av.typeAvantage)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditAvantageModal(av)}
                          className="h-7 w-7 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                          title="Modifier"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAvantage(av)}
                          className="h-7 w-7 rounded-md p-1 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                          title="Supprimer"
                        >
                          <TrashBinIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                        {av.tauxPourcentage
                          ? `${formatNumber(av.tauxPourcentage)} % du salaire de base`
                          : formatMoney(av.montantFixe)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {av.description || "Évaluation forfaitaire fiscale"}
                      </p>
                    </div>

                    {av.conditionsJson && (
                      <div className="rounded-xl bg-gray-50 p-2.5 text-[11px] text-gray-600 dark:bg-gray-800/50 dark:text-gray-400">
                        <div className="font-semibold text-gray-700 dark:text-gray-300">Détails barème CGI :</div>
                        <pre className="mt-1 font-mono text-[10px] overflow-x-auto">
                          {JSON.stringify(av.conditionsJson, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-3 text-[10px] text-gray-400 dark:border-gray-800">
                    Applicable dès le : {av.dateDebutValidite ? av.dateDebutValidite.substring(0, 10) : "2026-01-01"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SOUS-ONGLET 4 : PARAMÈTRES RÉGLEMENTAIRES PAYS           */}
      {/* ========================================================= */}
      {activeSubTab === "parametres" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <InfoIcon className="h-4 w-4 shrink-0 text-brand-500" />
              <span>SMIG (52 000 FCFA), durée légale hebdomadaire, seuils et majorations d'heures sup.</span>
            </div>
            <button
              onClick={openCreateParamModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 transition-all active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4 shrink-0 stroke-2" />
              <span>Nouveau Paramètre</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-100 bg-gray-50/75 uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/40">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Code Paramètre</th>
                    <th className="px-5 py-3 font-semibold">Description / Libellé</th>
                    <th className="px-5 py-3 font-semibold">Type de Donnée</th>
                    <th className="px-5 py-3 text-right font-semibold">Valeur Officielle</th>
                    <th className="px-5 py-3 font-semibold">Début de Validité</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                  {parametresPays.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                      <td className="px-5 py-3.5 font-mono font-bold text-gray-900 dark:text-white">
                        {p.codeParametre}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">
                        {p.libelle}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-gray-500">
                        {p.typeValeur}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-extrabold text-brand-600 dark:text-brand-400">
                        {p.valeurNumerique !== null && p.valeurNumerique !== undefined
                          ? p.codeParametre.includes("SMIG")
                            ? formatMoney(p.valeurNumerique)
                            : p.codeParametre.includes("TAUX")
                            ? `${formatNumber(p.valeurNumerique)} %`
                            : formatNumber(p.valeurNumerique)
                          : p.valeurTexte || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {p.dateDebutValidite ? p.dateDebutValidite.substring(0, 10) : "2026-01-01"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditParamModal(p)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                            title="Modifier"
                          >
                            <PencilIcon className="h-3.5 w-3.5 shrink-0" />
                          </button>
                          <button
                            onClick={() => handleDeleteParam(p)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                            title="Supprimer"
                          >
                            <TrashBinIcon className="h-3.5 w-3.5 shrink-0" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SOUS-ONGLET 5 : SIMULATEUR FISCAL EN DIRECT               */}
      {/* ========================================================= */}
      {activeSubTab === "simulateur" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Colonne Gauche : Saisie des Paramètres de Simulation */}
            <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs lg:col-span-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Simulateur Fiscal &amp; Social
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Testez en direct l'impact fiscal d'un salaire selon le barème progressif en vigueur.
                </p>
              </div>

              {/* Cas prédéfinis */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Exemples rapides :
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "SMIG (52k)", val: 52000 },
                    { label: "Employé (150k)", val: 150000 },
                    { label: "Maîtrise (300k)", val: 300000 },
                    { label: "Cadre (600k)", val: 600000 },
                    { label: "Dirigeant (1.2M)", val: 1200000 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setSimulBrut(item.val)}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-brand-950/50"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salaire Brut */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Salaire Brut Mensuel (FCFA)
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={simulBrut}
                    onChange={(e) => setSimulBrut(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-16 font-mono text-base font-bold text-gray-900 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-800 dark:text-white"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-gray-400">
                    FCFA
                  </span>
                </div>
              </div>

              {/* Choix du barème ITS */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Barème ITS appliqué
                </label>
                <select
                  value={simulBaremeId}
                  onChange={(e) => setSimulBaremeId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs font-medium text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
                >
                  {baremesIts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.libelle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mois de paie (pour ORTB) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Mois d'imposition
                </label>
                <select
                  value={simulMois}
                  onChange={(e) => setSimulMois(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs font-medium text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
                >
                  <option value={1}>Janvier (Régime standard)</option>
                  <option value={3}>Mars (+ Redevance ORTB 1 000 FCFA)</option>
                  <option value={6}>Juin (+ Redevance ORTB 3 000 FCFA si {">"} 1ère tranche)</option>
                  <option value={12}>Décembre (Clôture fiscale)</option>
                </select>
              </div>

              {/* Options de cotisations */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulInclureCnss}
                    onChange={(e) => setSimulInclureCnss(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Déduire CNSS Salariale (3,6 %)</span>
                </label>

                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulInclureVps}
                    onChange={(e) => setSimulInclureVps(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Calculer le VPS Patronal (4 %)</span>
                </label>

                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulInclureOrtb}
                    onChange={(e) => setSimulInclureOrtb(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Appliquer redevance ORTB légale</span>
                </label>
              </div>
            </div>

            {/* Colonne Droite : Résultats de la simulation */}
            <div className="space-y-5 lg:col-span-8">
              {simulationResult ? (
                <>
                  {/* Synthèse 4 KPI Cards */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
                      <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                        Net Imposable (Assiette)
                      </span>
                      <p className="mt-1 font-mono text-lg font-bold text-gray-900 dark:text-white">
                        {formatMoney(simulationResult.parametres.salaireNetImposable)}
                      </p>
                      <span className="text-[10px] text-gray-500">Après déduction CNSS</span>
                    </div>

                    <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-900/30 dark:bg-rose-950/20">
                      <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                        Impôt ITS Total
                      </span>
                      <p className="mt-1 font-mono text-lg font-bold text-rose-600 dark:text-rose-400">
                        {formatMoney(simulationResult.decompositionIts.totalIts)}
                      </p>
                      <span className="text-[10px] font-semibold text-gray-500">
                        Taux effectif : {simulationResult.decompositionIts.tauxEffectifMoyen} %
                      </span>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                        Net Salarié Estimé
                      </span>
                      <p className="mt-1 font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(simulationResult.recapitulatif.salaireNetEstime)}
                      </p>
                      <span className="text-[10px] text-gray-500">Net après impôt &amp; cotisations</span>
                    </div>

                    <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 dark:border-purple-900/30 dark:bg-purple-950/20">
                      <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                        Coût Global Employeur
                      </span>
                      <p className="mt-1 font-mono text-lg font-bold text-purple-700 dark:text-purple-400">
                        {formatMoney(simulationResult.recapitulatif.coutGlobalEmployeur)}
                      </p>
                      <span className="text-[10px] text-gray-500">Brut + VPS + CNSS Pat.</span>
                    </div>
                  </div>

                  {/* Décomposition Progressive Tranche par Tranche */}
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
                    <div className="border-b border-gray-100 bg-gray-50/75 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Liquidation de l'ITS par Tranche Progressive (Art. 125 CGI)
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      {simulationResult.decompositionIts.tranches.map((t) => {
                        const isImpactee = t.baseTaxable > 0;
                        return (
                          <div
                            key={t.numeroTranche}
                            className={`rounded-xl border p-3 transition-all ${
                              isImpactee
                                ? "border-brand-200 bg-brand-50/20 dark:border-brand-900/40 dark:bg-brand-950/10"
                                : "border-gray-100 bg-gray-50/30 opacity-60 dark:border-gray-800 dark:bg-gray-800/20"
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className={`rounded-md border px-2 py-0.5 font-bold ${getTrancheColorBadge(t.numeroTranche)}`}>
                                  Tranche {t.numeroTranche} ({t.taux} %)
                                </span>
                                <span className="font-mono text-gray-600 dark:text-gray-400">
                                  {formatNumber(t.limiteInferieure)} → {t.limiteSuperieure !== null ? `${formatNumber(t.limiteSuperieure)} FCFA` : "Illimité"}
                                </span>
                              </div>

                              <div className="text-right">
                                <span className="text-gray-400">Assiette taxée : </span>
                                <span className="font-mono font-bold text-gray-900 dark:text-white">
                                  {formatMoney(t.baseTaxable)}
                                </span>
                                <span className="mx-2 text-gray-300">|</span>
                                <span className="text-gray-400">Impôt tranche : </span>
                                <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400">
                                  {formatMoney(t.impotTranche)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tableau Récapitulatif Prélèvements & Charges Patronales */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                    {/* Retenues Salariales */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-2.5">
                      <div className="font-bold text-gray-900 dark:text-white border-b border-gray-100 pb-2 dark:border-gray-800">
                        Prélèvements &amp; Retenues Salarié
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">CNSS Salariale ({simulationResult.cotisationsSalariales.tauxCnss} %) :</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                          {formatMoney(simulationResult.cotisationsSalariales.cnss)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Impôt sur Salaires (ITS) :</span>
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                          {formatMoney(simulationResult.decompositionIts.totalIts)}
                        </span>
                      </div>
                      {simulationResult.redevanceOrtb.montant > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Redevance ORTB (CGI Art. 125-2) :</span>
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                            {formatMoney(simulationResult.redevanceOrtb.montant)}
                          </span>
                        </div>
                      )}
                      {simulationResult.redevanceOrtb.exoneree && (
                        <div className="rounded-lg bg-emerald-50 p-2 text-[11px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          ✓ {simulationResult.redevanceOrtb.motif}
                        </div>
                      )}
                      <div className="border-t border-gray-100 pt-2 flex justify-between font-bold dark:border-gray-800">
                        <span>Total Prélèvements Salariaux :</span>
                        <span className="font-mono text-rose-600 dark:text-rose-400">
                          {formatMoney(simulationResult.recapitulatif.totalRetenuesSalariales)}
                        </span>
                      </div>
                    </div>

                    {/* Charges Patronales */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-2.5">
                      <div className="font-bold text-gray-900 dark:text-white border-b border-gray-100 pb-2 dark:border-gray-800">
                        Charges Patronales Entreprise
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Versement Patronal sur Salaires (VPS {simulationResult.chargesPatronales.tauxVps} %) :</span>
                        <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                          {formatMoney(simulationResult.chargesPatronales.vps)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">CNSS Patronale (17,4 %) :</span>
                        <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                          {formatMoney(simulationResult.chargesPatronales.cnss)}
                        </span>
                      </div>
                      <div className="border-t border-gray-100 pt-2 flex justify-between font-bold dark:border-gray-800">
                        <span>Total Charges Patronales :</span>
                        <span className="font-mono text-purple-700 dark:text-purple-300">
                          {formatMoney(simulationResult.chargesPatronales.totalPatronal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-400 dark:border-gray-800 dark:bg-gray-900">
                  <PieChartIcon className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm font-semibold">Saisissez un salaire brut pour lancer la simulation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALE CRÉATION / MODIFICATION BARÈME ITS                 */}
      {/* ========================================================= */}
      <Modal
        isOpen={isBaremeModalOpen}
        onClose={() => setIsBaremeModalOpen(false)}
        className="max-w-md p-6"
      >
        <form onSubmit={handleSaveBareme} className="space-y-4">
          <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {editingBaremeId ? "Modifier le Barème ITS" : "Nouveau Barème Fiscal ITS"}
            </h3>
            <p className="text-xs text-gray-500">Configuration des métadonnées du barème fiscal.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Code Impôt
            </label>
            <input
              type="text"
              required
              value={baremeForm.codeImpot}
              onChange={(e) => setBaremeForm({ ...baremeForm, codeImpot: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 font-mono text-xs text-gray-900 uppercase focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Libellé Officiel
            </label>
            <input
              type="text"
              required
              value={baremeForm.libelle}
              onChange={(e) => setBaremeForm({ ...baremeForm, libelle: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Mode de Calcul
              </label>
              <select
                value={baremeForm.modeCalcul}
                onChange={(e) => setBaremeForm({ ...baremeForm, modeCalcul: e.target.value as any })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
              >
                <option value="PROGRESSIF_PAR_TRANCHE">Progressif par Tranche</option>
                <option value="TAUX_UNIQUE">Taux Unique</option>
                <option value="QUOTIENT_FAMILIAL">Quotient Familial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Périodicité
              </label>
              <select
                value={baremeForm.periodiciteAssiette}
                onChange={(e) => setBaremeForm({ ...baremeForm, periodiciteAssiette: e.target.value as any })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
              >
                <option value="MENSUELLE">Mensuelle</option>
                <option value="ANNUELLE">Annuelle</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Date Début Validité
              </label>
              <input
                type="date"
                required
                value={baremeForm.dateDebutValidite}
                onChange={(e) => setBaremeForm({ ...baremeForm, dateDebutValidite: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Date Fin Validité (Optionnelle)
              </label>
              <input
                type="date"
                value={baremeForm.dateFinValidite}
                onChange={(e) => setBaremeForm({ ...baremeForm, dateFinValidite: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsBaremeModalOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODALE DUPLICATION BARÈME ITS                             */}
      {/* ========================================================= */}
      <Modal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        className="max-w-md p-6"
      >
        <form onSubmit={handleDuplicateBareme} className="space-y-4">
          <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Dupliquer pour un Nouvel Exercice Fiscal
            </h3>
            <p className="text-xs text-gray-500">
              Copie l'intégralité des tranches et archive la période précédente sans écraser l'historique.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Nouveau Libellé
            </label>
            <input
              type="text"
              required
              value={duplicateForm.nouveauLibelle}
              onChange={(e) => setDuplicateForm({ ...duplicateForm, nouveauLibelle: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Date d'effet (Début)
              </label>
              <input
                type="date"
                required
                value={duplicateForm.nouvelleDateDebut}
                onChange={(e) => setDuplicateForm({ ...duplicateForm, nouvelleDateDebut: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Date de fin (Optionnelle)
              </label>
              <input
                type="date"
                value={duplicateForm.nouvelleDateFin}
                onChange={(e) => setDuplicateForm({ ...duplicateForm, nouvelleDateFin: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsDuplicateModalOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
            >
              Créer la version
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODALE TRANCHE FISCALE DU BARÈME ITS                      */}
      {/* ========================================================= */}
      <Modal
        isOpen={isTrancheModalOpen}
        onClose={() => setIsTrancheModalOpen(false)}
        className="max-w-md p-6"
      >
        <form onSubmit={handleSaveTranche} className="space-y-4">
          <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {editingTrancheId ? "Modifier la Tranche Fiscale" : "Ajouter une Tranche Fiscale"}
            </h3>
            <p className="text-xs text-gray-500">Bornes, taux marginal et déduction fixe de calcul.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                N° Tranche
              </label>
              <input
                type="number"
                min="1"
                required
                value={trancheForm.numeroTranche}
                onChange={(e) => setTrancheForm({ ...trancheForm, numeroTranche: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 font-bold focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Taux Marginal (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                required
                value={trancheForm.taux}
                onChange={(e) => setTrancheForm({ ...trancheForm, taux: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 font-bold text-brand-600 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-brand-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Limite Inférieure (FCFA)
            </label>
            <input
              type="number"
              min="0"
              required
              value={trancheForm.limiteInferieure}
              onChange={(e) => setTrancheForm({ ...trancheForm, limiteInferieure: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 font-mono text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Limite Supérieure (FCFA)
              </label>
              <label className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trancheForm.isIllimitee}
                  onChange={(e) =>
                    setTrancheForm({
                      ...trancheForm,
                      isIllimitee: e.target.checked,
                      limiteSuperieure: e.target.checked ? null : 500000,
                    })
                  }
                  className="rounded-sm border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Tranche illimitée</span>
              </label>
            </div>
            {!trancheForm.isIllimitee ? (
              <input
                type="number"
                min="0"
                required
                value={trancheForm.limiteSuperieure || 0}
                onChange={(e) => setTrancheForm({ ...trancheForm, limiteSuperieure: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 font-mono text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
              />
            ) : (
              <div className="mt-1 rounded-xl border border-dashed border-gray-300 p-2 text-center text-xs font-semibold text-gray-500 dark:border-gray-700">
                Au-delà de la limite inférieure (Pas de plafond)
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Montant Déduction Fixe (FCFA)
            </label>
            <input
              type="number"
              min="0"
              value={trancheForm.montantDeductionFixe}
              onChange={(e) => setTrancheForm({ ...trancheForm, montantDeductionFixe: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 font-mono text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
            />
            <span className="text-[10px] text-gray-400">
              Formule rapide : Impôt = (Revenu × Taux) - Déduction Fixe.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsTrancheModalOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
            >
              Enregistrer Tranche
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODALE CHARGE SOCIALE / VPS                               */}
      {/* ========================================================= */}
      <Modal
        isOpen={isChargeModalOpen}
        onClose={() => setIsChargeModalOpen(false)}
        className="max-w-md p-6"
      >
        <form onSubmit={handleSaveCharge} className="space-y-4">
          <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {editingChargeId ? "Modifier la Cotisation" : "Nouvelle Cotisation Sociale / Fiscale"}
            </h3>
            <p className="text-xs text-gray-500">Taux, assiette de prélèvement et organisme collecteur.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Code
              </label>
              <input
                type="text"
                required
                value={chargeForm.code}
                onChange={(e) => setChargeForm({ ...chargeForm, code: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 font-mono text-xs font-bold uppercase text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Organisme Collecteur
              </label>
              <input
                type="text"
                value={chargeForm.organismeCollecteur}
                onChange={(e) => setChargeForm({ ...chargeForm, organismeCollecteur: e.target.value })}
                placeholder="ex: CNSS, DGI"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Libellé de la Cotisation
            </label>
            <input
              type="text"
              required
              value={chargeForm.libelle}
              onChange={(e) => setChargeForm({ ...chargeForm, libelle: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Taux Salarial (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={chargeForm.tauxSalarial}
                onChange={(e) => setChargeForm({ ...chargeForm, tauxSalarial: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 font-mono text-xs font-bold text-blue-600 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Taux Patronal (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={chargeForm.tauxPatronal}
                onChange={(e) => setChargeForm({ ...chargeForm, tauxPatronal: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 font-mono text-xs font-bold text-purple-600 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-purple-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Assiette
              </label>
              <select
                value={chargeForm.typeAssiette}
                onChange={(e) => setChargeForm({ ...chargeForm, typeAssiette: e.target.value as any })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
              >
                <option value="SALAIRE_BRUT">Salaire Brut</option>
                <option value="SALAIRE_BRUT_PLAFONNE">Brut Plafonné</option>
                <option value="SALAIRE_NET_IMPOSABLE">Net Imposable</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Statut
              </label>
              <select
                value={chargeForm.actif ? "true" : "false"}
                onChange={(e) => setChargeForm({ ...chargeForm, actif: e.target.value === "true" })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
              >
                <option value="true">Actif</option>
                <option value="false">Désactivé</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsChargeModalOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODALE AVANTAGE EN NATURE                                 */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAvantageModalOpen}
        onClose={() => setIsAvantageModalOpen(false)}
        className="max-w-md p-6"
      >
        <form onSubmit={handleSaveAvantage} className="space-y-4">
          <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {editingAvantageId ? "Modifier l'Avantage en Nature" : "Nouvel Avantage en Nature Forfaitaire"}
            </h3>
            <p className="text-xs text-gray-500">Évaluation forfaitaire conforme CGI Bénin Art. 123.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Type d'avantage
            </label>
            <select
              value={avantageForm.typeAvantage}
              onChange={(e) => setAvantageForm({ ...avantageForm, typeAvantage: e.target.value as any })}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
            >
              <option value="LOGEMENT">Logement de fonction</option>
              <option value="DOMESTIQUE">Personnel domestique</option>
              <option value="EAU_ELECTRICITE">Eau &amp; Électricité</option>
              <option value="TELEPHONE">Téléphone &amp; Internet</option>
              <option value="NOURRITURE">Nourriture &amp; Repas</option>
              <option value="VEHICULE">Véhicule</option>
              <option value="AUTRE">Autre avantage</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Mode d'évaluation
              </label>
              <select
                value={avantageForm.modeValeur}
                onChange={(e) => setAvantageForm({ ...avantageForm, modeValeur: e.target.value as any })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
              >
                <option value="POURCENTAGE">Pourcentage (%)</option>
                <option value="FORFAIT_FIXE">Montant Fixe (FCFA)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                {avantageForm.modeValeur === "POURCENTAGE" ? "Taux (%)" : "Montant (FCFA)"}
              </label>
              <input
                type="number"
                min="0"
                step={avantageForm.modeValeur === "POURCENTAGE" ? "0.5" : "5000"}
                value={avantageForm.modeValeur === "POURCENTAGE" ? avantageForm.tauxPourcentage : avantageForm.montantFixe}
                onChange={(e) =>
                  setAvantageForm({
                    ...avantageForm,
                    ...(avantageForm.modeValeur === "POURCENTAGE"
                      ? { tauxPourcentage: Number(e.target.value) }
                      : { montantFixe: Number(e.target.value) }),
                  })
                }
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 font-mono text-xs font-bold text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Description légale
            </label>
            <input
              type="text"
              value={avantageForm.description}
              onChange={(e) => setAvantageForm({ ...avantageForm, description: e.target.value })}
              placeholder="ex: 15 % du salaire de base pour cadres et employés"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsAvantageModalOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODALE PARAMÈTRE PAYS                                     */}
      {/* ========================================================= */}
      <Modal
        isOpen={isParamModalOpen}
        onClose={() => setIsParamModalOpen(false)}
        className="max-w-md p-6"
      >
        <form onSubmit={handleSaveParam} className="space-y-4">
          <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {editingParamId ? "Modifier le Paramètre Légal" : "Nouveau Paramètre Légal"}
            </h3>
            <p className="text-xs text-gray-500">SMIG, durée légale de travail ou seuil réglementaire.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Code Paramètre
            </label>
            <input
              type="text"
              required
              value={paramForm.codeParametre}
              onChange={(e) => setParamForm({ ...paramForm, codeParametre: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 font-mono text-xs font-bold uppercase text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Libellé
            </label>
            <input
              type="text"
              required
              value={paramForm.libelle}
              onChange={(e) => setParamForm({ ...paramForm, libelle: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Type
              </label>
              <select
                value={paramForm.typeValeur}
                onChange={(e) => setParamForm({ ...paramForm, typeValeur: e.target.value as any })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
              >
                <option value="NOMBRE">Nombre</option>
                <option value="TEXTE">Texte</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Valeur
              </label>
              {paramForm.typeValeur === "NOMBRE" ? (
                <input
                  type="number"
                  required
                  value={paramForm.valeurNumerique}
                  onChange={(e) => setParamForm({ ...paramForm, valeurNumerique: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 font-mono text-xs font-bold text-brand-600 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-brand-400"
                />
              ) : (
                <input
                  type="text"
                  required
                  value={paramForm.valeurTexte}
                  onChange={(e) => setParamForm({ ...paramForm, valeurTexte: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-800 dark:text-white"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsParamModalOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
