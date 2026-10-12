export type ComptaClasse = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type ComptaSensSolde = 'DEBITEUR' | 'CREDITEUR' | 'INDETERMINE';

export type ComptaTypeJournal =
  | 'VENTES'
  | 'ACHATS'
  | 'BANQUE'
  | 'CAISSE'
  | 'OPERATIONS_DIVERSES'
  | 'A_NOUVEAUX'
  | 'PAIE'
  | 'NOTES_DE_FRAIS';

export type ComptaStatutExercice = 'OUVERT' | 'CLOTURE' | 'ARCHIVE';

export type ComptaStatutPeriode = 'OUVERTE' | 'CLOTUREE' | 'VERROUILLEE';

export type ComptaStatutEcriture =
  | 'BROUILLON'
  | 'EN_ATTENTE_VALIDATION'
  | 'VALIDEE'
  | 'REJETEE'
  | 'ANNULEE';

export type ComptaOrigineEcriture =
  | 'MANUELLE'
  | 'M1'
  | 'M2'
  | 'M4'
  | 'M5'
  | 'M7'
  | 'IMPORT'
  | 'MODELE'
  | 'A_NOUVEAU';

export type ComptaSystemeComptable = 'SN' | 'SMT';

export interface ComptaCompte {
  id: string;
  tenantId?: string;
  numero: string;
  intitule: string;
  classe: ComptaClasse;
  sensAttendu: ComptaSensSolde;
  actif: boolean;
  estRacineSyscohada: boolean;
  mouvemente: boolean;
  auxiliaires?: ComptaCompteAuxiliaire[];
}

export interface ComptaCompteAuxiliaire {
  id: string;
  tenantId: string;
  compteCollectifId: string;
  codeAuxiliaire: string;
  intitule: string;
  typeTiers: 'CLIENT' | 'FOURNISSEUR' | 'SALARIE' | 'AUTRE';
  actif: boolean;
  compteCollectif?: ComptaCompte;
}

export interface ComptaJournal {
  id: string;
  tenantId: string;
  codeJournal: string;
  libelle: string;
  typeJournal: ComptaTypeJournal;
  compteContrepartieId?: string | null;
  bloqueSiCloture: boolean;
  actif: boolean;
  compteContrepartie?: ComptaCompte | null;
}

export interface ComptaPeriode {
  id: string;
  exerciceId: string;
  anneeMois?: string;
  numeroPeriode: number;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  statut: ComptaStatutPeriode;
  dateCloture?: string | null;
  cloturePar?: string | null;
}

export interface ComptaExercice {
  id: string;
  tenantId: string;
  annee: number;
  dateDebut: string;
  dateFin: string;
  statut: ComptaStatutExercice;
  dateCloture?: string | null;
  cloturePar?: string | null;
  periodes?: ComptaPeriode[];
}

export interface ComptaEcritureLigne {
  id?: string;
  ordre: number;
  compteId: string;
  compteAuxiliaireId?: string | null;
  libelleLigne?: string;
  montantDebit: number;
  montantCredit: number;
  montantDevise?: number | null;
  codeDevise?: string | null;
  lettrageId?: string | null;
  compte?: ComptaCompte;
  compteAuxiliaire?: ComptaCompteAuxiliaire | null;
}

export interface ComptaEcriture {
  id: string;
  tenantId: string;
  exerciceId: string;
  periodeId: string;
  journalId: string;
  numEcriture?: string | null;
  dateEcriture: string;
  libelle: string;
  pieceRef?: string | null;
  datePiece?: string | null;
  statut: ComptaStatutEcriture;
  origine: ComptaOrigineEcriture;
  saisiPar: string;
  validePar?: string | null;
  dateValidation?: string | null;
  motifRejet?: string | null;
  journal?: ComptaJournal;
  exercice?: ComptaExercice;
  periode?: ComptaPeriode;
  lignes: ComptaEcritureLigne[];
}

export interface GrandLivreLigne {
  id: string;
  dateEcriture: string;
  numEcriture?: string;
  journalCode: string;
  journalLibelle: string;
  pieceRef?: string;
  libelle: string;
  debit: number;
  credit: number;
  soldeProgressif: number;
  lettrageCode?: string;
  compteAuxiliaire?: { id: string; code: string; intitule: string } | null;
}

