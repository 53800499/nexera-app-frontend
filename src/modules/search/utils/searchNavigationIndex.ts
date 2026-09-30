import { QuickActionItem, SystemPageItem } from "../types/search.types";

export const SYSTEM_PAGES: SystemPageItem[] = [
  // Dashboard & Général
  {
    id: "page-dashboard",
    title: "Tableau de Bord Commercial & Financier",
    path: "/",
    category: "Général",
    keywords: ["accueil", "tableau de bord", "kpi", "statistiques", "synthèse", "chiffre affaires", "ventes", "home"],
    description: "Indicateurs clés de performance commerciale, trésorerie et facturation.",
  },
  {
    id: "page-cabinet-cockpit",
    title: "Cockpit Cabinet d'Expertise",
    path: "/cabinet",
    category: "Cabinet",
    keywords: ["cabinet", "expert comptable", "supervision", "cockpit", "clients cabinet", "mandats"],
    description: "Vue d'ensemble des dossiers clients, échéances fiscales et missions.",
  },

  // Clients
  {
    id: "page-clients",
    title: "Clients & CRM",
    path: "/clients",
    category: "Clients",
    keywords: ["clients", "crm", "comptes", "carnet adresses", "contacts", "prospects", "ifu", "tiers"],
    description: "Gestion du portefeuille client, fiches détaillées, encaissements et relances.",
  },

  // Ventes & Facturation
  {
    id: "page-devis",
    title: "Devis & Propositions Commerciales",
    path: "/devis",
    category: "Ventes",
    keywords: ["devis", "proforma", "propositions", "estimations", "offres", "chiffrage"],
    description: "Création, suivi, validation et conversion des devis clients.",
  },
  {
    id: "page-commandes",
    title: "Commandes & Bons de Commande (BC)",
    path: "/commandes",
    category: "Ventes",
    keywords: ["commandes", "bons de commande", "bc", "ordres", "livraisons"],
    description: "Suivi des commandes clients et traitement des livraisons.",
  },
  {
    id: "page-factures",
    title: "Factures de Vente & Avoirs",
    path: "/factures",
    category: "Facturation",
    keywords: ["factures", "avoirs", "facturation", "notes de crédit", "ventes", "paiements", "impayés"],
    description: "Factures définitives, acomptes, avoirs, suivi des paiements et relances.",
  },
  {
    id: "page-encaissements",
    title: "Encaissements & Règlements",
    path: "/encaissements",
    category: "Trésorerie",
    keywords: ["encaissements", "règlements", "paiements", "trésorerie", "banque", "virements", "chèques", "espèces"],
    description: "Historique et saisie des encaissements sur factures clients.",
  },

  // Catalogue & Stock
  {
    id: "page-catalogue",
    title: "Catalogue Produits & Services",
    path: "/catalogue",
    category: "Catalogue",
    keywords: ["catalogue", "articles", "produits", "services", "prix", "tarifs", "tva", "références"],
    description: "Répertoire des articles, prestations de services et tarifs.",
  },
  {
    id: "page-stock-mouvements",
    title: "Stocks - Mouvements & Entrées/Sorties",
    path: "/stock/mouvements",
    category: "Stocks",
    keywords: ["stock", "mouvements", "entrées", "sorties", "ajustements", "traçabilité"],
    description: "Flux de stock, réceptions, expéditions et régularisations.",
  },
  {
    id: "page-stock-articles",
    title: "Stocks - Suivi des Articles",
    path: "/stock/articles",
    category: "Stocks",
    keywords: ["stock", "articles en stock", "quantités", "disponibilités"],
    description: "Niveaux de stock actuels par entrepôt et valorisation.",
  },
  {
    id: "page-stock-entrepots",
    title: "Stocks - Entrepôts & Dépôts",
    path: "/stock/entrepots",
    category: "Stocks",
    keywords: ["entrepôts", "dépôts", "magasins", "sites de stockage"],
    description: "Configuration et inventaire des lieux de stockage.",
  },
  {
    id: "page-stock-transferts",
    title: "Stocks - Transferts Inter-Entrepôts",
    path: "/stock/transferts",
    category: "Stocks",
    keywords: ["transferts", "déplacements", "inter entrepôts"],
    description: "Déplacement de marchandises entre différents entrepôts.",
  },
  {
    id: "page-stock-inventaires",
    title: "Stocks - Sessions d'Inventaire",
    path: "/stock/inventaires",
    category: "Stocks",
    keywords: ["inventaires", "comptage", "écarts", "clôture d'inventaire"],
    description: "Campagnes de comptage physique et ajustement des écarts.",
  },
  {
    id: "page-stock-alertes",
    title: "Stocks - Alertes & Ruptures",
    path: "/stock/alertes",
    category: "Stocks",
    keywords: ["alertes stock", "ruptures", "seuil de réapprovisionnement", "stock minimum"],
    description: "Articles sous le seuil d'alerte et prévisions de réapprovisionnement.",
  },
  {
    id: "page-stock-valorisation",
    title: "Stocks - Valorisation (CUMP / FIFO)",
    path: "/stock/valorisation",
    category: "Stocks",
    keywords: ["valorisation", "cump", "fifo", "valeur comptable stock"],
    description: "Calcul de la valeur globale du stock selon les règles OHADA.",
  },

  // RH & Paie
  {
    id: "page-rh-dashboard",
    title: "RH - Tableau de Bord Général",
    path: "/rh",
    category: "RH & Paie",
    keywords: ["rh", "ressources humaines", "effectif", "paie", "masse salariale"],
    description: "Effectifs, statistiques d'emploi et indicateurs de paie.",
  },
  {
    id: "page-rh-employes",
    title: "RH - Salariés & Dossiers du Personnel",
    path: "/rh/employes",
    category: "RH & Paie",
    keywords: ["salariés", "employés", "collaborateurs", "dossiers rh", "matricules", "personnel", "embauche"],
    description: "Fiches salariés, état civil, postes, rattachement départemental.",
  },
  {
    id: "page-rh-contrats",
    title: "RH - Contrats de Travail & Avenants",
    path: "/rh/contrats",
    category: "RH & Paie",
    keywords: ["contrats", "cdi", "cdd", "stage", "avenants", "période d'essai"],
    description: "Suivi des contrats, renouvellements et conditions d'embauche.",
  },
  {
    id: "page-rh-temps",
    title: "RH - Congés, Absences & Temps de Travail",
    path: "/rh/temps-absences",
    category: "RH & Paie",
    keywords: ["congés", "absences", "maladie", "repos", "pointage", "heures sup"],
    description: "Demandes de congés, plannings d'absence et validation managériale.",
  },
  {
    id: "page-rh-paie",
    title: "RH - Cycles & Calculs de Paie",
    path: "/rh/paie",
    category: "RH & Paie",
    keywords: ["paie", "cycles de paie", "salaires", "rémunérations", "clôture paie", "virement salaires"],
    description: "Génération mensuelle des paies et validation des rémunérations.",
  },
  {
    id: "page-rh-bulletins",
    title: "RH - Bulletins de Paie (Fiches de Paie)",
    path: "/rh/bulletins",
    category: "RH & Paie",
    keywords: ["bulletins", "fiches de paie", "salaire net", "primes", "retenues", "cnss", "ipts"],
    description: "Consultation, impression et envoi des bulletins de salaire.",
  },
  {
    id: "page-rh-solde",
    title: "RH - Solde de Tout Compte (STC)",
    path: "/rh/solde-tout-compte",
    category: "RH & Paie",
    keywords: ["solde de tout compte", "stc", "départ", "licenciement", "démission", "indemnités"],
    description: "Calcul des indemnités de départ, préavis et reçu STC.",
  },
  {
    id: "page-rh-declarations",
    title: "RH - Déclarations Sociales & Fiscales (CNSS, IPTS/VRS)",
    path: "/rh/declarations",
    category: "RH & Paie",
    keywords: ["déclarations sociales", "cnss", "ipts", "vrs", "charges patronales", "cotisations"],
    description: "Bordereaux CNSS et déclarations fiscales des salaires.",
  },
  {
    id: "page-rh-comptabilite",
    title: "RH - Écritures Comptables OD de Paie",
    path: "/rh/comptabilite",
    category: "RH & Paie",
    keywords: ["écritures comptables", "od de paie", "comptabilisation", "journal od", "ohada"],
    description: "Génération automatique des écritures de paie pour la comptabilité.",
  },
  {
    id: "page-rh-parametres",
    title: "RH - Paramètres & Barèmes Fiscaux/Sociaux",
    path: "/rh/parametres",
    category: "RH & Paie",
    keywords: ["paramètres rh", "barèmes fiscaux", "tranches irpp", "taux cnss", "abattements", "cotisations"],
    description: "Barèmes IPTS, taux de cotisations sociales, primes et indemnités.",
  },

  // Notes de Frais
  {
    id: "page-notes-frais",
    title: "Notes de Frais - Tableau de Bord",
    path: "/notes-frais",
    category: "Notes de Frais",
    keywords: ["notes de frais", "dépenses", "remboursements", "déplacements", "reçus"],
    description: "Suivi des dépenses professionnelles des équipes.",
  },
  {
    id: "page-notes-depenses",
    title: "Notes de Frais - Mes Dépenses & Reçus",
    path: "/notes-frais/mes-depenses",
    category: "Notes de Frais",
    keywords: ["mes dépenses", "justificatifs", "tickets", "factures transport", "hôtel", "repas"],
    description: "Saisie personnelle des dépenses avec téléversement de justificatifs.",
  },
  {
    id: "page-notes-rapports",
    title: "Notes de Frais - Rapports de Dépenses",
    path: "/notes-frais/rapports",
    category: "Notes de Frais",
    keywords: ["rapports de frais", "états de frais", "notes soumises"],
    description: "Regroupement des dépenses en rapports pour soumission et approbation.",
  },
  {
    id: "page-notes-validation",
    title: "Notes de Frais - À Valider (Manager)",
    path: "/notes-frais/validation",
    category: "Notes de Frais",
    keywords: ["validation frais", "approbation", "manager", "contrôle dépenses"],
    description: "Approbation ou rejet des notes de frais soumises par les collaborateurs.",
  },

  // Relances & Rapports
  {
    id: "page-relances",
    title: "Relances & Suivi des Impayés",
    path: "/relances",
    category: "Recouvrement",
    keywords: ["relances", "impayés", "retards", "recouvrement", "contentieux", "rappels"],
    description: "Gestion des relances automatiques et manuelles des clients en retard.",
  },
  {
    id: "page-rapports",
    title: "Rapports & Statistiques Financières",
    path: "/rapports",
    category: "Analyses",
    keywords: ["rapports", "statistiques", "analyses", "exports", "chiffre d'affaires", "bilan"],
    description: "Rapports détaillés sur les ventes, la TVA collectée et la performance.",
  },

  // Administration & Paramètres
  {
    id: "page-utilisateurs",
    title: "Gestion des Utilisateurs",
    path: "/utilisateurs",
    category: "Administration",
    keywords: ["utilisateurs", "collaborateurs", "comptes", "accès", "invitations", "sécurité"],
    description: "Gestion des comptes utilisateurs, statuts d'accès et réinitialisation de mot de passe.",
  },
  {
    id: "page-roles",
    title: "Gestion des Rôles & Permissions",
    path: "/roles",
    category: "Administration",
    keywords: ["rôles", "permissions", "droits", "habilitations", "sécurité", "profils"],
    description: "Définition des rôles (Admin, Commercial, Comptable...) et matrice des privilèges.",
  },
  {
    id: "page-parametres",
    title: "Paramètres Généraux de l'Entreprise",
    path: "/parametres",
    category: "Administration",
    keywords: ["paramètres", "configuration", "entreprise", "ifu", "logo", "mentions légales", "devises"],
    description: "Coordonnées de l'entreprise, devise, modèles de documents, emails et intégrations.",
  },
];

