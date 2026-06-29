"use client";

import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import {
  canManageQuotations,
  canReadQuotations,
  hasPermissionCode,
} from "@/modules/auth/utils/permissionCodes";

export function useQuotationAccess() {
  const user = useAuthUser();

  return {
    user,
    canReadQuotations: canReadQuotations(user),
    canManageQuotations: canManageQuotations(user),
    hasBackendPermission: (code: string) => hasPermissionCode(user, code),
  };
}
