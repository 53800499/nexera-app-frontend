"use client";

import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import {
  canManageInvoices,
  canReadInvoices,
  hasPermissionCode,
} from "@/modules/auth/utils/permissionCodes";

export function useInvoiceAccess() {
  const user = useAuthUser();

  return {
    user,
    canReadInvoices: canReadInvoices(user),
    canManageInvoices: canManageInvoices(user),
    hasBackendPermission: (code: string) => hasPermissionCode(user, code),
  };
}
