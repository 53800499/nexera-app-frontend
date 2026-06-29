import { getCrmOfflineDb } from "../db/crmOffline.db";
import type { SyncOperationType, SyncQueueRecord } from "../types/offline.types";

export const crmSyncQueue = {
  async enqueue(item: Omit<SyncQueueRecord, "id" | "retryCount" | "createdAt">) {
    const db = getCrmOfflineDb();
    if (!db) return;

    await db.syncQueue.add({
      ...item,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    });
  },

  async peekAll() {
    const db = getCrmOfflineDb();
    if (!db) return [] as SyncQueueRecord[];
    return db.syncQueue.orderBy("createdAt").toArray();
  },

  async remove(id: number) {
    const db = getCrmOfflineDb();
    if (!db) return;
    await db.syncQueue.delete(id);
  },

  async markError(id: number, message: string) {
    const db = getCrmOfflineDb();
    if (!db) return;
    const item = await db.syncQueue.get(id);
    if (!item) return;
    await db.syncQueue.update(id, {
      retryCount: item.retryCount + 1,
      lastError: message,
    });
  },

  async count() {
    const db = getCrmOfflineDb();
    if (!db) return 0;
    return db.syncQueue.count();
  },

  payload<T>(value: T) {
    return JSON.stringify(value);
  },

  parsePayload<T>(value: string): T {
    return JSON.parse(value) as T;
  },

  isOperation(value: string): value is SyncOperationType {
    return [
      "createClient",
      "updateClient",
      "archiveClient",
      "addContact",
      "updateContact",
      "removeContact",
    ].includes(value);
  },
};