export interface GrandLivreCompte {
  compteId: string;
  numeroCompte: string;
  intituleCompte: string;
  classe: number;
  soldeInitial: number;
  totalDebit: number;
  totalCredit: number;
  soldeFinal: number;
  lignes: GrandLivreLigne[];
}

export interface LigneBalance {
  compteId: string;
  numero: string;
  intitule: string;
  classe: number;
  soldeInitialDebit: number;
  soldeInitialCredit: number;
  mouvementsDebit: number;
  mouvementsCredit: number;
  soldeFinalDebit: number;
  soldeFinalCredit: number;
}

export interface BalanceGeneraleResponse {
  exerciceId: string;
  periodeId?: string | null;
  estEquilibree: boolean;
  totaux: {
    soldeInitialDebit: number;
    soldeInitialCredit: number;
    mouvementsDebit: number;
    mouvementsCredit: number;
    soldeFinalDebit: number;
    soldeFinalCredit: number;
  };
  lignes: LigneBalance[];
}

export interface LigneBalanceAuxiliaire {
  compteAuxiliaireId: string;
  codeAuxiliaire: string;
  intituleAuxiliaire: string;
  compteCollectifNumero: string;
  compteCollectifIntitule: string;
  totalDebit: number;
  totalCredit: number;
  soldeDebit: number;
  soldeCredit: number;
}

export interface ComptaLettrage {
  id: string;
  codeLettre: string;
  statut: 'COMPLET' | 'PARTIEL';
  automatique: boolean;
  lettrePar: string;
  lettreLe: string;
  delettre: boolean;
}

export interface ComptaReleveBancaire {
  id: string;
  journalId: string;
  formatSource: 'CSV' | 'OFX' | 'MT940';
  dateDebut: string;
  dateFin: string;
  soldeOuverture: number;
  soldeCloture: number;
  importeLe: string;
  journal?: ComptaJournal;
}

export interface EtatFinancierResponse {
  id?: string;
  exerciceId: string;
  annee: number;
  systemeComptable: ComptaSystemeComptable;
  typeEdition: 'PROVISOIRE' | 'DEFINITIF';
  genereLe: string;
  bilan: {
    actif: {
      actifImmobilise: number;
      actifCirculant: number;
      tresorerieActif: number;
      totalActif: number;
    };
    passif: {
      capitauxPropres: number;
      dettesFinancieres: number;
      passifCirculant: number;
      tresoreriePassif: number;
      totalPassif: number;
    };
    equilibre: boolean;
    ecart: number;
  };
  compteResultat: {
    produitsExploitation: number;
    chargesExploitation: number;
    resultatExploitation: number;
    produitsFinanciers: number;
    chargesFinancieres: number;
    resultatFinancier: number;
    resultatActivitesOrdinaires: number;
    produitsHao: number;
    chargesHao: number;
    resultatHao: number;
    impotSurResultat: number;
    resultatNet: number;
  };
  fluxTresorerie: {
    tresorerieNetteDebut: number;
    variationTresorerie: number;
    tresorerieNetteFin: number;
  };
}

export interface ComptaFecExport {
  id: string;
  ifu: string;
  nomFichier: string;
  format: string;
  nombreLignes: number;
  scelle: boolean;
  empreinteSha256: string;
  motifGeneration: string;
  genereLe: string;
}

export interface ComptaRegleComptabilisation {
  id: string;
  typeEvenement: string;
  critereCategorieArticle?: string | null;
  critereTauxTva?: number | null;
  critereTypeTiers?: string | null;
  compteDebitId?: string | null;
  compteCreditId?: string | null;
  journalCibleId: string;
  niveauSpecificite: number;
  actif: boolean;
  compteDebit?: ComptaCompte | null;
  compteCredit?: ComptaCompte | null;
  journalCible?: ComptaJournal;
}

export interface ComptaEvenementSource {
  id: string;
  moduleSource: 'M1' | 'M2' | 'M4' | 'M5' | 'M7';
  typeEvenement: string;
  referenceExterne: string;
  payload: any;
  statutTraitement: 'RECU' | 'EN_ATTENTE' | 'TRAITE' | 'ANOMALIE' | 'REJETE';
  motifAnomalie?: string | null;
  recuLe: string;
  traiteLe?: string | null;
  ecrituresGenerees?: Array<{ id: string; numEcriture?: string; statut: string; libelle: string }>;
}
