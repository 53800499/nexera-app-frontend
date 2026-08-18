import type {
  RhEmployeeStatus,
  RhContractType,
  RhPayrollCycleStatus,
  RhAbsenceStatus,
} from "../types/rh.types";

export function formatCurrencyXOF(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 FCFA";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateFR(dateString?: string | null): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("fr-FR");
}

export function getEmployeeStatusBadge(status?: RhEmployeeStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "ACTIF":
      return {
        label: "Actif",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
      };
    case "EN_CONGE":
      return {
        label: "En Congé",
        badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
      };
    case "SUSPENDU":
      return {
        label: "Suspendu",
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
    default:
      return {
        label: status || "Inconnu",
        badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

export function getPayrollCycleStatusBadge(status?: RhPayrollCycleStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "OUVERT":
      return {
        label: "Ouvert",
        badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
      };
    case "CALCULE":
      return {
        label: "Calculé",
        badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
      };
    case "VALIDE":
      return {
        label: "Validé / Clôturé",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
      };
    case "CLOTURE":
      return {
        label: "Archivé",
        badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300",
      };
    default:
      return {
        label: status || "Inconnu",
        badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

export function getAbsenceStatusBadge(status?: RhAbsenceStatus): {
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
        label: "En attente",
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
        label: status || "Inconnu",
        badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}
