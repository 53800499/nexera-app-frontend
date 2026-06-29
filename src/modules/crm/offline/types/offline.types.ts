export type SyncStatus = "synced" | "pending" | "error";

export type SyncOperationType =
  | "createClient"
  | "updateClient"
  | "archiveClient"
  | "addContact"
  | "updateContact"
  | "removeContact";

export type OfflineClientRecord = {
  id: string;
  serverId?: string;
  tenantId: string;
  data: string;
  syncStatus: SyncStatus;
  updatedAt: string;
  isDeleted?: boolean;
};

export type SyncQueueRecord = {
  id?: number;
  operation: SyncOperationType;
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

export type CrmSyncState = {
  isOffline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: string | null;
  lastError: string | null;
};

export const LOCAL_ID_PREFIX = "local_";

export function createLocalId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${LOCAL_ID_PREFIX}${crypto.randomUUID()}`;
  }
  return `${LOCAL_ID_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function isLocalId(id: string) {
  return id.startsWith(LOCAL_ID_PREFIX);
}
