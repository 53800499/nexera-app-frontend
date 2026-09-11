export type LinkedCompany = {
  id: string;
  name: string;
  type: string;
  linkedAt?: string;
  permissions: string[];
};

export type CabinetDetailsSummary = {
  raisonSociale: string;
  email?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  numeroInscriptionOrdre?: string | null;
  paysCode?: string | null;
  siret?: string | null;
};

export type AuthorizedCabinet = LinkedCompany & {
  details?: CabinetDetailsSummary;
};

export type GrantCabinetAccessPayload = {
  inviteCode?: string;
  cabinetTenantId?: string;
  permissions?: string[];
};

export type UpdateCabinetPermissionsPayload = {
  permissions: string[];
};

export type CabinetInviteCodeResponse = {
  inviteCode: string;
};

export type CabinetInvoiceClientRef = {
  companyName: string;
};

export type CabinetInvoice = {
  id: string;
  number: string;
  status: string;
  invoiceType: string;
  issueDate: string;
  dueDate: string | null;
  currency: string;
  totalTtc: number;
  client: CabinetInvoiceClientRef;
};

export type PaginatedCabinetInvoices = {
  items: CabinetInvoice[];
  total: number;
  page: number;
  limit: number;
};

export type CabinetCompanyPaymentImputation = {
  id: string;
  amount: number;
  invoice: {
    id: string;
    number: string;
  };
};

export type CabinetCompanyPayment = {
  id: string;
  reference?: string | null;
  paymentDate: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  isCancelled: boolean;
  unallocatedAmount: number;
  client: {
    id: string;
    companyName: string;
  };
  imputations?: CabinetCompanyPaymentImputation[];
};

export type PaginatedCabinetPayments = {
  items: CabinetCompanyPayment[];
  total: number;
  page: number;
  limit: number;
};

export type CabinetCompanyClientContactRef = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  isPrimary?: boolean;
};

export type CabinetCompanyClient = {
  id: string;
  code: string;
  companyName: string;
  tradeName?: string | null;
  clientType: string;
  siret?: string | null;
  taxId?: string | null;
  defaultCurrency?: string;
  isArchived: boolean;
  createdAt: string;
  contacts?: CabinetCompanyClientContactRef[];
  _count?: {
    invoices: number;
    payments: number;
  };
};

export type PaginatedCabinetClients = {
  items: CabinetCompanyClient[];
  total: number;
  page: number;
  limit: number;
};


// ==========================================
// MODULE 6 — TYPES OFFICIELS SFD & MBD
// ==========================================

export type CabinetTypeMandat =
  | 'TENUE_COMPTABLE'
  | 'REVISION_ANNUELLE'
  | 'EXPERTISE_PAIE'
  | 'ASSISTANCE_FISCALE'
  | 'AUDIT_CONTRACTUEL'
  | 'MISSION_PONCTUELLE';

export type CabinetStatutMandat = 'ACTIF' | 'SUSPENDU' | 'RESILIE' | 'TERMINE';

export type CabinetPeriodiciteFacturation =
  | 'MENSUELLE'
  | 'TRIMESTRIELLE'
  | 'ANNUELLE'
  | 'FORFAIT_PONCTUEL';

export type CabinetStatutLettreMission =
  | 'BROUILLON'
  | 'ENVOYEE'
  | 'SIGNEE'
  | 'EXPIREE';

export type CabinetNiveauHabilitation =
  | 'CONSULTATION'
  | 'ANNOTATION'
  | 'VALIDATION'
  | 'SIGNATURE';

export type CabinetStatutCollaborateur = 'ACTIF' | 'SUSPENDU' | 'SORTI';

export type CabinetTypeMission = 'RECURRENTE' | 'PONCTUELLE';

export type CabinetStatutMission =
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'EN_REVUE'
  | 'TERMINEE'
  | 'EN_RETARD';

export type CabinetStatutTache = 'A_FAIRE' | 'EN_COURS' | 'FAITE' | 'BLOQUEE';

export type CabinetStatutEcheance = 'A_VENIR' | 'DUE' | 'TRAITEE' | 'EN_RETARD';

