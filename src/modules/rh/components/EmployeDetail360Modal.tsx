"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { rhApi } from "../services/rhApi.service";
import type { RhDepartement, RhEmploye, RhEtablissement, RhPoste } from "../types/rh.types";
import {
  DocsIcon,
  PlusIcon,
  PencilIcon,
  TrashBinIcon,
  LockIcon,
  UserCircleIcon,
  CheckCircleIcon,
  UserIcon,
} from "@/icons";
import { useActionFeedback, useToast } from "@/shared/components/feedback";
import { CreerCompteErpModal } from "./CreerCompteErpModal";
import {
  getEmployeeStatusBadge,
  formatContractStatus,
  formatContractType,
  formatProbationStatus,
  formatGender,
  formatMaritalStatus,
  formatPaymentMethod,
  formatFamilyRelationship,
  formatDocumentType,
} from "../utils/rhFormatters";

interface Props {
  employe: RhEmploye | null;
  isOpen: boolean;
  onClose: () => void;
  onViewBulletin?: (bulletinId: string) => void;
  onEditEmploye?: (emp: RhEmploye) => void;
  onRefresh?: () => void;
}

export const EmployeDetail360Modal: React.FC<Props> = ({
  employe: initialEmploye,
  isOpen,
  onClose,
  onEditEmploye,
  onRefresh,
}) => {
  const { runAction } = useActionFeedback();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<
    "civil" | "contrat" | "banque" | "famille" | "carriere" | "docs" | "compte"
  >("civil");

  const [employe, setEmploye] = useState<RhEmploye | null>(initialEmploye);
  const [loading, setLoading] = useState(false);
  const [isCreerCompteOpen, setIsCreerCompteOpen] = useState(false);

  // Sub-actions modal forms
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [bankForm, setBankForm] = useState({
    modePaiement: "VIREMENT_BANCAIRE",
    banqueNom: "",
    codeBanque: "",
    codeGuichet: "",
    numeroCompteIban: "",
    cleRib: "",
    operateurMobileMoney: "MTN",
    numeroMobileMoney: "",
    estComptePrincipal: true,
  });

  const [isAddDependantOpen, setIsAddDependantOpen] = useState(false);
  const [dependantForm, setDependantForm] = useState({
    nomPrenoms: "",
    lienParente: "ENFANT",
    dateNaissance: "",
    estFiscalementACharge: true,
  });

  const [isAddAffectationOpen, setIsAddAffectationOpen] = useState(false);
  const [etablissements, setEtablissements] = useState<RhEtablissement[]>([]);
  const [departements, setDepartements] = useState<RhDepartement[]>([]);
  const [postes, setPostes] = useState<RhPoste[]>([]);
  const [affectationForm, setAffectationForm] = useState({
    etablissementId: "",
    departementId: "",
    posteId: "",
    dateDebut: new Date().toISOString().split("T")[0],
    motif: "AFFECTATION_INITIALE",
  });

  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [docForm, setDocForm] = useState({
    titre: "",
    typeDocument: "CNI",
    fichierUrl: "",
  });

  const refreshEmployeData = async () => {
    if (!initialEmploye?.id) return;
    try {
      setLoading(true);
      const res = await rhApi.getEmployeById(initialEmploye.id);
      if (res) {
        setEmploye(res);
      }
    } catch (err) {
      console.warn("Erreur actualisation fiche employé:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [etabsRes, deptsRes, postsRes] = await Promise.allSettled([
        rhApi.listEtablissements(),
        rhApi.listDepartements(),
        rhApi.listPostes(),
      ]);
      if (etabsRes.status === "fulfilled" && Array.isArray(etabsRes.value)) {
        setEtablissements(etabsRes.value);
      }
      if (deptsRes.status === "fulfilled" && Array.isArray(deptsRes.value)) {
        setDepartements(deptsRes.value);
      }
      if (postsRes.status === "fulfilled" && Array.isArray(postsRes.value)) {
        setPostes(postsRes.value);
      }
    } catch (err) {
      console.warn("Erreur chargement dépendances:", err);
    }
  };

  useEffect(() => {
    if (isOpen && initialEmploye) {
      setEmploye(initialEmploye);
      refreshEmployeData();
      loadDependencies();
    }
  }, [isOpen, initialEmploye?.id]);

  if (!employe) return null;

  const contratActif = employe.contrats?.find((c) => c.statut === "ACTIF") || employe.contrats?.[0];
  const affectationActuelle = employe.affectations?.find((a) => a.estActuelle) || employe.affectations?.[0];
  const comptePrincipal = employe.coordonneesBancaires?.find((b) => b.estComptePrincipal) || employe.coordonneesBancaires?.[0];
  const rawDocs = (employe.documentsAdministratifs?.length ? employe.documentsAdministratifs : employe.documents) || [];

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

  const formatDate = (dateVal?: string | Date | null) => {
    if (!dateVal) return "-";
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("fr-FR");
  };

  const telephone = employe.telephone1 || employe.telephonePrincipal || employe.telephone2 || "-";
  const adresse = [
    employe.adresseResidence || employe.adresseLigne1,
    employe.villeResidence || employe.ville,
  ].filter(Boolean).join(", ") || "-";

  // Handlers for Sub-actions
  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    await runAction({
      loadingMessage: "Ajout des coordonnées de paiement...",
      success: {
        title: "Coordonnées enregistrées",
        message: "Les détails de paiement ont été rattachés au collaborateur.",
      },
      error: {
        title: "Erreur d'ajout",
        message: "Impossible d'enregistrer les coordonnées bancaires.",
      },
      action: async () => {
        await rhApi.addBankAccount(employe.id, bankForm);
        setIsAddBankOpen(false);
        await refreshEmployeData();
        onRefresh?.();
      },
    });
  };

  const handleSaveDependant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dependantForm.nomPrenoms.trim()) {
      toast.warning("Nom requis", "Veuillez renseigner le nom complet de la personne à charge.");
      return;
    }
    await runAction({
      loadingMessage: "Ajout de la personne à charge...",
      success: {
        title: "Personne à charge enregistrée",
        message: `${dependantForm.nomPrenoms} a été ajouté(e) au dossier fiscal.`,
      },
      error: {
        title: "Erreur d'ajout",
        message: "Impossible d'enregistrer la personne à charge.",
      },
      action: async () => {
        await rhApi.addDependant(employe.id, {
          ...dependantForm,
          dateNaissance: dependantForm.dateNaissance ? dependantForm.dateNaissance : undefined,
        });
        setIsAddDependantOpen(false);
        await refreshEmployeData();
        onRefresh?.();
      },
    });
  };

  const handleDeleteDependant = async (id: string, name: string) => {
    await runAction({
      loadingMessage: `Suppression de ${name}...`,
      success: {
        title: "Personne à charge retirée",
        message: `${name} a été supprimé(e) du dossier.`,
      },
      error: {
        title: "Erreur de suppression",
        message: "Impossible de supprimer la personne à charge.",
      },
      action: async () => {
        await rhApi.deleteDependant(id);
        await refreshEmployeData();
        onRefresh?.();
      },
    });
  };

  const handleSaveAffectation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affectationForm.etablissementId || !affectationForm.posteId) {
      toast.warning("Champs requis", "Veuillez sélectionner l'établissement et le poste.");
      return;
    }
    await runAction({
      loadingMessage: "Enregistrement de la nouvelle affectation...",
      success: {
        title: "Affectation validée",
        message: "La nouvelle affectation de poste a été enregistrée dans l'historique de carrière.",
      },
      error: {
        title: "Erreur d'affectation",
        message: "Impossible d'enregistrer la mutation ou l'affectation.",
      },
      action: async () => {
        await rhApi.addAffectation(employe.id, {
          etablissementId: affectationForm.etablissementId,
          departementId: affectationForm.departementId ? affectationForm.departementId : undefined,
          posteId: affectationForm.posteId,
          dateDebut: affectationForm.dateDebut,
          motifAffectation: affectationForm.motif || "Affectation interne",
        });
        setIsAddAffectationOpen(false);
        await refreshEmployeData();
        onRefresh?.();
      },
    });
  };

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.titre.trim()) {
      toast.warning("Titre requis", "Veuillez préciser le titre du document.");
      return;
    }
    await runAction({
      loadingMessage: "Archivage du document dans le coffre-fort RH...",
      success: {
        title: "Document archivé",
        message: `${docForm.titre} a été déposé avec succès.`,
      },
      error: {
        title: "Erreur de dépôt",
        message: "Impossible d'archiver le document.",
      },
      action: async () => {
        await rhApi.addEmployeDocument(employe.id, {
          libelle: docForm.titre.trim(),
          titre: docForm.titre.trim(),
          typeDocument: docForm.typeDocument,
          fichierUrl: docForm.fichierUrl?.trim() || "https://storage.nexera.bj/docs/placeholder.pdf",
        });
        setIsAddDocOpen(false);
        await refreshEmployeData();
        onRefresh?.();
      },
    });
  };

  const handleDelierCompte = async () => {
    if (!employe) return;
    await runAction({
      confirm: {
        title: "Dissocier le compte utilisateur ?",
        message: `Le compte utilisateur (${employe.utilisateur?.email || "lié"}) ne sera plus associé à la fiche de ${employe.prenoms} ${employe.nom}. Le compte ne sera pas supprimé.`,
        confirmLabel: "Dissocier",
        variant: "danger",
      },
      loadingMessage: "Dissociation du compte utilisateur...",
      success: {
        title: "Compte dissocié",
        message: "Le compte d'accès ERP a été dissocié du dossier collaborateur.",
      },
      error: {
        title: "Erreur de dissociation",
        message: "Impossible de dissocier le compte utilisateur.",
      },
      action: async () => {
        await rhApi.delierUtilisateur(employe.id);
        await refreshEmployeData();
        onRefresh?.();
      },
    });
  };

  const safeEtabs = Array.isArray(etablissements) ? etablissements : [];
  const safeDepts = Array.isArray(departements) ? departements : [];
  const safePostes = Array.isArray(postes) ? postes : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-6">
      <div className="space-y-6">
        {/* Header Profil avec actions rapides */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-xl font-bold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 shadow-2xs">
              {employe.nom?.[0] || "?"}
              {employe.prenoms?.[0] || ""}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {employe.nom} {employe.prenoms}
                </h2>
                <span className="rounded-md bg-brand-50 px-2 py-0.5 font-mono text-xs font-semibold text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                  {employe.matricule}
                </span>
                {(() => {
                  const badge = getEmployeeStatusBadge(employe.statutEmploi);
                  return (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.badgeClass}`}>
                      {badge.label}
                    </span>
                  );
                })()}
                {employe.utilisateur && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-2xs font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                    <LockIcon className="h-3 w-3" />
                    <span>ERP Actif</span>
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {affectationActuelle?.poste?.intitule || "Poste non défini"} •{" "}
                {affectationActuelle?.departement?.libelle || "Département non assigné"} •{" "}
                {affectationActuelle?.etablissement?.raisonSociale || "Établissement Principal"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mr-12">
            {onEditEmploye && (
              <button
                type="button"
                onClick={() => onEditEmploye(employe)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750 transition-colors shadow-2xs"
              >
                <PencilIcon className="h-5 w-5 shrink-0" />
                <span>Modifier Fiche</span>
              </button>
            )}
          </div>
        </div>

        {/* Barre d'onglets */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          {[
            { id: "civil", label: "État Civil & Identité" },
            { id: "contrat", label: `Contrat & Rémunération (${employe.contrats?.length || 0})` },
            { id: "banque", label: `Paiement & Banque (${employe.coordonneesBancaires?.length || 0})` },
            { id: "famille", label: `Famille & Déductions (${employe.personnesACharge?.length || 0})` },
            { id: "carriere", label: `Carrière & Affectations (${employe.affectations?.length || 0})` },
            { id: "docs", label: `Coffre-fort Documents (${rawDocs.length})` },
            {
              id: "compte",
              label: employe.utilisateur ? "Compte ERP & Accès" : "Compte ERP & Accès",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id
                ? "border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400 font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu des Onglets */}
        <div className="min-h-[300px]">
          {/* 1. ÉTAT CIVIL */}
          {activeTab === "civil" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                <h3 className="font-semibold text-gray-900 dark:text-white">Identité Administrative</h3>
                <div className="flex justify-between"><span className="text-gray-500">NPI (Identifiant Unique) :</span><span className="font-mono font-medium">{employe.npi || "Non renseigné"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">N° CNSS :</span><span className="font-mono font-medium">{employe.numeroCnss || "Non affilié"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">N° IFU :</span><span className="font-mono font-medium">{employe.numeroIfu || "Non renseigné"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Pièce d'identité :</span><span>{employe.numeroPieceIdentite ? `${employe.typePieceIdentite || "Pièce"} : ${employe.numeroPieceIdentite}` : "Non renseignée"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Date d'entrée :</span><span className="font-medium">{formatDate(employe.dateEntreeEntreprise || employe.dateEntree)}</span></div>
              </div>

              <div className="space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                <h3 className="font-semibold text-gray-900 dark:text-white">Coordonnées & État Personnel</h3>
                <div className="flex justify-between"><span className="text-gray-500">Sexe :</span><span>{formatGender(employe.sexe)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Situation familiale :</span><span>{formatMaritalStatus(employe.situationFamiliale)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Enfants à charge :</span><span>{employe.nombreEnfantsCharge || 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Date de naissance :</span><span>{formatDate(employe.dateNaissance)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Email Professionnel :</span><span>{employe.emailProfessionnel || "-"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Téléphone :</span><span className="font-medium">{telephone}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Adresse / Ville :</span><span className="font-medium">{adresse}</span></div>
              </div>
            </div>
          )}

          {/* 2. CONTRAT & RÉMUNÉRATION */}
          {activeTab === "contrat" && (
            <div className="space-y-4 text-sm">
              {contratActif ? (
                <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white text-base">
                        Contrat {formatContractType(contratActif.typeContrat)}
                      </span>
                      {contratActif.numeroContrat && (
                        <span className="ml-2 font-mono text-xs text-gray-500">
                          ({contratActif.numeroContrat})
                        </span>
                      )}
                    </div>
                    {(() => {
                      const cBadge = formatContractStatus(contratActif.statut);
                      return (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cBadge.badgeClass}`}>
                          {cBadge.label}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-gray-500">Date début :</span><span>{formatDate(contratActif.dateDebut)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Date fin prévue :</span><span>{contratActif.dateFinPrevue ? formatDate(contratActif.dateFinPrevue) : "Indéterminée (CDI)"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Établissement :</span><span>{contratActif.etablissement?.raisonSociale || "-"}</span></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-gray-500">Salaire de Base Mensuel :</span><span className="font-bold text-gray-900 dark:text-white text-base">{formatCurrency(contratActif.salaireBaseMensuel)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Base Horaire :</span><span>173.33 h / mois</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Taux Horaire Moyen :</span><span>{formatCurrency(contratActif.salaireBaseMensuel / 173.33)} / h</span></div>
                    </div>
                  </div>

                  {contratActif.periodesEssai && contratActif.periodesEssai.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">Suivi Période d'Essai</h4>
                      {contratActif.periodesEssai.map((p) => {
                        const probBadge = formatProbationStatus(p.statutIssue);
                        return (
                          <div key={p.id} className="flex justify-between text-xs py-1">
                            <span>Du {formatDate(p.dateDebut)} au {formatDate(p.dateFin)} ({p.dureeMois} mois)</span>
                            <span className={`font-semibold rounded px-1.5 py-0.5 ${probBadge.badgeClass}`}>{probBadge.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 py-6 text-center">Aucun contrat actif enregistré.</p>
              )}
            </div>
          )}

          {/* 3. PAIEMENT & BANQUE */}
          {activeTab === "banque" && (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Comptes et Modes de Règlement</h3>
                <button
                  type="button"
                  onClick={() => setIsAddBankOpen(!isAddBankOpen)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 shadow-2xs transition-colors"
                >
                  <PlusIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>Ajouter un compte</span>
                </button>
              </div>

              {/* Formulaire ajout compte rapide */}
              {isAddBankOpen && (
                <form onSubmit={handleSaveBank} className="rounded-xl border border-brand-200 bg-brand-50/20 p-4 space-y-3 dark:border-brand-900/40 dark:bg-brand-950/20 text-xs">
                  <div className="font-bold text-brand-700 dark:text-brand-300">Nouveau mode de versement salaire</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Mode de règlement *</label>
                      <select
                        value={bankForm.modePaiement}
                        onChange={(e) => setBankForm({ ...bankForm, modePaiement: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="VIREMENT_BANCAIRE">Virement Bancaire (RIB/IBAN)</option>
                        <option value="MOBILE_MONEY">Mobile Money (MTN / Moov)</option>
                        <option value="CHEQUE">Chèque</option>
                        <option value="ESPECES">Espèces</option>
                      </select>
                    </div>

                    {bankForm.modePaiement === "VIREMENT_BANCAIRE" && (
                      <>
                        <div>
                          <label className="block font-semibold mb-1">Nom de la Banque *</label>
                          <input
                            type="text"
                            required
                            value={bankForm.banqueNom}
                            onChange={(e) => setBankForm({ ...bankForm, banqueNom: e.target.value })}
                            placeholder="Ex: BOA Bénin, Ecobank, BSIC"
                            className="w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">Numéro de Compte / IBAN *</label>
                          <input
                            type="text"
                            required
                            value={bankForm.numeroCompteIban}
                            onChange={(e) => setBankForm({ ...bankForm, numeroCompteIban: e.target.value })}
                            placeholder="Ex: BJ0660100100123456789012"
                            className="w-full rounded-xl border border-gray-300 p-2 font-mono dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">Clé RIB</label>
                          <input
                            type="text"
                            value={bankForm.cleRib}
                            onChange={(e) => setBankForm({ ...bankForm, cleRib: e.target.value })}
                            placeholder="Ex: 85"
                            className="w-full rounded-xl border border-gray-300 p-2 font-mono dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      </>
                    )}

                    {bankForm.modePaiement === "MOBILE_MONEY" && (
                      <>
                        <div>
                          <label className="block font-semibold mb-1">Opérateur *</label>
                          <select
                            value={bankForm.operateurMobileMoney}
                            onChange={(e) => setBankForm({ ...bankForm, operateurMobileMoney: e.target.value })}
                            className="w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          >
                            <option value="MTN">MTN Mobile Money</option>
                            <option value="MOOV">Moov Money Flooz</option>
                            <option value="CELTIS">Celtis Cash</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">Numéro Mobile Money *</label>
                          <input
                            type="tel"
                            required
                            value={bankForm.numeroMobileMoney}
                            onChange={(e) => setBankForm({ ...bankForm, numeroMobileMoney: e.target.value })}
                            placeholder="+229 97 00 00 00"
                            className="w-full rounded-xl border border-gray-300 p-2 font-mono dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddBankOpen(false)}
                      className="rounded-xl border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-brand-500 px-4 py-1.5 font-semibold text-white hover:bg-brand-600"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              )}

              {employe.coordonneesBancaires && employe.coordonneesBancaires.length > 0 ? (
                employe.coordonneesBancaires.map((cb) => (
                  <div
                    key={cb.id}
                    className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {cb.modePaiement === "VIREMENT_BANCAIRE"
                          ? `Banque : ${cb.banqueNom || "Virement Bancaire"}`
                          : cb.modePaiement === "MOBILE_MONEY"
                            ? `Mobile Money : ${cb.operateurMobileMoney || "MoMo"}`
                            : formatPaymentMethod(cb.modePaiement)}
                      </span>
                      {cb.estComptePrincipal && (
                        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                          Compte Principal
                        </span>
                      )}
                    </div>
                    {cb.numeroCompteIban && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">IBAN / Numéro de compte :</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-white">{cb.numeroCompteIban}</span>
                      </div>
                    )}
                    {cb.numeroMobileMoney && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Numéro Mobile Money :</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-white">{cb.numeroMobileMoney}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 py-6 text-center">Aucune coordonnée bancaire renseignée.</p>
              )}
            </div>
          )}

          {/* 4. FAMILLE */}
          {activeTab === "famille" && (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Personnes à Charge (Déductions ITS Bénin)</h3>
                <button
                  type="button"
                  onClick={() => setIsAddDependantOpen(!isAddDependantOpen)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 shadow-2xs transition-colors"
                >
                  <PlusIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>Ajouter une personne</span>
                </button>
              </div>

              {/* Formulaire ajout personne à charge */}
              {isAddDependantOpen && (
                <form onSubmit={handleSaveDependant} className="rounded-xl border border-brand-200 bg-brand-50/20 p-4 space-y-3 dark:border-brand-900/40 dark:bg-brand-950/20 text-xs">
                  <div className="font-bold text-brand-700 dark:text-brand-300">Nouvelle personne à charge fiscale</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Nom et prénoms *</label>
                      <input
                        type="text"
                        required
                        value={dependantForm.nomPrenoms}
                        onChange={(e) => setDependantForm({ ...dependantForm, nomPrenoms: e.target.value })}
                        placeholder="Ex: Mensah Arielle"
                        className="w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Lien de parenté *</label>
                      <select
                        value={dependantForm.lienParente}
                        onChange={(e) => setDependantForm({ ...dependantForm, lienParente: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="ENFANT">Enfant</option>
                        <option value="CONJOINT">Conjoint(e)</option>
                        <option value="ASCENDANT">Ascendant (Parent)</option>
                        <option value="AUTRE">Autre charge légale</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Date de naissance</label>
                      <input
                        type="date"
                        value={dependantForm.dateNaissance}
                        onChange={(e) => setDependantForm({ ...dependantForm, dateNaissance: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddDependantOpen(false)}
                      className="rounded-xl border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-brand-500 px-4 py-1.5 font-semibold text-white hover:bg-brand-600"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              )}

              {employe.personnesACharge && employe.personnesACharge.length > 0 ? (
                employe.personnesACharge.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 p-3.5 text-sm dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{p.nomPrenoms}</div>
                      <div className="text-xs text-gray-500">
                        {formatFamilyRelationship(p.lienParente)} • Né(e) le {formatDate(p.dateNaissance)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {p.estFiscalementACharge ? (
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                          À charge fiscale (ITS)
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Non fiscalisé</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteDependant(p.id, p.nomPrenoms)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
                        title="Supprimer la personne à charge"
                      >
                        <TrashBinIcon className="h-3.5 w-3.5 shrink-0" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-6 text-center">Aucune personne à charge enregistrée.</p>
              )}
            </div>
          )}

          {/* 5. CARRIÈRE & AFFECTATIONS */}
          {activeTab === "carriere" && (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Historique de Carrière & Postes</h3>
                <button
                  type="button"
                  onClick={() => setIsAddAffectationOpen(!isAddAffectationOpen)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 shadow-2xs transition-colors"
                >
                  <PlusIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>Nouvelle Affectation / Mutation</span>
                </button>
              </div>

              {/* Formulaire nouvelle affectation */}
              {isAddAffectationOpen && (
                <form onSubmit={handleSaveAffectation} className="rounded-xl border border-brand-200 bg-brand-50/20 p-4 space-y-3 dark:border-brand-900/40 dark:bg-brand-950/20 text-xs">
                  <div className="font-bold text-brand-700 dark:text-brand-300">Enregistrer une promotion ou changement de poste</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Établissement *</label>
                      <select
                        required
                        value={affectationForm.etablissementId}
                        onChange={(e) => setAffectationForm({ ...affectationForm, etablissementId: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">-- Sélectionner --</option>
                        {safeEtabs.map((etab) => (
                          <option key={etab.id} value={etab.id}>{etab.raisonSociale}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Département *</label>
                      <select
                        required
                        value={affectationForm.departementId}
                        onChange={(e) => setAffectationForm({ ...affectationForm, departementId: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">-- Sélectionner --</option>
                        {safeDepts.map((d) => (
                          <option key={d.id} value={d.id}>{d.libelle}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Poste *</label>
                      <select
                        required
                        value={affectationForm.posteId}
                        onChange={(e) => setAffectationForm({ ...affectationForm, posteId: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">-- Sélectionner --</option>
                        {safePostes.map((p) => (
                          <option key={p.id} value={p.id}>{p.intitule}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Date de Prise de Fonction *</label>
                      <input
                        type="date"
                        required
                        value={affectationForm.dateDebut}
                        onChange={(e) => setAffectationForm({ ...affectationForm, dateDebut: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddAffectationOpen(false)}
                      className="rounded-xl border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-brand-500 px-4 py-1.5 font-semibold text-white hover:bg-brand-600"
                    >
                      Valider Affectation
                    </button>
                  </div>
                </form>
              )}

              {employe.affectations && employe.affectations.length > 0 ? (
                employe.affectations.map((aff) => (
                  <div
                    key={aff.id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 p-3.5 text-sm dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {aff.poste?.intitule || "Poste assigné"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Département : {aff.departement?.libelle || "-"} • Établissement : {aff.etablissement?.raisonSociale || "-"}
                      </div>
                    </div>
                    <div className="text-right">
                      {aff.estActuelle ? (
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                          Poste Actuel
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Jusqu'au {formatDate(aff.dateFin)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-6 text-center">Aucun historique d'affectation.</p>
              )}
            </div>
          )}

          {/* 6. DOCUMENTS */}
          {activeTab === "docs" && (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Coffre-fort Numérique RH</h3>
                <button
                  type="button"
                  onClick={() => setIsAddDocOpen(!isAddDocOpen)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 shadow-2xs transition-colors"
                >
                  <PlusIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>Déposer un Document</span>
                </button>
              </div>

              {/* Formulaire ajout document */}
              {isAddDocOpen && (
                <form onSubmit={handleSaveDoc} className="rounded-xl border border-brand-200 bg-brand-50/20 p-4 space-y-3 dark:border-brand-900/40 dark:bg-brand-950/20 text-xs">
                  <div className="font-bold text-brand-700 dark:text-brand-300">Déposer un document au coffre RH</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Titre du document *</label>
                      <input
                        type="text"
                        required
                        value={docForm.titre}
                        onChange={(e) => setDocForm({ ...docForm, titre: e.target.value })}
                        placeholder="Ex: CNI Recto-Verso, Diplôme Master"
                        className="w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Type de Document</label>
                      <select
                        value={docForm.typeDocument}
                        onChange={(e) => setDocForm({ ...docForm, typeDocument: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="CNI">Pièce d'Identité / Passeport</option>
                        <option value="CONTRAT_SIGNE">Contrat de Travail Signé</option>
                        <option value="DIPLOME">Diplôme & Attestation</option>
                        <option value="CERTIFICAT_MEDICAL">Certificat Médical d'Aptitude</option>
                        <option value="RIB">RIB Bancaire</option>
                        <option value="AUTRE">Autre Document</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Lien / URL du Fichier</label>
                      <input
                        type="text"
                        value={docForm.fichierUrl}
                        onChange={(e) => setDocForm({ ...docForm, fichierUrl: e.target.value })}
                        placeholder="https://... ou chemin fichier"
                        className="w-full rounded-xl border border-gray-300 p-2 font-mono dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddDocOpen(false)}
                      className="rounded-xl border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-brand-500 px-4 py-1.5 font-semibold text-white hover:bg-brand-600"
                    >
                      Archiver Document
                    </button>
                  </div>
                </form>
              )}

              {rawDocs.length > 0 ? (
                rawDocs.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 p-3 text-sm dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <DocsIcon className="h-5 w-5 shrink-0 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{doc.titre}</div>
                        <div className="text-xs text-gray-500">{formatDocumentType(doc.typeDocument)}</div>
                      </div>
                    </div>
                    {doc.fichierUrl && (
                      <a
                        href={doc.fichierUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition-colors"
                      >
                        Consulter
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-6 text-center">Aucun document archivé dans le coffre RH.</p>
              )}
            </div>
          )}

          {/* 7. COMPTE ERP & ACCÈS */}
          {activeTab === "compte" && (
            <div className="space-y-6">
              {employe.utilisateur ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-brand-200 bg-linear-to-r from-brand-50/50 to-white p-5 dark:border-brand-900/40 dark:from-brand-950/20 dark:to-gray-900">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-md">
                          <UserCircleIcon className="h-7 w-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white text-base">
                              {employe.utilisateur.email}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              <CheckCircleIcon className="h-3.5 w-3.5" />
                              <span>{employe.utilisateur.isActive ? "Compte Actif" : "Compte Désactivé"}</span>
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Compte utilisateur relié au dossier collaborateur
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleDelierCompte}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100/70 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300 transition-colors"
                      >
                        <TrashBinIcon className="h-4 w-4" />
                        <span>Dissocier le compte</span>
                      </button>
                    </div>
                  </div>

                  {/* Rôles et habilitations */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-850 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      <LockIcon className="h-4 w-4 text-brand-500" />
                      <span>Rôles & Permissions Attribués</span>
                    </div>

                    {employe.utilisateur.roles && employe.utilisateur.roles.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {employe.utilisateur.roles.map((r, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50/60 px-3 py-1.5 text-xs font-medium text-brand-900 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-300"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                            <span>{r.role?.name || r.role?.code || "Rôle standard"}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Aucun rôle spécifique attribué (Accès standard).
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 p-8 text-center dark:border-gray-700 dark:bg-gray-850/40 space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400 border border-brand-200/50 dark:border-brand-900/50">
                    <LockIcon className="h-7 w-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="font-bold text-gray-900 dark:text-white text-base">
                      Aucun compte d'accès ERP associé
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Ce collaborateur n'a pas encore de compte utilisateur pour se connecter à Nexera (devis, factures, portail salarié).
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreerCompteOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-600 shadow-sm transition-all active:scale-[0.98]"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Créer un compte d'accès ERP</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pied de page modal */}
        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Modale de création de compte ERP */}
      {isCreerCompteOpen && (
        <CreerCompteErpModal
          isOpen={isCreerCompteOpen}
          onClose={() => setIsCreerCompteOpen(false)}
          employe={employe}
          onSuccess={() => {
            refreshEmployeData();
            onRefresh?.();
          }}
        />
      )}
    </Modal>
  );
};
