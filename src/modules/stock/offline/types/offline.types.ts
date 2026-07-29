export type SyncStatus = "synced" | "pending" | "error";

export type StockSyncOperationType =
  // Articles
  | "createStockItem"
  | "updateStockItem"
  // Warehouses & Locations
  | "createWarehouse"
  | "updateWarehouse"
  | "setDefaultWarehouse"
  | "archiveWarehouse"
  | "reactivateWarehouse"
  | "createWarehouseLocation"
  | "updateWarehouseLocation"
  // Movements
  | "createStockEntry"
  | "createStockExit"
  | "validateStockMovement"
  // Transfers
  | "createStockTransfer"
  | "submitStockTransfer"
  | "shipStockTransfer"
  | "receiveStockTransfer"
  | "cancelStockTransfer"
  // Inventories
  | "createInventorySession"
  | "startInventorySession"
  | "submitInventoryCounts"
  | "completeInventoryCount"
  | "completeInventoryRecount"
  | "validateInventorySession"
  | "closeInventorySession"
  | "cancelInventorySession"
  // Alerts & Replenishments
  | "scanStockAlerts"
  | "acknowledgeStockAlert"
  | "dismissStockAlert"
  | "createReplenishment"
  | "approveReplenishment"
  | "rejectReplenishment"
  // Valuation
  | "publishValuation";

export type OfflineArticleRecord = {
  id: string;
  serverId?: string;
  tenantId?: string;
  catalogItemId?: string;
  data: string;
  syncStatus: SyncStatus;
  updatedAt: string;
  isDeleted?: boolean;
};

export type OfflineWarehouseRecord = {
  id: string;
  serverId?: string;
  tenantId?: string;
  data: string;
  syncStatus: SyncStatus;
  updatedAt: string;
  isDeleted?: boolean;
};

export type OfflineMovementRecord = {
  id: string;
  serverId?: string;
  tenantId?: string;
  movementType?: string;
  data: string;
  syncStatus: SyncStatus;
  updatedAt: string;
  isDeleted?: boolean;
};

export type OfflineTransferRecord = {
  id: string;
  serverId?: string;
  tenantId?: string;
  data: string;
  syncStatus: SyncStatus;
  updatedAt: string;
  isDeleted?: boolean;
};

export type OfflineInventoryRecord = {
  id: string;
  serverId?: string;
  tenantId?: string;
  data: string;
  syncStatus: SyncStatus;
  updatedAt: string;
  isDeleted?: boolean;
};

export type OfflineAlertRecord = {
  id: string;
  serverId?: string;
  tenantId?: string;
  status?: string;
  alertType?: string;
  data: string;
  syncStatus: SyncStatus;
  updatedAt: string;
};

export type OfflineReplenishmentRecord = {
  id: string;
  serverId?: string;
  tenantId?: string;
  status?: string;
  data: string;
  syncStatus: SyncStatus;
  updatedAt: string;
};

export type OfflineValuationRecord = {
  key: string;
  tenantId?: string;
  data: string;
  updatedAt: string;
};

export type StockSyncQueueRecord = {
  id?: number;
  operation: StockSyncOperationType;
  entityId: string;
  parentId?: string;
  payload: string;
  createdAt: string;
  retryCount: number;
  lastError?: string;
};

export type OfflineMetaRecord = {
  key: string;
  value: string;
};

export type StockSyncState = {
  isOffline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: string | null;
  lastError: string | null;
};

export { createLocalId, isLocalId, LOCAL_ID_PREFIX } from "@/modules/crm/offline/types/offline.types";
