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
  // 6. FACTURATION & VENTES NORMALISÉES (e-MECeF)
  // =========================================================================
  {
    id: "invoicing-factures",
    title: "Émission de Factures Normalisées e-MECeF, TVA & Retenues AIB",
    category: "facturation",
    categoryLabel: "Facturation & Ventes",
    route: "/factures",
    legalRef: "CGI Bénin 2026 Art. 130-133, 248 • Réforme e-MECeF / SyGMEF DGI",
    summary: "Créer et certifier les factures avec normalisation e-MECeF DGI (QR Code, NIM, Code MECeF), appliquer la TVA 18% et l'acompte AIB, alimenter la déclaration fiscale et émettre des avoirs certifiés.",
    readTime: "4 min",
    tags: ["factures", "ventes", "e-mecef", "dgi bénin", "qr code", "tva 18%", "aib", "avoir", "normalisée"],
    steps: [
      {
        title: "1. Créer une nouvelle facture",
        content: "Rendez-vous dans Factures (/factures) et cliquez sur '+ Nouvelle Facture'. Sélectionnez le client et vérifiez la conformité de son IFU à 13 chiffres.",
      },
      {
        title: "2. Vérifier les lignes, la TVA et l'AIB",
        content: "Les articles taxables appliquent la TVA à 18%. Si l'opération est soumise à l'Acompte sur Impôt assis sur les Bénéfices (AIB), le montant (1% ou 5%) est calculé et affiché distinctement dans le total Net à payer (TTC + AIB).",
      },
      {
        title: "3. Valider et Émettre définitivement",
        content: "Cliquez sur 'Valider et Émettre'. Cette action fige définitivement la facture avec son numéro chrono officiel, décrémente les stocks et injecte la TVA collectée dans le module Fiscalité.",
      },
      {
        title: "4. Normaliser auprès de la DGI (e-MECeF)",
        content: "Cliquez sur 'Normaliser (e-MECeF)'. Nexera communique avec les serveurs de la DGI (SyGMEF) et intègre le cartouche vert officiel : Numéro d'Identification de la Machine (NIM), compteurs de vente, Code de Sécurité MECeF, horodatage certifié et QR Code scannable de vérification.",
      },
      {
        title: "5. Télécharger et imprimer le PDF certifié",
        content: "Téléchargez le PDF officiel certifié. En cas de facture normalisée, le cartouche vert e-MECeF et le QR Code de conformité DGI sont automatiquement incrustés au bas du document.",
      },
      {
        title: "6. Émettre un Avoir en cas d'annulation ou retour",
        content: "Une facture validée ne peut être supprimée : cliquez sur 'Créer un Avoir'. Vous pouvez émettre un avoir total ou partiel basé sur les lignes ou sur un montant saisi, avec normalisation e-MECeF de référence.",
      },
    ],
    tips: "Toute facture validée alimente automatiquement le journal des ventes en comptabilité et la déclaration de TVA du mois en cours sans aucune ressaisie.",
    warning: "La normalisation e-MECeF nécessite que votre NIM et clé d'API DGI soient actifs et rattachés à votre IFU sur le portail SyGMEF.",
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
    legalRef: "CGI Bénin 2026 Art. 10, 50, 130, 259, 487-488 • Code de Sécurité Sociale",
    summary: "Piloter toutes les dates limites fiscales et sociales (TVA au 10, ITS, AIB, VPS, CNSS, acomptes IS, Patente), configurer les rappels, simuler les pénalités de retard et exporter l'échéancier PDF.",
    readTime: "4 min",
    tags: ["calendrier", "échéancier", "dates limites", "tva au 10", "its", "vps", "cnss", "rappels", "pdf"],
    steps: [
      {
        title: "1. Consulter la Vue Calendrier et Liste Consolidée",
        content: "Accédez à Fiscalité -> Calendrier Fiscal (/fiscalite/calendrier). L'interface affiche l'ensemble des obligations consolidées sous forme d'agenda interactif et de liste chronologique.",
      },
      {
        title: "2. Mémoriser les 5 Grands Rendez-vous Fiscaux Béninois (CGI 2026)",
        content: "• Le 10 du mois : Déclaration et télépaiement de la TVA mensuelle (Art. 259).\n• Le 10 du mois : Reversement de l'AIB opérée (Art. 130).\n• Le 10 du mois : Déclaration et reversement ITS, VPS et cotisations CNSS (M4 Paie).\n• Les 10 mars, 10 juin, 10 septembre, 10 décembre : Les 4 acomptes trimestriels de l'IS (Art. 50-51).\n• Le 30 avril : Paiement de la Contribution des Patentes & Dépôt légal de la Liasse Fiscale SYSCOHADA (Art. 50 & 202).",
      },
      {
        title: "3. Calcul Automatique des Pénalités Légales en Cas de Retard (EF-033)",
        content: "En cas d'échéance dépassée, Nexera calcule automatiquement : 10% forfaitaire pour retard de paiement (Art. 487) + 0,25% par mois d'intérêt de retard moratoire (Art. 488).",
      },
      {
        title: "4. Aperçu et Téléchargement de l'Échéancier en PDF",
        content: "Cliquez sur 'Aperçu' pour ouvrir la visionneuse PDF in-app avec impression directe, ou sur 'Échéancier (PDF)' pour exporter le calendrier officiel certifié.",
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
    legalRef: "CGI Bénin 2026 Art. 241 à 259 • Taux standard 18%",
    summary: "Liquider la TVA mensuelle au plus tard le 10, agréger automatiquement les ventes M2 et frais M5, reporter le crédit antérieur, valider, prévisualiser et exporter le formulaire officiel e-TVA.",
    readTime: "5 min",
    tags: ["tva", "tva collectée", "tva déductible", "crédit de tva", "formulaire dgi", "pdf e-tva"],
    steps: [
      {
        title: "1. Sélectionner ou Ouvrir la Période Mensuelle",
        content: "Rendez-vous dans Fiscalité -> Déclarations TVA (/fiscalite/tva). Sélectionnez la période souhaitée (ex: 2026-03) exigible au plus tard le 10 du mois suivant.",
      },
      {
        title: "2. Contrôler l'Agrégation Automatique Continue (EF-020)",
        content: "• TVA Collectée (18%) : Alimentée en continu depuis les factures validées en Gestion Commerciale (M2).\n• TVA Déductible : Collectée depuis les achats fournisseurs et les notes de frais approuvées (M5).",
      },
      {
        title: "3. Vérifier la Liquidation et le Crédit de TVA (EF-021)",
        content: "Nexera applique la formule : TVA Nette Due = TVA Collectée - TVA Déductible - Crédit Antérieur Reporté. Si le solde est négatif, il est automatiquement préservé comme Crédit de TVA reporté sur le mois suivant.",
      },
      {
        title: "4. Aperçu In-App, Déclaration PDF et Paiement",
        content: "Cliquez sur 'Aperçu' pour vérifier la déclaration dans la modale interactive, ou sur 'Déclaration (PDF)' pour télécharger le formulaire officiel e-TVA. Une fois réglée au Trésor, cliquez sur 'Marquer comme payée à la DGI'.",
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
    legalRef: "CGI Bénin 2026 Art. 46 à 52 • Plancher Absolu 250 000 FCFA",
    summary: "Déterminer le résultat fiscal (réintégrations et déductions), calculer l'IS au taux légal (25% ou 30%) avec minimum de perception, planifier les 4 acomptes, prévisualiser le bordereau PDF et générer l'écriture retour 695/444.",
    readTime: "5 min",
    tags: ["is", "impôt sociétés", "minimum perception", "acomptes", "695", "444", "bordereau is"],
    steps: [
      {
        title: "1. Sélectionner l'Exercice Fiscal",
        content: "Accédez à Fiscalité -> Impôt sur les Sociétés (/fiscalite/is). Le Résultat Net Comptable avant impôt est extrait du compte de résultat (M3 clôturé).",
      },
      {
        title: "2. Saisir les Retraitements Fiscaux (Art. 47 CGI)",
        content: "Cliquez sur 'Ajouter un Retraitement' pour renseigner les réintégrations (charges non déductibles, amendes) et déductions (produits exonérés) avec leur base légale.",
      },
      {
        title: "3. Lancer le Calcul Officiel de l'IS (Règle EF-016)",
        content: "Nexera applique la règle d'ordre public : IS Dû = MAX(Résultat Fiscal x Taux 25%/30%, Minimum de Perception assis sur les produits encaissables avec plancher absolu de 250 000 FCFA).",
      },
      {
        title: "4. Suivre les 4 Acomptes Trimestriels (EF-018)",
        content: "Le système planifie les 4 acomptes de 25% dus les 10 mars, 10 juin, 10 septembre et 10 décembre. Consignez chaque paiement directement dans le tableau.",
      },
      {
        title: "5. Aperçu In-App, Bordereau PDF & Transmission Comptable (EF-045)",
        content: "Visualisez le Bordereau d'IS via 'Aperçu', téléchargez le document PDF officiel, puis cliquez sur 'Valider & Transmettre à M3' pour injecter automatiquement l'écriture d'impôt (Débit 695 / Crédit 444).",
      },
    ],
  },
  {
    id: "fiscalite-05-aib",
    chapterNumber: "Chapitre 05",
    title: "AIB & Retenues à la Source (Taux 1%, 3%, 5%, Attestations & Registre DGI)",
    category: "fiscalite",
    categoryLabel: "Fiscalité & Déclarations",
    route: "/fiscalite/aib",
    legalRef: "CGI Bénin 2026 Art. 130 à 133 • Grille 1%, 3%, 5%",
    summary: "Gérer l'Acompte sur Impôt assis sur les Bénéfices, distinguer AIB subie (imputable sur IS) et AIB opérée (à reverser), utiliser le simulateur, éditer les attestations individuelles et imprimer le registre récapitulatif officiel A4 paysage.",
    readTime: "4 min",
    tags: ["aib", "retenue à la source", "attestation", "1%", "3%", "5%", "registre dgi", "paysage a4"],
    steps: [
      {
        title: "1. Maîtriser la Grille Légale des Taux (CGI Art. 132)",
        content: "• 1% : Importations, achats commerciaux et fournitures de travaux réalisés par des entreprises immatriculées à l'IFU.\n• 3% : Prestations de services réalisées par des prestataires immatriculées à l'IFU.\n• 5% : Achats, fournitures et prestations réalisés par des personnes physiques ou morales non immatriculées à l'IFU.",
      },
      {
        title: "2. Distinguer le Sens de la Retenue",
        content: "• AIB Subie (Sens Ventes/Clients) : Acompte payé d'avance, déductible et imputable sur votre solde d'IS annuel.\n• AIB Opérée (Sens Achats/Fournisseurs) : Retenue prélevée sur vos prestataires, exigible et à reverser à la DGI au plus tard le 10 du mois suivant.",
      },
      {
        title: "3. Simuler une Retenue Instantanément",
        content: "Utilisez le simulateur interactif pour calculer instantanément la retenue AIB et le net à payer selon la nature de l'opération et le statut IFU du tiers.",
      },
      {
        title: "4. Émettre l'Attestation Individuelle de Retenue (PDF)",
        content: "Sur chaque ligne de retenue opérée, cliquez sur 'Attestation' ou 'Aperçu' pour générer l'attestation normalisée officielle à délivrer obligatoirement au prestataire.",
      },
      {
        title: "5. Imprimer le Registre Récapitulatif Consolidé A4 Paysage DGI",
        content: "Cliquez sur 'Aperçu Récap' ou 'Télécharger PDF' pour générer le registre annuel officiel au format A4 paysage avec total AIB subie, total AIB opérée, cadre de certification comptable et signatures.",
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
    legalRef: "CGI Bénin 2026 Art. 178 à 220 • Échéance 30 Avril",
    summary: "Calculer la Contribution des Patentes en Zone 1 ou Zone 2 avec barème progressif par tranche de CA, administrer la Taxe Professionnelle Synthétique (TPS) et piloter le cycle de vie des déclarations génériques.",
    readTime: "4 min",
    tags: ["patente", "autres taxes", "zone 1", "zone 2", "tps", "taxes locales", "déclarations génériques"],
    steps: [
      {
        title: "1. Calculer la Contribution des Patentes (CGI Art. 202)",
        content: "Renseignez votre chiffre d'affaires et la zone géographique :\n• 1ère zone (Cotonou, Porto-Novo, Parakou, etc.) : 70 000 FCFA si CA <= 1 milliard, puis +10 000 FCFA par milliard supplémentaire.\n• 2ème zone (autres communes) : 60 000 FCFA si CA <= 1 milliard, puis +10 000 FCFA par tranche de milliard supplémentaire.",
      },
      {
        title: "2. Gérer le Régime de la TPS (Art. 178)",
        content: "Pour les contribuables sous régime synthétique libératoire, la TPS remplace l'impôt sur les bénéfices, la patente et le versement patronal sur salaires. Nexera désactive automatiquement les déclarations redondantes.",
      },
      {
        title: "3. Piloter le Cycle de Vie des Déclarations Génériques",
        content: "Créez et suivez n'importe quelle taxe locale (TFU, taxes sur véhicules, etc.) à travers les 4 statuts réglementaires : BROUILLON -> VALIDÉE -> DÉCLARÉE -> PAYÉE.",
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
    summary: "Compiler automatiquement la liasse financière (Système Normal ou SMT), faire certifier les comptes par le Cabinet d'expertise comptable (M6), prévisualiser dans la visionneuse in-app et exporter le PDF officiel.",
    readTime: "5 min",
    tags: ["liasse fiscale", "syscohada", "bilan", "compte de résultat", "visa cabinet", "m6", "pdf liasse"],
    steps: [
      {
        title: "1. Sélectionner le Système Comptable SYSCOHADA",
        content: "Choisissez votre référentiel obligatoire selon votre taille : Système Normal (grandes entreprises et PME) ou Système Minimal de Trésorerie (SMT - TPE).",
      },
      {
        title: "2. Générer / Actualiser la Liasse Fiscale (EF-024)",
        content: "Cliquez sur 'Générer la Liasse'. Nexera compile automatiquement le Bilan Actif/Passif, le Compte de Résultat, le résultat d'exploitation et le résultat comptable avant IS.",
      },
      {
        title: "3. Soumettre au Visa de l'Expert-Comptable (EF-026)",
        content: "Avant tout dépôt officiel, la liasse est examinée et validée par le Cabinet comptable partenaire (Module 6) qui appose son visa de conformité et de certification.",
      },
      {
        title: "4. Aperçu In-App et Téléchargement PDF pour Dépôt DGI",
        content: "Cliquez sur 'Aperçu' pour contrôler la liasse dans la visionneuse intégrée, ou sur 'Liasse Fiscale (PDF)' pour exporter le dossier certifié prêt au téléversement sur le portail e-Bilan de la DGI ou au dépôt physique.",
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
    legalRef: "Arrêté Ministériel n° 1085-C/MEF/CAB/SGM/DGI/DLC/159SGG20 (Bénin)",
    summary: "Générer et certifier le FEC à 18 colonnes normalisées obligatoire lors de tout contrôle fiscal informatisé, auditer l'équilibre Débit=Crédit et télécharger le fichier officiel.",
    readTime: "4 min",
    tags: ["fec", "arrêté 1085-c", "audit", "18 colonnes", "contrôle fiscal", "écritures"],
    steps: [
      {
        title: "1. Paramétrer le Séparateur et le Format",
        content: "Dans Export FEC (/fiscalite/fec), sélectionnez le séparateur officiel (Point-virgule ou Tabulation) et l'extension de fichier (.CSV ou .TXT).",
      },
      {
        title: "2. Lancer la Génération & l'Audit de Conformité (EF-005)",
        content: "Cliquez sur 'Générer & Auditer le FEC'. Nexera contrôle l'égalité stricte Débit = Crédit, la chronologie des écritures et la présence des 18 champs obligatoires légaux.",
      },
      {
        title: "3. Télécharger le Fichier Homologué",
        content: "Dès validation de la conformité (badge vert), téléchargez le fichier nommé selon le standard réglementaire : FEC_[IFU]_[AAAAMMJJ].",
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
    legalRef: "CGI Bénin 2026 Art. 485, 486, 487, 488 • Délais de réponse légaux",
    summary: "Enregistrer les avis de vérification fiscale, simuler le montant exact des pénalités du CGI 2026, enregistrer les redressements et consigner les recours contentieux.",
    readTime: "5 min",
    tags: ["contrôle fiscal", "pénalités", "redressement", "recours", "contentieux", "art 485", "art 488"],
    steps: [
      {
        title: "1. Simuler les Sanctions et Pénalités selon le CGI 2026",
        content: "Nexera applique la grille exacte des sanctions fiscales béninoises :\n• Défaut de déclaration dans les délais (Art. 485) : 20% des droits (porté à 40% après mise en demeure 30 jours).\n• Insuffisance ou omission (Art. 486) : 20% standard, 40% pour mauvaise foi ou résultat réel, 80% pour manœuvres frauduleuses.\n• Retard de paiement d'impôt ou d'acompte (Art. 487) : 10% forfaitaire.\n• Intérêt moratoire légal (Art. 488) : 0,25% par mois ou fraction de mois de retard.",
      },
      {
        title: "2. Enregistrer un Contrôle Fiscal (EF-034)",
        content: "Dès réception d'un avis de vérification (sur pièces, sur place, ponctuel), enregistrez la procédure avec les dates de début/fin et le service instructeur en charge.",
      },
      {
        title: "3. Consigner les Redressements et Introduire un Recours (EF-035)",
        content: "Enregistrez les chefs de redressement notifiés avec leurs montants de droits et pénalités. Suivez l'introduction des réclamations préalables, recours hiérarchiques ou juridictionnels jusqu'à leur décision finale.",
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
    legalRef: "CGI Bénin 2026 • Règle EF-008 (Double Validation Obligatoire des Barèmes)",
    summary: "Gérer les sources réglementaires (lois de finances, circulaires, arrêtés), versionner les barèmes d'impôt et tranches progressives, administrer les paramètres pays et appliquer la règle de validation croisée à 4 yeux.",
    readTime: "5 min",
    tags: ["veille", "référentiel", "barèmes", "circulaires", "lois", "ef-008", "double validation", "audit"],
    steps: [
      {
        title: "1. Qualifier les Sources Réglementaires",
        content: "Dans 'Veille Réglementaire', enregistrez toute nouvelle circulaire ou loi et pilotez son cycle de vie : A_QUALIFIER -> QUALIFIÉE -> PARAMÉTRAGE_EN_COURS -> APPLIQUÉE.",
      },
      {
        title: "2. Versionner les Barèmes et Tranches d'Imposition (EF-002)",
        content: "Consultez ou dupliquez les grilles de TVA, IS, AIB et Patente en vigueur. Toute modification crée une nouvelle version datée sans écraser l'historique.",
      },
      {
        title: "3. Appliquer la Règle de Double Validation EF-008 (Règle des Quatre Yeux)",
        content: "Un barème créé par un utilisateur reste au statut 'BROUILLON' : le système interdit formellement que le créateur valide son propre barème. Seul un second utilisateur habilité distinct peut valider et activer le barème en production, avec journalisation dans tax_journal_modification_bareme.",
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
