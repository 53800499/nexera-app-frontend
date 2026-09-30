import { HelpArticle, ContextualHelpMapping } from "../types/help-center.types";

export const HELP_ARTICLES: HelpArticle[] = [
  // =========================================================================
  // 1. PRISE EN MAIN & TABLEAU DE BORD GLOBAL
  // =========================================================================
  {
    id: "guide-demarrage",
    title: "Premiers pas et configuration initiale de l'entreprise",
    category: "demarrage",
    categoryLabel: "Prise en Main",
    route: "/",
    summary: "Configuration initiale du compte société, numéro IFU légal, régime fiscal, sécurité 2FA et prise en main de l'interface.",
    readTime: "3 min",
    tags: ["démarrage", "ifu", "configuration", "raccourcis", "2fa", "sécurité", "connexion"],
    steps: [
      {
        title: "1. Première connexion et mot de passe sécurisé",
        content: "Connectez-vous sur votre espace Nexera avec vos identifiants temporaires. Personnalisez immédiatement votre mot de passe et activez l'authentification à deux facteurs (2FA) dans votre profil.",
      },
      {
        title: "2. Paramétrer l'IFU et les mentions légales",
        content: "Dans Paramètres -> Société, saisissez le numéro IFU légal (13 chiffres), le RCCM, l'adresse du siège, le centre des impôts de rattachement et le régime fiscal d'assujettissement (Réel normal, RSI ou TPS).",
      },
      {
        title: "3. Inviter vos premiers collaborateurs",
        content: "Dans Utilisateurs, invitez vos comptables, commerciaux, gestionnaires RH et magasiniers en leur assignant un rôle strict (RBAC) pour cloisonner les accès.",
      },
      {
        title: "4. Maîtriser les raccourcis de navigation",
        content: "Pressez Ctrl + K (ou Cmd + K) à tout moment pour lancer la recherche universelle, ou cliquez sur l'icône '?' dans l'en-tête pour ouvrir le tiroir d'aide contextuelle de l'écran en cours.",
      },
    ],
    tips: "Le numéro IFU est la clé de voûte de vos déclarations fiscales et de l'édition de vos factures normalisées.",
    warning: "Un compte sans 2FA expose vos données financières en cas de compromission d'adresse e-mail.",
    faq: [
      {
        q: "Où modifier les informations de mon entreprise ?",
        a: "Rendez-vous dans le menu Paramètres (icône engrenage) pour mettre à jour la raison sociale, l'IFU, le logo et les coordonnées bancaires.",
      },
    ],
  },

  // =========================================================================
  // 2. CRM & GESTION CLIENTS
  // =========================================================================
  {
    id: "crm-clients",
    title: "Fiche Client 360°, Conformité IFU & Suivi des En-cours",
    category: "crm",
    categoryLabel: "CRM & Relations Clients",
    route: "/clients",
    legalRef: "CGI Bénin Art. 130-133 (AIB) • AUDCIF Compte 411",
    summary: "Créer et gérer les clients, contrôler la validité de l'IFU, surveiller le plafond d'en-cours de crédit et suivre l'historique commercial complet.",
    readTime: "4 min",
    tags: ["clients", "crm", "ifu", "en-cours", "créances", "compte 411", "tiers"],
    steps: [
      {
        title: "1. Créer une nouvelle fiche client",
        content: "Accédez à Clients (/clients) et cliquez sur '+ Nouveau Client'. Renseignez la raison sociale, l'adresse physique, l'email de facturation et le téléphone WhatsApp professionnel.",
      },
      {
        title: "2. Renseigner l'IFU et le statut fiscal",
        content: "Pour les clients entreprises, saisissez impérativement le numéro IFU à 13 chiffres. Nexera vérifie la cohérence du format. L'IFU permet à votre client de bénéficier du taux d'AIB réduit de 1% au lieu du taux pénalisant de 5%.",
      },
      {
        title: "3. Définir le plafond d'en-cours et les conditions de paiement",
        content: "Fixez la limite maximale de crédit toléré (ex : 5 000 000 FCFA) et le délai de règlement (Comptant, 15 jours, 30 jours fin de mois). En cas de dépassement, le système avertit le commercial lors de l'émission d'un devis.",
      },
      {
        title: "4. Exploiter la vue 360° du client",
        content: "Ouvrez la fiche client pour consulter en un clic l'historique des devis, les commandes en cours, les factures impayées et l'état des encaissements.",
      },
    ],
    tips: "Pensez à rattacher le compte bancaire de virement préféré du client pour fluidifier la réconciliation des encaissements.",
    warning: "La facturation d'une société sans mention de son IFU peut faire requalifier la transaction au taux de retenue AIB de 5%.",
    faq: [
      {
        q: "Comment bloquer un client en contentieux d'impayés ?",
        a: "Dans la fiche du client, passez son statut à 'Suspendu' ou mettez son plafond d'en-cours à 0 FCFA pour empêcher la validation de nouvelles commandes.",
      },
    ],
  },

  // =========================================================================
  // 3. CATALOGUE & GRILLES TARIFAIRES
  // =========================================================================
  {
    id: "invoicing-catalogue",
    title: "Catalogue Produits, Prestations de Services & TVA",
    category: "facturation",
    categoryLabel: "Facturation & Ventes",
    route: "/catalogue",
    legalRef: "CGI Bénin Art. 248 (TVA 18% / 0%) • SYSCOHADA Comptes 701/706",
    summary: "Administrer la base des articles et prestations, définir les familles, prix HT/TTC, comptes de produits et taux de TVA applicables.",
    readTime: "3 min",
    tags: ["catalogue", "articles", "services", "prix", "tva 18%", "marge", "sku"],
    steps: [
      {
        title: "1. Créer un article ou un service",
        content: "Dans Catalogue (/catalogue), cliquez sur '+ Nouvel Article'. Indiquez la référence (SKU), la désignation commerciale imprimée sur les factures et la famille de produits.",
      },
      {
        title: "2. Choisir la nature : Produit stocké vs Prestation de service",
        content: "• Marchandise stockable : Active automatiquement la traçabilité dans le module Stock (entrées, sorties, inventaires et CMUP).\n• Prestation intellectuelle : Ne génère aucun mouvement physique d'entrepôt.",
      },
      {
        title: "3. Définir le prix et le régime de TVA",
        content: "Renseignez le prix d'achat HT (pour le suivi de marge) et le prix de vente HT. Choisissez le taux de TVA (18% taux normal, ou 0% exonéré selon l'art. 248 du CGI). Nexera calcule automatiquement le prix TTC.",
      },
      {
        title: "4. Importer le catalogue en masse",
        content: "Utilisez le bouton 'Importer Excel / CSV' pour téléverser votre base de données existante avec les colonnes modèles fournies.",
      },
    ],
    tips: "Renseignez systématiquement le prix d'achat unitaire pour permettre aux rapports de calculer votre marge commerciale brute en temps réel.",
  },

  // =========================================================================
  // 4. DEVIS & PROPOSITIONS COMMERCIALES
  // =========================================================================
  {
    id: "invoicing-devis",
    title: "Création, Envoi et Conversion de Devis Clients",
    category: "facturation",
    categoryLabel: "Facturation & Ventes",
    route: "/devis",
    summary: "Rédiger des devis professionnels aux couleurs de l'entreprise, suivre les statuts de négociation, envoyer par email et convertir en commande en 1-clic.",
    readTime: "3 min",
    tags: ["devis", "propositions", "ventes", "conversion", "chiffrage", "remises"],
    steps: [
      {
        title: "1. Rédiger une proposition commerciale",
        content: "Accédez à Devis (/devis) et cliquez sur '+ Nouveau Devis'. Sélectionnez le client ; ses coordonnées et conditions de règlement se chargent automatiquement.",
      },
      {
        title: "2. Ajouter les lignes et remises",
        content: "Ajoutez les articles du catalogue ou saisissez des prestations libres. Vous pouvez appliquer une remise par ligne ou globale sur le devis.",
      },
      {
        title: "3. Envoyer le devis au client",
        content: "Téléchargez le PDF normalisé avec la mention 'Bon pour accord' ou cliquez sur 'Envoyer par Email' directement depuis Nexera.",
      },
      {
        title: "4. Convertir en bon de commande en 1-clic",
        content: "Dès acceptation du client, cliquez sur 'Convertir en Commande'. Le devis passe au statut GAGNÉ et la commande ferme est générée sans aucune ressaisie.",
      },
    ],
    tips: "Fixez toujours une date limite de validité pour protéger votre entreprise contre les hausses de prix de vos fournisseurs.",
  },

  // =========================================================================
  // 5. COMMANDES CLIENTS & BONS DE LIVRAISON
  // =========================================================================
  {
    id: "invoicing-commandes",
    title: "Gestion des Commandes, Réservation de Stock & Expédition",
    category: "facturation",
    categoryLabel: "Facturation & Ventes",
    route: "/commandes",
    summary: "Confirmer les commandes clients, réserver les quantités en stock, éditer les bons de livraison et déclencher la facturation.",
    readTime: "4 min",
    tags: ["commandes", "livraison", "bon de livraison", "réservation stock", "expédition"],
    steps: [
      {
        title: "1. Confirmer la commande client",
        content: "Rendez-vous dans Commandes (/commandes). Ouvrez la commande issue du devis ou créée directement. Cliquez sur 'Confirmer la Commande' : le stock physique est réservé.",
      },
      {
        title: "2. Suivre la préparation en entrepôt",
        content: "Le responsable logistique visualise les commandes à préparer et prépare le colisage selon les stocks disponibles par dépôt.",
      },
      {
        title: "3. Générer le Bon de Livraison",
        content: "Cliquez sur 'Créer Bon de Livraison'. Ajustez les quantités si la livraison est partielle. Le bon est imprimé pour signature par le client à la réception.",
      },
      {
        title: "4. Facturer la commande",
        content: "Cliquez sur 'Générer Facture'. La facture définitive est émise en conservant le lien vers la commande pour la piste d'audit.",
      },
    ],
  },

  // =========================================================================
  // 6. FACTURATION & VENTES NORMALISÉES
  // =========================================================================
  {
    id: "invoicing-factures",
    title: "Émission de Factures Normalisées, TVA & Retenues AIB",
    category: "facturation",
    categoryLabel: "Facturation & Ventes",
    route: "/factures",
    legalRef: "CGI Bénin 2026 Art. 130-133, 248 • SYSCOHADA Journal Ventes",
    summary: "Créer et valider les factures officielles avec numéro chrono unique, appliquer la TVA et l'AIB, alimenter la déclaration de TVA et générer le PDF certifié.",
    readTime: "4 min",
    tags: ["factures", "ventes", "tva collectée", "aib", "pdf", "normalisée", "journal ventes"],
    steps: [
      {
        title: "1. Créer une nouvelle facture",
        content: "Rendez-vous dans Factures (/factures) et cliquez sur '+ Nouvelle Facture'. Sélectionnez le client et vérifiez son IFU.",
      },
      {
        title: "2. Vérifier les lignes, la TVA et l'AIB",
        content: "Les articles taxables appliquent la TVA à 18%. Si le client est habilité à opérer une retenue AIB, le taux légal (1% ou 5%) est déduit du net à payer.",
      },
      {
        title: "3. Valider et Émettre définitivement",
        content: "Cliquez sur 'Valider et Émettre'. Cette action fige définitivement la facture avec son numéro chrono officiel, décrémente les stocks et injecte la TVA collectée dans le module Fiscalité.",
      },
      {
        title: "4. Télécharger et expédier la facture",
        content: "Téléchargez le PDF officiel comportant les mentions légales obligatoires, coordonnées bancaires et QR Code de traçabilité.",
      },
    ],
    tips: "Toute facture validée alimente automatiquement le journal des ventes en comptabilité et la déclaration de TVA du mois en cours sans aucune ressaisie.",
    warning: "Une fois validée et numérotée, une facture ne peut plus être modifiée ou supprimée : en cas d'erreur, émettez un Avoir d'annulation.",
  },

  // =========================================================================
  // 7. ENCAISSEMENTS & RÈGLEMENTS CLIENTS
  // =========================================================================
  {
    id: "invoicing-encaissements",
    title: "Enregistrement des Encaissements & Quittances de Paiement",
    category: "facturation",
    categoryLabel: "Facturation & Ventes",
    route: "/encaissements",
    legalRef: "CGI Bénin (Plafond espèces 100 000 FCFA) • SYSCOHADA Journal Banque/Caisse",
    summary: "Consigner les paiements clients (virement, chèque, Mobile Money, espèces), lettrer les factures soldées et émettre les reçus de règlement.",
    readTime: "3 min",
    tags: ["encaissements", "règlements", "paiements", "lettrage", "reçus", "espèces 100k", "momo"],
    steps: [
      {
        title: "1. Enregistrer un règlement",
        content: "Dans Encaissements (/encaissements), cliquez sur '+ Nouvel Encaissement'. Sélectionnez le client et le mode de règlement (Virement bancaire, Chèque, Mobile Money ou Espèces).",
      },
      {
        title: "2. Respecter le plafond légal d'espèces de 100 000 FCFA",
        content: "Conformément au CGI Bénin, tout règlement d'un montant égal ou supérieur à 100 000 FCFA doit impérativement être opéré par voie bancaire ou Mobile Money traçable.",
      },
      {
        title: "3. Lettrer avec les factures en attente",
        content: "Cochez la ou les factures soldées par ce versement. En cas de montant partiel, le solde restant dû est recalculé automatiquement.",
      },
      {
        title: "4. Émettre le reçu d'encaissement (PDF)",
        content: "Générez et transmettez au client sa quittance officielle d'encaissement portant la référence de transaction bancaire.",
      },
    ],
  },

  // =========================================================================
  // 8. RELANCES CLIENTS & RECOUVREMENT
  // =========================================================================
  {
    id: "invoicing-relances",
    title: "Balance Âgée des Créances & Procédure de Relance d'Impayés",
    category: "facturation",
    categoryLabel: "Facturation & Ventes",
    route: "/relances",
    summary: "Surveiller les créances échues, classifier les retards par tranche d'âge et automatiser les relances amiables et mises en demeure.",
    readTime: "3 min",
    tags: ["relances", "recouvrement", "créances", "impayés", "balance âgée", "mise en demeure"],
    steps: [
      {
        title: "1. Consulter la balance âgée",
        content: "Rendez-vous dans Relances (/relances). Le tableau de bord classe les retards : 1-30 jours, 31-60 jours, plus de 60 jours.",
      },
      {
        title: "2. Déclencher une relance amiable par e-mail ou WhatsApp",
        content: "Sélectionnez les factures échues de niveau 1 et envoyez le modèle de rappel courtois pré-rempli.",
      },
      {
        title: "3. Émettre un courrier officiel de mise en demeure",
        content: "Pour les retards de plus de 60 jours, générez la sommation formelle de payer (PDF) avant transmission au service contentieux ou avocat.",
      },
    ],
  },

  // =========================================================================
  // 9. GESTION DES STOCKS & VALORISATION CMUP
  // =========================================================================
  {
    id: "stock-gestion",
    title: "Gestion des Stocks, Mouvements, Inventaires & Valorisation CMUP",
    category: "stock",
    categoryLabel: "Stocks & Approvisionnements",
    route: "/stock/mouvements",
    legalRef: "AUDCIF OHADA Art. 40 (Valorisation CMUP) • Comptes 31/32/37",
    summary: "Suivre les stocks en temps réel par dépôt, enregistrer les entrées/sorties, réaliser les transferts inter-dépôts, mener l'inventaire physique et calculer la valeur au CMUP.",
    readTime: "5 min",
    tags: ["stock", "cmup", "entrepôts", "inventaires", "transferts", "mouvements", "alertes"],
    steps: [
      {
        title: "1. Administrer les entrepôts et dépôts",
        content: "Dans Stocks -> Entrepôts (/stock/entrepots), configurez vos magasins de stockage avec les responsables de site.",
      },
      {
        title: "2. Suivre les mouvements d'entrée et de sortie",
        content: "Chaque réception fournisseur incrémente le stock et recalcule le Coût Moyen Unitaire Pondéré (CMUP). Chaque vente décrémente le stock disponible.",
      },
      {
        title: "3. Transférer des articles entre dépôts",
        content: "Dans Transferts (/stock/transferts), déplacez des marchandises d'un magasin A vers un magasin B avec génération du bon de transfert inter-magasins.",
      },
      {
        title: "4. Réaliser la session d'inventaire physique périodique",
        content: "Dans Inventaires (/stock/inventaires), lancez le comptage physique à l'aveugle, saisissez les quantités constatées et validez les écarts (mali/boni d'inventaire) pour ajuster la comptabilité.",
      },
      {
        title: "5. Obtenir la valorisation pour le Bilan SYSCOHADA",
        content: "Dans Valorisation (/stock/valorisation), consultez la valeur financière totale de vos stocks en FCFA requise pour le poste Stocks de l'actif circulant.",
      },
    ],
    tips: "Le CMUP est recalculé automatiquement à chaque bon d'entrée sans aucune formule manuelle à tenir sur tableur.",
    warning: "L'inventaire physique annuel est une obligation légale d'ordre public pour la sincérité des comptes de la liasse fiscale.",
  },

  // =========================================================================
  // 10. SALARIÉS & CONTRATS RH
  // =========================================================================
  {
    id: "rh-employes",
    title: "Gestion des Salariés, Dossiers du Personnel & Contrats",
    category: "paie",
    categoryLabel: "RH & Paie",
    route: "/rh/employes",
    legalRef: "Code du Travail béninois • Immatriculation CNSS obligatoire",
    summary: "Tenir le registre unique du personnel, gérer les matricules, immatriculations CNSS, situations de famille et contrats CDI/CDD/Stage.",
    readTime: "4 min",
    tags: ["salariés", "rh", "contrats", "cnss", "dossiers", "embauche", "enfants à charge"],
    steps: [
      {
        title: "1. Créer une fiche salarié",
        content: "Dans RH & Paie -> Salariés (/rh/employes), cliquez sur '+ Nouveau Salarié'. Saisissez l'état civil, le numéro CNSS et le numéro IFU individuel.",
      },
      {
        title: "2. Renseigner la situation familiale",
        content: "Indiquez le statut matrimonial et le nombre d'enfants à charge : ces données déterminent automatiquement les abattements d'impôt sur salaires (ITS).",
      },
      {
        title: "3. Établir le contrat de travail",
        content: "Dans Contrats (/rh/contrats), créez le contrat (CDI, CDD, Stage) avec la date d'embauche, le salaire brut contractuel et les primes permanentes.",
      },
    ],
  },

  // =========================================================================
  // 11. CYCLES DE PAIE 1-CLIC & BULLETINS
  // =========================================================================
  {
    id: "rh-cycle-paie",
    title: "Exécution de la Paie Mensuelle 1-Clic, Barème ITS & Bulletins",
    category: "paie",
    categoryLabel: "RH & Paie",
    route: "/rh/paie",
    legalRef: "CGI Bénin Art. 125 (Barème ITS) • CNSS (3,6% salariale, 17,4% patronale) • VPS 4%",
    summary: "Ouvrir le cycle mensuel, saisir les heures supplémentaires et primes, calculer les bulletins en 1-clic et imprimer les fiches de paie conformes.",
    readTime: "5 min",
    tags: ["paie", "salaires", "its", "vps", "cnss", "bulletins", "1-clic", "primes"],
    steps: [
      {
        title: "1. Ouvrir le cycle du mois",
        content: "Dans RH & Paie -> Cycles de Paie (/rh/paie), cliquez sur 'Ouvrir un Cycle' en sélectionnant le mois et l'année.",
      },
      {
        title: "2. Saisir les variables du mois",
        content: "Utilisez la grille de saisie en masse pour renseigner les primes exceptionnelles, commissions, heures supplémentaires bonifiées et acomptes déjà versés.",
      },
      {
        title: "3. Lancer le calcul automatique 1-clic",
        content: "Cliquez sur 'Calculer la Paie (1-Clic)'. Le barème progressif ITS Art. 125, l'abattement forfaitaire de 25%, la CNSS ouvrière (3,6%), la CNSS patronale (17,4%) et le VPS (4%) sont calculés pour chaque agent.",
      },
      {
        title: "4. Valider le cycle et distribuer les bulletins",
        content: "La validation verrouille la paie. Téléchargez les fiches de paie individuelles au format PDF ou envoyez-les par email aux collaborateurs.",
      },
    ],
    tips: "La validation du cycle envoie automatiquement les échéances d'ITS et de VPS dans le calendrier fiscal sans ressaisie.",
    warning: "Un cycle validé ne peut plus être modifié sans procédure de réouverture motivée.",
  },

  // =========================================================================
  // 12. DÉCLARATIONS SOCIALES (CNSS) & OD DE PAIE
  // =========================================================================
  {
    id: "rh-declarations",
    title: "Déclarations Fiscales & Sociales RH et Écritures Comptables OD",
    category: "paie",
    categoryLabel: "RH & Paie",
    route: "/rh/declarations",
    legalRef: "CNSS Bénin • CGI Bénin Art. 128 (Échéance 10 du mois) • SYSCOHADA Comptes 66/42/43/44",
    summary: "Générer les bordereaux nominatifs CNSS, déclarer l'ITS et le VPS avant le 10 du mois et transmettre l'écriture d'imputation en comptabilité.",
    readTime: "4 min",
    tags: ["cnss", "its", "vps", "od de paie", "comptabilité", "10 du mois", "bordereau"],
    steps: [
      {
        title: "1. Générer le bordereau nominatif CNSS",
        content: "Dans Déclarations (/rh/declarations), téléchargez le bordereau mensuel conforme avec salaires plafonnés et cotisations parts patronale et ouvrière.",
      },
      {
        title: "2. Consolider l'ITS et le VPS",
        content: "Consultez le montant total de retenue ITS et de taxe VPS à télédéclarer et reverser à la DGI avant le 10 du mois suivant.",
      },
      {
        title: "3. Transmettre l'écriture au journal des OD (M3)",
        content: "Dans Écritures OD (/rh/comptabilite), cliquez sur 'Transmettre au Journal OD'. L'écriture équilibrée (Débit 66/64, Crédit 42/43/44) est enregistrée en comptabilité.",
      },
    ],
  },

  // =========================================================================
  // 13. NOTES DE FRAIS, DÉPENSES & MISSIONS
  // =========================================================================
  {
    id: "frais-gestion",
    title: "Déclaration des Notes de Frais, Justificatifs & Récupération TVA",
    category: "frais",
    categoryLabel: "Notes de Frais",
    route: "/notes-frais",
    legalRef: "CGI Bénin (Plafond espèces 100 000 FCFA & TVA déductible)",
    summary: "Déclarer les dépenses professionnelles avec reçus scannés, gérer les ordres de mission et avances, appliquer la validation manager et récupérer la TVA.",
    readTime: "4 min",
    tags: ["notes de frais", "dépenses", "justificatifs", "missions", "avances", "tva déductible"],
    steps: [
      {
        title: "1. Déclarer une dépense avec justificatif",
        content: "Dans Mes Dépenses (/notes-frais/mes-depenses), saisissez la date, le montant, la nature (hôtel, transport, repas) et photographiez le reçu avec votre smartphone.",
      },
      {
        title: "2. Contrôle automatique des plafonds",
        content: "Nexera contrôle que les paiements en espèces ne dépassent pas le plafond légal de 100 000 FCFA et alerte sur les dépenses hors barème.",
      },
      {
        title: "3. Workflow d'approbation managériale",
        content: "Le manager examine les justificatifs dans l'écran Validation (/notes-frais/validation) et approuve ou rejette avec motif.",
      },
      {
        title: "4. Remboursement et récupération automatique de TVA",
        content: "Dès validation, la TVA déductible éligible est injectée directement dans la déclaration de TVA du mois (Module Fiscalité) et l'ordre de remboursement bancaire est créé.",
      },
    ],
  },

  // =========================================================================
  // 14. MODULE FISCALITÉ (10 CHAPITRES SPÉCIALISÉS)
  // =========================================================================
  {
    id: "fiscalite-01-dashboard",
    chapterNumber: "Chapitre 01",
    title: "Tableau de Bord Fiscal & Diagnostic Financier Consolidé",
    category: "fiscalite",
    categoryLabel: "Fiscalité & Déclarations",
    route: "/fiscalite",
    legalRef: "CGI Bénin 2026 • SYSCOHADA Révisé",
    summary: "Visualiser la charge fiscale globale, le compte à rebours de l'échéance imminente, le crédit de TVA reportable et l'indicateur d'exposition aux risques de pénalités.",
    readTime: "3 min",
    tags: ["dashboard", "synthèse", "kpi", "crédit tva", "charge fiscale", "alertes"],
    steps: [
      {
        title: "1. Accéder au Tableau de Bord Consolidé",
        content: "Naviguez vers Fiscalité (/fiscalite). Vous visualisez 4 cartes consolidées : Charge Fiscale Annuelle, Prochaine Échéance Légale avec compte à rebours (jours restants), Crédit de TVA Reportable et Statut d'Exposition au Risque.",
      },
      {
        title: "2. Suivre le Compte à Rebours des Échéances",
        content: "La carte centrale affiche l'obligation la plus urgente (TVA du 20, ITS du 10, Patente du 31/01). Si l'échéance est imminente, l'indicateur passe en alerte orange ; si elle est dépassée, un badge rouge 'EN RETARD' invite à régulariser.",
      },
      {
        title: "3. Analyser la Répartition de la Charge Fiscale",
        content: "Le graphique illustre le poids comparatif de la TVA décaissée, des acomptes d'IS, de l'AIB opérée et des taxes locales pour ajuster vos prévisions de trésorerie.",
      },
      {
        title: "4. Exploiter les Raccourcis Rapides",
        content: "Utilisez les boutons d'action rapide pour basculer en un clic vers la déclaration de TVA, le calcul de l'IS ou l'export du FEC.",
      },
    ],
    tips: "Le tableau de bord est rafraîchi en temps réel à chaque nouvelle facture validée en Ventes ou note de frais approuvée.",
  },
  {
    id: "fiscalite-02-calendrier",
    chapterNumber: "Chapitre 02",
    title: "Calendrier & Échéancier Fiscal et Social Unifié",
    category: "fiscalite",
    categoryLabel: "Fiscalité & Déclarations",
    route: "/fiscalite/calendrier",
    legalRef: "CGI Bénin 2026 Art. 10, 20, 50, 202 • Code de Sécurité Sociale",
    summary: "Piloter toutes les dates limites fiscales et sociales (TVA, ITS, AIB, VPS, CNSS, acomptes IS, Patente), configurer les rappels et simuler les pénalités de retard.",
    readTime: "4 min",
    tags: ["calendrier", "échéancier", "dates limites", "its", "vps", "cnss", "rappels"],
    steps: [
      {
        title: "1. Consulter la Vue Calendrier Mensuelle",
        content: "Accédez à Fiscalité -> Calendrier Fiscal (/fiscalite/calendrier). L'interface affiche l'ensemble des échéances sous forme d'agenda et de liste ordonnée.",
      },
      {
        title: "2. Mémoriser les 5 Grands Rendez-vous Fiscaux Béninois",
        content: "• Le 10 : Déclaration/reversement ITS, VPS et CNSS.\n• Le 10 : Reversement de l'AIB opérée.\n• Le 20 : Déclaration et télépaiement de la TVA mensuelle.\n• Les 10 mars, 10 juin, 10 septembre, 10 décembre : Les 4 acomptes trimestriels de l'IS.\n• Le 31 janvier : Paiement de la Contribution des Patentes.\n• Le 30 avril : Dépôt officiel de la Liasse Fiscale SYSCOHADA.",
      },
      {
        title: "3. Simuler les Pénalités Légales en Cas de Retard",
        content: "Le calendrier intègre le calcul automatique des intérêts moratoires de 1% par mois de retard (CGI Art. 1092) pour mesurer l'impact financier de tout décalage.",
      },
    ],
  },
  {
    id: "fiscalite-03-tva",
    chapterNumber: "Chapitre 03",
    title: "Déclarations Périodiques de TVA & Gestion du Crédit Reportable",
    category: "fiscalite",
    categoryLabel: "Fiscalité & Déclarations",
    route: "/fiscalite/tva",
    legalRef: "CGI Bénin 2026 Art. 248 et suivants",
    summary: "Liquider la TVA mensuelle, collecter automatiquement les ventes M2 et frais M5, intégrer le crédit reporté du mois précédent, valider et marquer la taxe payée.",
    readTime: "5 min",
    tags: ["tva", "tva collectée", "tva déductible", "crédit de tva", "télépaiement"],
    steps: [
      {
        title: "1. Sélectionner ou Ouvrir la Période Mensuelle",
        content: "Rendez-vous dans Fiscalité -> Déclarations TVA (/fiscalite/tva). Sélectionnez la période souhaitée (ex: 2026-03).",
      },
      {
        title: "2. Contrôler l'Agrégation Automatique (Zéro Double Saisie)",
        content: "• TVA Collectée (18%) : Issue des factures clients validées en Ventes (M2).\n• TVA Déductible : Collectée depuis les notes de frais approuvées (M5) et achats fournisseurs.",
      },
      {
        title: "3. Vérifier la Liquidation et le Crédit de TVA",
        content: "Nexera applique la formule : TVA Nette = TVA Collectée - TVA Déductible - Crédit Antérieur Reporté. Si le solde est négatif, le montant devient un Crédit de TVA reporté automatiquement sur M+1.",
      },
      {
        title: "4. Valider et Enregistrer le Télépaiement",
        content: "Cliquez sur 'Valider la Déclaration'. Dès règlement au Trésor, cliquez sur 'Marquer comme Payée' et renseignez la quittance.",
      },
    ],
  },
  {
    id: "fiscalite-04-is",
    chapterNumber: "Chapitre 04",
    title: "Impôt sur les Sociétés (IS), Retraitements & Acomptes Provisionnels",
    category: "fiscalite",
    categoryLabel: "Fiscalité & Déclarations",
    route: "/fiscalite/is",
    legalRef: "CGI Bénin 2026 Art. 46 à 52 • Plancher 250 000 FCFA",
    summary: "Déterminer le résultat fiscal imposable (réintégrations et déductions), calculer l'IS au taux légal (25% ou 30%) avec minimum de perception, planifier les 4 acomptes et transmettre l'écriture retour 695/444.",
    readTime: "5 min",
    tags: ["is", "impôt sociétés", "bénéfices", "minimum perception", "acomptes", "695", "444"],
    steps: [
      {
        title: "1. Sélectionner l'Exercice Fiscal",
        content: "Accédez à Fiscalité -> Impôt sur les Sociétés (/fiscalite/is). Le Résultat Net Comptable est extrait du compte 13.",
      },
      {
        title: "2. Saisir les Retraitements Fiscaux (Art. 22 CGI)",
        content: "Cliquez sur 'Ajouter un Retraitement' pour renseigner les réintégrations (charges non déductibles) et déductions (produits exonérés).",
      },
      {
        title: "3. Lancer le Calcul Officiel de l'IS (Règle EF-016)",
        content: "Cliquez sur 'Calculer l'IS Officiel'. Nexera applique la règle d'ordre public : IS Dû = MAX (Résultat Fiscal x Taux 25%/30%, Minimum de Perception assis sur les produits encaissables avec plancher absolu de 250 000 FCFA).",
      },
      {
        title: "4. Suivre les 4 Acomptes Trimestriels",
        content: "Nexera calcule les 4 acomptes de 25% dus les 10 mars, 10 juin, 10 septembre et 10 décembre. Consignez chaque règlement sur sa ligne.",
      },
      {
        title: "5. Valider et Transmettre l'Écriture Retour en M3",
        content: "Cliquez sur 'Valider & Transmettre en M3'. L'écriture d'imposition est générée en OD : Débit 695100 / Crédit 444100.",
      },
    ],
  },
  {
    id: "fiscalite-05-aib",
    chapterNumber: "Chapitre 05",
    title: "AIB & Retenues à la Source (Taux 1%, 5%, AIB Subie vs Opérée)",
    category: "fiscalite",
    categoryLabel: "Fiscalité & Déclarations",
    route: "/fiscalite/aib",
    legalRef: "CGI Bénin 2026 Art. 130 à 133",
    summary: "Maîtriser les retenues AIB, distinguer les retenues subies (crédit IS) des retenues opérées (à reverser à la DGI), utiliser le simulateur et émettre les attestations PDF officielles.",
    readTime: "4 min",
    tags: ["aib", "retenue à la source", "attestation", "1%", "5%", "prestataires", "fournisseurs"],
    steps: [
      {
        title: "1. Distinguer le Sens de la Retenue",
        content: "• AIB Subie (Sens Client) : Crédit d'impôt imputable sur votre solde d'IS.\n• AIB Opérée (Sens Fournisseur) : Dette à reverser à la DGI au plus tard le 10 du mois suivant.",
      },
      {
        title: "2. Utiliser le Simulateur de Retenue AIB",
        content: "Dans le volet de gauche, indiquez le montant brut de la facture et choisissez la nature (Prestations 5%, Achats de biens 1%, Non-immatriculé 5%).",
      },
      {
        title: "3. Émettre l'Attestation Officielle de Retenue en PDF",
        content: "Pour chaque retenue opérée, cliquez sur 'Attestation' pour télécharger le document normalisé officiel à remettre au prestataire.",
      },
    ],
  },
  {
    id: "fiscalite-06-patente",
    chapterNumber: "Chapitre 06",
    title: "Patente Commerciale (Art. 202), TPS & Déclarations de Taxes Locales",
    category: "fiscalite",
    categoryLabel: "Fiscalité & Déclarations",
    route: "/fiscalite/autres-taxes",
    legalRef: "CGI Bénin 2026 Art. 202 à 215 • Échéance 31 Janvier",
    summary: "Simuler la Contribution des Patentes en Zone 1 ou Zone 2, pré-remplir la déclaration, gérer la TPS, la TFU et la TVM et piloter le cycle BROUILLON -> VALIDEE -> DECLAREE -> PAYEE.",
    readTime: "4 min",
    tags: ["patente", "autres taxes", "zone 1", "zone 2", "tps", "tfu", "tvm", "31 janvier"],
    steps: [
      {
        title: "1. Simuler la Contribution des Patentes (Art. 202)",
        content: "Dans Autres Taxes (/fiscalite/autres-taxes), saisissez votre CA et sélectionnez la zone administrative : Zone 1 (Cotonou, Porto-Novo, Parakou, Calavi) ou Zone 2 (autres communes).",
      },
      {
        title: "2. Reporter dans une Déclaration en 1-Clic",
        content: "Cliquez sur 'Reporter dans une Déclaration' pour pré-remplir la période 2026 et l'échéance légale du 31 janvier.",
      },
      {
        title: "3. Suivre le Cycle de Vie à 4 Statuts",
        content: "Passez de BROUILLON à VALIDÉE, puis DÉCLARÉE et enfin PAYÉE avec archivage de la quittance.",
      },
    ],
  },
  {
    id: "fiscalite-07-liasse",
    chapterNumber: "Chapitre 07",
    title: "Liasse Fiscale SYSCOHADA, Visa Cabinet M6 & Dépôt Officiel DGI",
    category: "fiscalite",
    categoryLabel: "Fiscalité & Déclarations",
    route: "/fiscalite/liasse-fiscale",
    legalRef: "SYSCOHADA Révisé • CGI Bénin Art. 50 • Échéance 30 Avril",
    summary: "Compiler automatiquement la liasse financière (Système Normal ou SMT), faire certifier les comptes par le Cabinet d'expertise comptable (M6), télédéclarer à la DGI et exporter le PDF.",
    readTime: "5 min",
    tags: ["liasse fiscale", "syscohada", "bilan", "compte de résultat", "tft", "visa cabinet", "m6"],
    steps: [
      {
        title: "1. Compiler la Liasse Fiscale",
        content: "Sélectionnez l'exercice et votre système (Normal ou SMT), puis cliquez sur 'Compiler la Liasse Fiscale'. Nexera consolide le Bilan, Compte de Résultat, TFT et les notes annexes.",
      },
      {
        title: "2. Soumettre au Visa de l'Expert-Comptable (Module 6)",
        content: "L'expert-comptable partenaire appose sa signature électronique attestant de la régularité et sincérité des comptes.",
      },
      {
        title: "3. Procéder à la Télédéclaration Officielle DGI",
        content: "Cliquez sur 'Télédéclarer à la DGI' avant le 30 avril. Nexera transmet le flux numérique et conserve l'accusé de réception légal d'horodatage.",
      },
    ],
  },
  {
    id: "fiscalite-08-fec",
    chapterNumber: "Chapitre 08",
    title: "Export FEC — Fichier des Écritures Comptables (Arrêté 1085-C)",
    category: "fiscalite",
    categoryLabel: "Fiscalité & Déclarations",
    route: "/fiscalite/fec",
    legalRef: "Arrêté Ministériel n° 1085-C/MEF/CAB/SGM/DGI/DLC/159SGG20",
    summary: "Générer et certifier le FEC à 18 colonnes normalisées obligatoire lors de tout contrôle fiscal informatisé, auditer l'équilibre Débit=Crédit et télécharger le fichier officiel.",
    readTime: "4 min",
    tags: ["fec", "arrêté 1085-c", "audit", "18 colonnes", "contrôle fiscal", "écritures"],
    steps: [
      {
        title: "1. Paramétrer le Séparateur et le Format",
        content: "Dans Export FEC (/fiscalite/fec), sélectionnez le séparateur (Point-virgule ou Tabulation) et le format (.CSV ou .TXT).",
      },
      {
        title: "2. Lancer la Génération & l'Audit de Conformité",
        content: "Cliquez sur 'Générer & Auditer le FEC'. Nexera contrôle l'égalité Débit = Crédit, la chronologie des écritures et la présence des 18 champs légaux.",
      },
      {
        title: "3. Télécharger le Fichier Certifié",
        content: "Dès que le badge vert apparaît, téléchargez le fichier nommé conformément à la norme : FEC_[IFU]_[AAAAMMJJ].",
      },
    ],
  },
  {
    id: "fiscalite-09-controles",
    chapterNumber: "Chapitre 09",
    title: "Gestion des Contrôles Fiscaux, Simulateur de Pénalités & Contentieux",
    category: "fiscalite",
    categoryLabel: "Fiscalité & Déclarations",
    route: "/fiscalite/controles",
    legalRef: "CGI Bénin 2026 Art. 670+, 1092+, 1120+ • Délai réponse 30 jours",
    summary: "Enregistrer les avis de vérification, simuler le coût des pénalités (1% mensuel, majorations 40% et 80%), et consigner les recours contentieux (gracieux, hiérarchique, juridictionnel).",
    readTime: "5 min",
    tags: ["contrôle fiscal", "pénalités", "redressement", "recours", "contentieux", "30 jours"],
    steps: [
      {
        title: "1. Enregistrer un Avis de Vérification",
        content: "Dès notification d'un contrôle, cliquez sur '+ Notifier Contrôle'. Renseignez le type et activez le compte à rebours légal des 30 jours de réponse.",
      },
      {
        title: "2. Simuler les Sanctions et Pénalités Légales",
        content: "Renseignez les droits compromis et la durée du retard pour décomposer : intérêt de retard (1%/mois), majoration après mise en demeure (+40%) ou pour mauvaise foi (+80%).",
      },
      {
        title: "3. Introduire une Réclamation ou un Recours",
        content: "Cliquez sur '+ Introduire Recours' pour consigner une Réclamation préalable devant le DGI (délai de réponse 3 mois) ou un recours hiérarchique.",
      },
    ],
  },
  {
    id: "fiscalite-10-veille",
    chapterNumber: "Chapitre 10",
    title: "Veille Juridique, Barèmes Versionnés, Paramètres & Règle EF-008",
    category: "fiscalite",
    categoryLabel: "Fiscalité & Déclarations",
    route: "/fiscalite/veille",
    legalRef: "CGI Bénin 2026 • Règle EF-008 (Double Validation Obligatoire)",
    summary: "Gérer les sources réglementaires (circulaires, lois), versionner les barèmes d'impôt et tranches progressives, administrer les paramètres pays et appliquer la règle de validation à 4 yeux.",
    readTime: "5 min",
    tags: ["veille", "référentiel", "barèmes", "circulaires", "lois", "ef-008", "double validation"],
    steps: [
      {
        title: "1. Suivre et Qualifier les Textes de Veille",
        content: "Dans 'Veille Réglementaire', référencez les nouvelles parutions et qualifiez chaque texte en 'APPLICABLE', 'OBSOLÈTE' ou 'ARCHIVÉ'.",
      },
      {
        title: "2. Versionner les Barèmes Fiscaux",
        content: "Consultez ou créez les grilles de TVA, IS, AIB et ITS en vigueur pour chaque exercice.",
      },
      {
        title: "3. Respecter la Règle de Double Validation EF-008",
        content: "Un barème créé reste au statut 'BROUILLON' : seul un second utilisateur habilité peut valider son activation en production (règle des quatre yeux).",
      },
    ],
  },

  // =========================================================================
  // 15. ESPACE CABINET D'EXPERTISE COMPTABLE (M6)
  // =========================================================================
  {
    id: "cabinet-m6",
    title: "Espace Cabinet d'Expertise Comptable, Révision & Visa Liasse",
    category: "cabinet",
    categoryLabel: "Cabinet d'Expertise Comptable",
    route: "/cabinet",
    legalRef: "Ordre des Experts-Comptables du Bénin (OECCA) • AUDCIF OHADA",
    summary: "Piloter le portefeuille des dossiers d'entreprises clientes, réaliser la révision comptable continue, valider les déclarations et apposer le visa légal.",
    readTime: "4 min",
    tags: ["cabinet", "expert-comptable", "révision", "oecca", "audit", "visa liasse", "multi-dossiers"],
    steps: [
      {
        title: "1. Piloter le portefeuille multi-clients",
        content: "Dans l'Espace Cabinet (/cabinet), visualisez l'état d'avancement comptable, les alertes d'échéances fiscales et le statut de la liasse de chaque client sous mandat.",
      },
      {
        title: "2. Basculer instantanément dans un dossier",
        content: "Cliquez sur un dossier pour entrer dans son environnement et pointer ses balances, journaux et rapprochements bancaires.",
      },
      {
        title: "3. Viser et certifier la liasse SYSCOHADA",
        content: "Après revue des comptes annuels, apposez le visa électronique officiel OECCA certifiant la régularité et sincérité des états financiers.",
      },
    ],
  },

  // =========================================================================
  // 16. RAPPORTS & BUSINESS INTELLIGENCE
  // =========================================================================
  {
    id: "reports-analyses",
    title: "Tableaux de Bord Financiers, Trésorerie & Analyse des Ventes",
    category: "rapports",
    categoryLabel: "Rapports & Analyses",
    route: "/rapports",
    summary: "Analyser la santé financière de l'entreprise, mesurer l'évolution du Chiffre d'Affaires, surveiller la marge brute et exporter les rapports financiers en Excel/PDF.",
    readTime: "3 min",
    tags: ["rapports", "statistiques", "chiffre d'affaires", "trésorerie", "marge", "export excel", "bi"],
    steps: [
      {
        title: "1. Filtrer par période et segment",
        content: "Dans Rapports (/rapports), sélectionnez la plage temporelle (mois, trimestre, année) et filtrez par famille d'articles ou client.",
      },
      {
        title: "2. Suivre les indicateurs de performance",
        content: "Consultez la progression du CA (N vs N-1), la marge brute commerciale et le classement des 10 premiers clients contributeurs.",
      },
      {
        title: "3. Exporter pour les banques et partenaires",
        content: "Générez la plaquette financière graphique au format PDF ou téléchargez les données brutes sous format tableur Excel.",
      },
    ],
  },

  // =========================================================================
  // 17. PARAMÈTRES, UTILISATEURS & SÉCURITÉ RBAC
  // =========================================================================
  {
    id: "settings-parametres",
    title: "Administration Société, Gestion des Utilisateurs & Rôles RBAC",
    category: "demarrage",
    categoryLabel: "Paramètres & Sécurité",
    route: "/parametres",
    summary: "Administrer les mentions légales officielles, inviter vos collaborateurs, configurer la matrice des rôles et sécuriser les accès.",
    readTime: "4 min",
    tags: ["paramètres", "utilisateurs", "rôles", "rbac", "permissions", "sécurité", "invitation"],
    steps: [
      {
        title: "1. Configurer la fiche société",
        content: "Dans Paramètres -> Société (/parametres), mettez à jour votre IFU, RCCM, centre des impôts et coordonnées bancaires officielles.",
      },
      {
        title: "2. Inviter des collaborateurs",
        content: "Dans Utilisateurs (/utilisateurs), cliquez sur '+ Inviter un Utilisateur' et assignez-lui son rôle initial par e-mail.",
      },
      {
        title: "3. Définir des permissions fines (RBAC)",
        content: "Dans Rôles (/roles), ajustez les droits de consultation, création, modification ou suppression pour chaque profil afin d'assurer un strict cloisonnement des prérogatives.",
      },
    ],
  },
];

