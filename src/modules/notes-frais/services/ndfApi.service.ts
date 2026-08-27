import { authorizedFetch } from "@/shared/http/authorizedFetch";
import type {
  NdfAnomalieDetectee,
  NdfAvanceFrais,
  NdfBaremeKilometrique,
  NdfBaremePerDiem,
  NdfCarteAffaire,
  NdfCategorieDepense,
  NdfDashboardStats,
  NdfDepense,
  NdfExtractionIa,
  NdfMission,
  NdfParametrePays,
  NdfPolitiqueDepense,
  NdfRapportFrais,
  NdfRemboursement,
  NdfTransactionCarteAffaire,
} from "../types/notesFrais.types";

function normalizeArray<T>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

export const ndfApi = {
  // ---------------- DASHBOARD ----------------
  getDashboardStats: () =>
    authorizedFetch<NdfDashboardStats>("/notes-frais/dashboard/stats"),

  // ---------------- RÉFÉRENTIEL ----------------
  listCategories: async (paysCode?: string) => {
    const query = paysCode ? `?paysCode=${paysCode}` : "";
    const res = await authorizedFetch<any>(`/notes-frais/referentiel/categories${query}`);
    return normalizeArray<NdfCategorieDepense>(res);
  },

  createCategorie: (data: {
    code: string;
    libelle: string;
    paysCode?: string;
    compteSyscohadaDefaut?: string;
    tvaRecuperableParDefaut?: boolean;
    tauxTvaParDefaut?: number;
    justificatifObligatoire?: boolean;
  }) =>
    authorizedFetch<NdfCategorieDepense>("/notes-frais/referentiel/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCategorie: (id: string, data: Partial<NdfCategorieDepense>) =>
    authorizedFetch<NdfCategorieDepense>(`/notes-frais/referentiel/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteCategorie: (id: string) =>
    authorizedFetch<{ success: boolean }>(`/notes-frais/referentiel/categories/${id}`, {
      method: "DELETE",
    }),

  seedCategories: () =>
    authorizedFetch<NdfCategorieDepense[]>("/notes-frais/referentiel/categories/seed", {
      method: "POST",
    }),

  listPolitiques: async () => {
    const res = await authorizedFetch<any>("/notes-frais/referentiel/politiques");
    return normalizeArray<NdfPolitiqueDepense>(res);
  },

  createPolitique: (data: any) =>
    authorizedFetch<NdfPolitiqueDepense>("/notes-frais/referentiel/politiques", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listBaremesKm: async (paysCode = "BJ") => {
    const res = await authorizedFetch<any>(`/notes-frais/referentiel/baremes-km?paysCode=${paysCode}`);
    return normalizeArray<NdfBaremeKilometrique>(res);
  },

  calculerIndemniteKm: (data: { distanceKm: number; puissanceFiscale: number; typeVehicule?: string; paysCode?: string }) =>
    authorizedFetch<{
      distanceKm: number;
      puissanceFiscale: number;
      tauxParKm: number;
      deviseCode: string;
      montantTotal: number;
      baremeKilometriqueId: string;
      texteReference?: string;
    }>("/notes-frais/referentiel/calculer-indemnite-km", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listBaremesPerDiem: async (paysCode = "BJ") => {
    const res = await authorizedFetch<any>(`/notes-frais/referentiel/baremes-per-diem?paysCode=${paysCode}`);
    return normalizeArray<NdfBaremePerDiem>(res);
  },

  calculerPerDiem: (data: { nombreJours: number; zoneGeographique: string; paysCode?: string }) =>
    authorizedFetch<{
      nombreJours: number;
      zoneGeographique: string;
      montantJour: number;
      deviseCode: string;
      montantTotal: number;
      couvreHebergement: boolean;
      couvreRestauration: boolean;
      baremePerDiemId: string;
    }>("/notes-frais/referentiel/calculer-per-diem", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listParametresPays: async (paysCode = "BJ") => {
    const res = await authorizedFetch<any>(`/notes-frais/referentiel/parametres-pays?paysCode=${paysCode}`);
    return normalizeArray<NdfParametrePays>(res);
  },

  // ---------------- MISSIONS & AVANCES ----------------
  listMissions: async (params?: { employeRefId?: string; statut?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await authorizedFetch<any>(`/notes-frais/missions${query ? `?${query}` : ""}`);
    return normalizeArray<NdfMission>(res);
  },

  getMissionById: (id: string) =>
    authorizedFetch<NdfMission>(`/notes-frais/missions/${id}`),

  createMission: (data: any) =>
    authorizedFetch<NdfMission>("/notes-frais/missions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateMission: (id: string, data: any) =>
    authorizedFetch<NdfMission>(`/notes-frais/missions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  listAvances: async (params?: { employeRefId?: string; statut?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await authorizedFetch<any>(`/notes-frais/missions/avances/list${query ? `?${query}` : ""}`);
    return normalizeArray<NdfAvanceFrais>(res);
  },

  createAvance: (data: any) =>
    authorizedFetch<NdfAvanceFrais>("/notes-frais/missions/avances", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  regulariserAvance: (id: string, montant: number) =>
    authorizedFetch<NdfAvanceFrais>(`/notes-frais/missions/avances/${id}/regulariser`, {
      method: "POST",
      body: JSON.stringify({ montant }),
    }),

  // ---------------- DÉPENSES ----------------
  listDepenses: async (params?: { ndfRapportFraisId?: string; categorieDepenseId?: string; statut?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await authorizedFetch<any>(`/notes-frais/depenses${query ? `?${query}` : ""}`);
    return normalizeArray<NdfDepense>(res);
  },

  getDepenseById: (id: string) =>
    authorizedFetch<NdfDepense>(`/notes-frais/depenses/${id}`),

  createDepense: (data: any) =>
    authorizedFetch<NdfDepense>("/notes-frais/depenses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateDepense: (id: string, data: any) =>
    authorizedFetch<NdfDepense>(`/notes-frais/depenses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteDepense: (id: string) =>
    authorizedFetch<{ success: boolean; message: string }>(`/notes-frais/depenses/${id}`, {
      method: "DELETE",
    }),

  // ---------------- RAPPORTS DE FRAIS ----------------
  listRapports: async (params?: { employeRefId?: string; statut?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await authorizedFetch<any>(`/notes-frais/rapports${query ? `?${query}` : ""}`);
    return normalizeArray<NdfRapportFrais>(res);
  },

  getRapportById: (id: string) =>
    authorizedFetch<NdfRapportFrais>(`/notes-frais/rapports/${id}`),

  createRapport: (data: any) =>
    authorizedFetch<NdfRapportFrais>("/notes-frais/rapports", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateRapport: (id: string, data: any) =>
    authorizedFetch<NdfRapportFrais>(`/notes-frais/rapports/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  soumettreRapport: (id: string) =>
    authorizedFetch<NdfRapportFrais>(`/notes-frais/rapports/${id}/soumettre`, {
      method: "POST",
    }),

  validerRapport: (id: string, commentaire?: string) =>
    authorizedFetch<NdfRapportFrais>(`/notes-frais/rapports/${id}/valider`, {
      method: "POST",
      body: JSON.stringify({ commentaire }),
    }),

  rejeterRapport: (id: string, motifRejet: string) =>
    authorizedFetch<NdfRapportFrais>(`/notes-frais/rapports/${id}/rejeter`, {
      method: "POST",
      body: JSON.stringify({ motifRejet }),
    }),

  // ---------------- IA & OCR ----------------
  scanJustificatif: (data: { fichierUrl: string; typeFichier?: string }) =>
    authorizedFetch<{
      montantTtc: number;
      montantTva: number;
      tauxTva: number;
      date: string;
      fournisseur: string;
      devise: string;
      categorieSuggeree: string;
      scoreConfianceGlobal: number;
      confianceChamps: Record<string, number>;
    }>("/notes-frais/ia/scan-justificatif", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  auditerRapport: (id: string) =>
    authorizedFetch<any[]>(`/notes-frais/ia/auditer-rapport/${id}`, {
      method: "POST",
    }),

  listAnomalies: async (rapportId?: string) => {
    const query = rapportId ? `?rapportId=${rapportId}` : "";
    const res = await authorizedFetch<any>(`/notes-frais/ia/anomalies${query}`);
    return normalizeArray<NdfAnomalieDetectee>(res);
  },

  traiterAnomalie: (id: string, data: { statut: "CONFIRMEE" | "ECARTEE_FAUX_POSITIF"; motif?: string }) =>
    authorizedFetch<NdfAnomalieDetectee>(`/notes-frais/ia/anomalies/${id}/traiter`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // ---------------- REMBOURSEMENTS & CARTES AFFAIRES ----------------
  listRemboursements: async (statut?: string) => {
    const query = statut ? `?statut=${statut}` : "";
    const res = await authorizedFetch<any>(`/notes-frais/remboursements${query}`);
    return normalizeArray<NdfRemboursement>(res);
  },

  payerRemboursement: (id: string, data: { dateRemboursement: string; referenceBancaire?: string }) =>
    authorizedFetch<NdfRemboursement>(`/notes-frais/remboursements/${id}/payer`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  basculerSurBulletinPaie: (id: string, periodePaieCible: string) =>
    authorizedFetch<any>(`/notes-frais/remboursements/${id}/basculer-paie`, {
      method: "POST",
      body: JSON.stringify({ periodePaieCible }),
    }),

  listCartesAffaires: async () => {
    const res = await authorizedFetch<any>("/notes-frais/remboursements/cartes/list");
    return normalizeArray<NdfCarteAffaire>(res);
  },

  createCarteAffaire: (data: any) =>
    authorizedFetch<NdfCarteAffaire>("/notes-frais/remboursements/cartes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  importerTransactionCarte: (data: any) =>
    authorizedFetch<NdfTransactionCarteAffaire>("/notes-frais/remboursements/cartes/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  rapprocherTransactionCarte: (data: { ndfTransactionCarteAffaireId: string; ndfDepenseId: string }) =>
    authorizedFetch<any>("/notes-frais/remboursements/cartes/rapprocher", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
