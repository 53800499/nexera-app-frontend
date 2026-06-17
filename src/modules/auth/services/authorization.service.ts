import type { AuthUser } from "../types/auth.types";
import type { ModulePermission, PermissionLevel } from "../types/user.types";
import { PERMISSION_LEVELS, USER_ROLES } from "../types/user.types";

const LEVEL_RANK: Record<PermissionLevel, number> = {
  [PERMISSION_LEVELS.READ]: 1,
  [PERMISSION_LEVELS.PARTIAL_WRITE]: 2,
  [PERMISSION_LEVELS.WRITE]: 3,
};

const DEFAULT_PERMISSIONS: Record<string, ModulePermission[]> = {
  [USER_ROLES.DIRIGEANT]: [
    { module: "facturation", level: PERMISSION_LEVELS.WRITE },
    { module: "stock", level: PERMISSION_LEVELS.WRITE },
    { module: "comptabilite", level: PERMISSION_LEVELS.READ },
  ],
  [USER_ROLES.RESPONSABLE_COMMERCIAL]: [
    { module: "facturation", level: PERMISSION_LEVELS.WRITE },
  ],
  [USER_ROLES.COMMERCIAL]: [
    { module: "facturation", level: PERMISSION_LEVELS.PARTIAL_WRITE },
  ],
  [USER_ROLES.COMPTABLE]: [
    { module: "facturation", level: PERMISSION_LEVELS.READ },
    { module: "comptabilite", level: PERMISSION_LEVELS.READ },
  ],
  [USER_ROLES.EXPERT_COMPTABLE]: [
    { module: "facturation", level: PERMISSION_LEVELS.READ },
    { module: "comptabilite", level: PERMISSION_LEVELS.WRITE },
    { module: "cabinet", level: PERMISSION_LEVELS.WRITE },
  ],
  [USER_ROLES.COLLABORATEUR_CABINET]: [
    { module: "facturation", level: PERMISSION_LEVELS.READ },
    { module: "comptabilite", level: PERMISSION_LEVELS.WRITE },
    { module: "cabinet", level: PERMISSION_LEVELS.PARTIAL_WRITE },
  ],
};

export class AuthorizationService {
  hasPermission(
    user: AuthUser,
    module: string,
    requiredLevel: PermissionLevel,
  ): boolean {
    const backendPermission = this.matchBackendPermission(
      user.permissions,
      module,
      requiredLevel,
    );
    if (backendPermission !== null) return backendPermission;

    const permissions = DEFAULT_PERMISSIONS[user.role] ?? [];
    const permission = permissions.find((p) => p.module === module);
    if (!permission) return false;

    return LEVEL_RANK[permission.level] >= LEVEL_RANK[requiredLevel];
  }

  private matchBackendPermission(
    permissions: string[],
    module: string,
    requiredLevel: PermissionLevel,
  ): boolean | null {
    if (permissions.length === 0) return null;

    const modulePrefixes: Record<string, string[]> = {
      facturation: ["invoice", "quotation", "payment", "client", "catalog"],
      comptabilite: ["accounting", "ledger"],
      cabinet: ["cabinet", "dossier"],
      stock: ["stock", "inventory"],
    };

    const prefixes = modulePrefixes[module] ?? [module];
    const hasMatch = permissions.some((code) =>
      prefixes.some((prefix) => code.includes(prefix)),
    );

    if (!hasMatch) return false;

    if (requiredLevel === PERMISSION_LEVELS.READ) return true;
    return permissions.some(
      (code) =>
        prefixes.some((prefix) => code.includes(prefix)) &&
        (code.startsWith("manage:") || code.startsWith("write:")),
    );
  }
}

export const authorizationService = new AuthorizationService();
