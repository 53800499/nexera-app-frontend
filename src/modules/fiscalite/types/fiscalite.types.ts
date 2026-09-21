export type TaxTypeCategorie =
  | 'IMPOT_RESULTAT'
  | 'TAXE_CHIFFRE_AFFAIRES'
  | 'RETENUE_SOURCE'
  | 'TAXE_PATRIMOINE'
  | 'TAXE_LOCALE'
  | 'DROIT_ENREGISTREMENT_TIMBRE'
  | 'AUTRE';

export type TaxStatutBareme = 'BROUILLON' | 'VALIDE' | 'ACTIF' | 'REMPLACE';

export type TaxStatutVeille =
  | 'A_QUALIFIER'
  | 'QUALIFIEE'
  | 'PARAMETRAGE_EN_COURS'
  | 'APPLIQUEE'
  | 'SANS_IMPACT_LOGICIEL';

export type TaxTypeSource =
  | 'LOI_FINANCES'
  | 'CODE_GENERAL_IMPOTS'
  | 'ARRETE'
  | 'CIRCULAIRE'
  | 'NOTE_ADMINISTRATIVE'
  | 'DECISION_JUSTICE'
  | 'AUTRE';

export type TaxStatutDeclaration =
  | 'BROUILLON'
  | 'VALIDEE'
  | 'DECLAREE'
  | 'PAYEE'
  | 'EN_RETARD';

export type TaxStatutEcheance = 'A_VENIR' | 'DUE' | 'PAYEE' | 'EN_RETARD';

export interface TaxPays {
  codeIso2: string;
  libelle: string;
  deviseCode: string;
  administrationFiscaleLibelle?: string;
  administrationFiscaleSigle?: string;
  actif: boolean;
}

export interface TaxSourceReglementaire {
  id: string;
  paysCode: string;
  typeSource: TaxTypeSource;
  reference: string;
  titre: string;
  datePublication: string;
  dateEntreeVigueur: string;
  fichierUrl?: string;
  resume?: string;
  statutVeille: TaxStatutVeille;
  saisiParUtilisateurId?: string;
  createdAt: string;
}

export interface TaxBaremeTranche {
  id: string;
  taxBaremeId: string;
  ordre: number;
  critereSecondaire?: string;
  borneMin: number;
  borneMax?: number;
  taux?: number;
  montantFixe?: number;
}

export interface TaxBareme {
  id: string;
  taxTypeId: string;
  sourceReglementaireId: string;
  libelle: string;
  secteurActivite?: string;
  tauxDefaut?: number;
  dateDebutValidite: string;
  dateFinValidite?: string;
  statut: TaxStatutBareme;
  sourceReglementaire?: TaxSourceReglementaire;
  tranches?: TaxBaremeTranche[];
  taxType?: TaxType;
}

export interface TaxType {
  id: string;
  paysCode: string;
  code: string;
  libelle: string;
  categorie: TaxTypeCategorie;
  periodiciteDeclarative: string;
  modeCalcul: string;
  applicableRegimeSynthetique: boolean;
  texteReferenceDefaut?: string;
  actif: boolean;
  baremes?: TaxBareme[];
}

export interface TaxRegimeImposition {
  id: string;
  paysCode: string;
  code: string;
  libelle: string;
  seuilChiffreAffairesMax?: number;
  obligationComptable: string;
  dateDebutValidite: string;
}

export interface TaxParametrePays {
  id: string;
  paysCode: string;
  codeParametre: string;
  code?: string;
  libelle: string;
  typeValeur: string;
  valeur: string;
  valeurNumerique?: number | null;
  valeurTexte?: string | null;
  unite?: string;
  dateDebutValidite: string;
  sourceReglementaire?: TaxSourceReglementaire;
}

export interface TaxContribuableOption {
  id: string;
  taxContribuableId: string;
  typeOption: string;
  dateEffet: string;
  documentUrl?: string;
}

