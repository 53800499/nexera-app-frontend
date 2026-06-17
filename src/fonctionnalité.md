SPÉCIFICATIONS FONCTIONNELLES
DÉTAILLÉES


Module 1 — Facturation & Gestion Commerciale
Plateforme NEXERA ERP — Premier Livrable





Projet
NEXERA — ERP + Cabinet d'Expertise Comptable
Document
Spécifications Fonctionnelles Détaillées (SFD)
Module
Module 1 — Facturation & Gestion Commerciale
Version
1.0 — Initiale
Date
2026
Statut
✅ Approuvé pour développement
Destinataire
Équipe de développement


1. Contexte et Périmètre du Module



1.1 Objectif du module
Le module Facturation & Gestion Commerciale est le premier livrable de la plateforme NEXERA. Il couvre l'intégralité du cycle de vente : de la gestion des clients et du catalogue produits jusqu'au suivi des encaissements et aux relances, en passant par la création de devis, bons de commande et factures.
Ce module est le pilier commercial de chaque espace entreprise. Il est également le premier point de contact entre les données opérationnelles de l'entreprise et les modules Comptabilité (écritures automatiques) et Stock (déduction automatique).

1.2 Périmètre inclus — v1.0
Gestion du référentiel clients et contacts
Gestion du catalogue articles et services
Création et gestion des devis
Création et gestion des bons de commande
Création et gestion des factures (simples, proforma, acompte, avoir)
Factures récurrentes automatiques
Suivi des encaissements et balance âgée
Relances automatiques et manuelles
Tableau de bord commercial
Paramétrage : taxes, conditions de paiement, modèles de documents
1.3 Périmètre exclu — prévu dans modules futurs
Gestion des achats et fournisseurs → Module Stock
Écritures comptables → Module Comptabilité (intégration via événements)
Déduction de stock → Module Gestion des Stocks (intégration via événements)
Gestion des notes de frais → Module Notes de Frais
1.4 Utilisateurs concernés
RÔLE
ACCÈS
ACTIONS AUTORISÉES
Dirigeant / Promoteur
Lecture + Écriture
Toutes les fonctionnalités du module
Responsable Commercial
Lecture + Écriture
Clients, devis, commandes, factures, encaissements
Commercial
Lecture + Écriture partielle
Ses clients uniquement, devis et commandes
Comptable
Lecture
Consultation factures, encaissements, exports
Expert-Comptable
Lecture
Consultation depuis l'Espace Cabinet
Collaborateur Cabinet
Lecture
Consultation depuis l'Espace Cabinet


2. Cas d'Utilisation (Use Cases)
UC-01 — Créer et gérer un client
Description
L'utilisateur crée une fiche client complète dans le référentiel. La fiche client est le point de départ de toutes les transactions commerciales.
Flux principal
1. Accès : L'utilisateur navigue vers Clients > Nouveau client
2. Saisie : Remplit le formulaire : raison sociale ou nom, IFU, RCCM,  type (entreprise/particulier), secteur, contact principal, adresse facturation, adresse livraison
3. Conditions : Définit les conditions commerciales : devise, conditions de paiement par défaut, taux de remise, plafond d'encours
4. Sauvegarde : Le système valide, génère un code client unique et enregistre la fiche
5. Confirmation : Le système affiche la fiche client créée avec son historique vide

Flux alternatifs
Doublon détecté : si un client avec le même nom/IFU existe, le système affiche un avertissement avant création
Import en masse : création de clients par import CSV/Excel depuis un ancien logiciel

Règles métier
ID
RÈGLE
COMPORTEMENT
RM-C01
Code client unique
Généré automatiquement, format CLT-XXXXXX, non modifiable
RM-C02
Champs obligatoires
Raison sociale + au moins un contact + adresse de facturation
RM-C03
Détection de doublon
Alerte si SIRET ou email identique — création possible après confirmation
RM-C04
Historique complet
La fiche client affiche toutes ses transactions (devis, factures, paiements)
RM-C05
Archivage
Un client peut être archivé (masqué) mais jamais supprimé si il a des transactions

