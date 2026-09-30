# 🖥️ Frontend Nexera ERP (`front-endV1`)

Bienvenue sur le projet frontend de **Nexera**, l'ERP SaaS moderne de gestion commerciale, comptable, fiscale et RH.

Ce frontend est développé avec **Next.js v15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **TanStack React Query v5**, **Zustand v5** et **React Hook Form + Zod**.

---

## 📚 Documentation pour les Développeurs

Pour comprendre l'application et pouvoir contribuer efficacement :

1. **🧠 Guide de la Logique Métier & des Calculs :** [**`doc/logique-metier/README.md`**](./doc/logique-metier/README.md)
   - Comment sont calculés les devis, factures, remises, TVA et AIB.
   - Comment fonctionnent les gardes de statut (`canEditInvoice`, `canCreateCreditNote`).
   - Le décompte automatique des congés (week-ends et jours fériés exclus).
   - Les indicateurs visuels de stock (système feu tricolore) et les écarts d'inventaire.
   - La correspondance entre règles métier et schémas Zod.

2. **📖 Documentation Technique & Spécifications Complètes :** [**`doc/README.md`**](./doc/README.md)
   - Documents directeurs de cadrage, cahier des charges, SFD et STD.
   - Architecture technique Next.js App Router, Offline-First (Dexie IndexedDB).
   - Décisions d'architecture (ADR).

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js version 20+ ou 22+
- Gestionnaire de paquets `npm`

### Installation
```bash
# Cloner et se placer dans le frontend
cd front-endV1

# Installer les dépendances
npm install
```

### Lancement en Développement
```bash
npm run dev
```
L'application est accessible à l'adresse : [http://localhost:3000](http://localhost:3000).

---

## 📁 Architecture du Code Source (`src/`)

```text
src/
├── app/                 # Routes Next.js App Router (pages & layouts)
│   ├── (admin)/         # Espace d'administration et modules métier
│   ├── (auth)/          # Pages d'authentification (login, reset password)
│   └── (public)/        # Pages publiques ou partagées
├── components/          # Composants UI partagés (boutons, modales, tables, inputs)
├── context/             # Contextes React globaux (auth, notifications)
├── layout/              # Sidebar, Header, Breadcrumbs, navigation (`nav.config.ts`)
├── modules/             # 💼 MODULES MÉTIER ISOLÉS (Coeur de l'ERP)
│   ├── factures/        # Facturation, avoirs, e-invoicing MECEF
│   ├── devis/           # Devis et propositions commerciales
│   ├── stock/           # Articles, mouvements, CMUP, inventaires
│   ├── rh/              # Employés, contrats, congés, paie, bulletins PDF
│   ├── fiscalite/       # TVA, déclarations fiscales, contrôles
│   ├── notes-frais/     # Dépenses professionnelles, indemnités km
│   ├── cabinet/         # Espace cabinet d'expertise comptable
│   └── ...
├── stores/              # Stores d'état global Zustand (UI, sidebar, offline)
└── types/               # Typages TypeScript transversaux
```

---

## 🏛️ Règle d'Or pour Chaque Module (`src/modules/<domaine>/`)

Chaque module métier respecte la séparation des responsabilités :
- `components/` : Composants graphiques uniquement (JSX/Tailwind).
- `schemas/` : Validation Zod des règles métier.
- `services/` : Appels API HTTP vers le backend NestJS.
- `utils/` : **Fonctions pures de calcul métier et de formatage (sans JSX).**

Ne codez jamais de formule de calcul financier directement dans le JSX d'un composant ; placez-la toujours dans un helper pur dans le sous-dossier `utils/`.
