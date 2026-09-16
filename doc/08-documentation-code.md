# Guide du Développeur Frontend & Standards de Code — Nexera ERP

---

## 1. Arborescence Détaillée de `src/`

Le code source frontend est structuré de manière modulaire et hautement maintenable :

```
front-endV1/src/
├── app/                         # Routing Next.js 16 (App Router)
│   ├── (admin)/                 # Espace entreprise avec layout sidebar standard
│   ├── (cabinet)/               # Espace cabinet avec layout multi-dossiers
│   ├── (full-width-pages)/      # Écrans d'authentification plein écran
│   ├── globals.css              # Styles Tailwind CSS v4 globaux
│   ├── layout.tsx               # Root Layout HTML/Body avec Providers
│   └── error.tsx / loading.tsx  # Gestion globale des erreurs et chargements
│
├── components/                  # Composants UI Atomiques & Moléculaires Réutilisables
│   ├── common/                  # Cartes, modales, badges, conteneurs génériques
│   ├── form/                    # Éléments de formulaire (Input, Select, Label, DatePicker)
│   └── ui/                      # Boutons, menus déroulants, pagination, accordéons
│
├── core/                        # Cœur d'infrastructure frontend
│   └── api/authorizedFetch.ts   # Client HTTP sécurisé avec gestion du refresh token
│
├── hooks/                       # Custom Hooks génériques
│   ├── useTheme.ts              # Gestion de la bascule Dark/Light mode
│   └── useDebounce.ts           # Temporisation de saisie pour recherche temps réel
│
├── icons/                       # Icônes vectorielles SVG typées React
│
├── layout/                      # Éléments de structure globale
│   ├── AppHeader.tsx            # Barre supérieure (Profil, Notifications, Thème)
│   ├── AppSidebar.tsx           # Menu latéral dynamique avec repliement
│   └── Backdrop.tsx             # Voile de fond pour menus mobiles
│
├── modules/                     # Modules Métiers Autonomes (Domain Modules)
│   ├── factures/                # Facturation & e-MECeF
│   │   ├── components/          # MecefCertificationCard, NormalizeInvoiceModal, InvoicesTable
│   │   ├── pages/               # InvoiceDetailsPage, InvoicesListPage, CreateInvoicePage
│   │   ├── schemas/             # invoiceForm.schema.ts (Zod)
│   │   ├── services/            # invoicesApi.service.ts
│   │   └── types/               # invoice.types.ts
│   ├── devis/                   # Devis & chiffrages
│   ├── clients/                 # CRM & fiches tiers
│   ├── rh/                      # Salariés & Paie OHADA
│   └── ...                      # 18 modules métiers
│
├── shared/                      # Utilitaires & Constantes Partagés
│   ├── constants/currencies.ts  # Liste des devises (XOF, EUR, USD) et symboles
│   └── utils/formatters.ts      # Formatage des montants monétaires et des dates
│
└── stores/                      # Stores Globaux Légers (Zustand v5)
    ├── useAuthStore.ts          # État de l'utilisateur connecté et tokens
    └── useSidebarStore.ts       # État d'ouverture/fermeture du menu latéral
```

---

## 2. Conventions de Nommage & Bonnes Pratiques React 19

| Élément | Convention | Exemple |
| :--- | :--- | :--- |
| **Composants React** | `PascalCase.tsx` | `MecefCertificationCard.tsx`, `InvoiceForm.tsx` |
| **Pages App Router** | Toujours `page.tsx` dans un dossier | `app/(admin)/factures/[id]/page.tsx` |
| **Hooks Personnalisés**| `camelCase.ts` commençant par `use` | `useInvoices.ts`, `useSettingsFormFeedback.ts` |
| **Schémas Zod** | `camelCase.schema.ts` | `invoiceForm.schema.ts`, `clientForm.schema.ts` |
| **Services API** | `camelCase.service.ts` | `invoicesApi.service.ts`, `settingsApi.service.ts` |
| **Fichiers de Types** | `camelCase.types.ts` | `invoice.types.ts`, `settings.types.ts` |

---

## 3. Guide Pratique : Création d'un Nouveau Module Frontend

Pour implémenter un nouveau domaine fonctionnel dans l'interface (ex. *Gestion des Fournisseurs*), suivez cette démarche standardisée en 5 étapes :

### Étape 1 : Définition des Types TypeScript
Dans `src/modules/fournisseurs/types/supplier.types.ts` :
```typescript
export interface SupplierSummary {
  id: string;
  companyName: string;
  taxId?: string | null;
  email?: string | null;
  phone?: string | null;
  category: string;
}
```

### Étape 2 : Schéma Zod du Formulaire
Dans `src/modules/fournisseurs/schemas/supplierForm.schema.ts` :
```typescript
import { z } from 'zod';

export const supplierSchema = z.object({
  companyName: z.string().min(2, 'Le nom du fournisseur est obligatoire'),
  taxId: z.string().optional(),
  email: z.string().email('Format email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
```

### Étape 3 : Service API
Dans `src/modules/fournisseurs/services/suppliersApi.service.ts` :
```typescript
import { authorizedFetch } from '@/core/api/authorizedFetch';
import type { SupplierSummary } from '../types/supplier.types';

export const suppliersApi = {
  getAll: () => authorizedFetch<SupplierSummary[]>('/suppliers'),
  create: (data: any) => authorizedFetch<SupplierSummary>('/suppliers', { method: 'POST', body: data }),
};
```

### Étape 4 : Composant Formulaire Réactif
Dans `src/modules/fournisseurs/components/SupplierForm.tsx` avec `useForm({ resolver: zodResolver(supplierSchema) })`.

### Étape 5 : Page dans l'App Router
Dans `src/app/(admin)/fournisseurs/page.tsx` :
```typescript
import { SuppliersListPage } from '@/modules/fournisseurs/pages/SuppliersListPage';

export const metadata = {
  title: 'Fournisseurs | Nexera ERP',
};

export default function Page() {
  return <SuppliersListPage />;
}
```
