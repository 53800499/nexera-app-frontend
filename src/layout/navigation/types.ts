import type { ReactNode } from "react";

export type NavIconKey =
  | "grid"
  | "group"
  | "box"
  | "docs"
  | "task"
  | "file"
  | "dollar"
  | "bell"
  | "chart"
  | "plug"
  | "user"
  | "lock";

export type NavItemConfig<T = NavPermissions> = {
  id: string;
  name: string;
  iconKey: NavIconKey;
  path: string;
  canAccess: (permissions: T) => boolean;
};

export type NavPermissions = {
  dashboard: boolean;
  clients: boolean;
  catalogue: boolean;
  stock: boolean;
  quotations: boolean;
  orders: boolean;
  invoices: boolean;
  payments: boolean;
  reminders: boolean;
  reports: boolean;
  settings: boolean;
  users: boolean;
  roles: boolean;
  canManageClients: boolean;
  canManageCatalogue: boolean;
  canManageStock: boolean;
  canManageQuotations: boolean;
  canManageOrders: boolean;
  canManageInvoices: boolean;
  canManagePayments: boolean;
  canManageReminders: boolean;
  canManageUsers: boolean;
  canManageRoles: boolean;
  canManageSettings: boolean;
};

export type ResolvedNavItem = {
  name: string;
  icon: ReactNode;
  path: string;
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type RouteQuickAction = {
  label: string;
  href: string;
};

export type RouteContext = {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  quickAction?: RouteQuickAction;
  moduleLabel?: string;
};
