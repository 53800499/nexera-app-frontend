import Dexie, { type EntityTable } from "dexie";
import type {
  OfflineArticleRecord,
  OfflineWarehouseRecord,
  OfflineMovementRecord,
  OfflineTransferRecord,
  OfflineInventoryRecord,
  OfflineAlertRecord,
  OfflineReplenishmentRecord,
  OfflineValuationRecord,
  StockSyncQueueRecord,
  OfflineMetaRecord,
} from "../types/offline.types";

class StockOfflineDatabase extends Dexie {
  articles!: EntityTable<OfflineArticleRecord, "id">;
  warehouses!: EntityTable<OfflineWarehouseRecord, "id">;
  movements!: EntityTable<OfflineMovementRecord, "id">;
  transfers!: EntityTable<OfflineTransferRecord, "id">;
  inventories!: EntityTable<OfflineInventoryRecord, "id">;
  alerts!: EntityTable<OfflineAlertRecord, "id">;
  replenishments!: EntityTable<OfflineReplenishmentRecord, "id">;
  valuation!: EntityTable<OfflineValuationRecord, "key">;
  syncQueue!: EntityTable<StockSyncQueueRecord, "id">;
  meta!: EntityTable<OfflineMetaRecord, "key">;

  constructor() {
    super("nexera-stock-offline");
    this.version(1).stores({
      articles: "id, serverId, tenantId, catalogItemId, syncStatus, updatedAt",
      warehouses: "id, serverId, tenantId, syncStatus, updatedAt",
      movements: "id, serverId, tenantId, movementType, syncStatus, updatedAt",
      transfers: "id, serverId, tenantId, syncStatus, updatedAt",
      inventories: "id, serverId, tenantId, syncStatus, updatedAt",
      alerts: "id, serverId, tenantId, status, alertType, syncStatus, updatedAt",
      replenishments: "id, serverId, tenantId, status, syncStatus, updatedAt",
      valuation: "key",
      syncQueue: "++id, operation, entityId, createdAt",
      meta: "key",
    });
  }
}

let stockDb: StockOfflineDatabase | null = null;

export function getStockOfflineDb(): StockOfflineDatabase | null {
  if (typeof window === "undefined") return null;
  if (!stockDb) stockDb = new StockOfflineDatabase();
  return stockDb;
}

export async function clearStockOfflineDb() {
  const db = getStockOfflineDb();
  if (!db) return;
  await db.transaction(
    "rw",
    [
      db.articles,
      db.warehouses,
      db.movements,
      db.transfers,
      db.inventories,
      db.alerts,
      db.replenishments,
      db.valuation,
      db.syncQueue,
      db.meta,
    ],
    async () => {
      await db.articles.clear();
      await db.warehouses.clear();
      await db.movements.clear();
      await db.transfers.clear();
      await db.inventories.clear();
      await db.alerts.clear();
      await db.replenishments.clear();
      await db.valuation.clear();
      await db.syncQueue.clear();
      await db.meta.clear();
    },
  );
}