UC-02 — Créer et gérer le catalogue
Description
L'utilisateur gère le catalogue des articles (produits physiques) et services. Le catalogue est partagé entre tous les modules.
Flux principal
1. Accès : Navigation vers Catalogue > Nouvel article
2. Saisie : Référence, désignation, type (article/service/forfait), catégorie, unité de mesure
3. Tarification : Prix de vente HT, taux de TVA applicable, remise maximale autorisée
4. Stock (si article physique) : Liaison avec le module stock : unité de stockage, seuil d'alerte (facultatif en v1.0)
5. Sauvegarde : Le système génère une référence unique et enregistre
Règles métier
ID
RÈGLE
COMPORTEMENT
RM-A01
Référence article unique
Générée automatiquement ART-XXXXXX, ou saisie manuelle unique
RM-A02
Prix négatif interdit
Le prix HT doit être >= 0 (0 accepté pour articles offerts)
RM-A03
TVA obligatoire
Taux de TVA obligatoire parmi les taux paramétrés (0% autorisé)
RM-A04
Archivage
Un article utilisé dans une transaction ne peut être supprimé — archivage uniquement
RM-A05
Tarifs multiples
Possibilité de définir des tarifs par client ou groupe de clients


UC-03 — Créer un devis
Description
L'utilisateur crée un devis commercial pour un client, sélectionne les articles/services, applique les remises, et génère un PDF à envoyer. Le devis peut être converti en bon de commande ou facture.

Flux principal
1. Accès : Navigation vers Devis > Nouveau devis
2. En-tête : Sélection du client (auto-complétion), date du devis, date de validité, référence interne
3. Lignes : Ajout de lignes : sélection article/service, quantité, prix unitaire (modifiable), remise ligne (%), TVA
4. Totaux : Le système calcule automatiquement : sous-total HT, remise globale, base TVA par taux, montant TVA, total TTC
5. Conditions : Saisie des conditions de paiement, délai de livraison, notes et mentions légales
6. Prévisualisation : Aperçu PDF avant envoi
7. Envoi : Envoi par email depuis l'interface ou téléchargement PDF
8. Statut : Le devis passe au statut ENVOYÉ

