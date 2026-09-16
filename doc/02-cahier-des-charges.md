# Cahier des Charges — Frontend Nexera ERP

---

## 1. Objectif du Document
Ce cahier des charges formalise les exigences fonctionnelles et non-fonctionnelles encadrant l'interface utilisateur de **Nexera ERP**.

---

## 2. Exigences Fonctionnelles d'Interface (EFI)

### EFI-01 : Authentification & Gestion de Session
- **EFI-01.1** : Écran de connexion unifié avec saisie email/mot de passe et gestion du statut « Se souvenir de moi ».
- **EFI-01.2** : Renouvellement transparent de la session : lorsque le token d'accès expire (15 min), l'application doit automatiquement appeler `/api/auth/refresh` en arrière-plan sans interrompre la saisie de l'utilisateur.
- **EFI-01.3** : Sélecteur d'espace de travail (*Workspace Switcher*) permettant de basculer entre l'espace entreprise classique et l'espace cabinet pour les utilisateurs éligibles.

### EFI-02 : Parcours de Vente & Émission de Factures
- **EFI-02.1** : Formulaire de création de devis/facture avec auto-complétion intelligente des clients et des articles du catalogue.
- **EFI-02.2** : Calcul instantané côté client des sous-totaux HT, remises (pourcentage ou montant), bases de TVA ventilées par groupe et total TTC.
- **EFI-02.3** : Bloc de synthèse fiscale affichant clairement l'AIB (1% ou 5%) selon que l'IFU du client sélectionné est renseigné ou non.
- **EFI-02.4** : Bouton d'action contextuel « Émettre la facture » transformant le brouillon en document définitif inaltérable avec confirmation préalable.

### EFI-03 : Composants Visuels e-MECeF DGI Bénin
- **EFI-03.1** : Modale dédiée de normalisation (`NormalizeInvoiceModal`) permettant de choisir le type d'AIB avant envoi à la DGI.
- **EFI-03.2** : Carte de certification e-MECeF (`MecefCertificationCard`) affichant :
  - Le badge de conformité officiel (vert émeraude en cas de succès, rouge en cas d'erreur avec message explicatif retourné par la DGI).
  - Le Code de sécurité cryptographique avec bouton de copie en 1 clic dans le presse-papiers.
  - Le QR Code haute définition généré dynamiquement sur Canvas, flashable directement à l'écran.
  - Le bouton de reprise d'urgence « Réessayer e-MECeF » en cas d'échec de communication réseau.

### EFI-04 : Tableaux de Données & Gestion des Filtres
- **EFI-04.1** : Tableaux réactifs avec pagination serveur, recherche plein texte instantanée et filtres combinatoires (statuts, dates, devises).
- **EFI-04.2** : Badges sémantiques normalisés pour tous les statuts (`draft`, `issued`, `paid`, `normalized`, `failed`).
- **EFI-04.3** : Actions rapides par ligne (Télécharger le PDF certifié, dupliquer, créer un avoir, enregistrer un paiement).

### EFI-05 : Gestion des Notes de Frais & Justificatifs
- **EFI-05.1** : Zone de téléversement par glisser-déposer (*Dropzone*) supportant les formats images (JPG, PNG) et documents PDF.
- **EFI-05.2** : Prévisualisation immédiate de la pièce justificative attachée à la dépense.
- **EFI-05.3** : Boutons d'approbation pour les managers et comptables avec saisie obligatoire d'un motif en cas de rejet.

### EFI-06 : Espace Cabinet Comptable
- **EFI-06.1** : Grille synthétique du portefeuille des entreprises clientes avec indicateurs de santé financière et alertes déclaratives.
- **EFI-06.2** : Vue de supervision détaillée permettant de consulter les balances, grands livres et factures du client sélectionné.

---

## 3. Exigences Non-Fonctionnelles (ENF)

### ENF-01 : Performance & Core Web Vitals
- **ENF-01.1** : Largest Contentful Paint (LCP) < 2.5 secondes sur connexion 4G standard.
- **ENF-01.2** : First Input Delay (FID) / Interaction to Next Paint (INP) < 100 millisecondes pour toute interaction utilisateur.
- **ENF-01.3** : Cumulative Layout Shift (CLS) < 0.1 pour éliminer les sauts d'interface lors du chargement des images ou composants asynchrones.

### ENF-02 : Réactivité & Robustesse Réseau
- **ENF-02.1** : Utilisation systématique de skeletons de chargement et d'indicateurs de progression discrets pour éviter les écrans blancs.
- **ENF-02.2** : Gestion des erreurs globale avec limites de tolérance aux pannes (`error.tsx`, `global-error.tsx`) permettant de recharger l'écran défaillant sans bloquer toute l'application.

### ENF-03 : Accessibilité & Ergonomie
- **ENF-03.1** : Conformité aux directives **WCAG 2.1 niveau AA** (contrastes de couleurs suffisants en mode clair et en mode sombre).
- **ENF-03.2** : Navigation complète au clavier sur les formulaires complexes (tabulation logique, raccourcis de validation `Ctrl+Enter`).
