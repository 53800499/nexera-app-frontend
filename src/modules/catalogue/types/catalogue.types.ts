export type CatalogItemType = "product" | "service" | "package";

export type TaxRate = {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
  isActive: boolean;
};

export type CatalogCategory = {
  id: string;
  tenantId: string;
  name: string;
  code?: string | null;
  description?: string | null;
  parentId?: string | null;
  isArchived: boolean;
  createdAt?: string;
  children?: CatalogCategory[];
  parent?: CatalogCategory | null;
};

export type CatalogItemPrice = {
  id: string;
  tenantId: string;
  itemId: string;
  clientId?: string | null;
  groupName?: string | null;
  priceHt: number;
  currency: string;
  validFrom?: string | null;
  validTo?: string | null;
  isActive: boolean;
  createdAt?: string;
  client?: {
    id: string;
    companyName: string;
    code: string;
  } | null;
  item?: {
    id: string;
    name: string;
    reference: string;
    isArchived: boolean;
  };
};

export type CatalogItem = {
  id: string;
  tenantId: string;
  categoryId?: string | null;
  reference: string;
  name: string;
  description?: string | null;
  itemType: CatalogItemType;
  unit: string;
  priceHt: number;
  defaultTaxRateId: string;
  maxDiscountPct?: number | null;
  stockQuantity?: number | null;
  isArchived: boolean;
  createdAt?: string;
  category?: CatalogCategory | null;
  taxRate?: TaxRate | null;
  prices?: CatalogItemPrice[];
};

export type CreateCatalogItemPayload = {
  reference?: string;
  name: string;
  description?: string;
  itemType: CatalogItemType;
  unit?: string;
  priceHt: number;
  defaultTaxRateId: string;
  categoryId?: string;
  maxDiscountPct?: number;
  isArchived?: boolean;
};

export type UpdateCatalogItemPayload = Partial<CreateCatalogItemPayload>;

export type CreateCatalogCategoryPayload = {
  name: string;
  code?: string;
  description?: string;
  parentId?: string;
};

export type UpdateCatalogCategoryPayload = Partial<CreateCatalogCategoryPayload>;

export type CreateCatalogPricePayload = {
  clientId?: string;
  groupName?: string;
  priceHt: number;
  currency?: string;
  validFrom?: string;
  validTo?: string;
  isActive?: boolean;
};

export type UpdateCatalogPricePayload = {
  priceHt?: number;
  currency?: string;
  validFrom?: string | null;
  validTo?: string | null;
  isActive?: boolean;
};