États du devis
STATUT
CODE
DÉCLENCHEUR
Brouillon
DRAFT
Devis créé mais non envoyé
Envoyé
SENT
Devis envoyé au client (email ou PDF téléchargé)
Vu
VIEWED
Client a ouvert le lien email (tracking optionnel)
Accepté
ACCEPTED
Client a accepté (manuellement par l'utilisateur ou signature électronique future)
Refusé
DECLINED
Client a refusé
Expiré
EXPIRED
Date de validité dépassée sans réponse — automatique
Converti
CONVERTED
Devis converti en bon de commande ou facture





Règles métier
ID
RÈGLE
COMPORTEMENT
RM-D01
Numérotation automatique
Format paramétrable : DEV-AAAA-XXXXXX (ex: DEV-2025-000001), séquentielle et immuable
RM-D02
Calcul TVA
TVA calculée ligne par ligne puis agrégée par taux. Arrondi au centime inférieur.
RM-D03
Remise
Remise en % ou en montant, par ligne et/ou globale. Remise globale appliquée après remises lignes.
RM-D04
Un devis = un client
Un devis ne peut pas être multi-clients. Client non modifiable après premier enregistrement.
RM-D05
Conversion
Un devis ACCEPTED peut être converti en BC ou facture. Les données sont copiées, le devis passe à CONVERTED.
RM-D06
Modification
Un devis SENT peut-être modifié (nouvelle version). Le PDF précédent est archivé.
RM-D07
Suppression
Un devis CONVERTED ne peut pas être supprimé. Un DRAFT peut être supprimé.


UC-04 — Créer un bon de commande
Description
Le bon de commande formalise l'accord commercial. Il peut être généré depuis un devis (conversion) ou créé de toutes pièces. Il peut être partiellement ou totalement facturé.

États du bon de commande
STATUT
CODE
DÉCLENCHEUR
Brouillon
DRAFT
BC créé non confirmé
Confirmé
CONFIRMED
BC validé par l'utilisateur
En cours
IN_PROGRESS
Au moins une facture partielle créée
Facturé
FULLY_BILLED
100% du montant BC facturé
Annulé
CANCELLED
BC annulé (possible uniquement si aucune facture)


Règles métier spécifiques
ID
RÈGLE
COMPORTEMENT
RM-BC01
Numérotation
Format BC-AAAA-XXXXXX. Séquentielle et immuable dès CONFIRMED.
RM-BC02
Facturation partielle
Un BC peut générer plusieurs factures (acomptes + solde). Suivi du reste à facturer.
RM-BC03
Lien devis
Si issu d'un devis, la référence du devis est stockée et affichée. Traçabilité complète.


UC-05 — Créer et gérer les factures
Description
La facturation est la fonctionnalité centrale du module. Elle couvre tous les types de factures du cycle de vente et doit respecter les normes légales de numérotation et d'intégrité.
Types de factures
TYPE
DESCRIPTION
Facture simple ou normalisée
Facture standard d'une vente de biens ou services
Facture proforma
Document non comptable utilisé avant la vente définitive. Ne génère pas d'écriture.
Facture d'acompte
Facture partielle sur un bon de commande. Déduite de la facture de solde.
Facture de solde
Solde d'un BC après un ou plusieurs acomptes. Déduit les acomptes automatiquement.
Avoir
Annulation partielle ou totale d'une facture. Valeur négative. Peut être imputé sur une future facture.
Facture récurrente
Modèle de facture généré automatiquement à une fréquence définie (mensuelle, trimestrielle...).


États de la	 facture
STATUT
CODE
DÉCLENCHEUR / CONDITION
Brouillon
DRAFT
Facture créée non finalisée
Émise
ISSUED
Facture finalisée — numéro attribué — non modifiable
Normalisée
NORM
Facture contenant le code QR de la DGI (Impôts)
Envoyée
SENT
Facture transmise au client (email, portail, PDF)
Partiellement payée
PARTIAL
Au moins un encaissement enregistré, solde restant > 0
Payée
PAID
Montant TTC intégralement encaissé
En retard
OVERDUE
Date d'échéance dépassée, solde restant > 0 — automatique
Annulée (avoir)
CANCELLED
Avoir total émis sur cette facture

Règles métier — Facturation
ID
RÈGLE
COMPORTEMENT
RM-F01
Numérotation légale
Séquentielle, chronologique, sans trou, sans doublon. Format FAC-AAAA-XXXXXX. Non modifiable une fois ISSUED.
RM-F02
Immuabilité
Une facture ISSUED ne peut plus être modifiée. Correction = avoir + nouvelle facture.
RM-F03
Calcul TVA
Identique aux devis. Multi-taux supporté. Base arrondie par taux avant calcul TVA.
RM-F04
Acomptes
Les factures d'acompte sont déduites automatiquement dans la facture de solde. Traçabilité des acomptes.
RM-F05
Avoir
Un avoir doit référencer la facture d'origine. Montant de l'avoir <= montant de la facture originale.
RM-F06
Multi-devises
Une facture peut être en devise étrangère. Le taux de change est enregistré à la date de la facture.
RM-F07
Mentions légales
Numéro de facture, date, raison sociale vendeur, N° TVA intracommunautaire, RIB si demandé, conditions de paiement.
RM-F08
Récurrentes
Génération automatique J-7 avant la prochaine échéance avec notification. Statut DRAFT jusqu'à validation.


UC-06 — Enregistrer un encaissement
Description
L'utilisateur enregistre le paiement reçu d'un client sur une ou plusieurs factures. Un paiement peut couvrir partiellement ou totalement une facture.

Flux principal
1. Accès : Navigation vers Encaissements > Nouveau paiement ou depuis la fiche facture > Enregistrer paiement
2. Sélection : Sélection du client, affichage de toutes ses factures impayées ou partiellement payées
3. Saisie : Montant reçu, date de réception, mode de paiement (virement, chèque, espèces, CB), référence transaction
4. Imputation : Imputation automatique sur la facture la plus ancienne d'abord (FIFO), ou imputation manuelle par l'utilisateur
5. Validation : Le système met à jour les statuts des factures affectées
6. Écriture : Événement déclenché vers le module Comptabilité pour enregistrement automatique

Règles métier — Encaissements
ID
RÈGLE
COMPORTEMENT
RM-E01
Paiement > Montant facture
Trop-perçu enregistré comme avance client, utilisable sur prochaine facture
RM-E02
Imputation automatique
Par défaut : facture la plus ancienne en premier (FIFO). Modifiable manuellement.
RM-E03
Paiement en devise
Écart de change calculé et enregistré
RM-E04
Annulation
Un encaissement peut être annulé (erreur de saisie). Motif obligatoire. Trace conservée.


UC-07 — Relances clients
Description
Le système gère des relances automatiques ou manuelles pour les factures impayées au-delà de leur échéance.




Scénarios de relance
NIVEAU
DÉLAI
ACTION
Niveau 1 — Rappel
J+3 après échéance
Email automatique courtois. Objet : Rappel facture FAC-XXXX
Niveau 2 — Relance
J+15 après échéance
Email ferme avec récapitulatif des factures dues. Copie au responsable commercial.
Niveau 3 — Mise en demeure
J+30 après échéance
Email formel. Alerte au dirigeant. Blocage automatique de nouveaux devis/commandes si paramétrés.
Manuel
À tout moment
L'utilisateur peut déclencher une relance manuelle avec message personnalisé.


Règles métier — Relances
Les niveaux de relance et délais sont entièrement paramétrables par l'administrateur
Les relances peuvent être désactivées par client (client VIP, accord de paiement en cours)
Chaque relance envoyée est tracée dans l'historique de la facture et du client
L'IA analyse le comportement de paiement de chaque client et peut suggérer d'ajuster les délais

UC-08 — Tableau de bord commercial
Description
Le tableau de bord offre une vision temps réel de l'activité commerciale pour le dirigeant et le responsable commercial.

Indicateurs obligatoires (KPIs)
INDICATEUR
TYPE
CALCUL / SOURCE
Chiffre d'affaires période
Numérique
Somme HT des factures ISSUED de la période sélectionnée
CA vs période précédente
Variation %
Comparaison CA période / CA même période N-1
Nombre de factures émises
Compteur
Count factures ISSUED de la période
Montant impayés total
Alerte
Somme TTC des factures OVERDUE
Taux de conversion devis
Ratio %
Devis CONVERTED / Total devis SENT × 100
Top 5 clients (CA)
Classement
Clients triés par CA facturé sur la période
Top 5 articles/services
Classement
Articles triés par CA généré sur la période
Balance âgée clients
Critique
Impayés segmentés : 0-30j / 31-60j / 61-90j / +90j
Factures à échéance J+7
Attention
Factures SENT/PARTIAL avec échéance dans les 7 prochains jours



3. Règles de Calcul et Formules


3.1 Calcul d'une ligne de facture
CHAMP
FORMULE
Montant brut HT
quantite × prix_unitaire_ht
Remise ligne
montant_brut_ht × (remise_ligne_pct / 100)
Montant net HT ligne
montant_brut_ht − remise_ligne
Montant TVA ligne
montant_net_ht_ligne × (taux_tva / 100) — arrondi au centime
Montant TTC ligne
montant_net_ht_ligne + montant_tva_ligne


3.2 Calcul des totaux d'un document
CHAMP
FORMULE
Sous-total HT
Somme des montants nets HT de toutes les lignes
Remise globale
sous_total_ht × (remise_globale_pct / 100)
Base HT après remise
sous_total_ht − remise_globale
TVA par taux
Pour chaque taux TVA : Somme des bases HT lignes × taux — agrégé par taux
Total TVA
Somme de toutes les TVA par taux
Total TTC
base_ht_apres_remise + total_tva
Reste à payer
total_ttc − somme_encaissements_imputés


3.3 Gestion des arrondis
Tous les calculs intermédiaires sont effectués avec 6 décimales
L'arrondi final est appliqué au centime (2 décimales) en utilisant la règle du demi-en-haut (round half up)
La TVA est calculée et arrondie par taux, jamais par ligne
En cas de multi-devises : le taux de change est enregistré à 6 décimales à la date de la facture


4. Interfaces Utilisateur — Wireframes Fonctionnels
4.1 Structure de navigation du module
Menu principal > Gestion Commerciale
Clients (liste, fiche, nouveau)
Catalogue (articles, services, catégories)
Devis (liste, détail, nouveau)
Commandes (liste, détail, nouveau)
Factures (liste, détail, nouvelle)
Encaissements (liste, nouveau, balance âgée)
Relances (tableau de bord, historique)
Rapports (CA, top clients, top articles)
Paramètres (taxes, conditions paiement, numérotation, modèles)

4.2 Comportements UI obligatoires
COMPOSANT
COMPORTEMENT ATTENDU
Sélection client/article
Auto-complétion dès 2 caractères tapés. Affiche code + nom + info clé. Navigation clavier supportée.
Lignes de document
Ajout/suppression de lignes dynamiques. Recalcul immédiat des totaux à chaque modification.
Champs montant
Formatage automatique avec séparateur de milliers. Accepte la virgule ET le point comme décimale.
Dates
Sélecteur de date. Format affiché selon paramètre entreprise (JJ/MM/AAAA ou MM/DD/YYYY). Stockage ISO 8601.
Statuts
Badges colorés : DRAFT gris, SENT bleu, ACCEPTED vert, OVERDUE rouge, PAID vert foncé.
Bouton Enregistrer
Désactivé pendant la sauvegarde (anti-doublon). Validation côté client avant envoi.
Confirmation suppression
Modal de confirmation obligatoire. Mention de l'impact (lignes liées, etc.)
Mode hors-ligne
Badge rouge visible. Toutes les actions continuent. Indicateur de sync après reconnexion.



5. Génération des Documents PDF
5.1 Contenu obligatoire d'une facture (normes légales)
N°
ÉLÉMENT
PRÉCISION
1
Numéro de facture
Unique, séquentiel, sur chaque page
2
Date d'émission
Date à laquelle la facture est ISSUED
3
Identité du vendeur
Raison sociale, adresse, numéro d'immatriculation, N° TVA si applicable
4
Identité du client
Raison sociale ou nom, adresse de facturation
5
Description des prestations
Désignation, quantité, prix unitaire HT, taux TVA par ligne
6
Montants
Sous-total HT, remises, base TVA par taux, montant TVA, total TTC
7
Conditions de paiement
Date d'échéance, mode de paiement accepté, pénalités de retard
8
Mentions légales
Selon pays : RCS, SIREN/SIRET, capital social, N° TVA intracommunautaire


5.2 Personnalisation des modèles
Logo de l'entreprise (upload PNG/JPG/SVG)
Couleurs primaire et secondaire du document
Police de caractères (parmi une liste prédéfinie)
En-tête et pied de page personnalisés
Mentions légales et CGV configurables
Numérotation des pages (Page X/Y)
Minimum 3 modèles de mise en page disponibles au lancement

5.3 Envoi des documents
Envoi par email depuis l'interface (serveur SMTP paramétrable ou SendGrid)
Corps de l'email personnalisable avec variables (nom client, N° facture, montant, échéance)
Suivi d'ouverture email (optionnel, tracking pixel)
Lien de téléchargement sécurisé inclus dans l'email
Téléchargement manuel en PDF depuis l'interface


6. Intégrations avec les Autres Modules
6.1 Architecture d'intégration
Les intégrations entre modules se font via un système d'événements (event-driven). Quand une action se produit dans le module Facturation, un événement est publié. Les modules concernés (Comptabilité, Stock) s'y abonnent et réagissent de manière asynchrone. Cela garantit le découplage et la résilience.

6.2 Événements publiés par ce module
ÉVÉNEMENT
DÉCLENCHEUR
DONNÉES TRANSMISES
invoice.issued
Facture passe à ISSUED
ID facture, client, lignes (articles, qté, montants HT/TVA/TTC), date
invoice.cancelled
Avoir émis sur une facture
ID facture originale, ID avoir, montants
payment.recorded
Encaissement enregistré
ID paiement, ID factures imputées, montants, date, mode paiement
payment.cancelled
Encaissement annulé
ID paiement annulé, motif
quotation.converted
Devis converti
ID devis, ID document cible (BC ou facture)


6.3 Abonnements aux événements d'autres modules
ÉVÉNEMENT ÉCOUTÉ
MODULE SOURCE
ACTION DÉCLENCHÉE
stock.level_updated
Module Stock
Mise à jour de la disponibilité affichée sur la fiche article dans le catalogue
stock.item_archived
Module Stock
Alerte si l'article est encore utilisé dans des devis ou BC ouverts



7. Exigences Non Fonctionnelles



CATÉGORIE
MÉTRIQUE
EXIGENCE
Performance
Temps de réponse
< 1s pour 95% des requêtes de liste. < 2s pour génération PDF.
Performance
Pagination
Listes paginées à 50 éléments par défaut. Recherche côté serveur.
Disponibilité
SLA
99,9% de disponibilité mensuelle hors maintenance planifiée
Sécurité
Accès
Vérification des permissions à chaque endpoint API. Pas de bypass possible.
Sécurité
Données
Isolation multi-tenant au niveau base de données (Row-Level Security). Chiffrement en transit (TLS 1.3).
Hors-ligne
Continuité
Toutes les actions de création/modification sont disponibles hors-ligne et synchronisées.
Audit
Traçabilité
Toute modification d'une facture/devis/encaissement est tracée dans un journal immuable.
Compatibilité
Navigateurs
Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Progressive Web App.
Accessibilité
Standard
WCAG 2.1 Niveau AA.
Internationalisation
Langues
Architecture i18n dès le départ. Langue par défaut : Français. Anglais en v1.1.



8. Paramétrage du Module

Tous les paramètres ci-dessous sont configurables par l'administrateur de l'entreprise (ou par l'Expert-Comptable depuis l'Espace Cabinet).

PARAMÈTRE
DESCRIPTION & VALEURS
Numérotation des documents
Préfixe, suffixe, longueur du compteur, remise à zéro annuelle. Exemples : FAC-2025-000001, 2025/F/001
Taux de TVA
Liste des taux TVA applicables (ex: 0%, 10%, 18%, 20%). Taux par défaut paramétrable.
Conditions de paiement
Liste des conditions : 30j, 60j, 30j fin de mois, comptant, etc. Condition par défaut.
Devises
Devise principale de l'entreprise. Devises secondaires acceptées. Source des taux de change (manuel ou API).
Modèles d'email
Modèles personnalisables pour : envoi devis, envoi facture, rappel, relance N1, N2, N3.
Seuils de relance
Délais J+X pour chaque niveau de relance. Activation/désactivation des relances automatiques.
Modèles de documents PDF
Logo, couleurs, polices, mentions légales, en-tête, pied de page.
Pénalités de retard
Taux annuel des pénalités de retard à afficher sur les factures (obligatoire selon certaines législations).



9. Glossaire



TERME
DÉFINITION
Avoir
Document comptable émis par le vendeur annulant partiellement ou totalement une facture précédemment émise. Valeur négative.
Balance âgée
État des créances clients classé par tranche d'ancienneté d'impayés : 0-30j, 31-60j, 61-90j, +90j.
BC
Bon de Commande — Document formalisant l'accord commercial entre vendeur et acheteur.
Devis
Document non contractuel proposant des prix pour des biens ou services. Devient contractuel après acceptation.
Devise
Monnaie utilisée pour libeller une transaction (ex: EUR, USD, XOF).
Encours client
Montant total des factures impayées d'un client à un instant T.
Facture proforma
Document préfigurant une facture, non comptable, utilisé avant la livraison ou pour formalités douanières.
HT
Hors Taxes — Montant avant application de la TVA.
Imputat. paiement
Action d'affecter un paiement reçu à une ou plusieurs factures spécifiques.
Multi-tenant
Architecture où plusieurs entreprises (tenants) partagent la même infrastructure logicielle avec isolation complète des données.
SYSCOHADA
Système Comptable OHADA — Référentiel comptable harmonisé des pays membres de l'OHADA (17 pays d'Afrique).
TTC
Toutes Taxes Comprises — Montant après application de la TVA.
TVA
Taxe sur la Valeur Ajoutée — Impôt indirect collecté par l'entreprise pour le compte de l'État.





