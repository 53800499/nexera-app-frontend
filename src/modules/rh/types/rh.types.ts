export type RhGender = "M" | "F";
export type RhMaritalStatus = "CELIBATAIRE" | "MARIE" | "DIVORCE" | "VEUF" | "PACS" | "UNION_LIBRE";
export type RhIdentityDocType = "CNI" | "PASSEPORT" | "CARTE_SEJOUR" | "CIP" | "AUTRE";
export type RhEmploymentStatus = "ACTIF" | "EN_CONGE" | "SUSPENDU" | "DEMISSIONNE" | "LICENCIE" | "RETRAITE";
export type RhEmployeeStatus = RhEmploymentStatus;
export type RhContractType = "CDI" | "CDD" | "STAGE" | "APPRENTISSAGE" | "INTERIM" | "CONSULTANT";
export type RhContractStatus = "BROUILLON" | "ACTIF" | "SUSPENDU" | "CLOTURE" | "RESILIE" | "ROMPU" | "TERMINE";
export type RhProbationOutcome = "EN_COURS" | "VALIDE" | "RENOUVELE" | "ROMPU";
export type RhProbationStatus = RhProbationOutcome;
export type RhTimeRecordStatus = "SAISI" | "VALIDE_MANAGER" | "VALIDE_RH" | "REJETE";
export type RhAbsenceStatus = "SOUMIS" | "VALIDE_MANAGER" | "VALIDE_RH" | "REJETE" | "ANNULE";
export type RhPayrollCycleStatus = "BROUILLON" | "OUVERT" | "CALCULE" | "VALIDE" | "CLOTURE" | "COMPTABILISE";
export type RhPayslipStatus = "BROUILLON" | "CALCULE" | "VALIDE" | "PAYE" | "ANNULE";
export type RhPaymentMethod = "VIREMENT_BANCAIRE" | "CHEQUE" | "ESPECES" | "MOBILE_MONEY";
export type RhPayrollRubricType =
  | "GAIN_BRUT"
  | "INDEMNITE_NON_IMPOSABLE"
  | "AVANTAGE_EN_NATURE"
  | "RETENUE_SALARIALE_CNSS"
  | "RETENUE_FISCALE_ITS"
  | "CHARGE_PATRONALE_CNSS"
  | "CHARGE_PATRONALE_VPS"
  | "RETENUE_NETTE_AUTRE"
  | "GAIN_NET_NON_IMPOSABLE";

export interface RhPays {
  codeIso2: string;
  codeIso3: string;
  nom: string;
  deviseIso: string;
  zoneFiscaleSociale: string;
  tauxSmigHoraire?: number;
  tauxSmigMensuel?: number;
  tauxCnssSalarialDefaut?: number;
  tauxCnssPatronalDefaut?: number;
  tauxVpsPatronalDefaut?: number;
  actif: boolean;
}

export interface RhEtablissement {
  id: string;
  tenantId: string;
  code: string;
  raisonSociale: string;
  nom?: string;
  identifiantFiscal?: string;
  ifu?: string;
  numeroEmployeurSecuSociale?: string;
  numeroCnss?: string;
  adresse?: string;
  adresseLigne1?: string;
  ville?: string;
  telephone?: string;
  email?: string;
  paysCode: string;
  estSiege: boolean;
  actif: boolean;
  pays?: RhPays;
}

export interface RhDepartement {
  id: string;
  tenantId: string;
  etablissementId?: string;
  code: string;
  libelle: string;
  parentDepartementId?: string;
  departementParentId?: string;
  responsableEmployeId?: string;
  actif: boolean;
  parentDepartement?: RhDepartement;
  sousDepartements?: RhDepartement[];
  etablissement?: RhEtablissement;
}

export interface RhPoste {
  id: string;
  tenantId: string;
  code: string;
  intitule: string;
  departementId: string;
  description?: string;
  descriptionMission?: string;
  niveauHierarchique?: number;
  salaireMinConseille?: number;
  salaireMaxConseille?: number;
  tauxRisqueAt?: number | null;
  actif: boolean;
  departement?: RhDepartement;
}

