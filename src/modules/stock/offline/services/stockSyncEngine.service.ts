import { isLocalId } from "../types/offline.types";
import { stockApi } from "../../services/stockApi.service";
import { inventoryApi } from "../../inventory/services/inventoryApi.service";
import { alertsApi } from "../../alerts/services/alertsApi.service";
import { valuationApi } from "../../valuation/services/valuationApi.service";

import type {
  CreateStockItemPayload,
  UpdateStockItemPayload,
  CreateWarehousePayload,
  UpdateWarehousePayload,
  CreateWarehouseLocationPayload,
  UpdateWarehouseLocationPayload,
  CreateStockEntryPayload,
  CreateStockExitPayload,
  CreateStockTransferPayload,
  ReceiveStockTransferPayload,
  StockArticleRow,
} from "../../types/stock.types";

import type {
  CreateInventorySessionPayload,
  SubmitInventoryCountsPayload,
} from "../../inventory/types/inventory.types";

import { stockOfflineRepository } from "./stockOfflineRepository";
import { stockSyncQueue } from "./stockSyncQueue.service";

let syncing = false;

async function resolveWarehouseId(warehouseId?: string | null): Promise<string | undefined> {
  if (!warehouseId || !isLocalId(warehouseId)) return warehouseId ?? undefined;
  const wh = await stockOfflineRepository.getWarehouse(warehouseId);
  if (wh && !isLocalId(wh.id)) return wh.id;
  throw new Error("L'entrepôt local n'est pas encore synchronisé.");
}

export const stockSyncEngine = {
  async sync(): Promise<{ processed: number; failed: number }> {
    if (syncing || typeof navigator === "undefined" || !navigator.onLine) {
      return { processed: 0, failed: 0 };
    }

    syncing = true;
    let processed = 0;
    let failed = 0;

    try {
      const queue = await stockSyncQueue.peekAll();

      for (const item of queue) {
        if (item.id == null) continue;

        try {
          await processQueueItem(item);
          await stockSyncQueue.remove(item.id);
          processed += 1;
        } catch (error) {
          failed += 1;
          const message =
            error instanceof Error ? error.message : "Erreur de synchronisation stock";
          await stockSyncQueue.markError(item.id, message);
        }
      }

      // Always pull latest stock data to keep IndexedDB fully cached when online
      await pullLatestStockData();

      await stockOfflineRepository.setMeta("lastSyncAt", new Date().toISOString());
    } finally {
      syncing = false;
    }

    return { processed, failed };
  },

  get isSyncing() {
    return syncing;
  },
};