Fin du document SFD — Module Facturation & Gestion Commerciale
NEXERA ERP · Version 1.0 · Document approuvé pour développement






2.3 Deux espaces, un seul moteur
La plateforme est structurée en deux espaces fonctionnels distincts partageant la même infrastructure : 
L'Espace Cabinet : interface et fonctionnalités dédiées à l'expert-comptable et ses collaborateurs
L'Espace Entreprise : interface et fonctionnalités dédiées à chaque entreprise cliente
Les deux espaces sont liés par un moteur central partagé : authentification, IA, synchronisation, conformité, migration des données, API et audit.
3. Espace Cabinet — Pilotage Multi-portefeuille


L'Espace Cabinet est le cœur différenciateur de la plateforme. Il est conçu exclusivement pour l'expert-comptable et ses collaborateurs, leur permettant de piloter l'ensemble du portefeuille clients depuis une interface centralisée.
3.1 Cockpit de pilotage — Vue Dirigeant Cabinet
Le cockpit est la page d'accueil de l'expert-comptable. Il offre une vision consolidée et temps réel de l'état de santé de toutes les entreprises du portefeuille.
Tableau de bord agrégé : chiffres clés de toutes les entreprises (CA, trésorerie, masse salariale, impayés)
Alertes prioritaires globales : entreprises en difficulté, échéances fiscales imminentes, anomalies comptables détectées par l'IA
Carte de chaleur du portefeuille : visualisation rapide de l'état de chaque dossier (vert / orange / rouge)
Indicateurs de performance du cabinet : productivité par collaborateur, avancement des dossiers, facturation cabinet
Accès en un clic à n'importe quelle entreprise du portefeuille