export interface RhEmploye {
  id: string;
  tenantId: string;
  matricule: string;
  nom: string;
  prenoms: string;
  nomJeuneFille?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  nationaliteIso2?: string;
  sexe?: RhGender;
  situationFamiliale?: RhMaritalStatus;
  nombreEnfantsCharge: number;
  emailProfessionnel?: string;
  emailPersonnel?: string;
  telephone1?: string;
  telephone2?: string;
  telephonePrincipal?: string;
  adresseResidence?: string;
  adresseLigne1?: string;
  villeResidence?: string;
  ville?: string;
  npi?: string;
  numeroCnss?: string;
  numeroIfu?: string;
  typePieceIdentite?: RhIdentityDocType;
  numeroPieceIdentite?: string;
  dateExpirationPiece?: string;
  dateEntree?: string;
  dateEntreeEntreprise?: string;
  dateSortie?: string;
  statutEmploi: RhEmploymentStatus;
  photoUrl?: string;
  utilisateurId?: string;
  utilisateur?: RhEmployeUserAccount;
  coordonneesBancaires?: RhCoordonneeBancaire[];
  affectations?: RhAffectation[];
  contrats?: RhContrat[];
  personnesACharge?: RhPersonneACharge[];
  documentsAdministratifs?: RhDocumentAdministratif[];
  documents?: any[];
  soldesConges?: any[];
  bulletinsPaie?: any[];
  historiquesSalaire?: any[];
}

export interface RhEmployeUserAccount {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  roles?: Array<{
    id?: string;
    roleId?: string;
    role?: {
      id: string;
      name: string;
      code: string;
      description?: string;
    };
  }>;
}

export interface CreerCompteUtilisateurPayload {
  email?: string;
  roleIds?: string[];
  password?: string;
  envoyerInvitation?: boolean;
}

export interface LierCompteUtilisateurPayload {
  utilisateurId: string;
}

export interface RhPersonneACharge {
  id: string;
  employeId: string;
  lienParente: string;
  nomPrenoms: string;
  dateNaissance: string;
  estFiscalementACharge: boolean;
}

export interface RhCoordonneeBancaire {
  id: string;
  employeId: string;
  modePaiement: RhPaymentMethod;
  banqueNom?: string;
  codeBanque?: string;
  codeGuichet?: string;
  numeroCompteIban?: string;
  cleRib?: string;
  operateurMobileMoney?: string;
  numeroMobileMoney?: string;
  estComptePrincipal: boolean;
}

export interface RhAffectation {
  id: string;
  employeId: string;
  etablissementId: string;
  departementId: string;
  posteId: string;
  dateDebut: string;
  dateFin?: string;
  estActuelle: boolean;
  etablissement?: RhEtablissement;
  departement?: RhDepartement;
  poste?: RhPoste;
}

export interface RhDocumentAdministratif {
  id: string;
  employeId: string;
  typeDocument: string;
  titre: string;
  fichierUrl: string;
  dateExpiration?: string;
  creeLe: string;
}

export interface RhContrat {
  id: string;
  tenantId: string;
  employeId: string;
  etablissementId: string;
  posteId: string;
  conventionCollectiveId?: string;
  categorieProfessionnelleId?: string;
  categorieProId?: string;
  numeroContrat: string;
  typeContrat: RhContractType;
  dateSignature?: string;
  dateDebut: string;
  dateFinPrevue?: string;
  dateFinReelle?: string;
  clauseExclusivite?: boolean;
  clauseNonConcurrence?: boolean;
  salaireBaseMensuel: number;
  devise?: string;
  deviseCode?: string;
  dureeHebdoContrat?: number;
  tauxRisqueAt?: number | null;
  fichierContratUrl?: string;
  notes?: string;
  statut: RhContractStatus;
  motifFin?: string;
  employe?: RhEmploye;
  etablissement?: RhEtablissement;
  poste?: RhPoste;
  conventionCollective?: any;
  categorieProfessionnelle?: any;
  periodeEssai?: RhPeriodeEssai | null;
  periodesEssai?: RhPeriodeEssai[];
  avenants?: RhAvenant[];
  rupture?: RhRupture | null;
  _count?: {
    avenants?: number;
    bulletinsPaie?: number;
  };
}