export interface TaxEtablissementSecondaire {
  id: string;
  taxContribuableId: string;
  libelle: string;
  zoneAdministrative?: string;
  adresse?: string;
}

export interface TaxContribuable {
  id: string;
  tenantId: string;
  etablissementRefId: string;
  paysCode: string;
  identifiantFiscalUnique: string;
  secteurActivite?: string;
  zoneAdministrative?: string;
  regimeImpositionId: string;
  centreImpotsRattachement?: string;
  assujettiTva: boolean;
  assujettiIs: boolean;
  pays?: TaxPays;
  regimeImposition?: TaxRegimeImposition;
  options?: TaxContribuableOption[];
  etablissementsSecondaires?: TaxEtablissementSecondaire[];
}

export interface TaxRetraitementFiscal {
  id: string;
  taxExerciceFiscalId: string;
  sens: 'REINTEGRATION' | 'DEDUCTION';
  libelle: string;
  montant: number;
  baseLegale?: string;
  ecritureSourceRefId?: string;
}

export interface TaxCalculIs {
  id: string;
  taxExerciceFiscalId: string;
  resultatComptableNet: number;
  totalReintegrations: number;
  totalDeductions: number;
  resultatFiscal: number;
  tauxIsApplique: number;
  isCalculeTaux: number;
  produitsEncaissables?: number;
  minimumPerceptionTaux?: number;
  minimumPerceptionMontant?: number;
  isDu: number;
  totalAcomptesVerses: number;
  soldeAPayer: number;
  statut: 'BROUILLON' | 'VALIDE' | 'DECLARE' | 'TRANSMIS_M3';
  statutCalcul?: string;
  tauxApplicable?: number;
  appliqueMinimumPerception?: boolean;
  valideParUtilisateurId?: string;
  createdAt: string;
}

export interface TaxAcompteIs {
  id: string;
  taxExerciceFiscalId: string;
  numeroAcompte: number;
  dateEcheance: string;
  montantDu: number;
  montantPaye: number;
  statut: 'A_PAYER' | 'PAYE' | 'EN_RETARD';
}

export interface TaxExerciceFiscal {
  id: string;
  taxContribuableId: string;
  dateDebut: string;
  dateFin: string;
  exerciceComptableRefId?: string;
  statut: 'OUVERT' | 'EN_CALCUL' | 'DECLARE' | 'CLOTURE';
  calculIs?: TaxCalculIs;
  retraitements?: TaxRetraitementFiscal[];
  acomptesIs?: TaxAcompteIs[];
  acomptes?: TaxAcompteIs[];
  contribuable?: TaxContribuable;
}

export interface TaxDeclarationTvaLigne {
  id: string;
  taxDeclarationTvaId: string;
  nature: 'VENTE_TAXABLE' | 'VENTE_EXONEREE' | 'ACHAT_DEDUCTIBLE' | 'IMPORTATION' | 'NOTE_FRAIS_DEDUCTIBLE';
  tauxApplique: number;
  baseHorsTaxe: number;
  montantTva: number;
  evenementSourceId?: string;
}

export interface TaxDeclarationTva {
  id: string;
  taxContribuableId: string;
  periode: string; // AAAA-MM
  tvaCollectee: number;
  tvaDeductible: number;
  creditTvaAnterieur: number;
  tvaNetteDue: number;
  dateLimiteLegale: string;
  statut: TaxStatutDeclaration;
  createdAt: string;
  lignes?: TaxDeclarationTvaLigne[];
}

export interface TaxRetenueAib {
  id: string;
  taxContribuableId: string;
  evenementSourceId: string;
  natureOperation: 'IMPORTATION' | 'ACHAT_COMMERCIAL_IFU' | 'PRESTATION_SERVICE_IFU' | 'ACHAT_NON_IMMATRICULE';
  tauxApplique: number;
  base: number;
  montantRetenu: number;
  periodeDeclarative: string;
  imputableIs: boolean;
  createdAt: string;
  evenementSource?: any;
  natureAib?: 'SUBIE' | 'OPEREE' | string;
  tiersNom?: string;
  tiersIfu?: string;
  taux?: number;
  baseCalcul?: number;
  statut?: string;
}

