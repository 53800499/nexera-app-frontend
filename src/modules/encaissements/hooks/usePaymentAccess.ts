"use client";

import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import {
  canManagePayments,
  canReadPayments,
  hasPermissionCode,
} from "@/modules/auth/utils/permissionCodes";

export function usePaymentAccess() {
  const user = useAuthUser();

  return {
    user,
    canReadPayments: canReadPayments(user),
    canManagePayments: canManagePayments(user),
    hasBackendPermission: (code: string) => hasPermissionCode(user, code),
  };
}
