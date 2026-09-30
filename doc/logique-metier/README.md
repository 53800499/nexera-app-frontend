# 🧠 Guide de la Logique Métier & des Calculs — Frontend Nexera ERP

Ce guide de référence est destiné à **tout développeur intervenant sur le frontend de Nexera (`front-endV1`)**.

Il explique de manière exhaustive **comment chaque élément affiché à l'écran est calculé**, quelles règles métier gouvernent les composants interactifs, et comment maintenir ou ajouter de nouvelles fonctionnalités sans introduire de bugs métier ou de divergences avec le backend.

---

## 🎯 Pourquoi la logique métier est cruciale côté Frontend ?

Dans Nexera, le frontend ne se contente pas d'afficher passivement des données retournées par l'API :
1. **Calcul réactif en direct (*Live Calculation*) :** Les formulaires de vente (devis, factures), les sessions d'inventaire et les demandes de congés effectuent des calculs financiers et arithmétiques instantanés pour offrir une expérience fluide et préventive.
2. **Gardes d'action (*Status Guards*) :** Les boutons d'action (Modifier, Supprimer, Émettre un avoir, Enregistrer un règlement, Valider) sont pilotés par des fonctions booléennes strictes qui reflètent les lois fiscales et comptables (ex: immuabilité d'une facture validée).
3. **Pré-validation immédiate (*Zod Schemas*) :** Toute saisie utilisateur est validée par Zod selon les règles métier (`BM-xxx`) avant même d'envoyer la moindre requête au serveur.
4. **Restitution humaine et formatée (*Formatters*) :** Les montants financiers (XOF / FCFA), les pourcentages, les statuts et les codes énumérés sont formatés selon des normes typographiques comptables rigoureuses.

---

## 🗺️ Sommaire des Guides de Logique Métier Frontend

| Document | Périmètre & Questions auxquelles il répond |
| :--- | :--- |
| 🧾 [**Calculs Commerciaux & Factures**](./calculs-commerciaux-factures.md) | Comment sont calculés le HT net, la TVA ventilée par groupe fiscal, la retenue AIB et le Net à Payer ? Quelles sont les règles pour afficher/masquer les boutons d'action ? |
| 📦 [**Catalogue, Tarifs & Commandes**](./calculs-commandes-et-catalogue.md) | Comment le prix TTC et la marge sont-ils calculés en direct ? Comment un bon de commande réserve-t-il les stocks disponibles ? |
| 📈 [**Dashboard & KPIs Exécutifs**](./calculs-dashboard-kpis.md) | Comment le CA, l'évolution N vs N-1, le taux de conversion des devis et les créances en retard sont-ils calculés ? |
| 👥 [**CRM, Encours & Relances**](./calculs-crm-encours-et-relances.md) | Comment le plafond de crédit client est-il surveillé ? Comment la balance âgée et les niveaux de relance 1/2/3 sont-ils déterminés ? |
| 💳 [**Encaissements & Règlements**](./calculs-encaissements-et-reglements.md) | Comment un paiement est-il ventilé sur plusieurs factures ? Comment le reliquat client est-il tracé et le reçu généré ? |
| 🌴 [**Calculs RH, Congés & Paie**](./calculs-rh-paie-conges.md) | Comment sont décomptés les jours ouvrés en excluant week-ends et fériés ? Comment le solde projeté est-il calculé ? Comment fonctionne la génération PDF du bulletin ? |
| 🧾 [**Notes de Frais & Indemnités KM**](./calculs-notes-de-frais.md) | Comment les indemnités kilométriques sont-elles calculées ? Comment les plafonds de dépenses et justificatifs sont-ils vérifiés ? |
| 📦 [**Calculs Stocks & Inventaires**](./calculs-stocks-inventaires.md) | Comment fonctionne le système feu tricolore des stocks ? Comment les écarts d'inventaire sont-ils calculés et valorisés en direct ? Comment simuler le CMUP ? |
| 📊 [**Calculs Fiscalité & TVA**](./calculs-fiscalite-tva.md) | Comment les cartes KPI de TVA collectée, déductible et solde net sont-elles calculées ? Comment détecter visuellement les factures fournisseurs à risque (sans IFU) ? |
| 🏢 [**Espace Cabinet Multi-Dossiers**](./espace-cabinet-multi-dossiers.md) | Comment le sélecteur de client actif commute le contexte sans déconnexion ? Comment l'export officiel FEC est-il généré ? |
| ⚙️ [**Paramètres Tenant & Profil**](./parametres-et-profil.md) | Comment les paramètres d'entreprise (devise, TVA, numérotation) influencent l'ensemble de l'interface ? |
| 🔒 [**Contrôle d'Accès RBAC & Navigation**](./affichage-rbac-et-navigation.md) | Comment la barre latérale et les boutons sont-ils conditionnés par les rôles, permissions et options d'abonnement ? |
| 📡 [**Mode Hors-Ligne & Synchronisation**](./mode-offline-et-synchronisation.md) | Comment le mode déconnecté (Dexie IndexedDB) gère-t-il la numérotation provisoire et la résolution des conflits au retour réseau ? |
| 🛡️ [**Validation des Formulaires & Schémas Zod**](./validation-formulaires-zod.md) | Comment chaque règle métier `BM-xxx` est-elle encodée dans les schémas Zod couplés à React Hook Form ? |

---

## 🏛️ Architecture Type d'un Module Métier Frontend

Dans `src/modules/<domaine>/`, chaque développeur doit respecter cette répartition des responsabilités :

```text
src/modules/<domaine>/
├── components/          # Composants React de présentation (tableaux, cartes, modales)
├── hooks/               # Custom hooks React Query & logique d'état local
├── pages/               # Écrans routés
├── schemas/             # Schémas Zod (Validation des règles métier)
├── services/            # Client API (Appels HTTP autorisés vers NestJS)
├── types/               # Typages TypeScript stricts
└── utils/               # FONCTIONS PURES DE CALCUL MÉTIER ET FORMATAGE (Pas de JSX)
```

> ⚠️ **Règle d'or de développement :** Ne jamais coder de calcul financier ou fiscal directement à l'intérieur du JSX d'un composant. Tout calcul doit résider dans une fonction pure testable unitairement dans le sous-dossier `utils/`.
