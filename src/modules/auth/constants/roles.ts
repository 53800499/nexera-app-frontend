export const APP_ROLES = {
  CEO: "CEO",
  ADMIN: "ADMIN",
  SALES_MANAGER: "SALES_MANAGER",
  SALES_REP: "SALES_REP",
  ACCOUNTANT: "ACCOUNTANT",
  ACCOUNTING_FIRM: "ACCOUNTING_FIRM",
  CABINET_STAFF: "CABINET_STAFF",
} as const;

export const USER_ROLE_LABELS = {
  dirigeant: "Dirigeant / Promoteur",
  responsable_commercial: "Responsable Commercial",
  commercial: "Commercial",
  comptable: "Comptable",
  expert_comptable: "Expert-Comptable",
  collaborateur_cabinet: "Collaborateur Cabinet",
} as const;

export const WORKSPACE_LABELS = {
  cabinet: "Espace Cabinet",
  entreprise: "Espace Entreprise",
} as const;

import type { UserRole } from "../types/user.types";
import { USER_ROLES } from "../types/user.types";

export const APP_ROLE_TO_USER_ROLE: Record<string, UserRole> = {
  [APP_ROLES.CEO]: USER_ROLES.DIRIGEANT,
  [APP_ROLES.ADMIN]: USER_ROLES.DIRIGEANT,
  [APP_ROLES.SALES_MANAGER]: USER_ROLES.RESPONSABLE_COMMERCIAL,
  [APP_ROLES.SALES_REP]: USER_ROLES.COMMERCIAL,
  [APP_ROLES.ACCOUNTANT]: USER_ROLES.COMPTABLE,
  [APP_ROLES.ACCOUNTING_FIRM]: USER_ROLES.EXPERT_COMPTABLE,
  [APP_ROLES.CABINET_STAFF]: USER_ROLES.COLLABORATEUR_CABINET,
};

export const CABINET_APP_ROLES = new Set<string>([
  APP_ROLES.ACCOUNTING_FIRM,
  APP_ROLES.CABINET_STAFF,
]);

export function isCabinetRole(role: UserRole): boolean {
  return (
    role === USER_ROLES.EXPERT_COMPTABLE ||
    role === USER_ROLES.COLLABORATEUR_CABINET
  );
}
