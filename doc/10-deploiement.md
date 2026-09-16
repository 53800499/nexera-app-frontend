# Guide de Déploiement & DevOps — Frontend Nexera ERP

---

## 1. Processus de Build & Compilation Next.js

Le frontend de **Nexera ERP** est optimisé pour la production via le compilateur natif de Next.js (Turbopack / Webpack optimisé) :

```bash
# Compilation complète de production
npm run build
```

### Analyse des Artefacts Générés (`.next/`) :
- **Pages Statiques (SSG)** : Pré-rendues au moment du build (ex. écrans d'authentification, pages d'erreur 404/500).
- **Pages Dynamiques (SSR)** : Rendu côté serveur ou client à la demande (ex. tableau de bord, fiches factures dynamiques).
- **Chunks Optimisés** : Découpage intelligent du code (*code-splitting*) évitant de charger les bibliothèques lourdes (ApexCharts, FullCalendar) sur les pages qui ne les utilisent pas.

---

## 2. Déploiement Conteneurisé avec Docker

### Dockerfile Frontend Multi-Stage Optimisé :
```dockerfile
# Stage 1: Dépendances & Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 2: Serveur de Production Léger
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## 3. Options d'Hébergement & Déploiement Cloud

### 3.1 Déploiement sur Cloud Render (Web Service)
- **Environnement** : `Node`
- **Build Command** : `npm ci && npm run build`
- **Start Command** : `npm run start`
- **Variables d'Environnement** :
  - `NODE_ENV=production`
  - `NEXT_PUBLIC_API_URL=https://api.nexera.bj/api`

### 3.2 Déploiement sur Plateforme Vercel
Nexera s'intègre nativement à l'infrastructure mondiale de Vercel avec détection automatique de Next.js 16 et distribution sur réseau Edge mondial.

---

## 4. Dictionnaire des Variables d'Environnement Frontend

> [!IMPORTANT]
> Seules les variables préfixées par `NEXT_PUBLIC_` sont intégrées dans le bundle JavaScript côté client et accessibles par le navigateur. Ne **jamais** placer de secrets ou de clés privées dans ces variables.

| Variable | Exemple / Valeur | Obligatoire | Rôle & Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://api.nexera.bj/api` | **Oui** | URL de base de l'API REST du backend Nexera. |
| `NEXT_PUBLIC_APP_NAME` | `Nexera ERP` | Non | Nom d'application affiché dans les onglets. |
| `NEXT_PUBLIC_ENABLE_OFFLINE`| `true` ou `false` | Non | Active ou désactive les capacités de cache local IndexedDB. |

---

## 5. Optimisations de Performance de Production

1. **Minification & Purge CSS** : Tailwind CSS v4 analyse l'ensemble des composants `src/` et élimine toutes les classes utilitaires non utilisées, produisant un fichier CSS final de moins de 30 Ko gzippé.
2. **Gestion du Cache HTTP des Assets** : Tous les fichiers sous `_next/static/` disposent d'un hachage de contenu unique (*content hash*) et sont servis avec l'en-tête de cache immuable `Cache-Control: public, max-age=31536000, immutable`.
3. **Chargement Différé (Dynamic Imports)** : Les composants graphiques interactifs sont importés dynamiquement avec `next/dynamic` pour alléger le temps de premier chargement :
   ```typescript
   const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });
   ```
