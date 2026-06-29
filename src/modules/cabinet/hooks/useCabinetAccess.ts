"use client";

import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import {
  canReadCabinet,
  canReadSettings,
  hasPermissionCode,
  PERMISSION_CODES,
} from "@/modules/auth/utils/permissionCodes";

export function useCabinetAccess() {
  const user = useAuthUser();

  return {
    user,
    canReadCabinet: canReadCabinet(user),
    canReadSettings: canReadSettings(user),
    canManageUsers: hasPermissionCode(user, PERMISSION_CODES.MANAGE_USERS),
  };
}