3.2 Gestion des dossiers et des collaborateurs
Gestion du portefeuille
Création et paramétrage de chaque dossier entreprise (secteur, régime fiscal, plan comptable applicable)
Statut de chaque dossier : en cours, révision en attente, clôturé, liasse envoyée
Calendrier fiscal centralisé : toutes les échéances de toutes les entreprises en un seul endroit
Messagerie sécurisée intégrée : canal de communication direct expert-client au sein de chaque dossier

Affectation et gestion des collaborateurs
Création de comptes collaborateurs avec définition précise de leurs droits
Affectation de dossiers entreprises à chaque collaborateur — ex : 10 dossiers sur 50 pour un collaborateur
Un collaborateur ne voit que les dossiers qui lui sont affectés
Supervision en temps réel : l'expert-comptable voit tout ce que fait chaque collaborateur sur chaque dossier
Tableau de charge : répartition des dossiers par collaborateur, alertes de surcharge
Journal des activités : toutes les actions de chaque collaborateur sont tracées et visibles

3.3 Outils de révision comptable
Ces outils sont le fossé concurrentiel du cabinet — ils font ce qu'aucun ERP généraliste ne sait faire.
Dossier de révision numérique : feuilles de travail standardisées par cycle (achats, ventes, trésorerie, paie)
Feuille de travail IA : l'IA prépare une première version du dossier de révision, le collaborateur valide
Points de contrôle automatiques : vérification des soldes, équilibres, cohérences inter-cycles
Système de questions-réponses avec le client directement dans le dossier
Archivage des dossiers de révision par exercice fiscal

