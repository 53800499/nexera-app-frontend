export type NdfTypeVehicule = "VOITURE" | "MOTO" | "AUTRE";

export type NdfMissionStatut = "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "ANNULEE";

export type NdfAvanceStatut = "VERSEE" | "PARTIELLEMENT_REGULARISEE" | "SOLDEE";

export type NdfRapportStatut =
  | "BROUILLON"
  | "SOUMIS"
  | "EN_VALIDATION"
  | "VALIDE"
  | "REJETE"
  | "REMBOURSE";

export type NdfModePaiement =
  | "CARTE_PERSONNELLE"
  | "ESPECES"
  | "CARTE_AFFAIRE"
  | "VIREMENT_DIRECT_FOURNISSEUR";

export type NdfDepenseStatut = "SAISIE" | "VALIDEE" | "REJETEE";

export type NdfTypeFichier = "IMAGE" | "PDF";

export type NdfStatutTraitementIa =
  | "EN_ATTENTE"
  | "EXTRAIT"
  | "ECHEC_EXTRACTION"
  | "VALIDE_MANUELLEMENT";

export type NdfIaFonction =
  | "EXTRACTION_OCR"
  | "DETECTION_DOUBLON"
  | "DETECTION_ANOMALIE"
  | "CATEGORISATION";

export type NdfTypeRegleAnomalie =
  | "DOUBLON_POTENTIEL"
  | "DEPASSEMENT_POLITIQUE"
  | "INCOHERENCE_DATE_MISSION"
  | "INCOHERENCE_GEOGRAPHIQUE"
  | "MONTANT_INHABITUEL"
  | "FOURNISSEUR_A_RISQUE"
  | "FRACTIONNEMENT_SUSPECT";

export type NdfNiveauSeverite = "INFORMATIF" | "A_VERIFIER" | "BLOQUANT";

export type NdfAnomalieStatut = "DETECTEE" | "CONFIRMEE" | "ECARTEE_FAUX_POSITIF";

export type NdfEtapeValidationStatut =
  | "EN_ATTENTE"
  | "APPROUVEE"
  | "REJETEE"
  | "DELEGUEE";

export type NdfModeRemboursement = "VIREMENT_SEPARE" | "INTEGRE_BULLETIN_PAIE";

export type NdfRemboursementStatut = "A_PAYER" | "PAYE";

export type NdfCarteAffaireStatut = "ACTIVE" | "SUSPENDUE" | "RESILIEE";

export type NdfStatutRapprochement =
  | "NON_RAPPROCHEE"
  | "RAPPROCHEE"
  | "SANS_NOTE_FRAIS_ASSOCIEE";

export type NdfModeRapprochement = "AUTOMATIQUE_IA" | "MANUEL";

export type NdfTypeEcritureComptable = "ENGAGEMENT_DEPENSE" | "REMBOURSEMENT";

export type NdfStatutEcritureComptable =
  | "GENEREE"
  | "TRANSMISE_M3"
  | "COMPTABILISEE_M3"
  | "REJETEE_M3";

export type NdfSensEcriture = "DEBIT" | "CREDIT";

// ----------------------------------------------------
// INTERFACES MÉTIERS
// ----------------------------------------------------

