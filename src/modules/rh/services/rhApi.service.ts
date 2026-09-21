import { authorizedFetch } from "@/shared/http/authorizedFetch";
import type {
  RhAbsence,
  RhContrat,
  RhCyclePaie,
  RhDashboardSummary,
  RhDeclarationSocialeFiscale,
  RhDepartement,
  RhEcritureComptablePaie,
  RhEmploye,
  RhEtablissement,
  RhPays,
  RhPoste,
  RhReleveTemps,
  RhRubriquePaie,
  RhSoldeConge,
  AdjustSoldeCongePayload,
  RhSoldeToutCompte,
  RhBulletinPaie,
} from "../types/rh.types";

function normalizeArray<T>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

export const rhApi = {
  // ---------------- DASHBOARD ----------------
  getDashboardSummary: () =>
    authorizedFetch<RhDashboardSummary>("/rh/dashboard"),

  // ---------------- RÉFÉRENTIEL ----------------
  listPays: async () => {
    const res = await authorizedFetch<any>("/rh/referentiel/pays");
    return normalizeArray<RhPays>(res);
  },
  listTaxBrackets: async (paysCode = "BJ") => {
    const res = await authorizedFetch<any>(`/rh/referentiel/baremes-its?paysCode=${paysCode}`);
    return normalizeArray<any>(res);
  },
  listSocialCharges: async (paysCode = "BJ") => {
    const res = await authorizedFetch<any>(`/rh/referentiel/charges-sociales?paysCode=${paysCode}`);
    return normalizeArray<any>(res);
  },
  listHolidays: async (paysCode = "BJ", annee = 2026) => {
    const res = await authorizedFetch<any>(`/rh/referentiel/jours-feries?paysCode=${paysCode}&annee=${annee}`);
    return normalizeArray<any>(res);
  },
  listCollectiveAgreements: async (paysCode = "BJ") => {
    const res = await authorizedFetch<any>(`/rh/referentiel/conventions?paysCode=${paysCode}`);
    return normalizeArray<any>(res);
  },
  listAbsenceTypes: async (paysCode = "BJ") => {
    const res = await authorizedFetch<any>(`/rh/referentiel/types-absence?paysCode=${paysCode}`);
    return normalizeArray<any>(res);
  },

  // ---------------- ORGANISATION ----------------
  listEtablissements: async () => {
    const res = await authorizedFetch<any>("/rh/organisation/etablissements");
    return normalizeArray<RhEtablissement>(res);
  },
  createEtablissement: (payload: any) =>
    authorizedFetch<RhEtablissement>("/rh/organisation/etablissements", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateEtablissement: (id: string, payload: any) =>
    authorizedFetch<RhEtablissement>(`/rh/organisation/etablissements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteEtablissement: (id: string) =>
    authorizedFetch<any>(`/rh/organisation/etablissements/${id}`, {
      method: "DELETE",
    }),
  listDepartements: async (etablissementId?: string) => {
    const q = etablissementId ? `?etablissementId=${etablissementId}` : "";
    const res = await authorizedFetch<any>(`/rh/organisation/departements${q}`);
    return normalizeArray<RhDepartement>(res);
  },
  createDepartement: (payload: any) =>
    authorizedFetch<RhDepartement>("/rh/organisation/departements", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateDepartement: (id: string, payload: any) =>
    authorizedFetch<RhDepartement>(`/rh/organisation/departements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteDepartement: (id: string) =>
    authorizedFetch<any>(`/rh/organisation/departements/${id}`, {
      method: "DELETE",
    }),
  listPostes: async (departementId?: string) => {
    const q = departementId ? `?departementId=${departementId}` : "";
    const res = await authorizedFetch<any>(`/rh/organisation/postes${q}`);
    return normalizeArray<RhPoste>(res);
  },
  createPoste: (payload: any) =>
    authorizedFetch<RhPoste>("/rh/organisation/postes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updatePoste: (id: string, payload: any) =>
    authorizedFetch<RhPoste>(`/rh/organisation/postes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deletePoste: (id: string) =>
    authorizedFetch<any>(`/rh/organisation/postes/${id}`, {
      method: "DELETE",
    }),

  // ---------------- EMPLOYÉS ----------------
  listEmployes: async (params?: { q?: string; statutEmploi?: string; statut?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.q) query.append("q", params.q);
    if (params?.statut || params?.statutEmploi) {
      query.append("statut", params.statut || params.statutEmploi || "");
    }
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await authorizedFetch<any>(`/rh/employes${qs}`);
    return normalizeArray<RhEmploye>(res);
  },
  getEmployeById: (id: string) =>
    authorizedFetch<RhEmploye>(`/rh/employes/${id}`),
  createEmploye: (payload: any) =>
    authorizedFetch<RhEmploye>("/rh/employes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateEmploye: (id: string, payload: any) =>
    authorizedFetch<RhEmploye>(`/rh/employes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteEmploye: (id: string) =>
    authorizedFetch<any>(`/rh/employes/${id}`, {
      method: "DELETE",
    }),
  addDependant: (employeId: string, payload: any) =>
    authorizedFetch<any>(`/rh/employes/${employeId}/personnes-a-charge`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteDependant: (id: string) =>
    authorizedFetch<any>(`/rh/employes/personnes-a-charge/${id}`, {
      method: "DELETE",
    }),
  addBankAccount: (employeId: string, payload: any) =>
    authorizedFetch<any>(`/rh/employes/${employeId}/coordonnees-bancaires`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  addAffectation: (employeId: string, payload: any) =>
    authorizedFetch<any>(`/rh/employes/${employeId}/affectations`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  addEmployeDocument: (employeId: string, payload: any) =>
    authorizedFetch<any>(`/rh/employes/${employeId}/documents`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  creerCompteUtilisateur: (employeId: string, payload: any) =>
    authorizedFetch<any>(`/rh/employes/${employeId}/creer-compte-utilisateur`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  lierUtilisateur: (employeId: string, payload: any) =>
    authorizedFetch<any>(`/rh/employes/${employeId}/lier-utilisateur`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  delierUtilisateur: (employeId: string) =>
    authorizedFetch<any>(`/rh/employes/${employeId}/delier-utilisateur`, {
      method: "DELETE",
    }),
  getMonEspaceCollaborateur: () =>
    authorizedFetch<any>("/rh/employes/me/espace-collaborateur"),
  listRoles: async () => {
    const res = await authorizedFetch<any>("/roles");
    return normalizeArray<any>(res);
  },

  // ---------------- CONTRATS ----------------
  listContrats: async (params?: { employeId?: string; statut?: string; typeContrat?: string; etablissementId?: string }) => {
    const query = new URLSearchParams();
    if (params?.employeId) query.append("employeId", params.employeId);
    if (params?.statut) query.append("statut", params.statut);
    if (params?.typeContrat) query.append("typeContrat", params.typeContrat);
    if (params?.etablissementId) query.append("etablissementId", params.etablissementId);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await authorizedFetch<any>(`/rh/contrats${qs}`);
    return normalizeArray<RhContrat>(res);
  },
  getContratById: (id: string) =>
    authorizedFetch<RhContrat>(`/rh/contrats/${id}`),
  createContrat: (payload: any) =>
    authorizedFetch<RhContrat>("/rh/contrats", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateContrat: (id: string, payload: any) =>
    authorizedFetch<RhContrat>(`/rh/contrats/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  renouvelerEssai: (id: string, payload: any) =>
    authorizedFetch<any>(`/rh/contrats/${id}/renouveler-essai`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  cloreEssai: (id: string, payload: any) =>
    authorizedFetch<any>(`/rh/contrats/${id}/clore-essai`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createAvenant: (id: string, payload: any) =>
    authorizedFetch<any>(`/rh/contrats/${id}/avenants`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createRupture: (id: string, payload: any) =>
    authorizedFetch<any>(`/rh/contrats/${id}/rupture`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  simulateSeverance: (ancienneteAnnees: number, salaireMoyen12m: number) =>
    authorizedFetch<any>(
      `/rh/contrats/simulate-severance?ancienneteAnnees=${ancienneteAnnees}&salaireMoyen12m=${salaireMoyen12m}`,
    ),

  // ---------------- TEMPS & ABSENCES ----------------
  listRelevesTemps: async (params?: { employeId?: string; dateDebut?: string; dateFin?: string }) => {
    const query = new URLSearchParams();
    if (params?.employeId) query.append("employeId", params.employeId);
    if (params?.dateDebut) query.append("dateDebut", params.dateDebut);
    if (params?.dateFin) query.append("dateFin", params.dateFin);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await authorizedFetch<any>(`/rh/temps-absences/releves${qs}`);
    return normalizeArray<RhReleveTemps>(res);
  },
  saveReleveTemps: (payload: any) =>
    authorizedFetch<RhReleveTemps>("/rh/temps-absences/releves", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  batchSaveRelevesTemps: (payload: { releves: any[] }) =>
    authorizedFetch<any>("/rh/temps-absences/releves/batch", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listAbsences: async (params?: { employeId?: string; statut?: string; annee?: number }) => {
    const query = new URLSearchParams();
    if (params?.employeId) query.append("employeId", params.employeId);
    if (params?.statut) query.append("statut", params.statut);
    if (params?.annee) query.append("annee", params.annee.toString());
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await authorizedFetch<any>(`/rh/temps-absences/absences${qs}`);
    return normalizeArray<RhAbsence>(res);
  },
  createAbsence: (payload: any) =>
    authorizedFetch<RhAbsence>("/rh/temps-absences/absences", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  validateAbsence: (id: string, payload: { statut: string; motifRefus?: string }) =>
    authorizedFetch<RhAbsence>(`/rh/temps-absences/absences/${id}/valider`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  listSoldesConges: async (annee = 2026, employeId?: string) => {
    const q = employeId ? `&employeId=${employeId}` : "";
    const res = await authorizedFetch<any>(`/rh/temps-absences/soldes-conges?annee=${annee}${q}`);
    return normalizeArray<RhSoldeConge>(res);
  },
  recalculerSoldesConges: async (annee = 2026, employeId?: string) => {
    const res = await authorizedFetch<any>("/rh/temps-absences/soldes-conges/calculer", {
      method: "POST",
      body: JSON.stringify({ annee, employeId }),
    });
    return normalizeArray<RhSoldeConge>(res);
  },
  ajusterSoldeConge: (employeId: string, payload: AdjustSoldeCongePayload) =>
    authorizedFetch<RhSoldeConge>(`/rh/temps-absences/soldes-conges/${employeId}/ajuster`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listTypesAbsence: async () => {
    const res = await authorizedFetch<any>("/rh/temps-absences/types-absence");
    return normalizeArray<any>(res);
  },

  // ---------------- PAIE ----------------
  listRubriques: async (paysCode = "BJ") => {
    const res = await authorizedFetch<any>(`/rh/paie/rubriques?paysCode=${paysCode}`);
    return normalizeArray<RhRubriquePaie>(res);
  },
  createRubrique: (payload: any) =>
    authorizedFetch<RhRubriquePaie>("/rh/paie/rubriques", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateRubrique: (id: string, payload: any) =>
    authorizedFetch<RhRubriquePaie>(`/rh/paie/rubriques/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteRubrique: (id: string) =>
    authorizedFetch<any>(`/rh/paie/rubriques/${id}`, {
      method: "DELETE",
    }),
  listCycles: async (annee?: number, etablissementId?: string) => {
    const query = new URLSearchParams();
    if (annee) query.append("annee", annee.toString());
    if (etablissementId) query.append("etablissementId", etablissementId);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await authorizedFetch<any>(`/rh/paie/cycles${qs}`);
    return normalizeArray<RhCyclePaie>(res);
  },
  getCycleById: (id: string) =>
    authorizedFetch<RhCyclePaie>(`/rh/paie/cycles/${id}`),
  openCycle: (payload: { etablissementId: string; annee: number; mois: number; datePaiementPrevue?: string }) =>
    authorizedFetch<RhCyclePaie>("/rh/paie/cycles/ouvrir", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  calculateCycle: (cycleId: string, payload: { employeId?: string } = {}) =>
    authorizedFetch<any>(`/rh/paie/cycles/${cycleId}/calculer`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  validateCycle: (cycleId: string) =>
    authorizedFetch<RhCyclePaie>(`/rh/paie/cycles/${cycleId}/valider`, {
      method: "PATCH",
    }),
  getVariables: async (cycleId: string) => {
    const res = await authorizedFetch<any>(`/rh/paie/cycles/${cycleId}/variables`);
    return normalizeArray<any>(res);
  },
  saveVariable: (cycleId: string, payload: any) =>
    authorizedFetch<any>(`/rh/paie/cycles/${cycleId}/variables`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  batchSaveVariables: (cycleId: string, payload: { elements: any[] }) =>
    authorizedFetch<any>(`/rh/paie/cycles/${cycleId}/variables/batch`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ---------------- BULLETINS DE PAIE ----------------
  listBulletins: async (params?: { cyclePaieId?: string; employeId?: string; annee?: number }) => {
    const query = new URLSearchParams();
    if (params?.cyclePaieId) query.append("cyclePaieId", params.cyclePaieId);
    if (params?.employeId) query.append("employeId", params.employeId);
    if (params?.annee) query.append("annee", params.annee.toString());
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await authorizedFetch<any>(`/rh/paie/bulletins${qs}`);
    return normalizeArray<RhBulletinPaie>(res);
  },
  getBulletinById: (id: string) =>
    authorizedFetch<RhBulletinPaie>(`/rh/paie/bulletins/${id}`),

  // ---------------- SOLDE DE TOUT COMPTE ----------------
  listSoldesToutCompte: async (employeId?: string) => {
    const q = employeId ? `?employeId=${employeId}` : "";
    const res = await authorizedFetch<any>(`/rh/paie/soldes-tout-compte${q}`);
    return normalizeArray<RhSoldeToutCompte>(res);
  },
  createSoldeToutCompte: (payload: any) =>
    authorizedFetch<RhSoldeToutCompte>("/rh/paie/soldes-tout-compte", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  signerSoldeToutCompte: (id: string, payload: any) =>
    authorizedFetch<RhSoldeToutCompte>(`/rh/paie/soldes-tout-compte/${id}/signer`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // ---------------- INTERFACES (OD & DÉCLARATIONS) ----------------
  getOdPaie: (cycleId: string) =>
    authorizedFetch<RhEcritureComptablePaie>(`/rh/interfaces/od-paie/${cycleId}`),
  generateOdPaie: (cycleId: string) =>
    authorizedFetch<RhEcritureComptablePaie>(`/rh/interfaces/od-paie/${cycleId}/generer`, {
      method: "POST",
    }),
  getOdStc: (stcId: string) =>
    authorizedFetch<RhEcritureComptablePaie>(`/rh/interfaces/od-stc/${stcId}`),
  generateOdStc: (stcId: string) =>
    authorizedFetch<RhEcritureComptablePaie>(`/rh/interfaces/od-stc/${stcId}/generer`, {
      method: "POST",
    }),
  listDeclarations: async (cyclePaieId?: string, annee?: number) => {
    const query = new URLSearchParams();
    if (cyclePaieId) query.append("cyclePaieId", cyclePaieId);
    if (annee) query.append("annee", annee.toString());
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await authorizedFetch<any>(`/rh/interfaces/declarations${qs}`);
    return normalizeArray<RhDeclarationSocialeFiscale>(res);
  },
  generateDeclarations: async (cycleId: string) => {
    const res = await authorizedFetch<any>(`/rh/interfaces/declarations/${cycleId}/generer`, {
      method: "POST",
    });
    return normalizeArray<RhDeclarationSocialeFiscale>(res);
  },
};
