import type { AuthUser } from "../types/auth.types";

/** Codes alignés sur le seed RBAC backend (auth.service.ts). */
export const PERMISSION_CODES = {
  DASHBOARD_READ: "dashboard.read",
  CLIENTS_READ: "clients.read",
  CLIENTS_WRITE: "clients.write",
  MANAGE_CLIENTS: "manage:clients",
  QUOTATIONS_READ: "quotations.read",
  QUOTATIONS_WRITE: "quotations.write",
  MANAGE_QUOTATIONS: "manage:quotations",
  ORDERS_READ: "orders.read",
  ORDERS_WRITE: "orders.write",
  MANAGE_ORDERS: "manage:orders",
  INVOICES_READ: "invoices.read",
  INVOICES_WRITE: "invoices.write",
  MANAGE_INVOICES: "manage:invoices",
  PAYMENTS_READ: "payments.read",
  PAYMENTS_WRITE: "payments.write",
  MANAGE_PAYMENTS: "manage:payments",
  REMINDERS_READ: "reminders.read",
  REMINDERS_WRITE: "reminders.write",
  MANAGE_REMINDERS: "manage:reminders",
  SETTINGS_READ: "settings.read",
  MANAGE_SETTINGS: "manage:settings",
  CATALOGUE_READ: "catalogue.read",
  MANAGE_CATALOGUE: "manage:catalogue",
  STOCK_READ: "stock.read",
  MANAGE_STOCK: "manage:stock",
  MANAGE_USERS: "manage:users",
  ROLES_READ: "roles.read",
  MANAGE_ROLES: "manage:roles",
  MANAGE_PERMISSIONS: "manage:permissions",
  CABINET_READ: "cabinet.read",
} as const;

export function hasPermissionCode(
  user: Pick<AuthUser, "permissions"> | null | undefined,
  code: string,
): boolean {
  return user?.permissions.includes(code) ?? false;
}

export function hasAnyPermissionCode(
  user: Pick<AuthUser, "permissions"> | null | undefined,
  codes: readonly string[],
): boolean {
  return codes.some((code) => hasPermissionCode(user, code));
}

export function canReadClients(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.CLIENTS_READ,
    PERMISSION_CODES.CLIENTS_WRITE,
    PERMISSION_CODES.MANAGE_CLIENTS,
  ]);
}

export function canManageClients(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.CLIENTS_WRITE,
    PERMISSION_CODES.MANAGE_CLIENTS,
  ]);
}

export function canReadQuotations(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.QUOTATIONS_READ,
    PERMISSION_CODES.QUOTATIONS_WRITE,
    PERMISSION_CODES.MANAGE_QUOTATIONS,
  ]);
}

export function canManageQuotations(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.QUOTATIONS_WRITE,
    PERMISSION_CODES.MANAGE_QUOTATIONS,
  ]);
}

export function canReadOrders(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.ORDERS_READ,
    PERMISSION_CODES.ORDERS_WRITE,
    PERMISSION_CODES.MANAGE_ORDERS,
  ]);
}

export function canManageOrders(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.ORDERS_WRITE,
    PERMISSION_CODES.MANAGE_ORDERS,
  ]);
}

export function canReadInvoices(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.INVOICES_READ,
    PERMISSION_CODES.INVOICES_WRITE,
    PERMISSION_CODES.MANAGE_INVOICES,
  ]);
}

export function canManageInvoices(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.INVOICES_WRITE,
    PERMISSION_CODES.MANAGE_INVOICES,
  ]);
}

export function canReadPayments(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.PAYMENTS_READ,
    PERMISSION_CODES.PAYMENTS_WRITE,
    PERMISSION_CODES.MANAGE_PAYMENTS,
  ]);
}

export function canManagePayments(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.PAYMENTS_WRITE,
    PERMISSION_CODES.MANAGE_PAYMENTS,
  ]);
}

export function canReadReminders(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.REMINDERS_READ,
    PERMISSION_CODES.REMINDERS_WRITE,
    PERMISSION_CODES.MANAGE_REMINDERS,
  ]);
}

export function canManageReminders(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.REMINDERS_WRITE,
    PERMISSION_CODES.MANAGE_REMINDERS,
  ]);
}

export function canReadDashboard(user: Pick<AuthUser, "permissions"> | null) {
  return hasPermissionCode(user, PERMISSION_CODES.DASHBOARD_READ);
}

export function canReadSettings(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.SETTINGS_READ,
    PERMISSION_CODES.MANAGE_SETTINGS,
  ]);
}

export function canManageSettings(user: Pick<AuthUser, "permissions"> | null) {
  return hasPermissionCode(user, PERMISSION_CODES.MANAGE_SETTINGS);
}

export function canReadCatalogue(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.CATALOGUE_READ,
    PERMISSION_CODES.MANAGE_CATALOGUE,
  ]);
}

export function canManageCatalogue(user: Pick<AuthUser, "permissions"> | null) {
  return hasPermissionCode(user, PERMISSION_CODES.MANAGE_CATALOGUE);
}

export function canReadStock(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.STOCK_READ,
    PERMISSION_CODES.MANAGE_STOCK,
  ]);
}

export function canManageStock(user: Pick<AuthUser, "permissions"> | null) {
  return hasPermissionCode(user, PERMISSION_CODES.MANAGE_STOCK);
}

export function canReadCabinet(user: Pick<AuthUser, "permissions"> | null) {
  return hasPermissionCode(user, PERMISSION_CODES.CABINET_READ);
}
