# Spécifications Fonctionnelles Détaillées (SFD) — Frontend Nexera ERP

---

## 1. Cartographie des Écrans de l'Application

L'interface de **Nexera ERP** est organisée en 4 groupes de routes majeurs via Next.js App Router :

```
front-endV1/src/app/
├── (full-width-pages)/          # Écrans d'authentification et d'onboarding
│   └── (auth)/                  # Login, Register, Forgot Password, Reset Password
│
├── (admin)/                     # Espace de travail Entreprise (Gestion Opérationnelle)
│   ├── page.tsx                 # Dashboard financier & commercial principal
│   ├── clients/                 # Gestion du référentiel tiers et fiches clients
│   ├── catalogue/               # Catalogue d'articles, prestations et grilles tarifaires
│   ├── devis/                   # Édition, suivi et conversion de devis commerciaux
│   ├── commandes/               # Bons de commande clients et suivi des livraisons
│   ├── factures/                # Facturation standard, avoirs, e-MECeF et téléchargement PDF
│   ├── encaissements/           # Enregistrement des règlements et balance âgée
│   ├── relances/                # Gestion des impayés et plans de relance
│   ├── stock/                   # Suivi des niveaux de stock et mouvements d'inventaire
│   ├── rh/                      # Salariés, contrats et bulletins de paie OHADA
│   ├── notes-frais/             # Dépenses professionnelles, justificatifs et avances
│   ├── rapports/                # Déclarations TVA, registre AIB et export FEC
│   ├── utilisateurs/            # Collaborateurs de l'entreprise et assignation des rôles
│   ├── roles/                   # Gestion des rôles personnalisés et permissions
│   └── parametres/              # Configuration entreprise, devises, taxes, e-MECeF
│
└── (cabinet)/                   # Espace de travail Cabinet d'Expertise Comptable
    └── cabinet/                 # Supervision du portefeuille de clients, révision, lettrage
```

---

## 2. Spécifications Détaillées par Module

### 2.1 Authentification & Sessions (`(auth)`)
- **Écran de Connexion (`/login`)** :
  - Saisie de l'adresse email et du mot de passe avec masquage/démasquage sécurisé.
  - Option « Se souvenir de moi » prolongeant la rétention du refresh token.
  - Redirection automatique vers le dernier espace visité ou vers le sélecteur de workspace si l'utilisateur possède plusieurs organisations.
- **Écran d'Inscription (`/register`)** :
  - Création simultanée de l'administrateur et de la raison sociale du tenant avec sélection de la devise de référence (XOF, EUR, USD).
- **Réinitialisation de Mot de Passe (`/forgot-password`, `/reset-password`)** :
  - Formulaire de demande avec captcha invisible et écran de saisie du nouveau mot de passe avec indicateur de complexité.

### 2.2 Dashboard Financier & Commercial (`/(admin)/page.tsx`)
- **Cartes d'Indicateurs Clés (KPI Cards)** :
  - Chiffre d'Affaires du mois (HT et TTC) avec variation en pourcentage par rapport au mois précédent.
  - Encaissements réels perçus sur la période.
  - Total des factures impayées échues avec répartition par tranche de retard (< 30j, 30-60j, > 60j).
  - Taux de factures certifiées e-MECeF.
- **Graphiques d'Évolution (ApexCharts)** :
  - Courbe mensuelle des ventes vs encaissements.
  - Diagramme circulaire de ventilation des ventes par catégorie d'articles.
- **Flux d'Activité Récent** :
  - Dernières factures émises, alertes de stocks bas et notifications de relance.

### 2.3 CRM & Fiches Clients (`/clients`)
- **Tableau Répertoire** : Liste filtrable par statut (`actif`, `inactif`), type (`entreprise`, `particulier`) et tranche d'encours.
- **Fiche Client 360°** :
  - Onglet Informations Générales (Raison sociale, IFU, RCCM, adresse de facturation et de livraison).
  - Onglet Contacts (Multi-interlocuteurs avec fonction, email et téléphone direct).
  - Onglet Historique Financier (Liste chronologique de tous les devis, commandes et factures du client).
  - Onglet Solde & Encours (Graphique de la balance âgée et solde restant dû en temps réel).

### 2.4 Devis Commerciaux (`/devis`)
- **Formulaire de Chiffrage Dynamique** :
  - Ajout de lignes d'articles avec recherche instantanée dans le catalogue.
  - Sélection du taux de remise unitaire ou remise globale en pied de document.
  - Calcul en direct des montants de TVA et de l'AIB prévisionnel.
- **Gestion des Événements** :
  - Bouton « Envoyer par Email » ouvrant une modale de prévisualisation du message avec le devis PDF généré en pièce jointe.
  - Bouton « Convertir en Commande » ou « Convertir en Facture » transférant l'ensemble des lignes sans ressaisie.

