"use client";

import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import {
  canReadDashboard,
  hasPermissionCode,
} from "@/modules/auth/utils/permissionCodes";

export function useDashboardAccess() {
  const user = useAuthUser();

  return {
    user,
    canReadDashboard: canReadDashboard(user),
    hasBackendPermission: (code: string) => hasPermissionCode(user, code),
  };
}
