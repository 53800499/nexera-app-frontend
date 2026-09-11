/**
 * Dictionnaire de traduction et de formatage en français professionnel
 * pour l'ensemble des modules du Cabinet (évite l'affichage de variables brutes ou enums techniques).
 */

export function formatTypeMandat(type?: string | null): string {
  if (!type) return "—";
  const map: Record<string, string> = {
    TENUE_COMPTABLE: "Tenue comptable mensuelle",
    REVISION_ANNUELLE: "Révision & Clôture annuelle",
    EXPERTISE_PAIE: "Gestion sociale & Paie",
    ASSISTANCE_FISCALE: "Fiscalité & Déclarations",
    AUDIT_CONTRACTUEL: "Audit contractuel",
    MISSION_PONCTUELLE: "Conseil & Mission ponctuelle",
  };
  return map[type] || type.replace(/_/g, " ");
}

export function formatStatutMandat(statut?: string | null): string {
  if (!statut) return "—";
  const map: Record<string, string> = {
    ACTIF: "Actif",
    SUSPENDU: "Suspendu",
    RESILIE: "Résilié",
    TERMINE: "Terminé",
  };
  return map[statut] || statut;
}

export function formatTypeMission(type?: string | null): string {
  if (!type) return "—";
  const map: Record<string, string> = {
    RECURRENTE: "Mission récurrente",
    PONCTUELLE: "Mission ponctuelle",
    EXCEPTIONNELLE: "Mission exceptionnelle",
  };
  return map[type] || type;
}

export function formatStatutMission(statut?: string | null): string {
  if (!statut) return "—";
  const map: Record<string, string> = {
    PLANIFIEE: "Planifiée",
    EN_COURS: "En cours",
    EN_REVUE: "En revue",
    EN_RETARD: "En retard",
    TERMINEE: "Terminée",
  };
  return map[statut] || statut;
}

export function formatStatutTache(statut?: string | null): string {
  if (!statut) return "—";
  const map: Record<string, string> = {
    A_FAIRE: "À faire",
    EN_COURS: "En cours",
    FAITE: "Terminée",
    BLOQUEE: "Bloquée",
  };
  return map[statut] || statut;
}

export function formatStatutEcheance(statut?: string | null, isLate?: boolean): string {
  if (!statut) return "—";
  if (isLate && statut !== "TRAITEE") return "En retard";
  const map: Record<string, string> = {
    A_VENIR: "À venir",
    DUE: "Échue",
    TRAITEE: "Traitée",
    EN_RETARD: "En retard",
  };
  return map[statut] || statut;
}

export function formatModuleSource(module?: string | null): string {
  if (!module) return "—";
  const map: Record<string, string> = {
    M1_STOCK: "Stocks & Achats (M1)",
    M2_GESTION_COMMERCIALE: "Facturation & Ventes (M2)",
    M3_COMPTABILITE: "Comptabilité SYSCOHADA (M3)",
    M4_RH_PAIE: "Ressources Humaines & Paie (M4)",
    M5_NOTES_FRAIS: "Notes de Frais (M5)",
    M7_FISCALITE: "Fiscalité & Déclarations (M7)",
  };
  return map[module] || module;
}

export function formatObjetMetier(type?: string | null): string {
  if (!type) return "Livrable";
  const map: Record<string, string> = {
    ecriture_comptable: "Écriture comptable",
    piece_comptable: "Pièce justificative",
    declaration_tva: "Déclaration TVA (CA3)",
    liasse_fiscale: "Liasse fiscale annuelle",
    bilan_annuel: "Bilan & États financiers",
    bulletin_paie: "Bulletin de paie",
    etat_rapprochement: "Rapprochement bancaire",
    facture_client: "Facture client",
    facture_fournisseur: "Facture fournisseur",
    cycle_paie: "Cycle de paie",
    tax_liasse_2026: "Liasse fiscale 2026",
    situation_intermediaire: "Situation intermédiaire",
  };
  return map[type] || type.replace(/_/g, " ");
}

