# Base de Données Client & Cache Local — Frontend Nexera ERP

---

## 1. Architecture de Persistance Côté Client

Pour assurer la rapidité d'affichage et permettre la saisie des opérations de vente même en cas de déconnexion réseau, **Nexera ERP** s'appuie sur une hiérarchie de stockage local dans le navigateur :

```
+-------------------------------------------------------------------------+
|                        PERSISTANCE FRONTEND NEXERA                      |
+-------------------------------------------------------------------------+
| 1. TanStack Query Cache (Mémoire Vive)                                  |
|    └── Données fraîches du serveur (TTL / staleTime)                    |
|                                                                         |
| 2. IndexedDB via Dexie.js (Persistance Structurée Forte)                |
|    ├── offlineInvoices  : Factures saisies hors-ligne                   |
|    ├── offlineCatalog   : Référentiel des articles et tarifs            |
|    ├── offlineClients   : Annuaire des clients et IFU                    |
|    └── syncQueue        : File d'attente des mutations à rejouer        |
|                                                                         |
| 3. LocalStorage & Cookies Sécurisés (Métadonnées & Session)             |
|    ├── Tokens d'authentification chiffrés                               |
|    ├── Préférences d'interface (Thème sombre/clair, langue)             |
|    └── Contexte d'organisation actif (TenantId)                         |
+-------------------------------------------------------------------------+
```

---

## 2. Base de Données Locale IndexedDB (`Dexie.js v4`)

Dexie.js fournit une couche d'abstraction typée et transactionnelle sur l'API native IndexedDB du navigateur :

### Définition du Schéma Local (`offlineDatabase.ts`)
```typescript
import Dexie, { type Table } from 'dexie';
import type { InvoiceDetail, ClientSummary, CatalogItemSummary } from '@/modules/factures/types/invoice.types';

export interface PendingSyncMutation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  payload: any;
  createdAt: number;
  retryCount: number;
}

export class NexeraOfflineDatabase extends Dexie {
  offlineInvoices!: Table<InvoiceDetail, string>;
  offlineClients!: Table<ClientSummary, string>;
  offlineCatalog!: Table<CatalogItemSummary, string>;
  syncQueue!: Table<PendingSyncMutation, string>;

  constructor() {
    super('NexeraOfflineDB');
    this.version(1).stores({
      offlineInvoices: 'id, number, clientId, status, createdAt',
      offlineClients: 'id, companyName, taxId',
      offlineCatalog: 'id, name, sku',
      syncQueue: 'id, createdAt, retryCount',
    });
  }
}

export const localDb = new NexeraOfflineDatabase();
```

---

## 3. Typage TypeScript Unifié

Tous les modèles manipulés côté client disposent de définitions strictes garantissant la parfaite adéquation avec les DTOs exposés par le backend NestJS.

### Exemple : Types de Facturation & e-MECeF (`invoice.types.ts`)
```typescript
export type MecefTaxGroup = "A" | "B" | "C" | "D" | "E" | "F";
export type MecefAibType = "NONE" | "A" | "B";
export type MecefEnvironment = "sandbox" | "production";

export type InvoiceNormalizationStatus = 
  | "not_normalized" 
  | "pending" 
  | "normalized" 
  | "failed";

export type InvoiceDetail = {
  id: string;
  tenantId: string;
  number: string;
  status: "draft" | "issued" | "paid" | "partially_paid" | "cancelled";
  invoiceType: "standard" | "deposit" | "credit_note" | "proforma";
  issueDate: string;
  dueDate?: string | null;
  currency: string;
  baseHt: number;
  totalTax: number;
  totalTtc: number;
  amountPaid: number;
  amountDue: number;
  
  // Attributs e-MECeF DGI Bénin
  normalizationStatus: InvoiceNormalizationStatus;
  mecefNim?: string | null;
  mecefCounters?: string | null;
  mecefCode?: string | null;
  mecefQrCodeData?: string | null;
  mecefTaxGroupTotals?: Record<string, any> | null;
  mecefAibType?: MecefAibType;
  mecefAibAmount?: number;
  mecefNormalizedAt?: string | null;
  mecefErrorMessage?: string | null;
  originalMecefCode?: string | null;
  
  lines: InvoiceLineDetail[];
  client: ClientSummary;
};
```
