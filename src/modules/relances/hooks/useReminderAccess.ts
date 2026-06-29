"use client";

import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import {
  canManageReminders,
  canReadReminders,
  hasPermissionCode,
} from "@/modules/auth/utils/permissionCodes";

export function useReminderAccess() {
  const user = useAuthUser();

  return {
    user,
    canReadReminders: canReadReminders(user),
    canManageReminders: canManageReminders(user),
    hasBackendPermission: (code: string) => hasPermissionCode(user, code),
  };
}
