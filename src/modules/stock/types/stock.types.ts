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

export type StockEntryType =
  | "IN_SUPPLIER"
  | "IN_RETURN"
  | "IN_PRODUCTION"
  | "IN_ADJUSTMENT"
  | "IN_INITIAL";

export type StockQualityStatus = "accepted" | "partial" | "rejected";

export type StockMovementStatus = "draft" | "validated" | "cancelled";

export type StockEntryLinePayload = {
  stockItemId: string;
  qtyPlanned: number;
  qtyActual?: number;
  unitCost: number;
  locationId?: string;
  lotNumber?: string;
  manufactureDate?: string;
  expiryDate?: string;
  serialNumbers?: string[];
};

export type CreateStockEntryPayload = {
  movementType: StockEntryType;
  warehouseId: string;
  movementDate?: string;
  reference?: string;
  supplierId?: string;
  qualityStatus?: StockQualityStatus;
  reason?: string;
  notes?: string;
  validate?: boolean;
  lines: StockEntryLinePayload[];
};

export type StockExitType =
  | "OUT_SALE"
  | "OUT_CONSUMPTION"
  | "OUT_LOSS"
  | "OUT_RETURN_SUPPLIER"
  | "OUT_ADJUSTMENT";

export type StockExitLinePayload = {
  stockItemId: string;
  qty: number;
  lotId?: string;
  locationId?: string;
  serialNumbers?: string[];
};

export type CreateStockExitPayload = {
  movementType: StockExitType;
  warehouseId: string;
  movementDate?: string;
  reference?: string;
  costCenter?: string;
  reason?: string;
  notes?: string;
  validate?: boolean;
  lines: StockExitLinePayload[];
};

export type AvailableLotsResponse = {
  stockItemId: string;
  valuationMethod: string;
  trackLots: boolean;
  trackSerials: boolean;
  levels: Array<{
    levelId: string;
    lotId: string | null;
    lotNumber: string | null;
    receivedDate: string | null;
    locationId: string | null;
    locationCode: string | null;
    qtyAvailable: number;
    unitValue: number;
  }>;
};

export type StockMovement = {
  id: string;
  number: string;
  movementType: string;
  status: StockMovementStatus;
  warehouseId: string;
  movementDate: string;
  reference: string | null;
  supplierId: string | null;
  qualityStatus: StockQualityStatus | null;
  reason: string | null;
  notes: string | null;
  createdAt: string;
  warehouse?: { id: string; code: string; name: string };
  lines?: Array<{
    id: string;
    qtyPlanned: number;
    qtyActual: number;
    unitCost: number;
    totalCost?: number;
    cmupBefore?: number | null;
    cmupAfter?: number | null;
    lotNumber?: string | null;
    stockItem?: {
      id: string;
      commercialItem?: { reference: string; name: string };
      trackLots?: boolean;
      trackSerials?: boolean;
      trackExpiry?: boolean;
    };
    location?: { id: string; code: string } | null;
  }>;
};
