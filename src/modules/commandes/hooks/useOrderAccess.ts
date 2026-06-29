"use client";

import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import {
  canManageOrders,
  canReadOrders,
  hasPermissionCode,
} from "@/modules/auth/utils/permissionCodes";

export function useOrderAccess() {
  const user = useAuthUser();

  return {
    user,
    canReadOrders: canReadOrders(user),
    canManageOrders: canManageOrders(user),
    hasBackendPermission: (code: string) => hasPermissionCode(user, code),
  };
}
