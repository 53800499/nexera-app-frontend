"use client";

import { useAuthStore } from "@/modules/auth/store/authStore";

export function useAccessControl() {
  const user = useAuthStore((state) => state.user);

  const hasBackendPermission = (code: string) =>
    user?.permissions.includes(code) ?? false;

  return {
    user,
    canManageRoles: hasBackendPermission("manage:roles"),
    canManagePermissions: hasBackendPermission("manage:permissions"),
    hasBackendPermission,
  };
}
