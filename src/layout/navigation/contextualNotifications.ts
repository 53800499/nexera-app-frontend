import type { NavPermissions } from "./types";

export type ContextualNotificationTone = "info" | "warning" | "success";

export type ContextualNotification = {
  id: string;
  title: string;
  message: string;
  href?: string;
  tone?: ContextualNotificationTone;
  tag?: string;
};

export type NotificationPanelContext = {
  title: string;
  moduleLabel: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  items: ContextualNotification[];
};

function moduleRoot(pathname: string): string {
  if (pathname === "/") return "dashboard";
  return pathname.split("/").filter(Boolean)[0] ?? "dashboard";
}

function item(
  id: string,
  title: string,
  message: string,
  options?: Partial<ContextualNotification>,
): ContextualNotification {
  return { id, title, message, tone: "info", ...options };
}

export function shouldShowNotificationPanel(pathname: string): boolean {
  const hiddenPrefixes = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/profile",
    "/calendar",
    "/alerts",
    "/avatars",
    "/badge",
    "/buttons",
    "/images",
    "/videos",
    "/modals",
    "/form-elements",
    "/line-chart",
    "/bar-chart",
    "/blank",
    "/basic-tables",
    "/error-404",
  ];

  return !hiddenPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function getNotificationPanelContext(
  pathname: string,
  permissions: NavPermissions,
): NotificationPanelContext | null {
  if (!shouldShowNotificationPanel(pathname)) return null;

  const root = moduleRoot(pathname);

  switch (root) {
    case "dashboard":
      return {
        title: "Alertes",
        moduleLabel: "Tableau de bord",
        viewAllHref: permissions.reminders ? "/relances" : "/rapports",
        viewAllLabel: permissions.reminders
          ? "Ouvrir les relances"
          : "Voir les rapports",
        items: [
          ...(permissions.reminders
            ? [
                item(
                  "dash-relances",
                  "Relances clients",
                  "Consultez les factures à relancer.",
                  { href: "/relances", tone: "warning", tag: "Relances" },
                ),
              ]
            : []),
          ...(permissions.payments
            ? [
                item(
                  "dash-balance",
                  "Balance âgée",
                  "Analysez les créances par ancienneté.",
                  {
                    href: "/encaissements/balance-agee",
                    tone: "info",
                    tag: "Encaissements",
                  },
                ),
              ]
            : []),
          ...(permissions.reports
            ? [
                item(
                  "dash-rapports",
                  "Rapports commerciaux",
                  "Accédez aux indicateurs détaillés.",
                  { href: "/rapports", tag: "Rapports" },
                ),
              ]
            : []),
        ],
      };

    case "clients":
      return {
        title: "Alertes clients",
        moduleLabel: "Clients",
        viewAllHref: "/clients",
        viewAllLabel: "Voir tous les clients",
        items: [
          item(
            "clients-list",
            "Portefeuille clients",
            "Retrouvez l'ensemble de vos comptes clients.",
            { href: "/clients", tag: "Clients" },
          ),
          ...(permissions.canManageClients
            ? [
                item(
                  "clients-new",
                  "Nouveau client",
                  "Ajoutez un client depuis cette page.",
                  {
                    href: "/clients/nouveau",
                    tone: "success",
                    tag: "Action",
                  },
                ),
              ]
            : []),
        ],
      };

    case "catalogue":
      return {
        title: "Alertes catalogue",
        moduleLabel: "Catalogue",
        viewAllHref: "/catalogue",
        viewAllLabel: "Voir le catalogue",
        items: [
          item(
            "catalogue-list",
            "Articles & services",
            "Gérez vos références commerciales.",
            { href: "/catalogue", tag: "Catalogue" },
          ),
          ...(permissions.canManageCatalogue
            ? [
                item(
                  "catalogue-new",
                  "Nouvel article",
                  "Enrichissez votre catalogue produits.",
                  {
                    href: "/catalogue/nouveau",
                    tone: "success",
                    tag: "Action",
                  },
                ),
              ]
            : []),
        ],
      };

    case "devis":
      return {
        title: "Alertes devis",
        moduleLabel: "Devis",
        viewAllHref: "/devis",
        viewAllLabel: "Voir tous les devis",
        items: [
          item(
            "devis-list",
            "Devis en cours",
            "Suivez les propositions commerciales ouvertes.",
            { href: "/devis", tag: "Devis" },
          ),
          ...(permissions.canManageQuotations
            ? [
                item(
                  "devis-new",
                  "Nouveau devis",
                  "Créez une proposition pour un client.",
                  {
                    href: "/devis/nouveau",
                    tone: "success",
                    tag: "Action",
                  },
                ),
              ]
            : []),
        ],
      };

    case "commandes":
      return {
        title: "Alertes commandes",
        moduleLabel: "Commandes",
        viewAllHref: "/commandes",
        viewAllLabel: "Voir toutes les commandes",
        items: [
          item(
            "orders-list",
            "Commandes actives",
            "Pilotez le cycle de vos commandes clients.",
            { href: "/commandes", tag: "Commandes" },
          ),
          ...(permissions.canManageOrders
            ? [
                item(
                  "orders-new",
                  "Nouvelle commande",
                  "Enregistrez une commande client.",
                  {
                    href: "/commandes/nouveau",
                    tone: "success",
                    tag: "Action",
                  },
                ),
              ]
            : []),
        ],
      };

    case "factures":
      return {
        title: "Alertes factures",
        moduleLabel: "Factures",
        viewAllHref: "/factures",
        viewAllLabel: "Voir toutes les factures",
        items: [
          item(
            "invoices-list",
            "Factures émises",
            "Consultez le statut de facturation.",
            { href: "/factures", tag: "Factures" },
          ),
          ...(permissions.canManageInvoices
            ? [
                item(
                  "invoices-new",
                  "Nouvelle facture",
                  "Émettez une facture client.",
                  {
                    href: "/factures/nouvelle",
                    tone: "success",
                    tag: "Action",
                  },
                ),
              ]
            : []),
          ...(permissions.reminders
            ? [
                item(
                  "invoices-reminders",
                  "Factures à relancer",
                  "Traitez les impayés depuis les relances.",
                  {
                    href: "/relances",
                    tone: "warning",
                    tag: "Relances",
                  },
                ),
              ]
            : []),
        ],
      };

    case "encaissements":
      return {
        title: "Alertes encaissements",
        moduleLabel: "Encaissements",
        viewAllHref: "/encaissements",
        viewAllLabel: "Voir les encaissements",
        items: [
          item(
            "payments-list",
            "Suivi des paiements",
            "Visualisez les règlements reçus.",
            { href: "/encaissements", tag: "Encaissements" },
          ),
          item(
            "payments-aging",
            "Balance âgée",
            "Identifiez les retards de paiement.",
            {
              href: "/encaissements/balance-agee",
              tone: "warning",
              tag: "Analyse",
            },
          ),
          ...(permissions.canManagePayments
            ? [
                item(
                  "payments-new",
                  "Nouvel encaissement",
                  "Enregistrez un paiement reçu.",
                  {
                    href: "/encaissements/nouveau",
                    tone: "success",
                    tag: "Action",
                  },
                ),
              ]
            : []),
        ],
      };

    case "relances":
      return {
        title: "Alertes relances",
        moduleLabel: "Relances",
        viewAllHref: "/relances",
        viewAllLabel: "Tableau de bord relances",
        items: [
          item(
            "reminders-board",
            "Relances à traiter",
            "Priorisez les relances du jour.",
            { href: "/relances", tone: "warning", tag: "Relances" },
          ),
          item(
            "reminders-history",
            "Historique",
            "Consultez les relances envoyées.",
            { href: "/relances/historique", tag: "Historique" },
          ),
        ],
      };

    case "rapports":
      return {
        title: "Alertes rapports",
        moduleLabel: "Rapports",
        viewAllHref: "/rapports",
        viewAllLabel: "Ouvrir les rapports",
        items: [
          item(
            "reports-main",
            "Indicateurs commerciaux",
            "Analysez ventes, créances et performance.",
            { href: "/rapports", tag: "Rapports" },
          ),
          ...(permissions.dashboard
            ? [
                item(
                  "reports-dashboard",
                  "Retour au tableau de bord",
                  "Vue synthétique de l'activité.",
                  { href: "/", tag: "Dashboard" },
                ),
              ]
            : []),
        ],
      };

    case "parametres":
      return {
        title: "Alertes paramètres",
        moduleLabel: "Paramètres",
        viewAllHref: "/parametres",
        viewAllLabel: "Vue d'ensemble",
        items: [
          item(
            "settings-company",
            "Informations entreprise",
            "Vérifiez l'identité légale et les coordonnées.",
            {
              href: "/parametres/entreprise",
              tone: "warning",
              tag: "Entreprise",
            },
          ),
          item(
            "settings-taxes",
            "Taux de TVA",
            "Configurez les taux appliqués aux documents.",
            { href: "/parametres/taxes", tag: "TVA" },
          ),
          item(
            "settings-numbering",
            "Numérotation",
            "Contrôlez les préfixes et compteurs.",
            { href: "/parametres/numerotation", tag: "Documents" },
          ),
        ],
      };

    case "utilisateurs":
      return {
        title: "Alertes utilisateurs",
        moduleLabel: "Utilisateurs",
        viewAllHref: "/utilisateurs",
        viewAllLabel: "Voir les utilisateurs",
        items: [
          item(
            "users-list",
            "Comptes du tenant",
            "Gérez les accès de votre équipe.",
            { href: "/utilisateurs", tag: "Utilisateurs" },
          ),
          ...(permissions.canManageUsers
            ? [
                item(
                  "users-new",
                  "Nouvel utilisateur",
                  "Invitez un collaborateur.",
                  {
                    href: "/utilisateurs/nouveau",
                    tone: "success",
                    tag: "Action",
                  },
                ),
              ]
            : []),
        ],
      };

    case "roles":
      return {
        title: "Alertes rôles",
        moduleLabel: "Rôles & permissions",
        viewAllHref: "/roles",
        viewAllLabel: "Voir les rôles",
        items: [
          item(
            "roles-list",
            "Rôles applicatifs",
            "Contrôlez les profils d'accès.",
            { href: "/roles", tag: "Rôles" },
          ),
          ...(permissions.canManageRoles
            ? [
                item(
                  "roles-matrix",
                  "Matrice des permissions",
                  "Affinez les droits par rôle.",
                  {
                    href: "/roles/matricede-permissions",
                    tone: "warning",
                    tag: "Sécurité",
                  },
                ),
              ]
            : []),
        ],
      };

    default:
      return {
        title: "Alertes",
        moduleLabel: "NEXERA",
        items: [],
      };
  }
}