export type CabinetModuleSource =
  | 'M1_STOCK'
  | 'M2_GESTION_COMMERCIALE'
  | 'M3_COMPTABILITE'
  | 'M4_RH_PAIE'
  | 'M5_NOTES_FRAIS'
  | 'M7_FISCALITE';

export type CabinetNiveauSeverite = 'INFORMATION' | 'A_CORRIGER' | 'BLOQUANT';

export type CabinetStatutPointRevue =
  | 'OUVERT'
  | 'EN_TRAITEMENT'
  | 'RESOLU'
  | 'ECARTE';

export type CabinetStatutChecklistItem =
  | 'NON_CONTROLE'
  | 'CONFORME'
  | 'NON_CONFORME'
  | 'NON_APPLICABLE';

export type CabinetDecisionValidation =
  | 'APPROUVE'
  | 'REJETE'
  | 'RENVOYE_POUR_CORRECTION';

export type CabinetMethodeSignature =
  | 'SIGNATURE_ELECTRONIQUE_QUALIFIEE'
  | 'SIGNATURE_ELECTRONIQUE_SIMPLE'
  | 'SIGNATURE_MANUSCRITE_SCANNEE';

export type CabinetStatutNoteHonoraires =
  | 'BROUILLON'
  | 'EMISE'
  | 'PAYEE'
  | 'EN_RETARD'
  | 'ANNULEE';

export type CabinetStatutDemandePiece =
  | 'EN_ATTENTE'
  | 'RECUE'
  | 'RELANCEE'
  | 'SANS_OBJET';

export type CabinetAuteurMessage =
  | 'COLLABORATEUR_CABINET'
  | 'CONTACT_CLIENT';

export type CabinetDeposeParType =
  | 'COLLABORATEUR_CABINET'
  | 'CONTACT_CLIENT';

export type CabinetDecisionConflit =
  | 'AUCUNE_ACTION'
  | 'RETRAIT_DU_DOSSIER'
  | 'MESURE_SPECIFIQUE';

