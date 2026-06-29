import { getEmailTemplateLabel } from "./nav.config";
import { getSettingsSectionByHref } from "@/modules/parametres/utils/settingsLabels";
import type { BreadcrumbItem, RouteContext, RouteQuickAction } from "./types";
import type { NavPermissions } from "./types";

const SEGMENT_LABELS: Record<string, string> = {
  clients: "Clients",
  catalogue: "Catalogue",
  categories: "Catégories",
  devis: "Devis",
  commandes: "Commandes",
  factures: "Factures",
  encaissements: "Encaissements",
  relances: "Relances",
  rapports: "Rapports",
  parametres: "Paramètres",
  utilisateurs: "Utilisateurs",
  roles: "Rôles",
  profile: "Mon profil",
  nouveau: "Nouveau",
  nouvelle: "Nouvelle",
  modifier: "Modifier",
  tarifs: "Tarifs",
  historique: "Historique",
  "balance-agee": "Balance âgée",
  "modeles-email": "Modèles email",
  "modele-pdf": "Modèle PDF",
  "conditions-paiement": "Conditions de paiement",
  numerotation: "Numérotation",
  entreprise: "Entreprise",
  taxes: "Taux de TVA",
  devises: "Devises",
  "matricede-permissions": "Matrice permissions",
};

const MODULE_ROOTS: Record<
  string,
  { label: string; href: string; manageKey?: keyof NavPermissions }
> = {
  clients: { label: "Clients", href: "/clients", manageKey: "canManageClients" },
  catalogue: {
    label: "Catalogue",
    href: "/catalogue",
    manageKey: "canManageCatalogue",
  },
  devis: { label: "Devis", href: "/devis", manageKey: "canManageQuotations" },
  commandes: {
    label: "Commandes",
    href: "/commandes",
    manageKey: "canManageOrders",
  },
  factures: {
    label: "Factures",
    href: "/factures",
    manageKey: "canManageInvoices",
  },
  encaissements: {
    label: "Encaissements",
    href: "/encaissements",
    manageKey: "canManagePayments",
  },
  relances: { label: "Relances", href: "/relances" },
  parametres: {
    label: "Paramètres",
    href: "/parametres",
    manageKey: "canManageSettings",
  },
  utilisateurs: {
    label: "Utilisateurs",
    href: "/utilisateurs",
    manageKey: "canManageUsers",
  },
  roles: { label: "Rôles", href: "/roles", manageKey: "canManageRoles" },
};

function isDynamicSegment(segment: string): boolean {
  return (
    segment.length > 12 ||
    /^[0-9a-f-]{8,}$/i.test(segment) ||
    segment.includes("_")
  );
}

function labelForSegment(segment: string, pathname: string): string {
  if (segment === "" || segment === "/") return "Dashboard";

  const settingsSection = getSettingsSectionByHref(`/parametres/${segment}`);
  if (settingsSection) return settingsSection.title;

  const emailLabel = getEmailTemplateLabel(segment);
  if (emailLabel && pathname.includes("/modeles-email/")) {
    return emailLabel;
  }

  if (isDynamicSegment(segment)) return "Détail";

  return SEGMENT_LABELS[segment] ?? segment;
}

function buildQuickAction(
  pathname: string,
  permissions: NavPermissions,
): RouteQuickAction | undefined {
  const segments = pathname.split("/").filter(Boolean);
  const root = segments[0];
  const module = MODULE_ROOTS[root];
  if (!module?.manageKey) return undefined;
  if (!permissions[module.manageKey]) return undefined;

  const createPaths: Record<string, { label: string; href: string }> = {
    clients: { label: "Nouveau client", href: "/clients/nouveau" },
    catalogue: { label: "Nouvel article", href: "/catalogue/nouveau" },
    devis: { label: "Nouveau devis", href: "/devis/nouveau" },
    commandes: { label: "Nouvelle commande", href: "/commandes/nouveau" },
    factures: { label: "Nouvelle facture", href: "/factures/nouvelle" },
    encaissements: {
      label: "Nouvel encaissement",
      href: "/encaissements/nouveau",
    },
    utilisateurs: {
      label: "Nouvel utilisateur",
      href: "/utilisateurs/nouveau",
    },
    roles: { label: "Nouveau rôle", href: "/roles/nouveau" },
    parametres: {
      label: "Modifier l'entreprise",
      href: "/parametres/entreprise",
    },
  };

  const action = createPaths[root];
  if (!action) return undefined;

  const isListPage =
    pathname === module.href ||
    pathname === `${module.href}/` ||
    (root === "parametres" && pathname === "/parametres");

  if (!isListPage) return undefined;

  return action;
}

export function getRouteContext(
  pathname: string,
  permissions: NavPermissions,
): RouteContext {
  if (pathname === "/") {
    return {
      title: "Dashboard",
      moduleLabel: "Tableau de bord",
      breadcrumbs: [{ label: "Dashboard" }],
      quickAction: undefined,
    };
  }

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: "Dashboard", href: "/" }];

  let cumulative = "";
  for (let i = 0; i < segments.length; i += 1) {
    cumulative += `/${segments[i]}`;
    const isLast = i === segments.length - 1;
    breadcrumbs.push({
      label: labelForSegment(segments[i], pathname),
      href: isLast ? undefined : cumulative,
    });
  }

  const title = breadcrumbs[breadcrumbs.length - 1]?.label ?? "NEXERA";
  const moduleRoot = segments[0];
  const moduleLabel = MODULE_ROOTS[moduleRoot]?.label;

  return {
    title,
    moduleLabel,
    breadcrumbs,
    quickAction: buildQuickAction(pathname, permissions),
  };
}
