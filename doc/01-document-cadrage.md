# Document de Cadrage — Frontend Nexera ERP

---

## 1. Vision et Objectifs de l'Expérience Utilisateur (UX/UI)

### 1.1 Vision de l'Interface
L'interface de **Nexera ERP** est conçue pour offrir aux entreprises et cabinets d'expertise comptable de l'espace **UEMOA / OHADA** une expérience de gestion fluide, esthétique et sans friction. Contrairement aux progiciels traditionnels souvent austères et complexes, Nexera propose une interface moderne, aérée et pensée pour l'efficacité opérationnelle immédiate.

### 1.2 Objectifs Clés de l'Interface :
1. **Zéro Friction de Saisie** : Réduire le nombre de clics pour les actions du quotidien (création de devis en moins de 60 secondes, conversion en facture en 1 clic, certification e-MECeF instantanée).
2. **Clarté Fiscale Visuelle** : Visualisation transparente et rassurante du statut fiscal des pièces commerciales (badge de certification DGI émeraude avec QR Code interactif, ventilation immédiate des taux de TVA et de l'AIB).
3. **Espace de Travail Adaptatif (Dual-Workspace)** : Bascule intuitive entre l'espace entreprise standard et l'**Espace Cabinet d'Expertise Comptable** permettant de superviser des dizaines de dossiers clients sans déconnexion.
4. **Continuité d'Activité en Mobilité (Offline-First)** : Maintien de l'opérabilité de saisie des ventes même lors de micro-coupures réseau Internet fréquentes en Afrique de l'Ouest.

---

## 2. Contexte Ergonomique & Réalités du Terrain

Le développement de l'interface tient compte des contraintes matérielles et réseau réelles de la sous-région :
- **Diversité des Écrans** : Du grand écran d'ordinateur de bureau au terminal portable ou tablette de point de vente. L'interface est 100% *responsive* avec un menu latéral rétractable et des vues optimisées.
- **Bande Passante Fluctuante** : Minimisation du poids des assets, chargement différé (*lazy loading* des composants lourds comme les graphiques ApexCharts) et mise en cache intelligente des référentiels via TanStack Query.
- **Confort Visuel** : Intégration native d'un **Mode Sombre (Dark Mode)** complet permettant de réduire la fatigue visuelle lors des saisies comptables prolongées.

---

## 3. Typologie des Utilisateurs & Personas d'Interface

| Persona | Rôle & Besoins d'Interface | Fonctionnalités Clés Utilisées |
| :--- | :--- | :--- |
| **Gérant de PME** | Vision globale, mobilité, prise de décision rapide. | Tableau de bord financier consolidé, validation en 1 clic des devis et notes de frais. |
| **Commercial Nomade** | Création rapide de devis en clientèle, saisie au comptoir. | Formulaire devis/facture simplifié, recherche intuitive d'articles du catalogue, envoi direct par email. |
| **Comptable d'Entreprise**| Efficacité de saisie, travail au clavier, précision au centime. | Tableaux de factures avec filtres avancés, ventilation de TVA, pointage des encaissements, export FEC. |
| **Gestionnaire de Paie / DRH**| Traitement de masse périodique, vérification des bulletins. | Module RH/Paie, validation des éléments variables, téléchargement groupé des fiches de paie. |
| **Collaborateur Salarié** | Dépôt occasionnel de frais professionnels. | Saisie rapide de note de frais sur smartphone avec téléversement immédiat de la photo du reçu. |
| **Expert-Comptable / Réviseur**| Supervision transversale de multiples entreprises clientes. | Portefeuille multi-dossiers, indicateurs d'alerte fiscale, outils de lettrage et validation de clôture. |

---

## 4. Principes Directeurs de Design & Charte Graphique

1. **Feedback Visuel Non-Bloquant** : Chaque action (création, mise à jour, certification fiscale) est accompagnée de retours visuels clairs (indicateurs de progression discrets, alertes toasts non intrusives).
2. **Code Couleur Sémantique Rigoureux** :
   - 🟢 **Vert Émeraude / Sceau DGI** : Statut certifié conforme e-MECeF (`normalized`), facture payée.
   - 🟡 **Ambre / Jaune** : En attente de validation (`pending`), brouillon (`draft`), facture partiellement payée.
   - 🔴 **Rouge / Carmin** : Échec de certification e-MECeF (`failed`), facture échue impayée, anomalie comptable.
   - 🔵 **Bleu Marque (Brand)** : Actions primaires, navigation, sélection active.
3. **Affichage Conditionnel Prudent** : Les actions irréversibles (suppression, émission définitive de facture, clôture de paie) sont systématiquement précédées d'une modale de confirmation explicite détaillant les conséquences légales.