### 2.5 Factures & Certification Fiscale e-MECeF (`/factures`)
- **Écran de Création / Modification (`/factures/create`, `/factures/[id]/edit`)** :
  - Saisie des lignes de facturation, vérification de l'IFU du client sélectionné.
  - Calcul de l'AIB : si le client possède un IFU valide, l'AIB est automatiquement pré-sélectionné à 1% (Type A) ; si aucun IFU n'est saisi, l'AIB bascule sur 5% (Type B) avec possibilité de basculer sur Aucun (`NONE`).
- **Écran de Consultation Détaillée (`/factures/[id]`)** :
  - **En-tête de Statut** : Badges d'état de facturation (`draft`, `issued`, `paid`) et d'état de normalisation fiscale (`MecefStatusBadge`).
  - **Bouton d'Action « Émettre la facture »** : Fige la facture et lui attribue son numéro légal officiel séquentiel.
  - **Modale de Normalisation Fiscale (`NormalizeInvoiceModal`)** :
    - Permet de confirmer le taux d'AIB et les notes fiscales avant envoi.
    - Déclenche l'appel vers l'API DGI avec animation de chargement *« Certification e-MECeF en cours auprès de la DGI... »*.
  - **Composant Sceau Fiscal (`MecefCertificationCard`)** :
    - Si la normalisation réussit : affichage du sceau officiel vert émeraude, affichage des compteurs séquentiels DGI (ex. `15/45 FV`), affichage du code de sécurité cryptographique avec bouton de copie, et rendu du **QR Code DGI haute résolution**.
    - Si la normalisation échoue : bannière d'alerte rouge affichant le message d'erreur précis renvoyé par la DGI (ex. IFU invalide, service indisponible) et bouton de reprise immédiate **« Réessayer e-MECeF »**.
  - **Bouton de Téléchargement PDF** : Télécharge instantanément le PDF légal avec son QR Code officiel intégré.

### 2.6 Encaissements & Suivi des Règlements (`/encaissements`)
- **Formulaire d'Encaissement** :
  - Sélection du client payeur -> affichage automatique de la liste de ses factures impayées avec cases à cocher.
  - Saisie du montant perçu et répartition automatique ou manuelle sur les factures sélectionnées.
  - Choix du mode de règlement (Virement, Chèque, Espèces, Mobile Money) et référence de pièce.
- **Bordereau & Reçu de Paiement** : Génération immédiate du reçu de paiement client en PDF.

### 2.7 Ressources Humaines & Moteur de Paie OHADA (`/rh`)
- **Gestion du Personnel** : Annuaire des salariés avec photo, matricule, contrat (CDI/CDD), date d'embauche, salaire de base et nombre d'enfants à charge.
- **Période de Paie Mensuelle** :
  - Tableau de saisie rapide des variables du mois (primes, heures supplémentaires, absences, acomptes).
  - Bouton « Calculer la Paie » déclenchant le moteur de calcul salarial OHADA/Bénin.
  - Affichage instantané du brut, des cotisations CNSS ouvrières et patronales, de l'IPTS, du VPS et du net à payer.
  - Téléchargement individuel ou archivage groupé de tous les bulletins de paie vectoriels conformes.

### 2.8 Notes de Frais & Missions (`/notes-frais`)
- **Saisie Salarié** : Formulaire simplifié avec sélecteur de catégorie (Repas, Déplacement, Hébergement), montant, TVA et zone de glisser-déposer de la photo du reçu.
- **Tableau de Bord d'Approbation** : Vue dédiée pour les managers et comptables permettant d'examiner le justificatif agrandi et de valider ou rejeter la dépense en 1 clic.

### 2.9 Espace Cabinet d'Expertise Comptable (`/cabinet`)
- **Vue Portefeuille Multi-Dossiers** :
  - Grille des entreprises clientes suivies par le cabinet avec statut déclaratif, volume de facturation du mois et date de dernière clôture.
- **Accès Supervisé au Dossier** :
  - L'expert-comptable entre dans le dossier client et bénéficie d'outils exclusifs : lettrage des comptes généraux et auxiliaires, pointage de TVA et validation préalable à l'export du fichier FEC (Arrêté 1085-C).

### 2.10 Paramétrage de l'Entreprise (`/parametres`)
- **Organisation & Mentions Légales** : Raison sociale, IFU, RCCM, adresse, logo pour les documents PDF.
- **Configuration e-MECeF DGI** : Renseignement du NIM officiel, de la clé API secrète DGI, de l'URL de production et de l'activation de l'auto-normalisation.
- **Devises & Numérotation** : Définition des masques de numérotation séquentielle et des devises de facturation autorisées.
