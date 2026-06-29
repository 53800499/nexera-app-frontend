import type { NavItemConfig } from "./types";
import {
  canReadCabinet,
  canReadSettings,
  hasPermissionCode,
  PERMISSION_CODES,
} from "@/modules/auth/utils/permissionCodes";
import type { AuthUser } from "@/modules/auth/types/auth.types";

export type CabinetNavPermissions = {
  cockpit: boolean;
  dossiers: boolean;
  users: boolean;
  settings: boolean;
};

export function getCabinetNavPermissions(
  user: Pick<AuthUser, "permissions"> | null | undefined,
): CabinetNavPermissions {
  const permissionsUser = user ?? null;
  return {
    cockpit: canReadCabinet(permissionsUser),
    dossiers: canReadCabinet(permissionsUser),
    users: hasPermissionCode(permissionsUser, PERMISSION_CODES.MANAGE_USERS),
    settings: canReadSettings(permissionsUser),
  };
}

export const CABINET_NAV_CONFIG: NavItemConfig<CabinetNavPermissions>[] = [
  {
    id: "cockpit",
    name: "Cockpit",
    iconKey: "grid",
    path: "/cabinet",
    canAccess: (p) => p.cockpit,
  },
  {
    id: "dossiers",
    name: "Dossiers",
    iconKey: "group",
    path: "/cabinet/dossiers",
    canAccess: (p) => p.dossiers,
  },
  {
    id: "utilisateurs",
    name: "Utilisateurs",
    iconKey: "user",
    path: "/utilisateurs",
    canAccess: (p) => p.users,
  },
  {
    id: "parametres",
    name: "Paramètres",
    iconKey: "plug",
    path: "/parametres",
    canAccess: (p) => p.settings,
  },
];