export interface RhPeriodeEssai {
  id: string;
  contratId: string;
  dateDebut: string;
  dateFin: string;
  dureeJoursOuvres?: number;
  dureeMois?: number;
  estRenouvele: boolean;
  dateDebutRenouvellement?: string;
  dateFinRenouvellement?: string;
  statutIssue: RhProbationStatus | RhProbationOutcome;
  dateNotificationRupture?: string;
  motifRupture?: string;
  motifCommentaire?: string;
}

export interface RhAvenant {
  id: string;
  contratId: string;
  numeroAvenant: string;
  dateNotification?: string;
  dateSignature?: string;
  dateEffet: string;
  typeModification?: RhAmendmentType;
  objetModifie?: string;
  detailsModificationsJson?: any;
  salaireBaseAvant?: number;
  ancienSalaireBase?: number;
  salaireBaseApres?: number;
  nouveauSalaireBase?: number;
  tempsTravailAvant?: number;
  tempsTravailApres?: number;
  fichierAvenantUrl?: string;
  creeLe?: string;
}

export interface RhRupture {
  id: string;
  contratId: string;
  typeRupture: RhTerminationType;
  dateNotification: string;
  dateEffet: string;
  dureePreavisJours: number;
  dispensePreavis: boolean;
  montantIndemnitePreavis: number;
  montantIndemniteLicenciement: number;
  montantIndemniteCongesPayes: number;
  montantDommagesInterets: number;
  motifDetaille?: string;
  creeLe?: string;
}

export type RhAmendmentType =
  | "SALAIRE"
  | "POSTE"
  | "DUREE_TRAVAIL"
  | "LIEU_TRAVAIL"
  | "STATUT"
  | "AUTRE";

export type RhTerminationType =
  | "DEMISSION"
  | "LICENCIEMENT_MOTIF_PERSONNEL"
  | "LICENCIEMENT_ECONOMIQUE"
  | "LICENCIEMENT_FAUTE_GRAVE"
  | "LICENCIEMENT_FAUTE_LOURDE"
  | "RUPTURE_CONVENTIONNELLE"
  | "FIN_CDD"
  | "DECES"
  | "DEPART_RETRAITE"
  | "MISE_A_RETRAITE"
  | "FORCE_MAJEURE";

export interface CreateContratPayload {
  employeId: string;
  etablissementId: string;
  posteId?: string;
  numeroContrat?: string;
  typeContrat: RhContractType;
  dateSignature?: string;
  dateDebut: string;
  dateFinPrevue?: string;
  clauseExclusivite?: boolean;
  clauseNonConcurrence?: boolean;
  salaireBaseMensuel: number;
  deviseCode?: string;
  dureeHebdoContrat?: number;
  categorieProfessionnelleId?: string;
  conventionCollectiveId?: string;
  periodeEssaiMois?: number;
  fichierContratUrl?: string;
  notes?: string;
}

export interface UpdateContratPayload {
  statut?: RhContractStatus;
  dateFinPrevue?: string;
  salaireBaseMensuel?: number;
  dureeHebdoContrat?: number;
  posteId?: string;
  categorieProfessionnelleId?: string;
  fichierContratUrl?: string;
  notes?: string;
}

export interface CreateAvenantPayload {
  numeroAvenant?: string;
  dateNotification?: string;
  dateEffet: string;
  typeModification: RhAmendmentType;
  salaireBaseApres?: number;
  tempsTravailApres?: number;
  detailsModificationsJson?: any;
  fichierAvenantUrl?: string;
}

export interface RenouvelerEssaiPayload {
  dateDebutRenouvellement: string;
  dateFinRenouvellement: string;
  motif?: string;
}

