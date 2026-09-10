import { authorizedFetch } from "@/shared/http/authorizedFetch";
import type {
  AuthorizedCabinet,
  CabinetChecklistControle,
  CabinetChecklistItemResultat,
  CabinetCircuitValidation,
  CabinetClientContact,
  CabinetClientMandat,
  CabinetCollaborateur,
  CabinetConflitInteretDeclaration,
  CabinetDemandePiece,
  CabinetDocumentPartage,
  CabinetEcheanceConsolidee,
  CabinetEntite,
  CabinetHabilitationClient,
  CabinetInviteCodeResponse,
  CabinetJournalAccesConfidentialite,
  CabinetLettreMission,
  CabinetMessage,
  CabinetMission,
  CabinetNoteHonoraires,
  CabinetPointRevue,
  CabinetRole,
  CabinetSignatureElectronique,
  CabinetTache,
  CabinetTempsPasse,
  CabinetValidation,
  CockpitMetrics,
  GrantCabinetAccessPayload,
  LinkedCompany,
  PaginatedCabinetInvoices,
  UpdateCabinetPermissionsPayload,
} from "../types/cabinet.types";

export const cabinetApi = {
  // INVITE CODE & ACCESS (LEGACY COMPAT)
  getInviteCode: () =>
    authorizedFetch<CabinetInviteCodeResponse>("/cabinet/invite-code"),

  regenerateInviteCode: () =>
    authorizedFetch<CabinetInviteCodeResponse>(
      "/cabinet/invite-code/regenerate",
      { method: "POST" },
    ),

  listAuthorizedCabinets: () =>
    authorizedFetch<AuthorizedCabinet[]>("/cabinet/access"),

  grantCabinetAccess: (payload: GrantCabinetAccessPayload) =>
    authorizedFetch<{ message: string }>("/cabinet/access", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateCabinetPermissions: (
    cabinetTenantId: string,
    payload: UpdateCabinetPermissionsPayload,
  ) =>
    authorizedFetch<{ message: string }>(
      `/cabinet/access/${cabinetTenantId}/permissions`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),

  revokeCabinetAccess: (cabinetTenantId: string) =>
    authorizedFetch<{ message: string }>("/cabinet/access", {
      method: "DELETE",
      body: JSON.stringify({ cabinetTenantId }),
    }),

  listLinkedCompanies: () =>
    authorizedFetch<LinkedCompany[]>("/cabinet/companies"),

  listCompanyInvoices: (
    companyTenantId: string,
    params: { page?: number; limit?: number } = {},
  ) => {
    const search = new URLSearchParams();
    if (params.page) search.set("page", String(params.page));
    if (params.limit) search.set("limit", String(params.limit));
    const query = search.toString();
    return authorizedFetch<PaginatedCabinetInvoices>(
      `/cabinet/companies/${companyTenantId}/invoices${query ? `?${query}` : ""}`,
    );
  },

  // ----------------------------------------------------
  // COCKPIT DASHBOARD
  // ----------------------------------------------------
  getCockpitMetrics: () =>
    authorizedFetch<CockpitMetrics>("/cabinet/dashboard/cockpit"),

  // ----------------------------------------------------
  // PORTEFEUILLE & MANDATS
  // ----------------------------------------------------
  getEntite: () =>
    authorizedFetch<CabinetEntite>("/cabinet/portefeuille/entite"),

  updateEntite: (payload: Partial<CabinetEntite>) =>
    authorizedFetch<CabinetEntite>("/cabinet/portefeuille/entite", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  listMandats: () =>
    authorizedFetch<CabinetClientMandat[]>("/cabinet/portefeuille/mandats"),

  getMandat: (id: string) =>
    authorizedFetch<CabinetClientMandat>(`/cabinet/portefeuille/mandats/${id}`),

  createMandat: (payload: any) =>
    authorizedFetch<CabinetClientMandat>("/cabinet/portefeuille/mandats", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateMandat: (id: string, payload: any) =>
    authorizedFetch<CabinetClientMandat>(
      `/cabinet/portefeuille/mandats/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),

  deleteMandat: (id: string) =>
    authorizedFetch<{ success: boolean }>(
      `/cabinet/portefeuille/mandats/${id}`,
      { method: "DELETE" },
    ),

  createLettreMission: (payload: any) =>
    authorizedFetch<CabinetLettreMission>(
      "/cabinet/portefeuille/lettres-mission",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  updateLettreMission: (id: string, payload: any) =>
    authorizedFetch<CabinetLettreMission>(
      `/cabinet/portefeuille/lettres-mission/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),

  addClientContact: (payload: any) =>
    authorizedFetch<CabinetClientContact>("/cabinet/portefeuille/contacts", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateClientContact: (id: string, payload: any) =>
    authorizedFetch<CabinetClientContact>(
      `/cabinet/portefeuille/contacts/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),

  // ----------------------------------------------------
  // COLLABORATEURS & HABILITATIONS
  // ----------------------------------------------------
  listRoles: () =>
    authorizedFetch<CabinetRole[]>("/cabinet/collaborateurs/roles"),

  listCollaborateurs: () =>
    authorizedFetch<CabinetCollaborateur[]>("/cabinet/collaborateurs"),

  getCollaborateur: (id: string) =>
    authorizedFetch<CabinetCollaborateur>(`/cabinet/collaborateurs/${id}`),

  createCollaborateur: (payload: any) =>
    authorizedFetch<CabinetCollaborateur>("/cabinet/collaborateurs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateCollaborateur: (id: string, payload: any) =>
    authorizedFetch<CabinetCollaborateur>(`/cabinet/collaborateurs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteCollaborateur: (id: string) =>
    authorizedFetch<{ success: boolean }>(`/cabinet/collaborateurs/${id}`, {
      method: "DELETE",
    }),

  listHabilitationsByMandat: (mandatId: string) =>
    authorizedFetch<CabinetHabilitationClient[]>(
      `/cabinet/collaborateurs/mandat/${mandatId}/habilitations`,
    ),

  createHabilitation: (payload: any) =>
    authorizedFetch<CabinetHabilitationClient>(
      "/cabinet/collaborateurs/habilitations",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  updateHabilitation: (id: string, payload: any) =>
    authorizedFetch<CabinetHabilitationClient>(
      `/cabinet/collaborateurs/habilitations/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),

  deleteHabilitation: (id: string) =>
    authorizedFetch<{ success: boolean }>(
      `/cabinet/collaborateurs/habilitations/${id}`,
      { method: "DELETE" },
    ),

  // ----------------------------------------------------
  // MISSIONS & CALENDRIER
  // ----------------------------------------------------
  listMissions: (params: {
    mandatId?: string;
    statut?: string;
    collaborateurId?: string;
  } = {}) => {
    const search = new URLSearchParams();
    if (params.mandatId) search.set("mandatId", params.mandatId);
    if (params.statut) search.set("statut", params.statut);
    if (params.collaborateurId)
      search.set("collaborateurId", params.collaborateurId);
    const query = search.toString();
    return authorizedFetch<CabinetMission[]>(
      `/cabinet/missions${query ? `?${query}` : ""}`,
    );
  },

  getMission: (id: string) =>
    authorizedFetch<CabinetMission>(`/cabinet/missions/${id}`),

  createMission: (payload: any) =>
    authorizedFetch<CabinetMission>("/cabinet/missions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateMission: (id: string, payload: any) =>
    authorizedFetch<CabinetMission>(`/cabinet/missions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteMission: (id: string) =>
    authorizedFetch<{ success: boolean }>(`/cabinet/missions/${id}`, {
      method: "DELETE",
    }),

  createTache: (payload: any) =>
    authorizedFetch<CabinetTache>("/cabinet/missions/taches", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTache: (tacheId: string, payload: any) =>
    authorizedFetch<CabinetTache>(`/cabinet/missions/taches/${tacheId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteTache: (tacheId: string) =>
    authorizedFetch<{ success: boolean }>(
      `/cabinet/missions/taches/${tacheId}`,
      { method: "DELETE" },
    ),

  listCalendrier: (params: {
    mandatId?: string;
    statut?: string;
    startDate?: string;
    endDate?: string;
  } = {}) => {
    const search = new URLSearchParams();
    if (params.mandatId) search.set("mandatId", params.mandatId);
    if (params.statut) search.set("statut", params.statut);
    if (params.startDate) search.set("startDate", params.startDate);
    if (params.endDate) search.set("endDate", params.endDate);
    const query = search.toString();
    return authorizedFetch<CabinetEcheanceConsolidee[]>(
      `/cabinet/missions/calendrier-consolide${query ? `?${query}` : ""}`,
    );
  },

  createEcheance: (payload: any) =>
    authorizedFetch<CabinetEcheanceConsolidee>(
      "/cabinet/missions/calendrier-consolide",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  updateEcheance: (id: string, payload: any) =>
    authorizedFetch<CabinetEcheanceConsolidee>(
      `/cabinet/missions/calendrier-consolide/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),

  // ----------------------------------------------------
  // SUPERVISION & POINTS DE REVUE
  // ----------------------------------------------------
  listPointsRevue: (params: {
    mandatId?: string;
    moduleSource?: string;
    statut?: string;
    niveau?: string;
  } = {}) => {
    const search = new URLSearchParams();
    if (params.mandatId) search.set("mandatId", params.mandatId);
    if (params.moduleSource) search.set("moduleSource", params.moduleSource);
    if (params.statut) search.set("statut", params.statut);
    if (params.niveau) search.set("niveau", params.niveau);
    const query = search.toString();
    return authorizedFetch<CabinetPointRevue[]>(
      `/cabinet/supervision/points-revue${query ? `?${query}` : ""}`,
    );
  },

  getPointsRevueByObjet: (objetType: string, objetId: string) =>
    authorizedFetch<CabinetPointRevue[]>(
      `/cabinet/supervision/points-revue/objet/${objetType}/${objetId}`,
    ),

  createPointRevue: (payload: any) =>
    authorizedFetch<CabinetPointRevue>("/cabinet/supervision/points-revue", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updatePointRevue: (id: string, payload: any) =>
    authorizedFetch<CabinetPointRevue>(
      `/cabinet/supervision/points-revue/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),

  deletePointRevue: (id: string) =>
    authorizedFetch<{ success: boolean }>(
      `/cabinet/supervision/points-revue/${id}`,
      { method: "DELETE" },
    ),

  listChecklists: () =>
    authorizedFetch<CabinetChecklistControle[]>(
      "/cabinet/supervision/checklists",
    ),

  createChecklist: (payload: any) =>
    authorizedFetch<CabinetChecklistControle>(
      "/cabinet/supervision/checklists",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  submitChecklistResultat: (payload: any) =>
    authorizedFetch<CabinetChecklistItemResultat>(
      "/cabinet/supervision/checklists/resultats",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  // ----------------------------------------------------
  // VALIDATIONS & SIGNATURES
  // ----------------------------------------------------
  listCircuitsValidation: () =>
    authorizedFetch<CabinetCircuitValidation[]>("/cabinet/validations/circuits"),

  createCircuitValidation: (payload: any) =>
    authorizedFetch<CabinetCircuitValidation>(
      "/cabinet/validations/circuits",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  getValidationsByObjet: (objetType: string, objetId: string) =>
    authorizedFetch<CabinetValidation[]>(
      `/cabinet/validations/objet/${objetType}/${objetId}`,
    ),

  submitValidation: (payload: any) =>
    authorizedFetch<{ message: string; validation: CabinetValidation }>(
      "/cabinet/validations/decision",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  getSignaturesByObjet: (objetType: string, objetId: string) =>
    authorizedFetch<CabinetSignatureElectronique[]>(
      `/cabinet/validations/signatures/${objetType}/${objetId}`,
    ),

  apposeSignature: (payload: any) =>
    authorizedFetch<{
      message: string;
      signature: CabinetSignatureElectronique;
    }>("/cabinet/validations/signatures", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ----------------------------------------------------
  // HONORAIRES & TEMPS PASSÉ
  // ----------------------------------------------------
  listTemps: (params: {
    collaborateurId?: string;
    mandatId?: string;
    missionId?: string;
    startDate?: string;
    endDate?: string;
  } = {}) => {
    const search = new URLSearchParams();
    if (params.collaborateurId)
      search.set("collaborateurId", params.collaborateurId);
    if (params.mandatId) search.set("mandatId", params.mandatId);
    if (params.missionId) search.set("missionId", params.missionId);
    if (params.startDate) search.set("startDate", params.startDate);
    if (params.endDate) search.set("endDate", params.endDate);
    const query = search.toString();
    return authorizedFetch<CabinetTempsPasse[]>(
      `/cabinet/honoraires/temps${query ? `?${query}` : ""}`,
    );
  },

  createTemps: (payload: any) =>
    authorizedFetch<CabinetTempsPasse>("/cabinet/honoraires/temps", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTemps: (id: string, payload: any) =>
    authorizedFetch<CabinetTempsPasse>(`/cabinet/honoraires/temps/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteTemps: (id: string) =>
    authorizedFetch<{ success: boolean }>(`/cabinet/honoraires/temps/${id}`, {
      method: "DELETE",
    }),

  listNotesHonoraires: (mandatId?: string) => {
    const query = mandatId ? `?mandatId=${mandatId}` : "";
    return authorizedFetch<CabinetNoteHonoraires[]>(
      `/cabinet/honoraires/notes${query}`,
    );
  },

  getNoteHonoraires: (id: string) =>
    authorizedFetch<CabinetNoteHonoraires>(`/cabinet/honoraires/notes/${id}`),

  createNoteHonoraires: (payload: any) =>
    authorizedFetch<CabinetNoteHonoraires>("/cabinet/honoraires/notes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateNoteHonoraires: (id: string, payload: any) =>
    authorizedFetch<CabinetNoteHonoraires>(`/cabinet/honoraires/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // ----------------------------------------------------
  // COMMUNICATION & PORTAIL CLIENT
  // ----------------------------------------------------
  listDemandesPieces: (mandatId?: string) => {
    const query = mandatId ? `?mandatId=${mandatId}` : "";
    return authorizedFetch<CabinetDemandePiece[]>(
      `/cabinet/communication/demandes-pieces${query}`,
    );
  },

  createDemandePiece: (payload: any) =>
    authorizedFetch<CabinetDemandePiece>(
      "/cabinet/communication/demandes-pieces",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  updateDemandePiece: (id: string, payload: any) =>
    authorizedFetch<CabinetDemandePiece>(
      `/cabinet/communication/demandes-pieces/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),

  relancerDemandePiece: (id: string) =>
    authorizedFetch<CabinetDemandePiece>(
      `/cabinet/communication/demandes-pieces/${id}/relance`,
      { method: "POST" },
    ),

  listMessages: (mandatId: string) =>
    authorizedFetch<CabinetMessage[]>(
      `/cabinet/communication/messages/${mandatId}`,
    ),

  sendMessage: (payload: any) =>
    authorizedFetch<CabinetMessage>("/cabinet/communication/messages", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listDocumentsPartages: (mandatId: string) =>
    authorizedFetch<CabinetDocumentPartage[]>(
      `/cabinet/communication/documents/${mandatId}`,
    ),

  addDocumentPartage: (payload: any) =>
    authorizedFetch<CabinetDocumentPartage>(
      "/cabinet/communication/documents",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  // ----------------------------------------------------
  // DÉONTOLOGIE & SECRET PROFESSIONNEL
  // ----------------------------------------------------
  listConflitsInteret: () =>
    authorizedFetch<CabinetConflitInteretDeclaration[]>(
      "/cabinet/deontologie/conflits",
    ),

  declareConflitInteret: (payload: any) =>
    authorizedFetch<CabinetConflitInteretDeclaration>(
      "/cabinet/deontologie/conflits",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  arbitrerConflitInteret: (id: string, payload: any) =>
    authorizedFetch<CabinetConflitInteretDeclaration>(
      `/cabinet/deontologie/conflits/${id}/arbitrer`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),

  listJournalAcces: (mandatId?: string) => {
    const query = mandatId ? `?mandatId=${mandatId}` : "";
    return authorizedFetch<CabinetJournalAccesConfidentialite[]>(
      `/cabinet/deontologie/journal-acces${query}`,
    );
  },

  logAccesSecretPro: (payload: any) =>
    authorizedFetch<{ success: boolean; logId?: string }>(
      "/cabinet/deontologie/journal-acces",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
};
