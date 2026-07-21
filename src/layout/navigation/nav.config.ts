import { EMAIL_TEMPLATE_LABELS } from "@/modules/parametres/utils/settingsLabels";
import type { EmailTemplateType } from "@/modules/parametres/types/settings.types";
import type { NavItemConfig } from "./types";

export const MAIN_NAV_CONFIG: NavItemConfig[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    iconKey: "grid",
    path: "/",
    canAccess: (p) => p.dashboard,
  },
  {
    id: "clients",
    name: "Clients",
    iconKey: "group",
    path: "/clients",
    canAccess: (p) => p.clients,
  },
  {
    id: "catalogue",
    name: "Catalogue",
    iconKey: "box",
    path: "/catalogue",
    canAccess: (p) => p.catalogue,
  },
  {
    id: "stock",
    name: "Stocks",
    iconKey: "box",
    path: "/stock/articles",
    canAccess: (p) => p.stock,
  },
  {
    id: "devis",
    name: "Devis",
    iconKey: "docs",
    path: "/devis",
    canAccess: (p) => p.quotations,
  },
  {
    id: "commandes",
    name: "Commandes",
    iconKey: "task",
    path: "/commandes",
    canAccess: (p) => p.orders,
  },
  {
    id: "factures",
    name: "Factures",
    iconKey: "file",
    path: "/factures",
    canAccess: (p) => p.invoices,
  },
  {
    id: "encaissements",
    name: "Encaissements",
    iconKey: "dollar",
    path: "/encaissements",
    canAccess: (p) => p.payments,
  },
  {
    id: "relances",
    name: "Relances",
    iconKey: "bell",
    path: "/relances",
    canAccess: (p) => p.reminders,
  },
  {
    id: "rapports",
    name: "Rapports",
    iconKey: "chart",
    path: "/rapports",
    canAccess: (p) => p.reports,
  },
  {
    id: "parametres",
    name: "Paramètres",
    iconKey: "plug",
    path: "/parametres",
    canAccess: (p) => p.settings,
  },
  {
    id: "utilisateurs",
    name: "Utilisateurs",
    iconKey: "user",
    path: "/utilisateurs",
    canAccess: (p) => p.users,
  },
  {
    id: "roles",
    name: "Rôles",
    iconKey: "lock",
    path: "/roles",
    canAccess: (p) => p.roles,
  },
];

export function getEmailTemplateLabel(type: string): string | undefined {
  return EMAIL_TEMPLATE_LABELS[type as EmailTemplateType];
}