3.4 Production de la liasse fiscale
Génération automatique de la liasse fiscale depuis les données comptables saisies
Formulaires fiscaux pré-remplis : 2050, 2051, 2052, 2053, 2054, 2058 A et toutes annexes
Contrôles de cohérence automatiques avant envoi
Télédéclaration directe (EDI) vers les autorités fiscales
Archivage légal des liasses avec horodatage certifié
Adaptable à chaque pays et référentiel : SYSCOHADA, SYCEBNL, PCG, OHADA, IFRS

3.5 Relation client cabinet
Portail client sécurisé : le dirigeant peut déposer des documents, suivre ses dossiers, communiquer
Demandes de pièces : l'expert envoie une liste de documents à fournir, le client les dépose directement
Lettres de mission numériques : génération, envoi et signature électronique intégrés
Attestation de présentation des états financiers : Numérique, génération automatique
Facturation cabinet : honoraires, temps passé, facturation des missions


4. Espace Entreprise — ERP Complet



L'Espace Entreprise est l'ERP à proprement parler. Chaque entreprise du portefeuille dispose de son propre espace isolé, avec l'ensemble des modules métier. L'expert-comptable et les collaborateurs affectés peuvent y accéder en lecture et, selon les droits, en écriture.
4.1 Module Facturation & Gestion Commerciale  ★ Premier livrable
Gestion clients et prospects : fiches complètes, historique, encours, conditions tarifaires
Catalogue produits et services : tarifs, remises, multi-devises, multi-taxes
Devis, bons de commande, factures, avoirs, factures récurrentes
Conversion en un clic : Devis → BC → Facture — numérotation automatique conforme, normalisation
Suivi des encaissements, balance âgée, relances intelligentes
Tableau de bord commercial temps réel : CA, top clients, top produits, conversion
Intégration directe avec la comptabilité : toute facture génère automatiquement ses écritures
4.2 Module Gestion des Stocks
Référentiel articles : codes-barres, QR codes, familles, unités de mesure
Mouvements de stock : entrées, sorties, transferts, pertes, inventaire
Multi-entrepôts et multi-sites
Valorisation FIFO, LIFO, CMUP — Traçabilité lots, séries, dates de péremption
Alertes intelligentes et réapprovisionnement automatique
Déduction automatique au moment de la vente (intégration module Facturation)