// ENTITÉS
export type CabinetEntite = {
  id: string;
  tenantId: string;
  raisonSociale: string;
  numeroInscriptionOrdre?: string | null;
  paysCode: string;
  adresse?: string | null;
  telephone?: string | null;
  emailContact?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CabinetClientContact = {
  id: string;
  cabinetClientMandatId: string;
  nomPrenoms: string;
  fonction?: string | null;
  email?: string | null;
  telephone?: string | null;
  contactPrincipal: boolean;
  createdAt: string;
};

export type CabinetLettreMission = {
  id: string;
  cabinetClientMandatId: string;
  dateSignature?: string | null;
  perimetreTexte: string;
  honorairesConvenus?: number | null;
  deviseCode: string;
  periodiciteFacturation: CabinetPeriodiciteFacturation;
  documentUrl?: string | null;
  statut: CabinetStatutLettreMission;
  createdAt: string;
};

export type CabinetRole = {
  id: string;
  code: string;
  libelle: string;
  niveauHabilitationDefaut: CabinetNiveauHabilitation;
};

export type CabinetCollaborateur = {
  id: string;
  cabinetEntiteId: string;
  userId?: string | null;
  nomPrenoms: string;
  roleId: string;
  role?: CabinetRole;
  numeroOrdreProfessionnel?: string | null;
  email: string;
  telephone?: string | null;
  statut: CabinetStatutCollaborateur;
  createdAt: string;
  _count?: {
    mandatsResponsable: number;
    taches: number;
    pointsRevue: number;
    validations: number;
  };
};

export type CabinetHabilitationClient = {
  id: string;
  collaborateurId: string;
  collaborateur?: CabinetCollaborateur;
  cabinetClientMandatId: string;
  niveauAcces: CabinetNiveauHabilitation;
  dateDebut: string;
  dateFin?: string | null;
};

export type CabinetClientMandat = {
  id: string;
  cabinetEntiteId: string;
  clientTenantId: string;
  typeMandat: CabinetTypeMandat;
  dateDebut: string;
  dateFin?: string | null;
  statut: CabinetStatutMandat;
  collaborateurResponsableId?: string | null;
  collaborateurResponsable?: {
    id: string;
    nomPrenoms: string;
    email?: string;
  } | null;
  lettresMission?: CabinetLettreMission[];
  contactsClient?: CabinetClientContact[];
  habilitations?: CabinetHabilitationClient[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    missions: number;
    pointsRevue: number;
    demandesPiece: number;
  };
};

export type CabinetTache = {
  id: string;
  cabinetMissionId: string;
  libelle: string;
  collaborateurAssigneId?: string | null;
  collaborateurAssigne?: {
    id: string;
    nomPrenoms: string;
    email?: string;
  } | null;
  dateEcheance?: string | null;
  statut: CabinetStatutTache;
};

export type CabinetMission = {
  id: string;
  cabinetClientMandatId: string;
  mandat?: {
    id: string;
    typeMandat: CabinetTypeMandat;
    clientTenantId: string;
    collaborateurResponsable?: { id: string; nomPrenoms: string } | null;
  };
  libelle: string;
  typeMission: CabinetTypeMission;
  periodeReference?: string | null;
  dateEcheance?: string | null;
  statut: CabinetStatutMission;
  taches?: CabinetTache[];
  _count?: {
    taches: number;
    checklistsResultats: number;
    tempsPasses: number;
  };
  createdAt: string;
};

export type CabinetEcheanceConsolidee = {
  id: string;
  cabinetClientMandatId: string;
  mandat?: {
    id: string;
    typeMandat: CabinetTypeMandat;
    clientTenantId: string;
    collaborateurResponsable?: { id: string; nomPrenoms: string } | null;
  };
  referenceEcheanceM7?: string | null;
  cabinetMissionId?: string | null;
  mission?: { id: string; libelle: string } | null;
  libelle: string;
  dateLimite: string;
  statut: CabinetStatutEcheance;
};

export type CabinetPointRevue = {
  id: string;
  cabinetClientMandatId: string;
  mandat?: {
    id: string;
    typeMandat: CabinetTypeMandat;
    clientTenantId: string;
  };
  moduleSource: CabinetModuleSource;
  objetType: string;
  objetId: string;
  auteurCollaborateurId: string;
  auteur?: {
    id: string;
    nomPrenoms: string;
    email?: string;
    role?: CabinetRole;
  };
  texte: string;
  niveau: CabinetNiveauSeverite;
  statut: CabinetStatutPointRevue;
  dateCreation: string;
};

export type ChecklistItemTemplate = {
  id: string;
  libelle: string;
  obligatoire?: boolean;
};

export type CabinetChecklistControle = {
  id: string;
  cabinetEntiteId: string;
  typeMissionCible: string;
  libelle: string;
  items: ChecklistItemTemplate[];
  version: string;
  actif: boolean;
};

export type CabinetChecklistItemResultat = {
  id: string;
  cabinetMissionId: string;
  cabinetChecklistControleId: string;
  checklistControle?: CabinetChecklistControle;
  itemLibelle: string;
  statut: CabinetStatutChecklistItem;
  controleParCollaborateurId?: string | null;
  controlePar?: { id: string; nomPrenoms: string } | null;
  commentaire?: string | null;
};

export type CircuitEtapeTemplate = {
  etape: number;
  roleCode: string;
  libelle: string;
};

export type CabinetCircuitValidation = {
  id: string;
  cabinetEntiteId: string;
  typeObjetCible: string;
  etapes: CircuitEtapeTemplate[];
  actif: boolean;
};

export type CabinetValidation = {
  id: string;
  cabinetCircuitValidationId: string;
  objetType: string;
  objetId: string;
  etapeOrdre: number;
  collaborateurId: string;
  collaborateur?: {
    id: string;
    nomPrenoms: string;
    role?: CabinetRole;
  };
  decision: CabinetDecisionValidation;
  commentaire?: string | null;
  dateDecision: string;
};

export type CabinetSignatureElectronique = {
  id: string;
  objetType: string;
  objetId: string;
  signataireCollaborateurId?: string | null;
  signataireCollaborateur?: {
    id: string;
    nomPrenoms: string;
    role?: CabinetRole;
  } | null;
  signataireClientContactId?: string | null;
  signataireClientContact?: CabinetClientContact | null;
  methodeSignature: CabinetMethodeSignature;
  empreinteDocument: string;
  dateSignature: string;
  adresseIpSignataire?: string | null;
};

export type CabinetTempsPasse = {
  id: string;
  collaborateurId: string;
  collaborateur?: {
    id: string;
    nomPrenoms: string;
    email?: string;
  };
  cabinetMissionId: string;
  mission?: {
    id: string;
    libelle: string;
    mandat?: { id: string; clientTenantId: string; typeMandat: CabinetTypeMandat };
  };
  datePrestation: string;
  dureeHeures: number;
  description?: string | null;
  facturable: boolean;
};

export type CabinetNoteHonorairesLigne = {
  id: string;
  cabinetNoteHonorairesId: string;
  libelle: string;
  quantite?: number | null;
  prixUnitaire?: number | null;
  montant: number;
};

export type CabinetNoteHonoraires = {
  id: string;
  cabinetClientMandatId: string;
  mandat?: {
    id: string;
    clientTenantId: string;
    typeMandat: CabinetTypeMandat;
    collaborateurResponsable?: { id: string; nomPrenoms: string } | null;
  };
  numero: string;
  dateEmission: string;
  montantTotalHt: number;
  montantTva: number;
  montantTotalTtc: number;
  deviseCode: string;
  statut: CabinetStatutNoteHonoraires;
  lignes?: CabinetNoteHonorairesLigne[];
  createdAt: string;
};

export type CabinetDemandePiece = {
  id: string;
  cabinetClientMandatId: string;
  mandat?: {
    id: string;
    clientTenantId: string;
    typeMandat: CabinetTypeMandat;
  };
  cabinetMissionId?: string | null;
  mission?: { id: string; libelle: string } | null;
  libelle: string;
  dateDemande: string;
  dateLimiteReponse?: string | null;
  statut: CabinetStatutDemandePiece;
};

export type CabinetMessage = {
  id: string;
  cabinetClientMandatId: string;
  auteurType: CabinetAuteurMessage;
  auteurId: string;
  auteurNom?: string | null;
  contenu: string;
  dateEnvoi: string;
  lu: boolean;
};

export type CabinetDocumentPartage = {
  id: string;
  cabinetClientMandatId: string;
  deposeParType: CabinetDeposeParType;
  deposeParNom?: string | null;
  fichierUrl: string;
  libelle: string;
  tailleOctets?: number | null;
  dateDepot: string;
};

export type CabinetConflitInteretDeclaration = {
  id: string;
  collaborateurId: string;
  collaborateur?: {
    id: string;
    nomPrenoms: string;
    email?: string;
    role?: CabinetRole;
  };
  cabinetClientMandatId: string;
  mandat?: {
    id: string;
    clientTenantId: string;
    typeMandat: CabinetTypeMandat;
  };
  natureConflit: string;
  dateDeclaration: string;
  decision: CabinetDecisionConflit;
  decideeParCollaborateurId?: string | null;
  decideur?: { id: string; nomPrenoms: string } | null;
  commentaireDecision?: string | null;
};

export type CabinetJournalAccesConfidentialite = {
  id: string;
  collaborateurId: string;
  collaborateur?: { id: string; nomPrenoms: string; email?: string };
  cabinetClientMandatId: string;
  mandat?: { id: string; clientTenantId: string; typeMandat: CabinetTypeMandat };
  moduleConsulte: string;
  actionRealisee?: string | null;
  dateAcces: string;
};

export type CockpitMetrics = {
  kpis: {
    totalMandatsActifs: number;
    totalCollaborateurs: number;
    missionsEnRetard: number;
    pointsRevueBloquants: number;
    demandesPieceEnAttente: number;
    totalHonorairesEnAttente: number;
  };
  missionsRecentes: CabinetMission[];
  pointsRevueRecents: CabinetPointRevue[];
  mandatsRecents: CabinetClientMandat[];
};