async function processQueueItem(
  item: Awaited<ReturnType<typeof stockSyncQueue.peekAll>>[number],
) {
  switch (item.operation) {
    // --- ARTICLES ---
    case "createStockItem": {
      const payload = stockSyncQueue.parsePayload<CreateStockItemPayload>(item.payload);
      const created = await stockApi.createItem(payload);
      const articleRow: StockArticleRow = {
        catalogItemId: created.commercialItemId,
        reference: created.commercialItemId,
        name: created.commercialItemId,
        unit: created.storageUnit,
        stockQuantity: 0,
        isArchived: false,
        configured: true,
        stockItem: created,
      };
      await stockOfflineRepository.replaceLocalArticle(item.entityId, articleRow);
      return;
    }
    case "updateStockItem": {
      const payload = stockSyncQueue.parsePayload<UpdateStockItemPayload>(item.payload);
      await stockApi.updateItem(item.entityId, payload);
      return;
    }

    // --- WAREHOUSES & LOCATIONS ---
    case "createWarehouse": {
      const payload = stockSyncQueue.parsePayload<CreateWarehousePayload>(item.payload);
      const created = await stockApi.createWarehouse(payload);
      await stockOfflineRepository.upsertWarehouse(created, "synced");
      return;
    }
    case "updateWarehouse": {
      const payload = stockSyncQueue.parsePayload<UpdateWarehousePayload>(item.payload);
      const updated = await stockApi.updateWarehouse(item.entityId, payload);
      await stockOfflineRepository.upsertWarehouse(updated, "synced");
      return;
    }
    case "setDefaultWarehouse": {
      const updated = await stockApi.setDefaultWarehouse(item.entityId);
      await stockOfflineRepository.upsertWarehouse(updated, "synced");
      return;
    }
    case "archiveWarehouse": {
      const updated = await stockApi.archiveWarehouse(item.entityId);
      await stockOfflineRepository.upsertWarehouse(updated, "synced");
      return;
    }
    case "reactivateWarehouse": {
      const updated = await stockApi.reactivateWarehouse(item.entityId);
      await stockOfflineRepository.upsertWarehouse(updated, "synced");
      return;
    }
    case "createWarehouseLocation": {
      const payload = stockSyncQueue.parsePayload<CreateWarehouseLocationPayload>(item.payload);
      const whId = await resolveWarehouseId(item.parentId ?? item.entityId);
      if (!whId) throw new Error("ID Entrepôt manquant");
      await stockApi.createLocation(whId, payload);
      return;
    }
    case "updateWarehouseLocation": {
      const payload = stockSyncQueue.parsePayload<{
        locationId: string;
        payload: UpdateWarehouseLocationPayload;
      }>(item.payload);
      const whId = await resolveWarehouseId(item.parentId ?? item.entityId);
      if (!whId) throw new Error("ID Entrepôt manquant");
      await stockApi.updateLocation(whId, payload.locationId, payload.payload);
      return;
    }

    // --- MOVEMENTS ---
    case "createStockEntry": {
      const payload = stockSyncQueue.parsePayload<CreateStockEntryPayload>(item.payload);
      const created = await stockApi.createEntry(payload);
      await stockOfflineRepository.upsertMovement(created, "synced");
      return;
    }
    case "createStockExit": {
      const payload = stockSyncQueue.parsePayload<CreateStockExitPayload>(item.payload);
      const created = await stockApi.createExit(payload);
      await stockOfflineRepository.upsertMovement(created, "synced");
      return;
    }
    case "validateStockMovement": {
      const validated = await stockApi.validateEntry(item.entityId);
      await stockOfflineRepository.upsertMovement(validated, "synced");
      return;
    }

    // --- TRANSFERS ---
    case "createStockTransfer": {
      const payload = stockSyncQueue.parsePayload<CreateStockTransferPayload>(item.payload);
      const created = await stockApi.createTransfer(payload);
      await stockOfflineRepository.upsertTransfer(created, "synced");
      return;
    }
    case "submitStockTransfer": {
      const updated = await stockApi.submitTransfer(item.entityId);
      await stockOfflineRepository.upsertTransfer(updated, "synced");
      return;
    }
    case "shipStockTransfer": {
      const updated = await stockApi.shipTransfer(item.entityId);
      await stockOfflineRepository.upsertTransfer(updated, "synced");
      return;
    }
    case "receiveStockTransfer": {
      const payload = stockSyncQueue.parsePayload<ReceiveStockTransferPayload>(item.payload);
      const updated = await stockApi.receiveTransfer(item.entityId, payload);
      await stockOfflineRepository.upsertTransfer(updated, "synced");
      return;
    }
    case "cancelStockTransfer": {
      const updated = await stockApi.cancelTransfer(item.entityId);
      await stockOfflineRepository.upsertTransfer(updated, "synced");
      return;
    }

    // --- INVENTORIES ---
    case "createInventorySession": {
      const payload = stockSyncQueue.parsePayload<CreateInventorySessionPayload>(item.payload);
      const created = await inventoryApi.create(payload);
      await stockOfflineRepository.upsertInventory(created, "synced");
      return;
    }
    case "startInventorySession": {
      const started = await inventoryApi.start(item.entityId);
      await stockOfflineRepository.upsertInventory(started, "synced");
      return;
    }
    case "submitInventoryCounts": {
      const payload = stockSyncQueue.parsePayload<SubmitInventoryCountsPayload>(item.payload);
      const updated = await inventoryApi.submitCounts(item.entityId, payload);
      await stockOfflineRepository.upsertInventory(updated, "synced");
      return;
    }
    case "completeInventoryCount": {
      const updated = await inventoryApi.completeCount(item.entityId);
      await stockOfflineRepository.upsertInventory(updated, "synced");
      return;
    }
    case "completeInventoryRecount": {
      const updated = await inventoryApi.completeRecount(item.entityId);
      await stockOfflineRepository.upsertInventory(updated, "synced");
      return;
    }
    case "validateInventorySession": {
      const validated = await inventoryApi.validate(item.entityId);
      await stockOfflineRepository.upsertInventory(validated, "synced");
      return;
    }
    case "closeInventorySession": {
      const closed = await inventoryApi.close(item.entityId);
      await stockOfflineRepository.upsertInventory(closed, "synced");
      return;
    }
    case "cancelInventorySession": {
      const cancelled = await inventoryApi.cancel(item.entityId);
      await stockOfflineRepository.upsertInventory(cancelled, "synced");
      return;
    }

    // --- ALERTS & REPLENISHMENTS ---
    case "scanStockAlerts": {
      const dormantDays = item.payload ? Number(item.payload) : undefined;
      await alertsApi.scan(dormantDays);
      return;
    }
    case "acknowledgeStockAlert": {
      const updated = await alertsApi.acknowledge(item.entityId);
      await stockOfflineRepository.upsertAlert(updated, "synced");
      return;
    }
    case "dismissStockAlert": {
      const updated = await alertsApi.dismiss(item.entityId);
      await stockOfflineRepository.upsertAlert(updated, "synced");
      return;
    }
    case "createReplenishment": {
      const payload = stockSyncQueue.parsePayload<{ alertId: string; qtyProposed?: number }>(
        item.payload,
      );
      const created = await alertsApi.createReplenishment(payload);
      await stockOfflineRepository.upsertReplenishment(created, "synced");
      return;
    }
    case "approveReplenishment": {
      const updated = await alertsApi.approveReplenishment(item.entityId);
      await stockOfflineRepository.upsertReplenishment(updated, "synced");
      return;
    }
    case "rejectReplenishment": {
      const reason = item.payload ? item.payload : undefined;
      const updated = await alertsApi.rejectReplenishment(item.entityId, reason);
      await stockOfflineRepository.upsertReplenishment(updated, "synced");
      return;
    }

    // --- VALUATION ---
    case "publishValuation": {
      const params = item.payload ? stockSyncQueue.parsePayload<any>(item.payload) : undefined;
      await valuationApi.publish(params);
      return;
    }

    default:
      throw new Error(`Opération stock inconnue : ${item.operation}`);
  }
}

async function pullLatestStockData() {
  try {
    const [articles, warehouses, entries, exits, transfers, inventories, alerts] =
      await Promise.all([
        stockApi.listArticles().catch(() => []),
        stockApi.listWarehouses(true).catch(() => []),
        stockApi.listEntries().catch(() => []),
        stockApi.listExits().catch(() => []),
        stockApi.listTransfers().catch(() => []),
        inventoryApi.list().catch(() => []),
        alertsApi.list().catch(() => []),
      ]);

    for (const art of articles) {
      await stockOfflineRepository.upsertArticle(art, "synced");
    }
    for (const wh of warehouses) {
      await stockOfflineRepository.upsertWarehouse(wh, "synced");
    }
    for (const m of [...entries, ...exits]) {
      await stockOfflineRepository.upsertMovement(m, "synced");
    }
    for (const tr of transfers) {
      await stockOfflineRepository.upsertTransfer(tr, "synced");
    }
    for (const inv of inventories) {
      await stockOfflineRepository.upsertInventory(inv, "synced");
    }
    for (const alt of alerts) {
      await stockOfflineRepository.upsertAlert(alt, "synced");
    }
  } catch {
    // Ignore silent pull errors
  }
}
