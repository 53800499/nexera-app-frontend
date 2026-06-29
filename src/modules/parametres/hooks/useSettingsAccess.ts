"use client";

import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import {
  canManageSettings,
  canReadSettings,
  hasPermissionCode,
} from "@/modules/auth/utils/permissionCodes";

export function useSettingsAccess() {
  const user = useAuthUser();

  return {
    user,
    canReadSettings: canReadSettings(user),
    canManageSettings: canManageSettings(user),
    hasBackendPermission: (code: string) => hasPermissionCode(user, code),
  };
}
