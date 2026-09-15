import { authorizedFetch } from "@/shared/http/authorizedFetch";
import type {
  FiscaliteDashboardKpis,
  FecExportResult,
  TaxBareme,
  TaxContribuable,
  TaxControleFiscal,
  TaxDeclarationGenerique,
  TaxDeclarationTva,
  TaxEcheance,
  TaxExerciceFiscal,
  TaxParametrePays,
  TaxPays,
  TaxReclamationContentieuse,
  TaxRegimeImposition,
  TaxRetenueAib,
  TaxSourceReglementaire,
  TaxType,
} from "../types/fiscalite.types";

function normalizeArray<T>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

export const fiscaliteApi = {
  // ---------------- DASHBOARD ----------------
  getDashboardKpis: () =>
    authorizedFetch<FiscaliteDashboardKpis>("/fiscalite/dashboard/kpis"),

  // ---------------- RÉFÉRENTIEL & VEILLE ----------------
  listPays: async () => {
    const res = await authorizedFetch<any>("/fiscalite/referentiel/pays");
    return normalizeArray<TaxPays>(res);
  },

  listTypes: async (paysCode = "BJ") => {
    const res = await authorizedFetch<any>(`/fiscalite/referentiel/types?paysCode=${paysCode}`);
    return normalizeArray<TaxType>(res);
  },

  listBaremes: async (taxTypeId?: string, paysCode = "BJ") => {
    const query = taxTypeId ? `?taxTypeId=${taxTypeId}&paysCode=${paysCode}` : `?paysCode=${paysCode}`;
    const res = await authorizedFetch<any>(`/fiscalite/referentiel/baremes${query}`);
    return normalizeArray<TaxBareme>(res);
  },

  createBareme: (data: {
    taxTypeId: string;
    sourceReglementaireId: string;
    libelle: string;
    secteurActivite?: string;
    tauxDefaut?: number;
    dateDebutValidite: string;
  }) =>
    authorizedFetch<TaxBareme>("/fiscalite/referentiel/baremes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  validerBareme: (baremeId: string, aNecessiteRecalculRetroactif = false) =>
    authorizedFetch<TaxBareme>(`/fiscalite/referentiel/baremes/${baremeId}/valider`, {
      method: "PUT",
      body: JSON.stringify({ aNecessiteRecalculRetroactif }),
    }),

  listSources: async (paysCode = "BJ", statutVeille?: string) => {
    const query = statutVeille ? `?paysCode=${paysCode}&statutVeille=${statutVeille}` : `?paysCode=${paysCode}`;
    const res = await authorizedFetch<any>(`/fiscalite/referentiel/sources${query}`);
    return normalizeArray<TaxSourceReglementaire>(res);
  },

  createSource: (data: {
    paysCode: string;
    typeSource: string;
    reference: string;
    titre: string;
    datePublication: string;
    dateEntreeVigueur: string;
    resume?: string;
  }) =>
    authorizedFetch<TaxSourceReglementaire>("/fiscalite/referentiel/sources", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  qualifierSource: (sourceId: string, data: { statutVeille: string; resume?: string }) =>
    authorizedFetch<TaxSourceReglementaire>(`/fiscalite/referentiel/sources/${sourceId}/qualifier`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  listParametres: async (paysCode = "BJ") => {
    const res = await authorizedFetch<any>(`/fiscalite/referentiel/parametres?paysCode=${paysCode}`);
    return normalizeArray<TaxParametrePays>(res);
  },

  listRegimes: async (paysCode = "BJ") => {
    const res = await authorizedFetch<any>(`/fiscalite/referentiel/regimes?paysCode=${paysCode}`);
    return normalizeArray<TaxRegimeImposition>(res);
  },

  // ---------------- CONTRIBUABLE ----------------
  getMonProfil: () =>
    authorizedFetch<TaxContribuable>("/fiscalite/contribuable/mon-profil"),

  updateProfil: (id: string, data: Partial<TaxContribuable>) =>
    authorizedFetch<TaxContribuable>(`/fiscalite/contribuable/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // ---------------- IMPÔT SUR LES SOCIÉTÉS (IS) ----------------
  listExercicesIs: async (taxContribuableId: string) => {
    const res = await authorizedFetch<any>(`/fiscalite/is/exercices?taxContribuableId=${taxContribuableId}`);
    return normalizeArray<TaxExerciceFiscal>(res);
  },

  getExerciceIs: (id: string) =>
    authorizedFetch<TaxExerciceFiscal>(`/fiscalite/is/exercices/${id}`),

  createExerciceIs: (data: { taxContribuableId: string; dateDebut: string; dateFin: string }) =>
    authorizedFetch<TaxExerciceFiscal>("/fiscalite/is/exercices", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  addRetraitement: (exerciceId: string, data: { sens: 'REINTEGRATION' | 'DEDUCTION'; libelle: string; montant: number; baseLegale?: string }) =>
    authorizedFetch<any>(`/fiscalite/is/exercices/${exerciceId}/retraitements`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteRetraitement: (id: string) =>
    authorizedFetch<any>(`/fiscalite/is/retraitements/${id}`, {
      method: "DELETE",
    }),

  simulerIs: (data: {
    resultatComptableNet: number;
    reintegrations: number;
    deductions: number;
    produitsEncaissables: number;
    secteurActivite?: string;
  }) =>
    authorizedFetch<any>("/fiscalite/is/simuler", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  calculerEtEnregistrerIs: (exerciceId: string, data: { resultatComptableNet: number; produitsEncaissables: number }) =>
    authorizedFetch<TaxExerciceFiscal>(`/fiscalite/is/exercices/${exerciceId}/calculer`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  validerIsTransmissionM3: (exerciceId: string) =>
    authorizedFetch<any>(`/fiscalite/is/exercices/${exerciceId}/valider-transmission-m3`, {
      method: "POST",
    }),

  payerAcompteIs: (acompteId: string, montant: number) =>
    authorizedFetch<any>(`/fiscalite/is/acomptes/${acompteId}/payer`, {
      method: "PUT",
      body: JSON.stringify({ montant }),
    }),

  // ---------------- TVA ----------------
  listDeclarationsTva: async (taxContribuableId: string) => {
    const res = await authorizedFetch<any>(`/fiscalite/tva/declarations?taxContribuableId=${taxContribuableId}`);
    return normalizeArray<TaxDeclarationTva>(res);
  },

  getDeclarationTva: (id: string) =>
    authorizedFetch<TaxDeclarationTva>(`/fiscalite/tva/declarations/${id}`),

  createDeclarationTva: (data: { taxContribuableId: string; periode: string; dateLimiteLegale: string; creditTvaAnterieur?: number }) =>
    authorizedFetch<TaxDeclarationTva>("/fiscalite/tva/declarations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  addLigneTva: (declarationId: string, data: { nature: string; tauxApplique: number; baseHorsTaxe: number; montantTva: number }) =>
    authorizedFetch<TaxDeclarationTva>(`/fiscalite/tva/declarations/${declarationId}/lignes`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  validerDeclarationTva: (id: string) =>
    authorizedFetch<TaxDeclarationTva>(`/fiscalite/tva/declarations/${id}/valider`, {
      method: "PUT",
    }),

  marquerPayeeTva: (id: string) =>
    authorizedFetch<TaxDeclarationTva>(`/fiscalite/tva/declarations/${id}/payer`, {
      method: "PUT",
    }),

  // ---------------- AIB ----------------
  simulerAib: (data: { natureOperation: string; base: number }) =>
    authorizedFetch<any>("/fiscalite/aib/simuler", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listRetenuesAib: async (taxContribuableId: string, periode?: string) => {
    const query = periode ? `?taxContribuableId=${taxContribuableId}&periode=${periode}` : `?taxContribuableId=${taxContribuableId}`;
    const res = await authorizedFetch<any>(`/fiscalite/aib/retenues${query}`);
    return normalizeArray<TaxRetenueAib>(res);
  },

  getRecapitulatifAib: (taxContribuableId: string, annee = "2026") =>
    authorizedFetch<any>(`/fiscalite/aib/recapitulatif?taxContribuableId=${taxContribuableId}&annee=${annee}`),

  // ---------------- AUTRES TAXES & PATENTE ----------------
  simulerPatente: (data: { chiffreAffaires: number; zoneAdministrative?: string }) =>
    authorizedFetch<any>("/fiscalite/autres-taxes/patente/simuler", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listDeclarationsGeneriques: async (taxContribuableId: string, taxTypeCode?: string) => {
    const query = taxTypeCode ? `?taxContribuableId=${taxContribuableId}&taxTypeCode=${taxTypeCode}` : `?taxContribuableId=${taxContribuableId}`;
    const res = await authorizedFetch<any>(`/fiscalite/autres-taxes/declarations${query}`);
    return normalizeArray<TaxDeclarationGenerique>(res);
  },

  creerDeclarationGenerique: (data: {
    taxContribuableId: string;
    taxTypeId: string;
    periodeOuExercice: string;
    baseImposable?: number;
    montantCalcule: number;
    dateLimiteLegale: string;
    libelleLigne?: string;
  }) =>
    authorizedFetch<TaxDeclarationGenerique>("/fiscalite/autres-taxes/declarations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ---------------- LIASSE FISCALE ----------------
  getLiasse: (exerciceId: string) =>
    authorizedFetch<any>(`/fiscalite/liasse-fiscale/exercice/${exerciceId}`),

  genererLiasse: (exerciceId: string, typeSystemeComptable: 'SYSTEME_NORMAL' | 'SMT' = 'SYSTEME_NORMAL') =>
    authorizedFetch<any>(`/fiscalite/liasse-fiscale/exercice/${exerciceId}/generer`, {
      method: "POST",
      body: JSON.stringify({ typeSystemeComptable }),
    }),

  validerLiasseCabinet: (liasseId: string) =>
    authorizedFetch<any>(`/fiscalite/liasse-fiscale/${liasseId}/valider-cabinet`, {
      method: "PUT",
    }),

  deposerLiasse: (liasseId: string) =>
    authorizedFetch<any>(`/fiscalite/liasse-fiscale/${liasseId}/deposer`, {
      method: "PUT",
    }),

  // ---------------- CALENDRIER FISCAL & ÉCHÉANCES ----------------
  listEcheances: async (taxContribuableId: string, statut?: string) => {
    const query = statut ? `?taxContribuableId=${taxContribuableId}&statut=${statut}` : `?taxContribuableId=${taxContribuableId}`;
    const res = await authorizedFetch<any>(`/fiscalite/calendrier/echeances${query}`);
    return normalizeArray<TaxEcheance>(res);
  },

  synchroniserEcheances: (taxContribuableId: string) =>
    authorizedFetch<TaxEcheance[]>("/fiscalite/calendrier/synchroniser", {
      method: "POST",
      body: JSON.stringify({ taxContribuableId }),
    }),

  marquerEcheancePayee: (id: string) =>
    authorizedFetch<any>(`/fiscalite/calendrier/echeances/${id}/payer`, {
      method: "PUT",
    }),

  // ---------------- FICHIER DES ÉCRITURES COMPTABLES (FEC ARRÊTÉ 1085-C) ----------------
  genererFec: (taxContribuableId: string, data: { dateCloture: string; separateur?: 'TABULATION' | 'POINT_VIRGULE'; formatFichier?: 'CSV' | 'TXT' }) =>
    authorizedFetch<FecExportResult>(`/fiscalite/fec/generer?taxContribuableId=${taxContribuableId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ---------------- CONTRÔLES & CONTENTIEUX ----------------
  estimerPenalite: (data: {
    typePenalite: string;
    baseCalcul: number;
    nbMoisRetard?: number;
    apresMiseEnDemeure?: boolean;
    mauvaiseFoi?: boolean;
  }) =>
    authorizedFetch<any>("/fiscalite/controles/penalites/estimer", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listControles: async (taxContribuableId: string) => {
    const res = await authorizedFetch<any>(`/fiscalite/controles?taxContribuableId=${taxContribuableId}`);
    return normalizeArray<TaxControleFiscal>(res);
  },

  creerControle: (data: {
    taxContribuableId: string;
    typeControle: string;
    dateAvisVerification?: string;
    periodeControleeDebut?: string;
    periodeControleeFin?: string;
    serviceEnCharge?: string;
  }) =>
    authorizedFetch<TaxControleFiscal>("/fiscalite/controles", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  notifierRedressement: (controleId: string, data: {
    taxTypeId: string;
    exerciceOuPeriodeConcerne: string;
    motif: string;
    montantDroitsReclames: number;
    montantPenalitesReclamees?: number;
  }) =>
    authorizedFetch<any>(`/fiscalite/controles/${controleId}/redressements`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listReclamations: async (taxContribuableId: string) => {
    const res = await authorizedFetch<any>(`/fiscalite/controles/reclamations?taxContribuableId=${taxContribuableId}`);
    return normalizeArray<TaxReclamationContentieuse>(res);
  },

  introduireRecours: (data: {
    taxContribuableId: string;
    redressementId?: string;
    typeRecours: string;
    dateDepot: string;
    objet: string;
  }) =>
    authorizedFetch<TaxReclamationContentieuse>("/fiscalite/controles/reclamations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
