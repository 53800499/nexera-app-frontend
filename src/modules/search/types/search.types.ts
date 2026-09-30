export type SearchEntityType =
  | 'page'
  | 'action'
  | 'client'
  | 'quotation'
  | 'invoice'
  | 'order'
  | 'catalog'
  | 'employe';

export type SearchCategoryFilter =
  | 'all'
  | 'pages'
  | 'actions'
  | 'clients'
  | 'invoices'
  | 'quotations'
  | 'orders'
  | 'catalog'
  | 'rh';

export interface SearchItemResult {
  id: string;
  type: 'client' | 'quotation' | 'invoice' | 'order' | 'catalog' | 'employe';
  title: string;
  subtitle: string;
  code?: string;
  badge?: string;
  badgeVariant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  meta?: string;
  href: string;
}

export interface GlobalSearchResponse {
  query: string;
  totalMatches: number;
  clients: SearchItemResult[];
  quotations: SearchItemResult[];
  invoices: SearchItemResult[];
  orders: SearchItemResult[];
  catalogItems: SearchItemResult[];
  employes: SearchItemResult[];
}

export interface SystemPageItem {
  id: string;
  title: string;
  path: string;
  category: string;
  keywords?: string[];
  description?: string;
  icon?: string;
}

export interface QuickActionItem {
  id: string;
  title: string;
  path: string;
  category: string;
  description: string;
  shortcut?: string;
  icon?: string;
}

export interface UnifiedSearchResultItem {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle: string;
  code?: string;
  badge?: string;
  badgeVariant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  meta?: string;
  href: string;
  categoryLabel: string;
}