export interface IssueEssaiPayload {
  statutIssue: RhProbationStatus;
  dateNotificationRupture?: string;
  motifRupture?: string;
}

export interface CreateRupturePayload {
  typeRupture: RhTerminationType;
  dateNotification: string;
  dateEffet: string;
  dureePreavisJours?: number;
  dispensePreavis?: boolean;
  montantIndemnitePreavis?: number;
  montantIndemniteLicenciement?: number;
  montantIndemniteCongesPayes?: number;
  montantDommagesInterets?: number;
  motifDetaille?: string;
}

export interface RhReleveTemps {
  id: string;
  employeId: string;
  dateJour: string;
  heuresNormales: number;
  heuresSup15: number;
  heuresSup50: number;
  heuresSupNuit: number;
  heuresSupDimancheFerie: number;
  statutValidation: RhTimeRecordStatus;
  employe?: RhEmploye;
}

export interface RhAbsence {
  id: string;
  employeId: string;
  typeAbsenceId: string;
  dateDebut: string;
  dateFin: string;
  nombreJoursOuvrables: number;
  statut: RhAbsenceStatus;
  motif?: string;
  pieceJustificativeUrl?: string;
  employe?: RhEmploye;
  typeAbsence?: {
    id: string;
    code: string;
    libelle: string;
    estPaye: boolean;
    decompteJoursConges: boolean;
  };
}

export interface RhSoldeConge {
  id: string;
  tenantId?: string;
  employeId: string;
  anneeReference: number;
  soldeDebutAnnee?: number;
  droitsAcquis: number;
  droitsAcquisJours?: number; // Alias de compatibilité
  droitsSupplementairesAnciennete?: number;
  droitsSupplementairesEnfants?: number;
  joursConsommes: number;
  joursPris?: number; // Alias de compatibilité
  joursRestants: number;
  soldeReporte?: number;
  createdAt?: string;
  updatedAt?: string;
  employe?: RhEmploye;
}

export interface AdjustSoldeCongePayload {
  anneeReference: number;
  soldeDebutAnnee?: number;
  droitsAcquis?: number;
  droitsSupplementairesAnciennete?: number;
  droitsSupplementairesEnfants?: number;
  joursConsommes?: number;
  soldeReporte?: number;
  motif?: string;
}


export interface RhRubriquePaie {
  id: string;
  paysCode: string;
  code: string;
  libelle: string;
  typeRubrique: RhPayrollRubricType;
  sensDefaut: "GAIN" | "RETENUE" | "INFORMATION";
  assujettiIts: boolean;
  assujettiCnss: boolean;
  assujettiVps: boolean;
  ordreAffichage: number;
  actif: boolean;
  compteComptableCharge?: string;
  compteComptableTiers?: string;
}

export interface RhCyclePaie {
  id: string;
  tenantId: string;
  etablissementId: string;
  annee: number;
  mois: number;
  codeCycle: string;
  dateDebut: string;
  dateFin: string;
  datePaiementPrevue?: string;
  statut: RhPayrollCycleStatus;
  dateCalcul?: string;
  dateValidationFinale?: string;
  etablissement?: RhEtablissement;
  bulletinsPaie?: RhBulletinPaie[];
  elementsVariables?: RhElementVariable[];
  ecrituresComptables?: RhEcritureComptablePaie[];
  declarations?: RhDeclarationSocialeFiscale[];
  _count?: {
    bulletinsPaie: number;
    elementsVariables: number;
  };
}

export interface RhElementVariable {
  id: string;
  employeId: string;
  rubriquePaieId: string;
  cyclePaieId: string;
  base?: number;
  taux?: number;
  montant: number;
  commentaire?: string;
  employe?: RhEmploye;
  rubriquePaie?: RhRubriquePaie;
}

