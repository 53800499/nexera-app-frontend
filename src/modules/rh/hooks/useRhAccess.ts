"use client";

import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import {
  canReadRh,
  canManageRh,
  canManageEmployees,
  canManageContracts,
  canRequestLeaves,
  canValidateLeaves,
  canManageTimesheets,
  canCalculatePayroll,
  canValidatePayroll,
  canManageDeclarations,
  canExportAccounting,
  hasPermissionCode,
} from "@/modules/auth/utils/permissionCodes";

export function useRhAccess() {
  const user = useAuthUser();

  return {
    user,
    canReadRh: canReadRh(user),
    canManageRh: canManageRh(user),
    canManageEmployees: canManageEmployees(user),
    canManageContracts: canManageContracts(user),
    canRequestLeaves: canRequestLeaves(user),
    canValidateLeaves: canValidateLeaves(user),
    canManageTimesheets: canManageTimesheets(user),
    canCalculatePayroll: canCalculatePayroll(user),
    canValidatePayroll: canValidatePayroll(user),
    canManageDeclarations: canManageDeclarations(user),
    canExportAccounting: canExportAccounting(user),
    hasBackendPermission: (code: string) => hasPermissionCode(user, code),
  };
}
