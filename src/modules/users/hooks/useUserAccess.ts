"use client";

import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";

export function useUserAccess() {
  const user = useAuthUser();

  const hasBackendPermission = (code: string) =>
    user?.permissions.includes(code) ?? false;

  const canManageUsers = hasBackendPermission("manage:users");

  return {
    user,
    canReadUsers: canManageUsers,
    canManageUsers,
    hasBackendPermission,
  };
}
