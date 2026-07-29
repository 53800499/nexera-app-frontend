import type {
  StockArticleRow,
  CatalogStockBundle,
  StockItem,
  Warehouse,
  WarehouseLocation,
  StockMovement,
  StockTransfer,
  AvailableLotsResponse,
} from "../../types/stock.types";
import type {
  InventorySession,
  InventoryCountLine,
  InventoryVariancesResponse,
} from "../../inventory/types/inventory.types";
import type {
  StockAlert,
  AlertsSummary,
  ReplenishmentProposal,
  StockAlertStatus,
  StockAlertType,
} from "../../alerts/types/alerts.types";
import type {
  ValuationReport,
  TurnoverReport,
  CmupHistoryResponse,
} from "../../valuation/types/valuation.types";

import { getStockOfflineDb } from "../db/stockOffline.db";
import type {
  OfflineArticleRecord,
  OfflineWarehouseRecord,
  OfflineMovementRecord,
  OfflineTransferRecord,
  OfflineInventoryRecord,
  OfflineAlertRecord,
  OfflineReplenishmentRecord,
  OfflineValuationRecord,
  SyncStatus,
} from "../types/offline.types";

function parseJson<T>(data: string | T): T {
  if (typeof data === "string") {
    return JSON.parse(data) as T;
  }
  return data as T;
}

