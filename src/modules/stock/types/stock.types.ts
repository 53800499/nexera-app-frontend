export type StockValuationMethod = "cmup" | "fifo" | "lifo";

export type Warehouse = {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  address: Record<string, unknown> | null;
  isDefault: boolean;
  isActive: boolean;
  managerUserId: string | null;
  createdAt: string;
  updatedAt: string;
  locations?: WarehouseLocation[];
};

export type WarehouseLocation = {
  id: string;
  tenantId: string;
  warehouseId: string;
  code: string;
  zone: string | null;
  aisle: string | null;
  rack: string | null;
  bin: string | null;
  capacity: number | null;
  isActive: boolean;
  createdAt: string;
};

export type StockItem = {
  id: string;
  tenantId: string;
  commercialItemId: string;
  trackLots: boolean;
  trackSerials: boolean;
  trackExpiry: boolean;
  valuationMethod: StockValuationMethod;
  storageUnit: string;
  conversionFactor: number;
  minStockQty: number | null;
  safetyStockQty: number | null;
  maxStockQty: number | null;
  reorderQty: number | null;
  defaultWarehouseId: string | null;
  defaultLocationId: string | null;
  allowNegativeStock: boolean;
  currentCmup: number;
  createdAt: string;
  updatedAt: string;
  commercialItem?: {
    id: string;
    reference: string;
    name: string;
    unit: string;
    itemType: string;
    stockQuantity: number | null;
    isArchived: boolean;
  };
  defaultWarehouse?: Pick<Warehouse, "id" | "code" | "name"> | null;
  defaultLocation?: Pick<WarehouseLocation, "id" | "code"> | null;
};

export type StockArticleRow = {
  catalogItemId: string;
  reference: string;
  name: string;
  unit: string;
  stockQuantity: number;
  isArchived: boolean;
  configured: boolean;
  stockItem: StockItem | null;
};

export type CatalogStockBundle = {
  catalogItem: {
    id: string;
    reference: string;
    name: string;
    unit: string;
    itemType: string;
    stockQuantity: number | null;
    isArchived: boolean;
  };
  stockItem: StockItem | null;
};

export type CreateStockItemPayload = {
  commercialItemId: string;
  trackLots?: boolean;
  trackSerials?: boolean;
  trackExpiry?: boolean;
  valuationMethod?: StockValuationMethod;
  storageUnit: string;
  conversionFactor?: number;
  minStockQty?: number | null;
  safetyStockQty?: number | null;
  maxStockQty?: number | null;
  reorderQty?: number | null;
  defaultWarehouseId?: string | null;
  defaultLocationId?: string | null;
  allowNegativeStock?: boolean;
};

export type UpdateStockItemPayload = Omit<
  CreateStockItemPayload,
  "commercialItemId"
>;

export type CreateWarehousePayload = {
  code: string;
  name: string;
  address?: Record<string, unknown>;
  isDefault?: boolean;
  isActive?: boolean;
};

export type CreateWarehouseLocationPayload = {
  zone: string;
  aisle: string;
  rack: string;
  bin: string;
  capacity?: number;
  isActive?: boolean;
};

export type UpdateWarehousePayload = {
  name?: string;
  address?: Record<string, unknown>;
  isDefault?: boolean;
  isActive?: boolean;
};

export type UpdateWarehouseLocationPayload = {
  capacity?: number;
  isActive?: boolean;
};
