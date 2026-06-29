export type SyncStatus = "synced" | "pending" | "error";

export type OrderSyncOperationType =
  | "createOrder"
  | "updateOrder"
  | "deleteOrder";

export type OfflineOrderRecord = {
  id: string;
  serverId?: string;
  tenantId?: string;
  data: string;
  syncStatus: SyncStatus;
  updatedAt: string;
  isDeleted?: boolean;
};

export type OrderSyncQueueRecord = {
  id?: number;
  operation: OrderSyncOperationType;
  entityId: string;
  payload: string;
  createdAt: string;
  retryCount: number;
  lastError?: string;
};

export type OfflineMetaRecord = {
  key: string;
  value: string;
};

export type OrdersSyncState = {
  isOffline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: string | null;
  lastError: string | null;
};

export { createLocalId, isLocalId, LOCAL_ID_PREFIX } from "@/modules/crm/offline/types/offline.types";
