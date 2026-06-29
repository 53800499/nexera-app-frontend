export type SyncStatus = "synced" | "pending" | "error";

export type QuotationSyncOperationType =
  | "createQuotation"
  | "updateQuotation"
  | "deleteQuotation";

export type OfflineQuotationRecord = {
  id: string;
  serverId?: string;
  tenantId?: string;
  data: string;
  syncStatus: SyncStatus;
  updatedAt: string;
  isDeleted?: boolean;
};

export type QuotationSyncQueueRecord = {
  id?: number;
  operation: QuotationSyncOperationType;
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

export type QuotationsSyncState = {
  isOffline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: string | null;
  lastError: string | null;
};

export { createLocalId, isLocalId, LOCAL_ID_PREFIX } from "@/modules/crm/offline/types/offline.types";
