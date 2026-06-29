import { getQuotationsOfflineDb } from "../db/quotationsOffline.db";
import type {
  QuotationSyncOperationType,
  QuotationSyncQueueRecord,
} from "../types/offline.types";

export const quotationsSyncQueue = {
  async enqueue(
    item: Omit<QuotationSyncQueueRecord, "id" | "retryCount" | "createdAt">,
  ) {
    const db = getQuotationsOfflineDb();
    if (!db) return;

    await db.syncQueue.add({
      ...item,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    });
  },

  async peekAll() {
    const db = getQuotationsOfflineDb();
    if (!db) return [] as QuotationSyncQueueRecord[];
    return db.syncQueue.orderBy("createdAt").toArray();
  },

  async remove(id: number) {
    const db = getQuotationsOfflineDb();
    if (!db) return;
    await db.syncQueue.delete(id);
  },

  async markError(id: number, message: string) {
    const db = getQuotationsOfflineDb();
    if (!db) return;
    const item = await db.syncQueue.get(id);
    if (!item) return;
    await db.syncQueue.update(id, {
      retryCount: item.retryCount + 1,
      lastError: message,
    });
  },

  async count() {
    const db = getQuotationsOfflineDb();
    if (!db) return 0;
    return db.syncQueue.count();
  },

  payload<T>(value: T) {
    return JSON.stringify(value);
  },

  parsePayload<T>(value: string): T {
    return JSON.parse(value) as T;
  },

  isOperation(value: string): value is QuotationSyncOperationType {
    return ["createQuotation", "updateQuotation", "deleteQuotation"].includes(
      value,
    );
  },
};
