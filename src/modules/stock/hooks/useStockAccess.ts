"use client";

import {
  canManageStock,
  canReadStock,
} from "@/modules/auth/utils/permissionCodes";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";

export function useStockAccess() {
  const user = useAuthUser();
  return {
    canReadStock: canReadStock(user),
    canManageStock: canManageStock(user),
  };
}