export interface NdfCategorieDepense {
  id: string;
  paysCode?: string | null;
  code: string;
  libelle: string;
  compteSyscohadaDefaut?: string | null;
  tvaRecuperableParDefaut: boolean;
  tauxTvaParDefaut?: number | null;
  justificatifObligatoire: boolean;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NdfPolitiqueDepense {
  id: string;
  tenantId: string;
  categorieDepenseId: string;
  paysCode?: string | null;
  niveauHierarchique?: string | null;
  plafondMontant?: number | null;
  plafondDevise?: string | null;
  regleComplementaire?: Record<string, any> | null;
  dateDebutValidite: string;
  dateFinValidite?: string | null;
  categorieDepense?: NdfCategorieDepense;
}

export interface NdfBaremeKilometrique {
  id: string;
  paysCode: string;
  puissanceFiscaleMin: number;
  puissanceFiscaleMax?: number | null;
  typeVehicule: NdfTypeVehicule;
  tauxParKm: number;
  deviseCode: string;
  dateDebutValidite: string;
  dateFinValidite?: string | null;
  texteReference?: string | null;
}

export interface NdfBaremePerDiem {
  id: string;
  paysCode: string;
  zoneGeographique: string;
  categorieProfessionnelleLibelle?: string | null;
  montantJour: number;
  deviseCode: string;
  couvreHebergement: boolean;
  couvreRestauration: boolean;
  dateDebutValidite: string;
  dateFinValidite?: string | null;
}

export interface NdfParametrePays {
  id: string;
  paysCode: string;
  codeParametre: string;
  libelle: string;
  valeur: string;
  unite?: string | null;
  texteReference?: string | null;
  dateDebutValidite: string;
  dateFinValidite?: string | null;
}

export interface NdfMission {
  id: string;
  tenantId: string;
  employeRefId: string;
  objet: string;
  lieuDestination?: string | null;
  dateDebut: string;
  dateFin: string;
  statut: NdfMissionStatut;
  employe?: {
    id: string;
    matricule: string;
    nom: string;
    prenoms: string;
    emailProfessionnel?: string | null;
  };
  avances?: NdfAvanceFrais[];
  rapportsFrais?: NdfRapportFrais[];
  createdAt: string;
  updatedAt: string;
}

export interface NdfAvanceFrais {
  id: string;
  tenantId: string;
  employeRefId: string;
  missionId?: string | null;
  montant: number;
  deviseCode: string;
  dateVersement: string;
  montantRegularise: number;
  statut: NdfAvanceStatut;
  mission?: NdfMission;
  createdAt: string;
  updatedAt: string;
}

export interface NdfJustificatif {
  id: string;
  tenantId: string;
  ndfDepenseId: string;
  fichierUrl: string;
  typeFichier: NdfTypeFichier;
  dateUpload: string;
  statutTraitementIa: NdfStatutTraitementIa;
  extractionsIa?: NdfExtractionIa[];
}

export interface NdfExtractionIa {
  id: string;
  ndfJustificatifId: string;
  modeleIaVersionId: string;
  champsExtraits: {
    montant_ttc?: number;
    montant_tva?: number;
    taux_tva?: number;
    date?: string;
    fournisseur?: string;
    devise?: string;
    categorie_suggeree?: string;
    confiance?: Record<string, number>;
  };
  scoreConfianceGlobal: number;
  dateExtraction: string;
  corrigeManuellement: boolean;
}

export interface NdfDepenseKilometrique {
  id: string;
  ndfDepenseId: string;
  trajetDepart: string;
  trajetArrivee: string;
  distanceKm: number;
  puissanceFiscaleVehicule: number;
  baremeKilometriqueId: string;
  baremeKilometrique?: NdfBaremeKilometrique;
}

export interface NdfDepensePerDiem {
  id: string;
  ndfDepenseId: string;
  nombreJours: number;
  baremePerDiemId: string;
  baremePerDiem?: NdfBaremePerDiem;
}

export interface NdfDepense {
  id: string;
  tenantId: string;
  ndfRapportFraisId: string;
  categorieDepenseId: string;
  dateDepense: string;
  fournisseurLibelle?: string | null;
  montantTtc: number;
  montantTva?: number | null;
  tauxTvaApplique?: number | null;
  deviseCode: string;
  montantDeviseReference: number;
  modePaiement: NdfModePaiement;
  depasseSeuilEspeceLegal: boolean;
  depassePolitique: boolean;
  statut: NdfDepenseStatut;
  categorieDepense?: NdfCategorieDepense;
  depenseKilometrique?: NdfDepenseKilometrique | null;
  depensePerDiem?: NdfDepensePerDiem | null;
  justificatifs?: NdfJustificatif[];
  anomalies?: NdfAnomalieDetectee[];
  createdAt: string;
  updatedAt: string;
}

export interface NdfAnomalieDetectee {
  id: string;
  tenantId: string;
  ndfDepenseId?: string | null;
  ndfRapportFraisId: string;
  regleDetectionId: string;
  description: string;
  scoreRisque: number;
  depenseLieeSuspecteeId?: string | null;
  statut: NdfAnomalieStatut;
  traiteParUtilisateurId?: string | null;
  createdAt: string;
  regleDetection?: {
    typeRegle: NdfTypeRegleAnomalie;
    niveauSeverite: NdfNiveauSeverite;
  };
}

export interface NdfEtapeValidation {
  id: string;
  ndfRapportFraisId: string;
  ordre: number;
  valideurUtilisateurId: string;
  delegueParUtilisateurId?: string | null;
  statut: NdfEtapeValidationStatut;
  dateDecision?: string | null;
  commentaire?: string | null;
}

export interface NdfRapportFrais {
  id: string;
  tenantId: string;
  employeRefId: string;
  missionId?: string | null;
  numeroRapport: string;
  objet: string;
  periodeDebut: string;
  periodeFin: string;
  montantTotal: number;
  montantTvaRecuperableTotal: number;
  avanceFraisId?: string | null;
  statut: NdfRapportStatut;
  scoreRisqueIa?: number | null;
  employe?: {
    id: string;
    matricule: string;
    nom: string;
    prenoms: string;
  };
  mission?: NdfMission | null;
  avanceFrais?: NdfAvanceFrais | null;
  depenses?: NdfDepense[];
  anomalies?: NdfAnomalieDetectee[];
  etapesValidation?: NdfEtapeValidation[];
  createdAt: string;
  updatedAt: string;
}

export interface NdfRemboursement {
  id: string;
  tenantId: string;
  ndfRapportFraisId: string;
  modeRemboursement: NdfModeRemboursement;
  montant: number;
  dateRemboursement?: string | null;
  referenceBancaire?: string | null;
  referenceBulletinPaieM4?: string | null;
  statut: NdfRemboursementStatut;
  rapportFrais?: NdfRapportFrais;
  createdAt: string;
  updatedAt: string;
}

export interface NdfCarteAffaire {
  id: string;
  tenantId: string;
  employeRefId: string;
  numeroMasque: string;
  emetteur?: string | null;
  plafondMensuel?: number | null;
  statut: NdfCarteAffaireStatut;
  employe?: {
    nom: string;
    prenoms: string;
    matricule: string;
  };
}

export interface NdfTransactionCarteAffaire {
  id: string;
  tenantId: string;
  ndfCarteAffaireId: string;
  dateTransaction: string;
  montant: number;
  deviseCode: string;
  libelleCommercant?: string | null;
  statutRapprochement: NdfStatutRapprochement;
  carteAffaire?: NdfCarteAffaire;
}

// ----------------------------------------------------
// DTOs & KPI Dashboard
// ----------------------------------------------------

export interface NdfDashboardStats {
  totalDepensesMoisEnCours: number;
  nombreRapportsEnAttenteValidation: number;
  montantEnAttenteRemboursement: number;
  nombreAnomaliesDetectees: number;
  repartitionParCategorie: {
    categorie: string;
    montant: number;
    pourcentage: number;
  }[];
  evolutionDepensesMensuelles: {
    mois: string;
    montant: number;
  }[];
  dernieresDepenses: NdfDepense[];
}
