"use client";

import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import {
  canManageCatalogue,
  canReadCatalogue,
  canReadSettings,
  hasPermissionCode,
} from "@/modules/auth/utils/permissionCodes";

export function useCatalogAccess() {
  const user = useAuthUser();

  return {
    user,
    canReadCatalogue: canReadCatalogue(user),
    canManageCatalogue: canManageCatalogue(user),
    canReadTaxRates: canReadSettings(user) || canManageCatalogue(user),
    hasBackendPermission: (code: string) => hasPermissionCode(user, code),
  };
}