export function formatNiveauSeverite(niveau?: string | null): string {
  if (!niveau) return "—";
  const map: Record<string, string> = {
    BLOQUANT: "Bloquant",
    A_CORRIGER: "À corriger",
    INFORMATION: "Information",
  };
  return map[niveau] || niveau;
}

export function formatStatutPointRevue(statut?: string | null): string {
  if (!statut) return "—";
  const map: Record<string, string> = {
    OUVERT: "Ouvert",
    EN_TRAITEMENT: "En traitement",
    RESOLU: "Résolu",
    ECARTE: "Écarté",
  };
  return map[statut] || statut;
}

export function formatDecisionValidation(decision?: string | null): string {
  if (!decision) return "—";
  const map: Record<string, string> = {
    APPROUVE: "Approuvé",
    REJETE: "Rejeté",
    RENVOYE_POUR_CORRECTION: "Renvoyé pour correction",
  };
  return map[decision] || decision;
}

export function formatMethodeSignature(methode?: string | null): string {
  if (!methode) return "—";
  const map: Record<string, string> = {
    SIGNATURE_ELECTRONIQUE_QUALIFIEE: "Signature Électronique Qualifiée (SEQ)",
    SIGNATURE_ELECTRONIQUE_SIMPLE: "Signature Électronique Simple (SES)",
    SIGNATURE_MANUSCRITE_SCANNEE: "Signature Manuscrite Scannée",
  };
  return map[methode] || methode;
}

export function formatRoleCode(roleCode?: string | null): string {
  if (!roleCode) return "Collaborateur";
  const map: Record<string, string> = {
    EXPERT_COMPTABLE: "Expert-Comptable",
    ASSOCIE: "Associé",
    CHEF_DE_MISSION: "Chef de mission",
    COLLABORATEUR: "Collaborateur",
    ASSISTANT: "Assistant comptable",
    GESTIONNAIRE_PAIE: "Gestionnaire de paie",
    JURISTE_FISCALISTE: "Juriste fiscaliste",
    STAGIAIRE: "Stagiaire",
  };
  return map[roleCode] || roleCode.replace(/_/g, " ");
}

export function formatStatutNoteHonoraires(statut?: string | null): string {
  if (!statut) return "—";
  const map: Record<string, string> = {
    BROUILLON: "Brouillon",
    EMISE: "Émise",
    PAYEE: "Payée",
    EN_RETARD: "En retard",
    ANNULEE: "Annulée",
  };
  return map[statut] || statut;
}

export function formatStatutDemandePiece(statut?: string | null): string {
  if (!statut) return "—";
  const map: Record<string, string> = {
    EN_ATTENTE: "En attente du client",
    RECUE: "Pièce reçue",
    RELANCEE: "Relancée",
    SANS_OBJET: "Sans objet",
  };
  return map[statut] || statut;
}

export function formatNiveauHabilitation(niveau?: string | null): string {
  if (!niveau) return "—";
  const map: Record<string, string> = {
    CONSULTATION: "Consultation seule",
    ANNOTATION: "Annotation & Revue",
    VALIDATION: "Validation des livrables",
    SIGNATURE: "Signature engagée",
  };
  return map[niveau] || niveau;
}

export function formatDecisionConflit(decision?: string | null): string {
  if (!decision) return "—";
  const map: Record<string, string> = {
    AUCUNE_ACTION: "Aucune action requise",
    RETRAIT_DU_DOSSIER: "Retrait du dossier",
    MESURE_SPECIFIQUE: "Mesure de sauvegarde",
  };
  return map[decision] || decision;
}

export function formatClientDossierName(
  clientTenantId?: string | null,
  companyName?: string | null,
): string {
  if (companyName) return companyName;
  if (!clientTenantId) return "Dossier client";
  return `Dossier client`;
}

export function formatMandatSelectOption(
  mandat?: {
    typeMandat?: string | null;
    clientTenantId?: string | null;
  } | null,
  companyName?: string | null,
): string {
  if (!mandat) return "Dossier client";
  const client = companyName || "Dossier client";
  const type = formatTypeMandat(mandat.typeMandat);
  return `${client} — ${type}`;
}

