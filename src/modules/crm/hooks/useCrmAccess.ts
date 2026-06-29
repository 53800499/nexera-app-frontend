"use client";

import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import {
  canManageClients,
  canReadClients,
  hasPermissionCode,
} from "@/modules/auth/utils/permissionCodes";

export function useCrmAccess() {
  const user = useAuthUser();

  return {
    user,
    canReadClients: canReadClients(user),
    canManageClients: canManageClients(user),
    hasBackendPermission: (code: string) => hasPermissionCode(user, code),
  };
}
