import { getStockOfflineDb } from "../db/stockOffline.db";
import type {
  StockSyncOperationType,
  StockSyncQueueRecord,
} from "../types/offline.types";

export const stockSyncQueue = {
  async enqueue(
    item: Omit<StockSyncQueueRecord, "id" | "retryCount" | "createdAt">,
  ) {
    const db = getStockOfflineDb();
    if (!db) return;

    await db.syncQueue.add({
      ...item,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    });
  },

  async peekAll() {
    const db = getStockOfflineDb();
    if (!db) return [] as StockSyncQueueRecord[];
    return db.syncQueue.orderBy("createdAt").toArray();
  },

  async remove(id: number) {
    const db = getStockOfflineDb();
    if (!db) return;
    await db.syncQueue.delete(id);
  },

  async markError(id: number, message: string) {
    const db = getStockOfflineDb();
    if (!db) return;
    const item = await db.syncQueue.get(id);
    if (!item) return;
    await db.syncQueue.update(id, {
      retryCount: item.retryCount + 1,
      lastError: message,
    });
  },

  async count() {
    const db = getStockOfflineDb();
    if (!db) return 0;
    return db.syncQueue.count();
  },

  payload<T>(value: T) {
    return JSON.stringify(value);
  },

  parsePayload<T>(value: string): T {
    return JSON.parse(value) as T;
  },
};