export const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: "action-new-quote",
    title: "Créer un Devis",
    path: "/devis/nouveau",
    category: "Actions Rapides",
    description: "Établir une nouvelle proposition commerciale ou proforma.",
    shortcut: "D",
  },
  {
    id: "action-new-invoice",
    title: "Créer une Facture",
    path: "/factures/nouvelle",
    category: "Actions Rapides",
    description: "Émettre une nouvelle facture de vente client.",
    shortcut: "F",
  },
  {
    id: "action-new-order",
    title: "Créer un Bon de Commande",
    path: "/commandes/nouveau",
    category: "Actions Rapides",
    description: "Enregistrer une nouvelle commande client.",
    shortcut: "B",
  },
  {
    id: "action-new-client",
    title: "Ajouter un Client",
    path: "/clients/nouveau",
    category: "Actions Rapides",
    description: "Créer une nouvelle fiche client ou prospect.",
    shortcut: "C",
  },
  {
    id: "action-new-expense",
    title: "Saisir une Dépense / Note de frais",
    path: "/notes-frais/mes-depenses",
    category: "Actions Rapides",
    description: "Ajouter un reçu ou une dépense de déplacement.",
    shortcut: "N",
  },
  {
    id: "action-new-employee",
    title: "Enregistrer un Nouveau Salarié",
    path: "/rh/employes",
    category: "Actions Rapides",
    description: "Ajouter un nouvel employé dans le registre RH.",
    shortcut: "S",
  },
  {
    id: "action-run-payroll",
    title: "Lancer un Cycle de Paie",
    path: "/rh/paie",
    category: "Actions Rapides",
    description: "Calculer les salaires et cotisations du mois.",
    shortcut: "P",
  },
  {
    id: "action-baremes",
    title: "Consulter les Barèmes Fiscaux RH",
    path: "/rh/parametres",
    category: "Actions Rapides",
    description: "Ajuster les barèmes IPTS, CNSS et tranches fiscales.",
    shortcut: "T",
  },
  {
    id: "action-new-payment",
    title: "Encaisser un Paiement",
    path: "/encaissements",
    category: "Actions Rapides",
    description: "Enregistrer un règlement reçu sur facture.",
    shortcut: "E",
  },
];

/**
 * Filtre les pages du système selon la saisie utilisateur (recherche instantanée locale)
 */
export function searchSystemPages(query: string): SystemPageItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return SYSTEM_PAGES.filter((page) => {
    return (
      page.title.toLowerCase().includes(q) ||
      page.category.toLowerCase().includes(q) ||
      page.description?.toLowerCase().includes(q) ||
      page.path.toLowerCase().includes(q) ||
      page.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  }).slice(0, 6);
}

/**
 * Filtre les actions rapides selon la saisie
 */
export function searchQuickActions(query: string): QuickActionItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return QUICK_ACTIONS.slice(0, 5);

  return QUICK_ACTIONS.filter((act) => {
    return (
      act.title.toLowerCase().includes(q) ||
      act.description.toLowerCase().includes(q) ||
      act.category.toLowerCase().includes(q) ||
      act.shortcut?.toLowerCase() === q
    );
  }).slice(0, 5);
}
