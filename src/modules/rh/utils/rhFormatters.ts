/**
 * Traducteur et formateur universel pour les termes et énumérations du module RH & Paie
 * Remplace tous les termes bruts à base d'underscore par des libellés professionnels,
 * clairs et compréhensibles par les utilisateurs finaux.
 */

import type {
  RhEmployeeStatus,
  RhContractType,
  RhContractStatus,
  RhPayrollCycleStatus,
  RhAbsenceStatus,
  RhTimeRecordStatus,
  RhPayslipStatus,
  RhPaymentMethod,
  RhPayrollRubricType,
  RhMaritalStatus,
  RhGender,
} from "../types/rh.types";

/**
 * Nettoie et humanise un code brut en texte lisible si aucune traduction spécifique n'est trouvée.
 * Ex: "SIGNE_SANS_RESERVE" -> "Signé Sans Réserve"
 */
export function humanizeCode(code?: string | null): string {
  if (!code) return "-";
  return code
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatCurrencyXOF(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 FCFA";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formate un nombre avec 2 chiffres maximum après la virgule (ex: 12,34 ou 1 250,5 ou 15)
 */
export function formatNumber(amount?: number | null, maxDecimals = 2): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "0";
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formate un taux ou pourcentage avec 2 chiffres maximum après la virgule (ex: 15,25 % ou 30 %)
 */
export function formatPercent(amount?: number | null, maxDecimals = 2): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 %";
  return `${formatNumber(amount, maxDecimals)} %`;
}

export function formatDateFR(dateString?: string | null): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("fr-FR");
}

