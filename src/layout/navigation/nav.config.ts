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
    path: "/stock/mouvements",
    canAccess: (p) => p.stock,
    subItems: [
      { name: "Articles", path: "/stock/articles" },
      { name: "Entrepôts", path: "/stock/entrepots" },
      { name: "Mouvements", path: "/stock/mouvements" },
      { name: "Transferts", path: "/stock/transferts" },
      { name: "Inventaires", path: "/stock/inventaires" },
      { name: "Alertes", path: "/stock/alertes" },
      { name: "Valorisation", path: "/stock/valorisation" },
    ],
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
    id: "rh",
    name: "RH & Paie",
    iconKey: "group",
    path: "/rh",
    canAccess: (p) => p.rh,
    subItems: [
      { name: "Tableau de Bord", path: "/rh" },
      { name: "Salariés & Dossiers", path: "/rh/employes" },
      { name: "Contrats & Carrières", path: "/rh/contrats" },
      { name: "Temps & Congés", path: "/rh/temps-absences" },
      { name: "Cycles de Paie", path: "/rh/paie" },
      { name: "Bulletins de Paie", path: "/rh/bulletins" },
      { name: "Solde de Tout Compte", path: "/rh/solde-tout-compte" },
      { name: "Déclarations Fiscales & Sociales", path: "/rh/declarations" },
      { name: "Comptabilisation Paie (OD)", path: "/rh/comptabilite" },
      { name: "Paramètres RH & Barèmes", path: "/rh/parametres" },
    ],
  },
  {
    id: "notes-frais",
    name: "Notes de Frais",
    iconKey: "docs",
    path: "/notes-frais",
    canAccess: (p) => p.notesFrais,
    subItems: [
      { name: "Tableau de Bord", path: "/notes-frais" },
      { name: "Mes Dépenses & Reçus", path: "/notes-frais/mes-depenses" },
      { name: "Rapports de Frais", path: "/notes-frais/rapports" },
      { name: "Missions & Avances", path: "/notes-frais/missions" },
      { name: "À Valider (Manager)", path: "/notes-frais/validation" },
      { name: "Remboursements & Cartes", path: "/notes-frais/remboursements" },
      { name: "Paramètres & Politiques", path: "/notes-frais/parametres" },
    ],
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
  {
    id: "parametres",
    name: "Paramètres",
    iconKey: "plug",
    path: "/parametres",
    canAccess: (p) => p.settings,
  }
];

export function getEmailTemplateLabel(type: string): string | undefined {
  return EMAIL_TEMPLATE_LABELS[type as EmailTemplateType];
}
