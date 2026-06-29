export type SyncStatus = "synced" | "pending" | "error";

export type InvoiceSyncOperationType =
  | "createInvoice"
  | "updateInvoice"
  | "deleteInvoice";

export type OfflineInvoiceRecord = {
  id: string;
  serverId?: string;
  tenantId?: string;
  data: string;
  syncStatus: SyncStatus;
  updatedAt: string;
  isDeleted?: boolean;
};

export type InvoiceSyncQueueRecord = {
  id?: number;
  operation: InvoiceSyncOperationType;
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

export type InvoicesSyncState = {
  isOffline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: string | null;
  lastError: string | null;
};

export {
  createLocalId,
  isLocalId,
  LOCAL_ID_PREFIX,
} from "@/modules/crm/offline/types/offline.types";