// ---------------- 1. STATUTS COLLABORATEURS ----------------
export function getEmployeeStatusBadge(status?: string | null): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "ACTIF":
      return {
        label: "Actif en poste",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
      };
    case "EN_CONGE":
      return {
        label: "En Congé",
        badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
      };
    case "SUSPENDU":
      return {
        label: "Contrat Suspendu",
        badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
      };
    case "DEMISSIONNE":
      return {
        label: "Démissionné",
        badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
      };
    case "LICENCIE":
      return {
        label: "Licencié",
        badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
      };
    case "RETRAITE":
      return {
        label: "Retraité",
        badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      };
    case "SORTI":
      return {
        label: "Sorti d'effectif",
        badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      };
    default:
      return {
        label: humanizeCode(status),
        badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

// ---------------- 2. STATUTS & TYPES DE CONTRAT ----------------
export function formatContractStatus(status?: string | null): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "ACTIF":
      return {
        label: "Actif",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
      };
    case "BROUILLON":
      return {
        label: "Projet / Brouillon",
        badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
    case "SUSPENDU":
      return {
        label: "Suspendu",
        badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
      };
    case "CLOTURE":
      return {
        label: "Clôturé à terme",
        badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300",
      };
    case "RESILIE":
    case "ROMPU":
      return {
        label: "Rupture de contrat",
        badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
      };
    default:
      return {
        label: humanizeCode(status),
        badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

export function formatContractType(type?: string | null): string {
  switch (type) {
    case "CDI":
      return "CDI (Durée indéterminée)";
    case "CDD":
      return "CDD (Durée déterminée)";
    case "STAGE":
      return "Stage professionnel";
    case "APPRENTISSAGE":
      return "Contrat d'apprentissage";
    case "INTERIM":
      return "Mission d'intérim";
    case "CONSULTANT":
      return "Prestation / Consultant";
    default:
      return humanizeCode(type);
  }
}

// ---------------- 3. PÉRIODES D'ESSAI ----------------
export function formatProbationStatus(status?: string | null): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "EN_COURS":
      return {
        label: "En cours d'essai",
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
      };
    case "VALIDE":
    case "VALIDEE":
      return {
        label: "Période confirmée",
        badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
      };
    case "RENOUVELE":
    case "RENOUVELEE":
      return {
        label: "Essai renouvelé",
        badgeClass: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
      };
    case "ROMPU":
    case "ROMPUE":
      return {
        label: "Essai non concluant",
        badgeClass: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
      };
    case "ROMPUE_SALARIE":
      return {
        label: "Rupture par le salarié",
        badgeClass: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
      };
    case "ROMPUE_EMPLOYEUR":
      return {
        label: "Rupture par l'employeur",
        badgeClass: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
      };
    default:
      return {
        label: humanizeCode(status),
        badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

// ---------------- 4. RELEVÉS DE TEMPS & ABSENCES ----------------
export function getAbsenceStatusBadge(status?: string | null): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "VALIDE_RH":
      return {
        label: "Validée RH",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
      };
    case "VALIDE_MANAGER":
      return {
        label: "Validée Manager",
        badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
      };
    case "SOUMIS":
      return {
        label: "En attente d'approbation",
        badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
      };
    case "REJETE":
      return {
        label: "Refusée",
        badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
      };
    case "ANNULE":
      return {
        label: "Annulée",
        badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      };
    default:
      return {
        label: humanizeCode(status),
        badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

export function formatTimeRecordStatus(status?: string | null): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "SAISI":
      return {
        label: "Saisi par le salarié",
        badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
    case "VALIDE_MANAGER":
      return {
        label: "Approuvé par le manager",
        badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
      };
    case "VALIDE_RH":
      return {
        label: "Validé définitivement (RH)",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
      };
    case "REJETE":
      return {
        label: "Rejeté / À corriger",
        badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
      };
    default:
      return {
        label: humanizeCode(status),
        badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

export function formatAbsenceType(type?: string | null): string {
  switch (type) {
    case "CONGE_PAYE":
      return "Congé Payé Annuel";
    case "MALADIE_ORDINAIRE":
      return "Maladie Ordinaire";
    case "ACCIDENT_TRAVAIL":
      return "Accident du Travail";
    case "MATERNITE":
      return "Congé Maternité";
    case "PATERNITE":
      return "Congé Paternité";
    case "EVENEMENT_FAMILIAL":
      return "Événement Familial (Mariage, Décès)";
    case "FORMATION":
      return "Formation Professionnelle";
    case "ABSENCE_INJUSTIFIEE":
      return "Absence Injustifiée";
    case "CONGE_SANS_SOLDE":
      return "Congé Sans Solde";
    case "MISSION":
      return "Ordre de Mission";
    default:
      return humanizeCode(type);
  }
}

// ---------------- 5. CYCLES DE PAIE & BULLETINS ----------------
export function getPayrollCycleStatusBadge(status?: string | null): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "BROUILLON":
      return {
        label: "Brouillon en préparation",
        badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
    case "OUVERT":
      return {
        label: "Ouvert à la saisie",
        badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
      };
    case "CALCULE":
      return {
        label: "Calculé (À Valider)",
        badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
      };
    case "VALIDE":
      return {
        label: "Validé et Verrouillé",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
      };
    case "CLOTURE":
      return {
        label: "Clôturé & Archivé",
        badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300",
      };
    case "COMPTABILISE":
      return {
        label: "Comptabilisé (OD Générée)",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
      };
    default:
      return {
        label: humanizeCode(status),
        badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

export function formatPayslipStatus(status?: string | null): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "BROUILLON":
      return {
        label: "Brouillon",
        badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
    case "CALCULE":
      return {
        label: "Calculé",
        badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
      };
    case "VALIDE":
      return {
        label: "Validé",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
      };
    case "PAYE":
      return {
        label: "Régler / Payé",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
      };
    case "ANNULE":
      return {
        label: "Annulé",
        badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
      };
    default:
      return {
        label: humanizeCode(status),
        badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

// ---------------- 6. SOLDE DE TOUT COMPTE (STC) ----------------
export function formatStcSignatureStatus(status?: string | null): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "SIGNE_SANS_RESERVE":
      return {
        label: "Signé sans réserve",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
      };
    case "SIGNE_AVEC_RESERVE":
      return {
        label: "Signé avec réserves",
        badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
      };
    case "EN_ATTENTE_SIGNATURE":
      return {
        label: "En attente de signature",
        badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
      };
    case "CONTESTE":
      return {
        label: "Contesté au tribunal",
        badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
      };
    default:
      return {
        label: humanizeCode(status),
        badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

// ---------------- 7. DÉCLARATIONS SOCIALES ET FISCALES ----------------
export function formatDeclarationType(type?: string | null): string {
  switch (type) {
    case "ITS_BENIN":
      return "Bordereau mensuel ITS (Impôt sur Salaires)";
    case "VPS_BENIN":
      return "Bordereau mensuel VPS (Taxe Patronale)";
    case "CNSS_BENIN_COTISATIONS":
      return "Déclaration nominative CNSS (Cotisations sociales)";
    default:
      return humanizeCode(type);
  }
}

export function formatDeclarationStatus(status?: string | null): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "A_DECLARER":
      return {
        label: "À télédéclarer",
        badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
      };
    case "DECLAREE_TELETRANSMIS":
      return {
        label: "Télédéclarée",
        badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
      };
    case "PAYEE":
      return {
        label: "Acquittée / Quitus",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
      };
    case "EN_RETARD":
      return {
        label: "Délai légal dépassé",
        badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
      };
    default:
      return {
        label: humanizeCode(status),
        badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

// ---------------- 8. RUBRIQUES DE PAIE & COTISATIONS ----------------
export function formatRubricType(type?: string | null): string {
  switch (type) {
    case "GAIN_BRUT":
      return "Gain brut imposable";
    case "INDEMNITE_NON_IMPOSABLE":
      return "Indemnité exonérée / non imposable";
    case "AVANTAGE_EN_NATURE":
      return "Avantage en nature";
    case "RETENUE_SALARIALE_CNSS":
      return "Cotisation salariale CNSS";
    case "RETENUE_FISCALE_ITS":
      return "Retenue fiscale ITS (Impôt source)";
    case "CHARGE_PATRONALE_CNSS":
      return "Cotisation patronale CNSS";
    case "CHARGE_PATRONALE_VPS":
      return "Versement patronal VPS (Taxe)";
    case "RETENUE_NETTE_AUTRE":
      return "Retenue diverse sur net";
    case "GAIN_NET_NON_IMPOSABLE":
      return "Net à payer salarié";
    default:
      return humanizeCode(type);
  }
}

export function formatRubricSens(sens?: string | null): {
  label: string;
  badgeClass: string;
} {
  switch (sens) {
    case "GAIN":
      return {
        label: "Gain / Salaire",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
      };
    case "RETENUE":
      return {
        label: "Retenue / Prélèvement",
        badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
      };
    case "INFORMATION":
      return {
        label: "Information (Charge patronale)",
        badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
      };
    default:
      return {
        label: humanizeCode(sens),
        badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

export function formatAssietteType(type?: string | null): string {
  switch (type) {
    case "SALAIRE_BRUT":
      return "Salaire brut total";
    case "SALAIRE_NET":
      return "Salaire net";
    case "PLAFONNEE":
      return "Assiette plafonnée";
    default:
      return humanizeCode(type);
  }
}

export function formatSocialShare(share?: string | null): string {
  switch (share) {
    case "SALARIALE":
      return "Part salariale";
    case "PATRONALE":
      return "Part patronale";
    case "CONJOINTE":
      return "Parts salariale et patronale";
    default:
      return humanizeCode(share);
  }
}

// ---------------- 9. ÉTAT CIVIL, SITUATION ET PAIEMENT ----------------
export function formatMaritalStatus(status?: string | null): string {
  switch (status) {
    case "CELIBATAIRE":
      return "Célibataire";
    case "MARIE":
      return "Marié(e)";
    case "DIVORCE":
      return "Divorcé(e)";
    case "VEUF":
      return "Veuf / Veuve";
    case "PACS":
      return "Pacsé(e)";
    case "UNION_LIBRE":
      return "Union libre";
    default:
      return humanizeCode(status);
  }
}

export function formatGender(gender?: string | null): string {
  switch (gender) {
    case "M":
    case "MASCULIN":
      return "Masculin";
    case "F":
    case "FEMININ":
      return "Féminin";
    default:
      return humanizeCode(gender);
  }
}

export function formatPaymentMethod(method?: string | null): string {
  switch (method) {
    case "VIREMENT_BANCAIRE":
      return "Virement bancaire";
    case "CHEQUE":
      return "Chèque";
    case "ESPECES":
      return "Espèces (Caisse)";
    case "MOBILE_MONEY":
      return "Mobile Money";
    default:
      return humanizeCode(method);
  }
}

// ---------------- 10. RUPTURES ET AVENANTS ----------------
export function formatTerminationType(type?: string | null): string {
  switch (type) {
    case "LICENCIEMENT_MOTIF_PERSONNEL":
      return "Licenciement pour motif personnel";
    case "LICENCIEMENT_MOTIF_ECONOMIQUE":
      return "Licenciement économique";
    case "DEMISSION":
      return "Démission du salarié";
    case "RUPTURE_CONVENTIONNELLE":
      return "Rupture conventionnelle";
    case "FIN_CONTRAT_CDD":
      return "Terme normal du CDD";
    case "DECES":
      return "Décès du salarié";
    case "RETRAITE":
      return "Départ à la retraite";
    case "FORCE_MAJEURE":
      return "Force majeure";
    default:
      return humanizeCode(type);
  }
}

export function formatAmendmentType(type?: string | null): string {
  switch (type) {
    case "AUGMENTATION_SALAIRE":
      return "Augmentation de salaire";
    case "PROMOTION":
      return "Promotion de fonction";
    case "CHANGEMENT_POSTE":
      return "Changement de poste";
    case "MODIFICATION_TEMPS_TRAVAIL":
      return "Modification du temps de travail";
    case "TRANSFERT_ETABLISSEMENT":
      return "Transfert d'établissement";
    case "PROLONGATION_CDD":
      return "Prolongation de CDD";
    case "AUTRE":
      return "Autre avenant contractuel";
    default:
      return humanizeCode(type);
  }
}

// ---------------- 11. LIENS DE PARENTÉ & DOCUMENTS ----------------
export function formatFamilyRelationship(rel?: string | null): string {
  switch (rel) {
    case "ENFANT":
      return "Enfant";
    case "CONJOINT":
      return "Conjoint(e)";
    case "ASCENDANT":
      return "Ascendant (Parent)";
    case "AUTRE":
      return "Autre charge légale";
    default:
      return humanizeCode(rel);
  }
}

export function formatDocumentType(type?: string | null): string {
  switch (type) {
    case "CNI":
      return "Pièce d'Identité / Passeport";
    case "CONTRAT_SIGNE":
      return "Contrat de Travail Signé";
    case "DIPLOME":
      return "Diplôme & Attestation";
    case "CERTIFICAT_MEDICAL":
      return "Certificat Médical d'Aptitude";
    case "RIB":
      return "RIB / Relevé Bancaire";
    case "AUTRE":
      return "Autre Document";
    default:
      return humanizeCode(type);
  }
}

