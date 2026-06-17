"use client";

import { authorizationService } from "../services/authorization.service";
import { useAuthStore } from "../store/authStore";
import type { PermissionLevel } from "../types/user.types";

export function usePermission() {
  const user = useAuthStore((s) => s.user);

  const hasPermission = (module: string, level: PermissionLevel) => {
    if (!user) return false;
    return authorizationService.hasPermission(user, module, level);
  };

  return { hasPermission, user };
}
