# Modèle de Données Local Client — Frontend Nexera ERP

---

## 1. Structures de Stockage IndexedDB (Dexie.js)

Le schéma de base de données locale stocké dans le navigateur de l'utilisateur est structuré ainsi :

| Table Locale | Clé Primaire | Index Secondaires | Rôle & Contenu |
| :--- | :--- | :--- | :--- |
| `offlineInvoices` | `id` (UUID) | `number, clientId, status, createdAt` | Brouillons et factures émises en mode déconnecté. |
| `offlineClients` | `id` (UUID) | `companyName, taxId` | Copie locale du carnet d'adresses client pour saisie rapide. |
| `offlineCatalog` | `id` (UUID) | `name, sku` | Catalogue d'articles et prix unitaires HT/TVA. |
| `syncQueue` | `id` (UUID) | `createdAt, retryCount` | File d'attente des mutations en attente d'expédition au serveur. |

---

## 2. Modèles d'État Global Zustand

### Store d'Authentification (`useAuthStore`)
```typescript
interface AuthState {
  user: UserProfile | null;
  activeTenantId: string | null;
  workspace: 'enterprise' | 'cabinet';
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (payload: { user: UserProfile; tokens: Tokens }) => void;
  switchWorkspace: (workspace: 'enterprise' | 'cabinet') => void;
  logout: () => void;
}
```

### Store d'Interface & Navigation (`useSidebarStore`)
```typescript
interface SidebarState {
  isExpanded: boolean;
  isMobileOpen: boolean;
  toggleSidebar: () => void;
  setMobileOpen: (open: boolean) => void;
}
```

---

## 3. Typage des Réponses API Paginisées

Toutes les requêtes de listes partagent une structure générique :
```typescript
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```