export interface RhBulletinPaie {
  id: string;
  cyclePaieId: string;
  employeId: string;
  contratId: string;
  numeroBulletin: string;
  dateDebutPeriode: string;
  dateFinPeriode: string;
  datePaiement?: string;
  modePaiement: RhPaymentMethod;
  salaireBase: number;
  heuresNormales: number;
  heuresSupplementairesTotal: number;
  montantHeuresSup: number;
  montantPrimesIndemnitesBrutes: number;
  montantAvantagesNature: number;
  totalSalaireBrut: number;
  totalAssietteCnss: number;
  totalAssietteIts: number;
  totalAssietteVps: number;
  montantCnssSalariale: number;
  montantImpotSalaire: number;
  montantAutresRetenuesSalariales: number;
  totalRetenuesSalariales: number;
  montantCnssPatronale: number;
  montantVpsPatronale: number;
  totalChargesPatronales: number;
  netImposable: number;
  netAPayer: number;
  netApresRetenues: number;
  statut: RhPayslipStatus;
  fichierPdfUrl?: string;
  employe?: RhEmploye;
  contrat?: RhContrat;
  cyclePaie?: RhCyclePaie;
  lignes?: RhBulletinPaieLigne[];
}

export interface RhBulletinPaieLigne {
  id: string;
  bulletinPaieId: string;
  codeRubrique: string;
  libelleRubrique: string;
  typeRubrique: RhPayrollRubricType;
  sens: "GAIN" | "RETENUE" | "INFORMATION";
  base?: number;
  taux?: number;
  montantGain: number;
  montantRetenue: number;
  partPatronaleMontant: number;
  ordre: number;
}

export interface RhSoldeToutCompte {
  id: string;
  employeId: string;
  dateEtablissement: string;
  montantDernierSalaireNet: number;
  montantIndemnitePreavisNet: number;
  montantIndemniteLicenciementNet: number;
  montantIndemniteCongesPayesNet: number;
  montantRetenuesDiverses: number;
  montantTotalNet: number;
  recuPourSoldeSigne: boolean;
  statutSignature: string;
  dateSignature?: string;
  certificatTravailGenere: boolean;
  employe?: RhEmploye;
}

export interface RhEcritureComptablePaie {
  id: string;
  cyclePaieId?: string;
  stcId?: string;
  dateEcriture: string;
  journalCode: string;
  libellePiece: string;
  montantTotalDebit: number;
  montantTotalCredit: number;
  estEquilibree: boolean;
  statut: string;
  etablissement?: RhEtablissement;
  employe?: RhEmploye;
  lignes?: Array<{
    id?: string;
    numeroLigne: number;
    compteNumero: string;
    libelle: string;
    montantDebit: number;
    montantCredit: number;
    rubriquePaieId?: string | null;
  }>;
}

export interface RhDeclarationSocialeFiscale {
  id: string;
  cyclePaieId: string;
  typeDeclaration: string;
  periodeDeclaration: string;
  montantBase: number;
  montantTotal: number;
  nombreSalariesConcernes: number;
  dateLimiteLegale: string;
  statut: string;
  etablissement?: RhEtablissement;
}

export interface RhDashboardSummary {
  kpi: {
    totalEmployes: number;
    totalActifs: number;
    totalContratsActifs: number;
    masseSalarialeBrute: number;
    totalNetAPayer: number;
    totalIts: number;
    totalCnss: number;
    totalVps: number;
    totalChargesPatronales: number;
    absencesEnAttente: number;
    employesEnCongeAujourdhui: number;
  };
  dernierCycle: {
    id: string;
    annee: number;
    mois: number;
    codeCycle: string;
    statut: RhPayrollCycleStatus;
    nombreBulletins: number;
  } | null;
  alertes: {
    contratsExpirantBientot: Array<{
      contratId: string;
      numeroContrat: string;
      employeNom: string;
      matricule: string;
      dateFinPrevue: string;
    }>;
    essaisExpirantBientot: Array<{
      contratId: string;
      employeNom: string;
      matricule: string;
      dateFinEssai: string;
      estRenouvele: boolean;
    }>;
  };
  repartition: {
    parGenre: Array<{ genre: string; count: number }>;
    parTypeContrat: Array<{ type: string; count: number }>;
    parDepartement: Array<{ departementId: string; libelle: string; count: number }>;
  };
}