// =========================================================================
// MAPPING CONTEXTUEL EXHAUSTIF DES ROUTES ERP VERS LES GUIDES DÉDIÉS
// =========================================================================
export const CONTEXTUAL_ROUTE_MAP: ContextualHelpMapping[] = [
  // --- Fiscalité (10 sous-menus) ---
  { routePrefix: "/fiscalite/calendrier", articleId: "fiscalite-02-calendrier" },
  { routePrefix: "/fiscalite/tva", articleId: "fiscalite-03-tva" },
  { routePrefix: "/fiscalite/is", articleId: "fiscalite-04-is" },
  { routePrefix: "/fiscalite/aib", articleId: "fiscalite-05-aib" },
  { routePrefix: "/fiscalite/autres-taxes", articleId: "fiscalite-06-patente" },
  { routePrefix: "/fiscalite/liasse-fiscale", articleId: "fiscalite-07-liasse" },
  { routePrefix: "/fiscalite/fec", articleId: "fiscalite-08-fec" },
  { routePrefix: "/fiscalite/controles", articleId: "fiscalite-09-controles" },
  { routePrefix: "/fiscalite/veille", articleId: "fiscalite-10-veille" },
  { routePrefix: "/fiscalite", articleId: "fiscalite-01-dashboard" },

  // --- CRM & Ventes & Facturation ---
  { routePrefix: "/clients", articleId: "crm-clients" },
  { routePrefix: "/crm", articleId: "crm-clients" },
  { routePrefix: "/catalogue", articleId: "invoicing-catalogue" },
  { routePrefix: "/devis", articleId: "invoicing-devis" },
  { routePrefix: "/commandes", articleId: "invoicing-commandes" },
  { routePrefix: "/factures", articleId: "invoicing-factures" },
  { routePrefix: "/encaissements", articleId: "invoicing-encaissements" },
  { routePrefix: "/relances", articleId: "invoicing-relances" },

  // --- Stocks (tous sous-menus) ---
  { routePrefix: "/stock/articles", articleId: "stock-gestion" },
  { routePrefix: "/stock/entrepots", articleId: "stock-gestion" },
  { routePrefix: "/stock/mouvements", articleId: "stock-gestion" },
  { routePrefix: "/stock/transferts", articleId: "stock-gestion" },
  { routePrefix: "/stock/inventaires", articleId: "stock-gestion" },
  { routePrefix: "/stock/alertes", articleId: "stock-gestion" },
  { routePrefix: "/stock/valorisation", articleId: "stock-gestion" },
  { routePrefix: "/stock", articleId: "stock-gestion" },

  // --- RH & Paie (tous sous-menus) ---
  { routePrefix: "/rh/employes", articleId: "rh-employes" },
  { routePrefix: "/rh/contrats", articleId: "rh-employes" },
  { routePrefix: "/rh/temps-absences", articleId: "rh-employes" },
  { routePrefix: "/rh/paie", articleId: "rh-cycle-paie" },
  { routePrefix: "/rh/bulletins", articleId: "rh-cycle-paie" },
  { routePrefix: "/rh/declarations", articleId: "rh-declarations" },
  { routePrefix: "/rh/comptabilite", articleId: "rh-declarations" },
  { routePrefix: "/rh/solde-tout-compte", articleId: "rh-declarations" },
  { routePrefix: "/rh", articleId: "rh-cycle-paie" },
  { routePrefix: "/paie", articleId: "rh-cycle-paie" },

  // --- Notes de frais (tous sous-menus) ---
  { routePrefix: "/notes-frais/mes-depenses", articleId: "frais-gestion" },
  { routePrefix: "/notes-frais/rapports", articleId: "frais-gestion" },
  { routePrefix: "/notes-frais/missions", articleId: "frais-gestion" },
  { routePrefix: "/notes-frais/validation", articleId: "frais-gestion" },
  { routePrefix: "/notes-frais/remboursements", articleId: "frais-gestion" },
  { routePrefix: "/notes-frais/parametres", articleId: "frais-gestion" },
  { routePrefix: "/notes-frais", articleId: "frais-gestion" },
  { routePrefix: "/notes-de-frais", articleId: "frais-gestion" },

  // --- Cabinet d'expertise (M6) ---
  { routePrefix: "/cabinet", articleId: "cabinet-m6" },

  // --- Rapports & BI ---
  { routePrefix: "/rapports", articleId: "reports-analyses" },

  // --- Paramètres, Utilisateurs, Rôles ---
  { routePrefix: "/parametres", articleId: "settings-parametres" },
  { routePrefix: "/utilisateurs", articleId: "settings-parametres" },
  { routePrefix: "/roles", articleId: "settings-parametres" },
  { routePrefix: "/", articleId: "guide-demarrage" },
];

/**
 * Retrouve l'article contextuel le plus pertinent pour une route donnée.
 */
export function findContextualArticle(pathname: string): HelpArticle | undefined {
  if (!pathname) return HELP_ARTICLES[0];

  // Chercher la correspondance la plus spécifique d'abord (la plus longue)
  const sortedMappings = [...CONTEXTUAL_ROUTE_MAP].sort(
    (a, b) => b.routePrefix.length - a.routePrefix.length
  );

  const matched = sortedMappings.find((m) => {
    if (m.routePrefix === "/") {
      return pathname === "/" || pathname === "";
    }
    return pathname.startsWith(m.routePrefix);
  });

  if (matched) {
    return HELP_ARTICLES.find((a) => a.id === matched.articleId);
  }

  // Par défaut, retourner le guide de démarrage
  return HELP_ARTICLES[0];
}