export interface TaxDeclarationGeneriqueLigne {
  id: string;
  taxDeclarationGeneriqueId: string;
  libelle: string;
  montant: number;
}

export interface TaxDeclarationGenerique {
  id: string;
  taxContribuableId: string;
  taxTypeId: string;
  periodeOuExercice: string;
  baseImposable?: number;
  tauxOuBaremeAppliqueId?: string;
  montantCalcule: number;
  dateLimiteLegale: string;
  statut: TaxStatutDeclaration;
  taxType?: TaxType;
  lignes?: TaxDeclarationGeneriqueLigne[];
}

export interface TaxLiasseFiscale {
  id: string;
  taxExerciceFiscalId: string;
  typeSystemeComptable: 'SYSTEME_NORMAL' | 'SMT';
  dateGeneration: string;
  dateLimiteDepot: string;
  statut: 'GENEREE' | 'EN_REVISION_CABINET' | 'VALIDEE' | 'DEPOSEE';
  valideParCabinet: boolean;
  documentUrl?: string;
  exerciceFiscal?: TaxExerciceFiscal;
  annexes?: any[];
}

export interface TaxEcheance {
  id: string;
  taxContribuableId: string;
  taxTypeId: string;
  objetLieType?: string;
  objetLieId?: string;
  dateLimite: string;
  montantEstime?: number;
  statut: TaxStatutEcheance;
  statutCalcul?: string;
  datePaiement?: string;
  periodeOuExercice?: string;
  penaliteEstimee?: number;
  montantTotalAvecPenalite?: number;
  taxType?: TaxType;
}

export interface FecAuditConformite {
  conforme: boolean;
  nombreLignes: number;
  totalDebit: number;
  totalCredit: number;
  ecart: number;
  anomalies: string[];
  referenceNorme: string;
}

export interface FecExportResult {
  nomFichier: string;
  contenuFichier: string;
  mimeType: string;
  tailleOctets: number;
  auditConformite: FecAuditConformite;
  lignes?: any[];
}

export interface TaxControleFiscal {
  id: string;
  taxContribuableId: string;
  typeControle: 'SUR_PIECES' | 'SUR_PLACE' | 'PONCTUEL';
  dateAvisVerification?: string;
  periodeControleeDebut?: string;
  periodeControleeFin?: string;
  serviceEnCharge?: string;
  statut: 'EN_COURS' | 'CLOTURE_SANS_REDRESSEMENT' | 'CLOTURE_AVEC_REDRESSEMENT';
  redressements?: any[];
}

export interface TaxReclamationContentieuse {
  id: string;
  redressementId?: string;
  taxContribuableId: string;
  typeRecours: 'RECLAMATION_PREALABLE' | 'RECOURS_HIERARCHIQUE' | 'RECOURS_JURIDICTIONNEL' | 'DEMANDE_GRACIEUSE';
  dateDepot: string;
  objet: string;
  statut: 'EN_COURS' | 'ACCEPTEE' | 'REJETEE' | 'PARTIELLEMENT_ACCEPTEE';
  decisionDocumentUrl?: string;
}

export interface FiscaliteDashboardKpis {
  hasContribuable: boolean;
  contribuable?: {
    id: string;
    ifu: string;
    pays: string;
    regime: string;
    secteurActivite: string;
    centreImpots?: string;
  };
  kpis: {
    tvaNetteMois: number;
    creditTvaReporte: number;
    isEstime: number;
    acomptesIsVerses: number;
    acomptesIsRestants: number;
    sourcesEnAttenteQualification: number;
    prochainesEcheancesCount: number;
    controlesEnCoursCount: number;
    tauxEffectifEstime: number;
  };
  prochainesEcheances: TaxEcheance[];
  sourcesRecentes: TaxSourceReglementaire[];
}
