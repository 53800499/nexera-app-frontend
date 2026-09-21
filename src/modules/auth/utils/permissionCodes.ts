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
  RH_READ: "rh.read",
  MANAGE_RH: "manage:rh",
  RH_EMPLOYEES_MANAGE: "rh.employees.manage",
  RH_CONTRACTS_MANAGE: "rh.contracts.manage",
  RH_LEAVES_REQUEST: "rh.leaves.request",
  RH_LEAVES_VALIDATE: "rh.leaves.validate",
  RH_TIMESHEETS_MANAGE: "rh.timesheets.manage",
  RH_PAYROLL_CALCULATE: "rh.payroll.calculate",
  RH_PAYROLL_VALIDATE: "rh.payroll.validate",
  RH_DECLARATIONS_MANAGE: "rh.declarations.manage",
  RH_ACCOUNTING_EXPORT: "rh.accounting.export",
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

export function canReadRh(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.RH_READ,
    PERMISSION_CODES.MANAGE_RH,
    PERMISSION_CODES.RH_EMPLOYEES_MANAGE,
    PERMISSION_CODES.RH_PAYROLL_CALCULATE,
  ]);
}

export function canManageRh(user: Pick<AuthUser, "permissions"> | null) {
  return hasPermissionCode(user, PERMISSION_CODES.MANAGE_RH);
}

export function canManageEmployees(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.MANAGE_RH,
    PERMISSION_CODES.RH_EMPLOYEES_MANAGE,
  ]);
}

export function canManagePayroll(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.MANAGE_RH,
    PERMISSION_CODES.RH_PAYROLL_CALCULATE,
    PERMISSION_CODES.RH_PAYROLL_VALIDATE,
  ]);
}

export function canManageContracts(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.MANAGE_RH,
    PERMISSION_CODES.RH_CONTRACTS_MANAGE,
  ]);
}

export function canRequestLeaves(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.MANAGE_RH,
    PERMISSION_CODES.RH_LEAVES_REQUEST,
  ]);
}

export function canValidateLeaves(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.MANAGE_RH,
    PERMISSION_CODES.RH_LEAVES_VALIDATE,
  ]);
}

export function canManageTimesheets(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.MANAGE_RH,
    PERMISSION_CODES.RH_TIMESHEETS_MANAGE,
  ]);
}

export function canCalculatePayroll(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.MANAGE_RH,
    PERMISSION_CODES.RH_PAYROLL_CALCULATE,
  ]);
}

export function canValidatePayroll(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.MANAGE_RH,
    PERMISSION_CODES.RH_PAYROLL_VALIDATE,
  ]);
}

export function canManageDeclarations(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.MANAGE_RH,
    PERMISSION_CODES.RH_DECLARATIONS_MANAGE,
  ]);
}

export function canExportAccounting(user: Pick<AuthUser, "permissions"> | null) {
  return hasAnyPermissionCode(user, [
    PERMISSION_CODES.MANAGE_RH,
    PERMISSION_CODES.RH_ACCOUNTING_EXPORT,
  ]);
}

// ----------------------------------------------------
// NOTES DE FRAIS (M5)
// ----------------------------------------------------

function isNdfAdminOrManager(user: any): boolean {
  if (!user) return false;
  return (
    user.role === "admin" ||
    user.role === "dirigeant" ||
    user.roles?.includes("ADMIN") ||
    user.roles?.includes("CEO") ||
    user.roles?.includes("RH_MANAGER") ||
    user.workspace === "entreprise"
  );
}

export function canReadNotesFrais(user: any) {
  if (!user) return false;
  if (isNdfAdminOrManager(user)) return true;
  return hasAnyPermissionCode(user, [
    "ndf.read",
    "ndf.write",
    "manage:ndf",
    "ndf.expenses.submit",
    "ndf.reports.validate",
    "dashboard.read",
  ]);
}

export function canSubmitExpenses(user: any) {
  if (!user) return false;
  if (isNdfAdminOrManager(user)) return true;
  return hasAnyPermissionCode(user, [
    "ndf.expenses.submit",
    "ndf.write",
    "manage:ndf",
  ]);
}

export function canValidateExpenseReports(user: any) {
  if (!user) return false;
  if (isNdfAdminOrManager(user)) return true;
  return hasAnyPermissionCode(user, [
    "ndf.reports.validate",
    "manage:ndf",
  ]);
}

export function canManageReimbursements(user: any) {
  if (!user) return false;
  if (isNdfAdminOrManager(user)) return true;
  return hasAnyPermissionCode(user, [
    "ndf.refund.manage",
    "manage:ndf",
  ]);
}

export function canReconcileCorporateCards(user: any) {
  if (!user) return false;
  if (isNdfAdminOrManager(user)) return true;
  return hasAnyPermissionCode(user, [
    "ndf.cards.reconcile",
    "manage:ndf",
  ]);
}

// ----------------------------------------------------
// FISCALITÉ & DÉCLARATIONS (M7)
// ----------------------------------------------------

export function canReadFiscalite(user: any): boolean {
  if (!user) return false;
  if (
    user.role === "admin" ||
    user.role === "dirigeant" ||
    user.role === "comptable" ||
    user.role === "fiscaliste" ||
    user.roles?.includes("ADMIN") ||
    user.roles?.includes("CEO") ||
    user.roles?.includes("COMPTABLE") ||
    user.roles?.includes("FISCALISTE") ||
    user.roles?.includes("CABINET_ADMIN") ||
    user.roles?.includes("CABINET_COLLABORATEUR") ||
    user.workspace === "entreprise" ||
    user.workspace === "cabinet"
  ) {
    return true;
  }
  return hasAnyPermissionCode(user, [
    "fiscalite.read",
    "fiscalite.write",
    "manage:fiscalite",
    "tva.read",
    "is.read",
    "dashboard.read",
  ]);
}

export function canManageFiscalite(user: any): boolean {
  if (!user) return false;
  if (
    user.role === "admin" ||
    user.role === "dirigeant" ||
    user.roles?.includes("ADMIN") ||
    user.roles?.includes("CEO") ||
    user.roles?.includes("FISCALISTE") ||
    user.roles?.includes("CABINET_ADMIN")
  ) {
    return true;
  }
  return hasAnyPermissionCode(user, [
    "fiscalite.write",
    "manage:fiscalite",
    "tva.write",
    "is.write",
  ]);
}
