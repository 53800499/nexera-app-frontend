import Dexie, { type EntityTable } from "dexie";
import type {
  OfflineMetaRecord,
  OfflineOrderRecord,
  OrderSyncQueueRecord,
} from "../types/offline.types";

class OrdersOfflineDatabase extends Dexie {
  orders!: EntityTable<OfflineOrderRecord, "id">;
  syncQueue!: EntityTable<OrderSyncQueueRecord, "id">;
  meta!: EntityTable<OfflineMetaRecord, "key">;

  constructor() {
    super("nexera-orders-offline");
    this.version(1).stores({
      orders: "id, serverId, tenantId, syncStatus, updatedAt",
      syncQueue: "++id, operation, entityId, createdAt",
      meta: "key",
    });
  }
}

let ordersDb: OrdersOfflineDatabase | null = null;

export function getOrdersOfflineDb(): OrdersOfflineDatabase | null {
  if (typeof window === "undefined") return null;
  if (!ordersDb) ordersDb = new OrdersOfflineDatabase();
  return ordersDb;
}

export async function clearOrdersOfflineDb() {
  const db = getOrdersOfflineDb();
  if (!db) return;
  await db.transaction("rw", db.orders, db.syncQueue, db.meta, async () => {
    await db.orders.clear();
    await db.syncQueue.clear();
    await db.meta.clear();
  });
}