export const stockOfflineRepository = {
  // --- ARTICLES ---
  async upsertArticle(article: StockArticleRow, syncStatus: SyncStatus = "synced") {
    const db = getStockOfflineDb();
    if (!db) return;

    const recordId = article.stockItem?.id ?? article.catalogItemId;

    const record: OfflineArticleRecord = {
      id: recordId,
      serverId: recordId.startsWith("local_") ? undefined : recordId,
      catalogItemId: article.catalogItemId,
      data: JSON.stringify(article),
      syncStatus,
      updatedAt: new Date().toISOString(),
      isDeleted: article.isArchived,
    };

    await db.articles.put(record);
  },

  async replaceLocalArticle(localId: string, serverArticle: StockArticleRow) {
    const db = getStockOfflineDb();
    if (!db) return;

    const recordId = serverArticle.stockItem?.id ?? serverArticle.catalogItemId;

    await db.transaction("rw", [db.articles, db.syncQueue], async () => {
      await db.articles.delete(localId);
      await db.articles.put({
        id: recordId,
        serverId: recordId,
        catalogItemId: serverArticle.catalogItemId,
        data: JSON.stringify(serverArticle),
        syncStatus: "synced",
        updatedAt: new Date().toISOString(),
        isDeleted: serverArticle.isArchived,
      });

      const queueItems = await db.syncQueue.toArray();
      for (const item of queueItems) {
        if (item.entityId === localId && item.id != null) {
          await db.syncQueue.update(item.id, { entityId: recordId });
        }
      }
    });
  },

  async listArticles(q?: string): Promise<StockArticleRow[]> {
    const db = getStockOfflineDb();
    if (!db) return [];

    const records = await db.articles.filter((r) => r.isDeleted !== true).toArray();
    let articles = records.map((r) => parseJson<StockArticleRow>(r.data));

    if (q?.trim()) {
      const searchTerm = q.trim().toLowerCase();
      articles = articles.filter(
        (art) =>
          art.reference.toLowerCase().includes(searchTerm) ||
          art.name.toLowerCase().includes(searchTerm),
      );
    }

    return articles.sort((a, b) => a.reference.localeCompare(b.reference, "fr"));
  },

  async getArticleByCatalogItem(catalogItemId: string): Promise<CatalogStockBundle | null> {
    const db = getStockOfflineDb();
    if (!db) return null;

    const record = await db.articles
      .where("catalogItemId")
      .equals(catalogItemId)
      .first();

    if (!record) return null;
    const row = parseJson<StockArticleRow>(record.data);
    return {
      catalogItem: {
        id: row.catalogItemId,
        reference: row.reference,
        name: row.name,
        unit: row.unit,
        itemType: "PHYSICAL",
        stockQuantity: row.stockQuantity,
        isArchived: row.isArchived,
      },
      stockItem: row.stockItem,
    };
  },

  // --- WAREHOUSES & LOCATIONS ---
  async upsertWarehouse(warehouse: Warehouse, syncStatus: SyncStatus = "synced") {
    const db = getStockOfflineDb();
    if (!db) return;

    const record: OfflineWarehouseRecord = {
      id: warehouse.id,
      serverId: warehouse.id.startsWith("local_") ? undefined : warehouse.id,
      tenantId: warehouse.tenantId,
      data: JSON.stringify(warehouse),
      syncStatus,
      updatedAt: new Date().toISOString(),
      isDeleted: !warehouse.isActive,
    };

    await db.warehouses.put(record);
  },

  async listWarehouses(includeArchived = true): Promise<Warehouse[]> {
    const db = getStockOfflineDb();
    if (!db) return [];

    const records = await db.warehouses.toArray();
    return records
      .map((r) => parseJson<Warehouse>(r.data))
      .filter((w) => includeArchived || w.isActive)
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  },

  async getWarehouse(id: string): Promise<Warehouse | null> {
    const db = getStockOfflineDb();
    if (!db) return null;

    const record = await db.warehouses.get(id);
    if (!record) return null;
    return parseJson<Warehouse>(record.data);
  },

  // --- MOVEMENTS ---
  async upsertMovement(movement: StockMovement, syncStatus: SyncStatus = "synced") {
    const db = getStockOfflineDb();
    if (!db) return;

    const record: OfflineMovementRecord = {
      id: movement.id,
      serverId: movement.id.startsWith("local_") ? undefined : movement.id,
      movementType: movement.movementType,
      data: JSON.stringify(movement),
      syncStatus,
      updatedAt: new Date().toISOString(),
    };

    await db.movements.put(record);
  },

  async listMovements(type?: string): Promise<StockMovement[]> {
    const db = getStockOfflineDb();
    if (!db) return [];

    let records: OfflineMovementRecord[];
    if (type) {
      records = await db.movements.where("movementType").equals(type).toArray();
    } else {
      records = await db.movements.toArray();
    }

    return records
      .map((r) => parseJson<StockMovement>(r.data))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getMovement(id: string): Promise<StockMovement | null> {
    const db = getStockOfflineDb();
    if (!db) return null;

    const record = await db.movements.get(id);
    if (!record) return null;
    return parseJson<StockMovement>(record.data);
  },

  // --- TRANSFERS ---
  async upsertTransfer(transfer: StockTransfer, syncStatus: SyncStatus = "synced") {
    const db = getStockOfflineDb();
    if (!db) return;

    const record: OfflineTransferRecord = {
      id: transfer.id,
      serverId: transfer.id.startsWith("local_") ? undefined : transfer.id,
      data: JSON.stringify(transfer),
      syncStatus,
      updatedAt: new Date().toISOString(),
    };

    await db.transfers.put(record);
  },

  async listTransfers(): Promise<StockTransfer[]> {
    const db = getStockOfflineDb();
    if (!db) return [];

    const records = await db.transfers.toArray();
    return records
      .map((r) => parseJson<StockTransfer>(r.data))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getTransfer(id: string): Promise<StockTransfer | null> {
    const db = getStockOfflineDb();
    if (!db) return null;

    const record = await db.transfers.get(id);
    if (!record) return null;
    return parseJson<StockTransfer>(record.data);
  },

  // --- INVENTORIES ---
  async upsertInventory(inventory: InventorySession, syncStatus: SyncStatus = "synced") {
    const db = getStockOfflineDb();
    if (!db) return;

    const record: OfflineInventoryRecord = {
      id: inventory.id,
      serverId: inventory.id.startsWith("local_") ? undefined : inventory.id,
      data: JSON.stringify(inventory),
      syncStatus,
      updatedAt: new Date().toISOString(),
    };

    await db.inventories.put(record);
  },

  async listInventories(): Promise<InventorySession[]> {
    const db = getStockOfflineDb();
    if (!db) return [];

    const records = await db.inventories.toArray();
    return records
      .map((r) => parseJson<InventorySession>(r.data))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getInventory(id: string): Promise<InventorySession | null> {
    const db = getStockOfflineDb();
    if (!db) return null;

    const record = await db.inventories.get(id);
    if (!record) return null;
    return parseJson<InventorySession>(record.data);
  },

  // --- ALERTS & REPLENISHMENTS ---
  async upsertAlert(alert: StockAlert, syncStatus: SyncStatus = "synced") {
    const db = getStockOfflineDb();
    if (!db) return;

    const record: OfflineAlertRecord = {
      id: alert.id,
      serverId: alert.id.startsWith("local_") ? undefined : alert.id,
      status: alert.status,
      alertType: alert.alertType,
      data: JSON.stringify(alert),
      syncStatus,
      updatedAt: new Date().toISOString(),
    };

    await db.alerts.put(record);
  },

  async listAlerts(filters?: { status?: StockAlertStatus; alertType?: StockAlertType }): Promise<StockAlert[]> {
    const db = getStockOfflineDb();
    if (!db) return [];

    const records = await db.alerts.toArray();
    let alerts = records.map((r) => parseJson<StockAlert>(r.data));

    if (filters?.status) {
      alerts = alerts.filter((a) => a.status === filters.status);
    }
    if (filters?.alertType) {
      alerts = alerts.filter((a) => a.alertType === filters.alertType);
    }

    return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getAlertsSummary(): Promise<AlertsSummary> {
    const alerts = await this.listAlerts();
    const active = alerts.filter((a) => a.status === "open" || a.status === "acknowledged");
    const replenishments = await this.listReplenishments();
    const pendingReplenishments = replenishments.filter((r) => r.status === "pending").length;

    return {
      byType: [],
      openCount: active.length,
      pendingReplenishments,
    };
  },

  async upsertReplenishment(replenishment: ReplenishmentProposal, syncStatus: SyncStatus = "synced") {
    const db = getStockOfflineDb();
    if (!db) return;

    const record: OfflineReplenishmentRecord = {
      id: replenishment.id,
      serverId: replenishment.id.startsWith("local_") ? undefined : replenishment.id,
      status: replenishment.status,
      data: JSON.stringify(replenishment),
      syncStatus,
      updatedAt: new Date().toISOString(),
    };

    await db.replenishments.put(record);
  },

  async listReplenishments(): Promise<ReplenishmentProposal[]> {
    const db = getStockOfflineDb();
    if (!db) return [];

    const records = await db.replenishments.toArray();
    return records
      .map((r) => parseJson<ReplenishmentProposal>(r.data))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // --- VALUATION ---
  async setValuationCache(key: string, data: any) {
    const db = getStockOfflineDb();
    if (!db) return;

    const record: OfflineValuationRecord = {
      key,
      data: JSON.stringify(data),
      updatedAt: new Date().toISOString(),
    };

    await db.valuation.put(record);
  },

  async getValuationCache<T>(key: string): Promise<T | null> {
    const db = getStockOfflineDb();
    if (!db) return null;

    const record = await db.valuation.get(key);
    if (!record) return null;
    return parseJson<T>(record.data);
  },

  // --- META & QUEUE ---
  async setMeta(key: string, value: string) {
    const db = getStockOfflineDb();
    if (!db) return;
    await db.meta.put({ key, value });
  },

  async getMeta(key: string) {
    const db = getStockOfflineDb();
    if (!db) return null;
    const row = await db.meta.get(key);
    return row?.value ?? null;
  },

  async getPendingCount() {
    const db = getStockOfflineDb();
    if (!db) return 0;
    return db.syncQueue.count();
  },
};
