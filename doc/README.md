# Documentation Technique & Fonctionnelle — Frontend Nexera ERP

Bienvenue dans la documentation officielle de référence du frontend de **Nexera ERP**.

Le frontend de Nexera est une application monopage moderne, modulaire et réactive conçue avec **Next.js v16 (App Router)**, **React 19**, **Tailwind CSS v4**, **TanStack React Query v5**, **Zustand v5** et **Dexie.js (IndexedDB)**. Elle offre une expérience utilisateur de niveau entreprise pour la gestion commerciale, la certification fiscale **e-MECeF (DGI Bénin)**, la paie OHADA, les notes de frais et l'expertise comptable multi-dossiers.

---

## 🗺️ Cartographie de la Documentation Frontend

La documentation est structurée selon les standards de l'ingénierie logicielle pour répondre aux besoins des développeurs frontend, UI/UX designers, chefs de projet et exploitants :

### 📚 Documents Directeurs (01 à 12)

| N° | Document | Description & Périmètre | Public Cible |
| :--- | :--- | :--- | :--- |
| **01** | [01 - Document de Cadrage](./01-document-cadrage.md) | Vision ergonomique, personas utilisateurs, principes directeurs UX/UI et accessibilité. | Designers, PO, Développeurs |
| **02** | [02 - Cahier des Charges](./02-cahier-des-charges.md) | Exigences fonctionnelles d'interface, critères de réactivité, robustesse réseau et accessibilité. | PO, Lead Dev, QA |
| **03** | [03 - Spécifications Fonctionnelles](./03-specifications-fonctionnelles.md) | SFD exhaustive des écrans : Auth, Dashboard, Factures, e-MECeF, Paie, Notes de frais, Cabinet. | PO, Développeurs |
| **04** | [04 - Architecture Technique](./04-architecture-technique.md) | Architecture Next.js 16 App Router, Server/Client Components, React Query v5, Zustand, Dexie. | Architectes, Développeurs |
| **05** | [05 - Spécifications Techniques](./05-specifications-techniques.md) | STD : formulaires React Hook Form + Zod, client HTTP `authorizedFetch`, QR Code, thèmes. | Développeurs frontend |
| **06** | [06 - Base de Données & Cache Client](./06-base-de-donnees.md) | Stockage local client IndexedDB (Dexie), synchronisation offline, typage TypeScript. | Développeurs |
| **07** | [07 - Intégration & Consommation d'API](./07-api.md) | Services API frontend, intercepteurs de tokens, gestion du rafraîchissement silencieux. | Développeurs Fullstack |
| **08** | [08 - Guide du Développeur & Code](./08-documentation-code.md) | Structure de `src/`, conventions React 19, Design System Tailwind, guide de création d'écrans. | Développeurs |
| **09** | [09 - Stratégie de Tests](./09-tests.md) | Tests unitaires des composants, validation Zod, tests de navigation et simulation offline. | QA, Développeurs |
| **10** | [10 - Guide de Déploiement](./10-deploiement.md) | Build `next build`, optimisations SSG/SSR, hébergement Vercel / Render, variables d'environnement. | DevOps, SysAdmin |
| **11** | [11 - Stratégie & Roadmap](./11-doc-strategie-.md) | Évolution Progressive Web App (PWA), synchronisation temps réel WebSockets, Core Web Vitals. | Direction, Lead Tech |
| **12** | [12 - Parcours Utilisateurs & Workflows](./12-doc-fonctionnelles.md) | Guides pas-à-pas des flux d'interface : émission/normalisation e-MECeF, paie, note de frais. | Formateurs, Utilisateurs |

---

### 📂 Dossiers Spécialisés & Décisions d'Architecture

- 🎨 **Architecture d'Interface** : [`architecture/architecture.md`](./architecture/architecture.md) (Flux de données frontend, diagrammes de composants, arborescence des routes Next.js).
- 💾 **Modèle de Données Local** : [`database/data-model.md`](./database/data-model.md) (Schéma IndexedDB Dexie pour le mode déconnecté, state stores Zustand).
- 🚢 **Procédures de Déploiement** : [`deployment/deployment.md`](./deployment/deployment.md) (Build de production, compression, variables d'environnement).
- 📈 **Télémétrie & Monitoring** : [`operations/monitoring.md`](./operations/monitoring.md) (Core Web Vitals, gestion d'erreurs globales `error.tsx`, logs console).
- 🛡️ **Sécurité Côté Client** : [`security/security-audit.md`](./security/security-audit.md) (Stockage des tokens JWT, protection contre les failles XSS, politique CSP).
- 🧪 **Plan d'Assurance Qualité UI** : [`testing/test-strategy.md`](./testing/test-strategy.md) (Matrice de compatibilité navigateurs, accessibilité WCAG, tests de charge UI).
- 📜 **Architecture Decision Records (ADR)** :
  - [`adr/ADR-001-choix-nextjs-app-router.md`](./adr/ADR-001-choix-nextjs-app-router.md) : Choix de Next.js v16 avec App Router et React 19.
  - [`adr/ADR-002-state-management-zustand-react-query.md`](./adr/ADR-002-state-management-zustand-react-query.md) : Gestion d'état découplée Server Cache (React Query) vs UI State (Zustand).
  - [`adr/ADR-003-offline-first-dexie-indexeddb.md`](./adr/ADR-003-offline-first-dexie-indexeddb.md) : Architecture Offline-First basée sur Dexie.js (IndexedDB).
  - [`adr/ADR-004-formulaires-react-hook-form-zod.md`](./adr/ADR-004-formulaires-react-hook-form-zod.md) : Standardisation des formulaires avec React Hook Form et validation Zod.
  - [`adr/ADR-005-design-system-tailwind-dark-mode.md`](./adr/ADR-005-design-system-tailwind-dark-mode.md) : Design System utilitaire Tailwind CSS v4 avec mode sombre natif.

---

## ⚡ Stack Technologique Clé

- **Framework & Rendu** : [Next.js v16](https://nextjs.org) (App Router, Server & Client Components)
- **Bibliothèque UI** : [React 19](https://react.dev)
- **Styling & Design System** : [Tailwind CSS v4](https://tailwindcss.com) + `@tailwindcss/forms`
- **Cache Serveur & Mutations** : [TanStack React Query v5](https://tanstack.com/query)
- **Gestion d'État Local** : [Zustand v5](https://github.com/pmndrs/zustand)
- **Base Locale Déconnectée (Offline)** : [Dexie.js v4](https://dexie.org) (Wrapper IndexedDB typé)
- **Formulaires & Schémas** : [React Hook Form v7](https://react-hook-form.com) + [Zod v4](https://zod.dev)
- **Graphiques & Calendriers** : [ApexCharts](https://apexcharts.com) + [FullCalendar v6](https://fullcalendar.io)
- **QR Code & Documents** : `qrcode` + `@react-pdf/renderer`

---

## 🧭 Démarrage Rapide en Développement

```bash
# 1. Se positionner dans le dossier frontend
cd front-endV1

# 2. Installation des dépendances
npm install

# 3. Configuration des variables d'environnement
# Créer .env.local avec l'URL du backend (ex. NEXT_PUBLIC_API_URL=http://localhost:3008/api)
cp .env.local.example .env.local # ou éditer .env.local

# 4. Lancement du serveur de développement Next.js (port 3000 ou 3001)
npm run dev
```

L'application s'ouvre sur `http://localhost:3000` (ou port attribué dynamiquement).
