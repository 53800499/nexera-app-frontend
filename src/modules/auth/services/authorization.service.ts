import type { AuthUser } from "../types/auth.types";
import type { PermissionLevel } from "../types/user.types";
import { PERMISSION_LEVELS } from "../types/user.types";
import {
  canManageClients,
  canReadClients,
  canReadDashboard,
  canReadInvoices,
  canReadOrders,
  canReadPayments,
  canReadQuotations,
  canReadReminders,
  canReadSettings,
  canManageInvoices,
  canManageOrders,
  canManagePayments,
  canManageQuotations,
  canManageReminders,
  canManageSettings,
  hasAnyPermissionCode,
  PERMISSION_CODES,
} from "../utils/permissionCodes";

const MODULE_READ_CHECKERS: Record<
  string,
  (user: Pick<AuthUser, "permissions">) => boolean
> = {
  clients: canReadClients,
  facturation: (user) =>
    canReadQuotations(user) ||
    canReadInvoices(user) ||
    canReadOrders(user) ||
    canReadPayments(user) ||
    canReadReminders(user) ||
    canReadClients(user),
  dashboard: canReadDashboard,
  settings: canReadSettings,
  roles: (user) =>
    hasAnyPermissionCode(user, [
      PERMISSION_CODES.ROLES_READ,
      PERMISSION_CODES.MANAGE_ROLES,
      PERMISSION_CODES.MANAGE_PERMISSIONS,
    ]),
};

const MODULE_WRITE_CHECKERS: Record<
  string,
  (user: Pick<AuthUser, "permissions">) => boolean
> = {
  clients: canManageClients,
  facturation: (user) =>
    canManageQuotations(user) ||
    canManageInvoices(user) ||
    canManageOrders(user) ||
    canManagePayments(user) ||
    canManageReminders(user) ||
    canManageClients(user),
  settings: canManageSettings,
  roles: (user) =>
    hasAnyPermissionCode(user, [
      PERMISSION_CODES.MANAGE_ROLES,
      PERMISSION_CODES.MANAGE_PERMISSIONS,
    ]),
};

export class AuthorizationService {
  /**
   * Vérifie une permission module/niveau uniquement via les codes RBAC backend.
   * Aucun repli sur le rôle applicatif : un tableau vide signifie aucun accès.
   */
  hasPermission(
    user: AuthUser,
    module: string,
    requiredLevel: PermissionLevel,
  ): boolean {
    if (!user.permissions?.length) return false;

    const checker =
      requiredLevel === PERMISSION_LEVELS.READ
        ? MODULE_READ_CHECKERS[module]
        : MODULE_WRITE_CHECKERS[module];

    return checker ? checker(user) : false;
  }
}

export const authorizationService = new AuthorizationService();
