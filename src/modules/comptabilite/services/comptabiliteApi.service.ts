import { authorizedFetch } from "@/shared/http/authorizedFetch";
import type {
  BalanceGeneraleResponse,
  ComptaCompte,
  ComptaCompteAuxiliaire,
  ComptaEcriture,
  ComptaEvenementSource,
  ComptaExercice,
  ComptaFecExport,
  ComptaJournal,
  ComptaLettrage,
  ComptaPeriode,
  ComptaRegleComptabilisation,
  ComptaReleveBancaire,
  EtatFinancierResponse,
  GrandLivreCompte,
  LigneBalanceAuxiliaire,
} from "../types/comptabilite.types";

function normalizeArray<T>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

function normalizeAuxiliaire(a: any): ComptaCompteAuxiliaire {
  if (!a) return a;
  return {
    ...a,
    id: a.id,
    tenantId: a.tenantId,
    compteCollectifId: a.compteCollectifId,
    codeAuxiliaire: a.codeAuxiliaire ?? a.numeroAuxiliaire ?? "",
    numeroAuxiliaire: a.numeroAuxiliaire ?? a.codeAuxiliaire ?? "",
    intitule: a.intitule ?? a.libelle ?? "",
    libelle: a.libelle ?? a.intitule ?? "",
    typeTiers: a.typeTiers ?? a.tiersType ?? "CLIENT",
    actif: a.actif !== undefined ? Boolean(a.actif) : a.statut === "ACTIF",
    statut: a.statut ?? (a.actif ? "ACTIF" : "INACTIF"),
  };
}

function normalizeCompte(c: any): ComptaCompte {
  if (!c) return c;
  const num = c.numero ?? c.numeroCompte ?? "";
  const cls = c.classe ?? (num ? parseInt(num.charAt(0), 10) : 1);
  return {
    ...c,
    id: c.id,
    numero: num,
    numeroCompte: num,
    intitule: c.intitule ?? c.libelle ?? "",
    libelle: c.libelle ?? c.intitule ?? "",
    classe: cls,
    sensAttendu: c.sensAttendu ?? "DEBITEUR",
    actif: c.actif !== undefined ? Boolean(c.actif) : c.statut === "ACTIF",
    statut: c.statut ?? (c.actif ? "ACTIF" : "INACTIF"),
    estRacineSyscohada: c.estRacineSyscohada ?? false,
    mouvemente: Boolean(c.mouvemente),
    auxiliaires: (c.comptesAuxiliaires || c.auxiliaires || []).map(normalizeAuxiliaire),
  };
}

function normalizePeriode(p: any): ComptaPeriode {
  if (!p) return p;
  let numeroPeriode = p.numeroPeriode;
  let libelle = p.libelle;
  let dateDebut = p.dateDebut;
  let dateFin = p.dateFin;

  if (p.anneeMois) {
    const parts = String(p.anneeMois).split("-");
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(y) && !isNaN(m)) {
      if (!numeroPeriode) numeroPeriode = m;
      const moisNoms = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
      ];
      if (!libelle || libelle === `Période ${p.anneeMois}`) {
        libelle = `${moisNoms[m - 1] || "Mois " + m} ${y}`;
      }
      if (!dateDebut) {
        const mm = m < 10 ? `0${m}` : `${m}`;
        dateDebut = `${y}-${mm}-01`;
      }
      if (!dateFin) {
        const lastDay = new Date(y, m, 0).getDate();
        const mm = m < 10 ? `0${m}` : `${m}`;
        const dd = lastDay < 10 ? `0${lastDay}` : `${lastDay}`;
        dateFin = `${y}-${mm}-${dd}`;
      }
    }
  }

  return {
    ...p,
    numeroPeriode: numeroPeriode ?? 1,
    libelle: libelle || (p.anneeMois ? `Période ${p.anneeMois}` : "Période 1"),
    dateDebut: dateDebut ? String(dateDebut) : "",
    dateFin: dateFin ? String(dateFin) : "",
    statut: p.statut || "OUVERTE",
  };
}

function normalizeExercice(e: any): ComptaExercice {
  if (!e) return e;
  return {
    ...e,
    annee: e.annee ?? (e.dateDebut ? new Date(e.dateDebut).getFullYear() : new Date().getFullYear()),
    periodes: (e.periodes || []).map(normalizePeriode),
  };
}

