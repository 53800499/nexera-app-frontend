"use client";

import { useMemo } from "react";
import {
  canManageCatalogue,
  canManageClients,
  canManageInvoices,
  canManageOrders,
  canManagePayments,
  canManageQuotations,
  canManageReminders,
  canManageSettings,
  canReadCatalogue,
  canReadClients,
  canReadDashboard,
  canReadInvoices,
  canReadOrders,
  canReadPayments,
  canReadQuotations,
  canReadReminders,
  canReadSettings,
  canReadStock,
  canManageStock,
  hasAnyPermissionCode,
  hasPermissionCode,
  PERMISSION_CODES,
} from "@/modules/auth/utils/permissionCodes";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import type { NavPermissions } from "./types";

export function useNavPermissions(): NavPermissions {
  const user = useAuthUser();

  return useMemo(() => {
    return {
      dashboard: canReadDashboard(user),
      clients: canReadClients(user),
      catalogue: canReadCatalogue(user),
      stock: canReadStock(user),
      quotations: canReadQuotations(user),
      orders: canReadOrders(user),
      invoices: canReadInvoices(user),
      payments: canReadPayments(user),
      reminders: canReadReminders(user),
      reports:
        canReadDashboard(user) || hasPermissionCode(user, "reports.read"),
      settings: canReadSettings(user),
      users: hasPermissionCode(user, PERMISSION_CODES.MANAGE_USERS),
      roles: hasAnyPermissionCode(user, [
        PERMISSION_CODES.MANAGE_ROLES,
        PERMISSION_CODES.MANAGE_PERMISSIONS,
        PERMISSION_CODES.ROLES_READ,
      ]),
      canManageClients: canManageClients(user),
      canManageCatalogue: canManageCatalogue(user),
      canManageStock: canManageStock(user),
      canManageQuotations: canManageQuotations(user),
      canManageOrders: canManageOrders(user),
      canManageInvoices: canManageInvoices(user),
      canManagePayments: canManagePayments(user),
      canManageReminders: canManageReminders(user),
      canManageUsers: hasPermissionCode(user, PERMISSION_CODES.MANAGE_USERS),
      canManageRoles: hasPermissionCode(user, PERMISSION_CODES.MANAGE_ROLES),
      canManageSettings: canManageSettings(user),
    };
  }, [user]);
}