function normalizeEcriture(e: any): ComptaEcriture {
  if (!e) return e;
  return {
    ...e,
    pieceRef: e.pieceRef ?? e.refPiece ?? null,
    refPiece: e.refPiece ?? e.pieceRef ?? null,
    lignes: (e.lignes || []).map((l: any) => ({
      ...l,
      compteNumero: l.compte?.numero ?? l.compteNumero ?? "",
      compteIntitule: l.compte?.intitule ?? l.compteIntitule ?? "",
    })),
  };
}

export const comptabiliteApi = {
  // ---------------- PLAN COMPTABLE SYSCOHADA (UC-01, UC-02) ----------------
  getPlanComptable: async (filters?: { classe?: number; actif?: boolean; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.classe) params.append("classe", String(filters.classe));
    if (filters?.actif !== undefined) params.append("actif", String(filters.actif));
    if (filters?.search) params.append("search", filters.search);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await authorizedFetch<any>(`/compta/plan-comptable${query}`);
    return normalizeArray<any>(res).map(normalizeCompte);
  },

  createCompte: (data: Partial<ComptaCompte> & Record<string, any>) => {
    const num = data.numeroCompte ?? data.numero;
    const lib = data.libelle ?? data.intitule;
    const cls = data.classe ?? (num ? parseInt(String(num).charAt(0), 10) : 1);
    return authorizedFetch<ComptaCompte>("/compta/plan-comptable", {
      method: "POST",
      body: JSON.stringify({
        numeroCompte: num,
        numero: num,
        libelle: lib,
        intitule: lib,
        classe: cls,
        sensAttendu: data.sensAttendu || "DEBITEUR",
        actif: data.actif !== undefined ? data.actif : true,
      }),
    }).then(normalizeCompte);
  },

  updateCompte: (id: string, data: Partial<ComptaCompte> & Record<string, any>) => {
    const lib = data.libelle ?? data.intitule;
    return authorizedFetch<ComptaCompte>(`/compta/plan-comptable/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        libelle: lib,
        intitule: lib,
        sensAttendu: data.sensAttendu,
        statut: data.statut ?? (data.actif !== undefined ? (data.actif ? "ACTIF" : "INACTIF") : undefined),
      }),
    }).then(normalizeCompte);
  },

  toggleActifCompte: (id: string) =>
    authorizedFetch<ComptaCompte>(`/compta/plan-comptable/${id}/toggle-actif`, {
      method: "PATCH",
    }).then(normalizeCompte),

  getComptesAuxiliaires: async (compteCollectifId?: string) => {
    const query = compteCollectifId ? `?compteCollectifId=${compteCollectifId}` : "";
    const res = await authorizedFetch<any>(`/compta/plan-comptable/auxiliaires${query}`);
    return normalizeArray<any>(res).map(normalizeAuxiliaire);
  },

  createCompteAuxiliaire: (data: Partial<ComptaCompteAuxiliaire> & Record<string, any>) => {
    const num = data.numeroAuxiliaire ?? data.codeAuxiliaire;
    const lib = data.libelle ?? data.intitule;
    const tiersType = data.tiersType ?? data.typeTiers ?? "CLIENT";
    return authorizedFetch<ComptaCompteAuxiliaire>("/compta/plan-comptable/auxiliaires", {
      method: "POST",
      body: JSON.stringify({
        compteCollectifId: data.compteCollectifId,
        numeroAuxiliaire: num,
        codeAuxiliaire: num,
        libelle: lib,
        intitule: lib,
        tiersType,
        typeTiers: tiersType,
        tiersReferenceExterne: data.tiersReferenceExterne,
      }),
    }).then(normalizeAuxiliaire);
  },

  // ---------------- JOURNAUX & EXERCICES (UC-03, UC-12, UC-13, UC-14) ----------------
  getJournaux: async () => {
    const res = await authorizedFetch<any>("/compta/journaux-exercices/journaux");
    return normalizeArray<ComptaJournal>(res);
  },

  createJournal: (data: Partial<ComptaJournal>) => {
    const typeJournal = data.typeJournal === "OPERATIONS_DIVERSES" ? "OD" : data.typeJournal;
    return authorizedFetch<ComptaJournal>("/compta/journaux-exercices/journaux", {
      method: "POST",
      body: JSON.stringify({ ...data, typeJournal }),
    });
  },

  getExercices: async () => {
    const res = await authorizedFetch<any>("/compta/journaux-exercices/exercices");
    return normalizeArray<any>(res).map(normalizeExercice);
  },

  createExercice: (data: { annee: number; dateDebut: string; dateFin: string }) =>
    authorizedFetch<ComptaExercice>("/compta/journaux-exercices/exercices", {
      method: "POST",
      body: JSON.stringify(data),
    }).then(normalizeExercice),

  cloturerPeriode: (periodeId: string) =>
    authorizedFetch<any>(`/compta/journaux-exercices/periodes/${periodeId}/cloturer`, {
      method: "POST",
    }).then(normalizePeriode),

  cloturerExercice: (exerciceId: string, data?: { resultatNet?: number }) =>
    authorizedFetch<any>(`/compta/journaux-exercices/exercices/${exerciceId}/cloturer`, {
      method: "POST",
      body: JSON.stringify(data || {}),
    }).then(normalizeExercice),

  rouvrirExercice: (exerciceId: string, periodeId: string, motif: string) =>
    authorizedFetch<any>(`/compta/journaux-exercices/exercices/${exerciceId}/rouvrir`, {
      method: "POST",
      body: JSON.stringify({ periodeId, motif }),
    }).then(normalizeExercice),

  archiverExercice: (exerciceId: string) =>
    authorizedFetch<any>(`/compta/journaux-exercices/exercices/${exerciceId}/archiver`, {
      method: "POST",
    }).then(normalizeExercice),

  // ---------------- ÉCRITURES COMPTABLES (UC-04, UC-05) ----------------
  getEcritures: async (filters?: {
    journalId?: string;
    exerciceId?: string;
    statut?: string;
    dateDebut?: string;
    dateFin?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.journalId) params.append("journalId", filters.journalId);
    if (filters?.exerciceId) params.append("exerciceId", filters.exerciceId);
    if (filters?.statut) params.append("statut", filters.statut);
    if (filters?.dateDebut) params.append("dateDebut", filters.dateDebut);
    if (filters?.dateFin) params.append("dateFin", filters.dateFin);
    if (filters?.search) params.append("search", filters.search);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await authorizedFetch<any>(`/compta/ecritures${query}`);
    return normalizeArray<any>(res).map(normalizeEcriture);
  },

  getEcriture: (id: string) =>
    authorizedFetch<any>(`/compta/ecritures/${id}`).then(normalizeEcriture),

  createEcriture: (data: any) => {
    const payload = {
      journalId: data.journalId,
      dateEcriture: data.dateEcriture,
      libelle: data.libelle,
      refPiece: data.refPiece ?? data.pieceRef ?? undefined,
      pieceRef: data.pieceRef ?? data.refPiece ?? undefined,
      datePiece: data.datePiece || data.dateEcriture || undefined,
      exerciceId: data.exerciceId || undefined,
      periodeId: data.periodeId || undefined,
      origine: data.origine || "MANUELLE",
      soumettreValidation: Boolean(data.soumettreValidation),
      lignes: (data.lignes || []).map((l: any, idx: number) => ({
        ordre: l.ordre || idx + 1,
        compteId: l.compteId,
        compteAuxiliaireId: l.compteAuxiliaireId || undefined,
        libelleLigne: l.libelleLigne || data.libelle,
        montantDebit: Number(l.montantDebit) || 0,
        montantCredit: Number(l.montantCredit) || 0,
        codeDevise: l.codeDevise || "XOF",
        sectionAnalytiqueId: l.sectionAnalytiqueId || undefined,
      })),
    };
    return authorizedFetch<any>("/compta/ecritures", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then(normalizeEcriture);
  },

  updateEcriture: (id: string, data: any) => {
    const payload: any = {};
    if (data.journalId) payload.journalId = data.journalId;
    if (data.dateEcriture) payload.dateEcriture = data.dateEcriture;
    if (data.libelle) payload.libelle = data.libelle;
    if (data.refPiece !== undefined || data.pieceRef !== undefined) {
      payload.refPiece = data.refPiece ?? data.pieceRef;
      payload.pieceRef = data.pieceRef ?? data.refPiece;
    }
    if (data.datePiece) payload.datePiece = data.datePiece;
    if (data.soumettreValidation !== undefined) payload.soumettreValidation = data.soumettreValidation;
    if (data.lignes) {
      payload.lignes = data.lignes.map((l: any, idx: number) => ({
        ordre: l.ordre || idx + 1,
        compteId: l.compteId,
        compteAuxiliaireId: l.compteAuxiliaireId || undefined,
        libelleLigne: l.libelleLigne || data.libelle,
        montantDebit: Number(l.montantDebit) || 0,
        montantCredit: Number(l.montantCredit) || 0,
        codeDevise: l.codeDevise || "XOF",
        sectionAnalytiqueId: l.sectionAnalytiqueId || undefined,
      }));
    }
    return authorizedFetch<any>(`/compta/ecritures/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }).then(normalizeEcriture);
  },

  soumettreValidation: (id: string) =>
    authorizedFetch<any>(`/compta/ecritures/${id}/soumettre`, {
      method: "POST",
    }).then(normalizeEcriture),

  deleteEcriture: (id: string) =>
    authorizedFetch<any>(`/compta/ecritures/${id}`, {
      method: "DELETE",
    }),

  // ---------------- CIRCUIT DE VALIDATION (UC-07) ----------------
  getEnAttenteValidation: async (filters?: { journalId?: string; exerciceId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.journalId) params.append("journalId", filters.journalId);
    if (filters?.exerciceId) params.append("exerciceId", filters.exerciceId);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await authorizedFetch<any>(`/compta/validation/attente${query}`);
    return normalizeArray<any>(res).map(normalizeEcriture);
  },

  deciderEcriture: (id: string, data: { decision: "VALIDEE" | "REJETEE"; motifRejet?: string }) =>
    authorizedFetch<any>(`/compta/validation/${id}/decider`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  validerLot: (data: { ecritureIds: string[]; decision: "VALIDEE" | "REJETEE"; motif?: string }) =>
    authorizedFetch<any>("/compta/validation/lot", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ---------------- RESTITUTIONS : GRAND LIVRE & BALANCES (UC-08, UC-09) ----------------
  getGrandLivre: async (filters?: {
    exerciceId?: string;
    compteId?: string;
    compteNumero?: string;
    dateDebut?: string;
    dateFin?: string;
    avecAuxiliaires?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters?.exerciceId) params.append("exerciceId", filters.exerciceId);
    if (filters?.compteId) params.append("compteId", filters.compteId);
    if (filters?.compteNumero) params.append("compteNumero", filters.compteNumero);
    if (filters?.dateDebut) params.append("dateDebut", filters.dateDebut);
    if (filters?.dateFin) params.append("dateFin", filters.dateFin);
    if (filters?.avecAuxiliaires) params.append("avecAuxiliaires", "true");
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await authorizedFetch<any>(`/compta/restitutions/grand-livre${query}`);
    return normalizeArray<GrandLivreCompte>(res);
  },

  getBalanceGenerale: async (exerciceId: string, periodeId?: string) => {
    const query = periodeId ? `?exerciceId=${exerciceId}&periodeId=${periodeId}` : `?exerciceId=${exerciceId}`;
    const res = await authorizedFetch<any>(`/compta/restitutions/balance${query}`);
    if (!res) {
      return {
        exerciceId,
        periodeId,
        lignes: [],
        totaux: {
          soldeInitialDebit: 0,
          soldeInitialCredit: 0,
          mouvementsDebit: 0,
          mouvementsCredit: 0,
          soldeFinalDebit: 0,
          soldeFinalCredit: 0,
        },
        estEquilibree: true,
      };
    }
    const rawLignes = Array.isArray(res.lignes) ? res.lignes : [];
    const lignes = rawLignes.map((l: any) => ({
      ...l,
      numero: l.numero ?? l.numeroCompte ?? "",
      numeroCompte: l.numeroCompte ?? l.numero ?? "",
      intitule: l.intitule ?? l.libelleCompte ?? l.libelle ?? "",
      libelle: l.libelle ?? l.intitule ?? l.libelleCompte ?? "",
    }));
    return {
      ...res,
      lignes,
    } as BalanceGeneraleResponse;
  },

  getBalanceAuxiliaire: async (exerciceId: string, compteCollectifId?: string) => {
    const params = new URLSearchParams({ exerciceId });
    if (compteCollectifId) params.append("compteCollectifId", compteCollectifId);
    const res = await authorizedFetch<any>(`/compta/restitutions/balance-auxiliaire?${params.toString()}`);
    return normalizeArray<LigneBalanceAuxiliaire>(res);
  },

  // ---------------- LETTRAGE & RAPPROCHEMENT (UC-10, UC-11) ----------------
  getLignesNonLettrees: async (compteAuxiliaireId: string) => {
    const res = await authorizedFetch<any>(
      `/compta/lettrage-rapprochement/lettrage/non-lettrees?compteAuxiliaireId=${compteAuxiliaireId}`,
    );
    return normalizeArray<any>(res);
  },

  lettrerManuel: (data: { compteAuxiliaireId: string; ligneIds: string[]; codeLettre?: string }) =>
    authorizedFetch<any>("/compta/lettrage-rapprochement/lettrage/manuel", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  lettrerAutomatique: (compteAuxiliaireId: string) =>
    authorizedFetch<any>("/compta/lettrage-rapprochement/lettrage/automatique", {
      method: "POST",
      body: JSON.stringify({ compteAuxiliaireId }),
    }),

  delettrer: (lettrageId: string) =>
    authorizedFetch<any>(`/compta/lettrage-rapprochement/lettrage/${lettrageId}`, {
      method: "DELETE",
    }),

  importerReleve: (data: any) =>
    authorizedFetch<any>("/compta/lettrage-rapprochement/rapprochement/import", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  rapprocherAutomatique: (releveId: string) =>
    authorizedFetch<any>(`/compta/lettrage-rapprochement/rapprochement/${releveId}/automatique`, {
      method: "POST",
    }),

  getEtatRapprochement: (releveId: string) =>
    authorizedFetch<any>(`/compta/lettrage-rapprochement/rapprochement/${releveId}/etat`),

  // ---------------- MOTEUR & ÉVÉNEMENTS AMONT (UC-06) ----------------
  getRegles: async () => {
    const res = await authorizedFetch<any>("/compta/moteur-regles/regles");
    return normalizeArray<any>(res).map((r: any) => ({
      ...r,
      compteDebit: r.compteDebit ? normalizeCompte(r.compteDebit) : undefined,
      compteCredit: r.compteCredit ? normalizeCompte(r.compteCredit) : undefined,
    }));
  },

  createRegle: (data: any) =>
    authorizedFetch<any>("/compta/moteur-regles/regles", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r: any) => ({
      ...r,
      compteDebit: r.compteDebit ? normalizeCompte(r.compteDebit) : undefined,
      compteCredit: r.compteCredit ? normalizeCompte(r.compteCredit) : undefined,
    })),

  getEvenements: async (filters?: { statutTraitement?: string; moduleSource?: string }) => {
    const params = new URLSearchParams();
    if (filters?.statutTraitement) params.append("statutTraitement", filters.statutTraitement);
    if (filters?.moduleSource) params.append("moduleSource", filters.moduleSource);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await authorizedFetch<any>(`/compta/moteur-regles/evenements${query}`);
    return normalizeArray<ComptaEvenementSource>(res);
  },

  retraiterEvenement: (id: string) =>
    authorizedFetch<any>(`/compta/moteur-regles/evenements/${id}/retraiter`, {
      method: "POST",
    }),

  // ---------------- ÉTATS FINANCIERS & FEC (UC-15, UC-16, UC-17, UC-18, UC-20) ----------------
  genererEtatsFinanciers: (data: {
    exerciceId: string;
    systemeRetenu?: "SN" | "SMT";
    typeEdition?: "PROVISOIRE" | "DEFINITIF";
  }) =>
    authorizedFetch<EtatFinancierResponse>("/compta/etats-financiers/generer", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  genererFec: (data: {
    exerciceId: string;
    format?: "CSV" | "TXT_TAB" | "TXT_PIPE";
    motifGeneration?: "A_LA_DEMANDE" | "ARCHIVAGE" | "CONTROLE_FISCAL";
  }) =>
    authorizedFetch<any>("/compta/etats-financiers/fec/generer", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getHistoriqueFec: async (exerciceId?: string) => {
    const query = exerciceId ? `?exerciceId=${exerciceId}` : "";
    const res = await authorizedFetch<any>(`/compta/etats-financiers/fec/historique${query}`);
    return normalizeArray<ComptaFecExport>(res);
  },

  getJournalAudit: async (filters?: { categorie?: string; action?: string; limite?: number }) => {
    const params = new URLSearchParams();
    if (filters?.categorie) params.append("categorie", filters.categorie);
    if (filters?.action) params.append("action", filters.action);
    if (filters?.limite) params.append("limite", String(filters.limite));
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await authorizedFetch<any>(`/compta/etats-financiers/audit${query}`);
    return normalizeArray<any>(res);
  },
};
