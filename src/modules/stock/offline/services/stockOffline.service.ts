import { isOfflineError } from "@/shared/core/OfflineError";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { withTimeout } from "@/shared/lib/withTimeout";
import { stockApi } from "../../services/stockApi.service";

import type {
  CatalogStockBundle,
  CreateStockItemPayload,
  CreateWarehouseLocationPayload,
  CreateWarehousePayload,
  StockArticleRow,
  StockItem,
  UpdateStockItemPayload,
  UpdateWarehouseLocationPayload,
  UpdateWarehousePayload,
  Warehouse,
  WarehouseLocation,
  CreateStockEntryPayload,
  CreateStockExitPayload,
  AvailableLotsResponse,
  StockMovement,
  StockTransfer,
  CreateStockTransferPayload,
  ReceiveStockTransferPayload,
} from "../../types/stock.types";

import { createLocalId } from "../types/offline.types";
import { clearStockOfflineIfOnline, setStockOfflineMode } from "../utils/stockOfflineState";
import { stockOfflineRepository } from "./stockOfflineRepository";
import { stockSyncQueue } from "./stockSyncQueue.service";
import { useStockSyncStore } from "../store/stockSyncStore";

const API_READ_TIMEOUT_MS = 8_000;
const OFFLINE_ACTION_ERROR = "Cette action nécessite une connexion réseau. Réessayez une fois en ligne.";

function isOfflineMode() {
  if (typeof window === "undefined") return false;
  if (!isBrowserOnline()) return true;
  return useStockSyncStore.getState().isOffline;
}

function setStockOffline(offline: boolean) {
  setStockOfflineMode(offline);
}

async function readWithOfflineFallback<T>(
  onlineReader: () => Promise<T>,
  offlineReader: () => Promise<T>,
): Promise<T> {
  if (isOfflineMode()) {
    return await offlineReader();
  }

  try {
    const data = await withTimeout(onlineReader(), API_READ_TIMEOUT_MS);
    if (isBrowserOnline()) {
      clearStockOfflineIfOnline();
    }
    return data;
  } catch (error) {
    if (!isBrowserOnline() || isOfflineError(error)) {
      setStockOffline(true);
      return await offlineReader();
    }
    throw error;
  }
}

function assertOnlineForAction() {
  if (isOfflineMode()) {
    throw new Error(OFFLINE_ACTION_ERROR);
  }
}

export const stockOfflineService = {
  isOnline: () => !isOfflineMode(),

  // --- ARTICLES ---
  async listArticles(q?: string): Promise<StockArticleRow[]> {
    return readWithOfflineFallback(
      async () => {
        const data = await stockApi.listArticles(q);
        await Promise.all(data.map((art) => stockOfflineRepository.upsertArticle(art, "synced")));
        return data;
      },
      () => stockOfflineRepository.listArticles(q),
    );
  },

  async getByCatalogItem(catalogItemId: string): Promise<CatalogStockBundle> {
    return readWithOfflineFallback(
      async () => {
        const bundle = await stockApi.getByCatalogItem(catalogItemId);
        if (bundle.stockItem) {
          const row: StockArticleRow = {
            catalogItemId: bundle.catalogItem.id,
            reference: bundle.catalogItem.reference,
            name: bundle.catalogItem.name,
            unit: bundle.catalogItem.unit,
            stockQuantity: bundle.catalogItem.stockQuantity ?? 0,
            isArchived: bundle.catalogItem.isArchived,
            configured: true,
            stockItem: bundle.stockItem,
          };
          await stockOfflineRepository.upsertArticle(row, "synced");
        }
        return bundle;
      },
      async () => {
        const cached = await stockOfflineRepository.getArticleByCatalogItem(catalogItemId);
        if (!cached) throw new Error("Article introuvable en mode hors-ligne");
        return cached;
      },
    );
  },

  async createItem(payload: CreateStockItemPayload): Promise<StockItem> {
    if (!isOfflineMode()) {
      const created = await stockApi.createItem(payload);
      const row: StockArticleRow = {
        catalogItemId: created.commercialItemId,
        reference: created.commercialItemId,
        name: created.commercialItemId,
        unit: created.storageUnit,
        stockQuantity: 0,
        isArchived: false,
        configured: true,
        stockItem: created,
      };
      await stockOfflineRepository.upsertArticle(row, "synced");
      return created;
    }

    const localId = createLocalId();
    const optimistic: StockItem = {
      id: localId,
      tenantId: "local",
      commercialItemId: payload.commercialItemId,
      trackLots: payload.trackLots ?? false,
      trackSerials: payload.trackSerials ?? false,
      trackExpiry: payload.trackExpiry ?? false,
      expiryAlertDays: payload.expiryAlertDays ?? 30,
      valuationMethod: payload.valuationMethod ?? "cmup",
      storageUnit: payload.storageUnit,
      conversionFactor: payload.conversionFactor ?? 1,
      minStockQty: payload.minStockQty ?? null,
      safetyStockQty: payload.safetyStockQty ?? null,
      maxStockQty: payload.maxStockQty ?? null,
      reorderQty: payload.reorderQty ?? null,
      defaultWarehouseId: payload.defaultWarehouseId ?? null,
      defaultLocationId: payload.defaultLocationId ?? null,
      allowNegativeStock: payload.allowNegativeStock ?? false,
      currentCmup: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const row: StockArticleRow = {
      catalogItemId: payload.commercialItemId,
      reference: payload.commercialItemId,
      name: payload.commercialItemId,
      unit: payload.storageUnit,
      stockQuantity: 0,
      isArchived: false,
      configured: true,
      stockItem: optimistic,
    };

    await stockOfflineRepository.upsertArticle(row, "pending");
    await stockSyncQueue.enqueue({
      operation: "createStockItem",
      entityId: localId,
      payload: stockSyncQueue.payload(payload),
    });

    return optimistic;
  },

  async updateItem(id: string, payload: UpdateStockItemPayload): Promise<StockItem> {
    if (!isOfflineMode()) {
      const updated = await stockApi.updateItem(id, payload);
      return updated;
    }

    await stockSyncQueue.enqueue({
      operation: "updateStockItem",
      entityId: id,
      payload: stockSyncQueue.payload(payload),
    });

    return {
      id,
      tenantId: "local",
      commercialItemId: id,
      trackLots: payload.trackLots ?? false,
      trackSerials: payload.trackSerials ?? false,
      trackExpiry: payload.trackExpiry ?? false,
      expiryAlertDays: payload.expiryAlertDays ?? 30,
      valuationMethod: payload.valuationMethod ?? "cmup",
      storageUnit: payload.storageUnit ?? "PCS",
      conversionFactor: payload.conversionFactor ?? 1,
      minStockQty: payload.minStockQty ?? null,
      safetyStockQty: payload.safetyStockQty ?? null,
      maxStockQty: payload.maxStockQty ?? null,
      reorderQty: payload.reorderQty ?? null,
      defaultWarehouseId: payload.defaultWarehouseId ?? null,
      defaultLocationId: payload.defaultLocationId ?? null,
      allowNegativeStock: payload.allowNegativeStock ?? false,
      currentCmup: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  // --- WAREHOUSES ---
  async listWarehouses(includeArchived = true): Promise<Warehouse[]> {
    return readWithOfflineFallback(
      async () => {
        const data = await stockApi.listWarehouses(includeArchived);
        await Promise.all(data.map((wh) => stockOfflineRepository.upsertWarehouse(wh, "synced")));
        return data;
      },
      () => stockOfflineRepository.listWarehouses(includeArchived),
    );
  },

  async createWarehouse(payload: CreateWarehousePayload): Promise<Warehouse> {
    if (!isOfflineMode()) {
      const wh = await stockApi.createWarehouse(payload);
      await stockOfflineRepository.upsertWarehouse(wh, "synced");
      return wh;
    }

    const localId = createLocalId();
    const optimistic: Warehouse = {
      id: localId,
      tenantId: "local",
      code: payload.code,
      name: payload.name,
      address: payload.address ?? null,
      isDefault: payload.isDefault ?? false,
      isActive: payload.isActive ?? true,
      managerUserId: null,
      locations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await stockOfflineRepository.upsertWarehouse(optimistic, "pending");
    await stockSyncQueue.enqueue({
      operation: "createWarehouse",
      entityId: localId,
      payload: stockSyncQueue.payload(payload),
    });

    return optimistic;
  },

  async updateWarehouse(id: string, payload: UpdateWarehousePayload): Promise<Warehouse> {
    if (!isOfflineMode()) {
      const wh = await stockApi.updateWarehouse(id, payload);
      await stockOfflineRepository.upsertWarehouse(wh, "synced");
      return wh;
    }

    const existing = await stockOfflineRepository.getWarehouse(id);
    if (!existing) throw new Error("Entrepôt introuvable en mode hors-ligne");

    const updated: Warehouse = {
      ...existing,
      name: payload.name ?? existing.name,
      address: payload.address !== undefined ? payload.address : existing.address,
      isActive: payload.isActive ?? existing.isActive,
      updatedAt: new Date().toISOString(),
    };

    await stockOfflineRepository.upsertWarehouse(updated, "pending");
    await stockSyncQueue.enqueue({
      operation: "updateWarehouse",
      entityId: id,
      payload: stockSyncQueue.payload(payload),
    });

    return updated;
  },

  async setDefaultWarehouse(id: string): Promise<Warehouse> {
    if (!isOfflineMode()) {
      const wh = await stockApi.setDefaultWarehouse(id);
      await stockOfflineRepository.upsertWarehouse(wh, "synced");
      return wh;
    }

    const existing = await stockOfflineRepository.getWarehouse(id);
    if (!existing) throw new Error("Entrepôt introuvable");

    const updated: Warehouse = { ...existing, isDefault: true };
    await stockOfflineRepository.upsertWarehouse(updated, "pending");
    await stockSyncQueue.enqueue({
      operation: "setDefaultWarehouse",
      entityId: id,
      payload: stockSyncQueue.payload({}),
    });
    return updated;
  },

  async archiveWarehouse(id: string): Promise<Warehouse> {
    if (!isOfflineMode()) {
      const wh = await stockApi.archiveWarehouse(id);
      await stockOfflineRepository.upsertWarehouse(wh, "synced");
      return wh;
    }

    const existing = await stockOfflineRepository.getWarehouse(id);
    if (!existing) throw new Error("Entrepôt introuvable");

    const updated: Warehouse = { ...existing, isActive: false };
    await stockOfflineRepository.upsertWarehouse(updated, "pending");
    await stockSyncQueue.enqueue({
      operation: "archiveWarehouse",
      entityId: id,
      payload: stockSyncQueue.payload({}),
    });
    return updated;
  },

  async reactivateWarehouse(id: string): Promise<Warehouse> {
    if (!isOfflineMode()) {
      const wh = await stockApi.reactivateWarehouse(id);
      await stockOfflineRepository.upsertWarehouse(wh, "synced");
      return wh;
    }

    const existing = await stockOfflineRepository.getWarehouse(id);
    if (!existing) throw new Error("Entrepôt introuvable");

    const updated: Warehouse = { ...existing, isActive: true };
    await stockOfflineRepository.upsertWarehouse(updated, "pending");
    await stockSyncQueue.enqueue({
      operation: "reactivateWarehouse",
      entityId: id,
      payload: stockSyncQueue.payload({}),
    });
    return updated;
  },

  async createLocation(
    warehouseId: string,
    payload: CreateWarehouseLocationPayload,
  ): Promise<WarehouseLocation> {
    if (!isOfflineMode()) {
      const loc = await stockApi.createLocation(warehouseId, payload);
      const wh = await stockOfflineRepository.getWarehouse(warehouseId);
      if (wh) {
        wh.locations = [...(wh.locations ?? []), loc];
        await stockOfflineRepository.upsertWarehouse(wh, "synced");
      }
      return loc;
    }

    const localId = createLocalId();
    const loc: WarehouseLocation = {
      id: localId,
      tenantId: "local",
      warehouseId,
      code: `${payload.zone}-${payload.aisle}-${payload.rack}-${payload.bin}`,
      zone: payload.zone,
      aisle: payload.aisle,
      rack: payload.rack,
      bin: payload.bin,
      capacity: payload.capacity ?? null,
      isActive: payload.isActive ?? true,
      createdAt: new Date().toISOString(),
    };

    const wh = await stockOfflineRepository.getWarehouse(warehouseId);
    if (wh) {
      wh.locations = [...(wh.locations ?? []), loc];
      await stockOfflineRepository.upsertWarehouse(wh, "pending");
    }

    await stockSyncQueue.enqueue({
      operation: "createWarehouseLocation",
      entityId: localId,
      parentId: warehouseId,
      payload: stockSyncQueue.payload(payload),
    });

    return loc;
  },

  async updateLocation(
    warehouseId: string,
    locationId: string,
    payload: UpdateWarehouseLocationPayload,
  ): Promise<WarehouseLocation> {
    if (!isOfflineMode()) {
      const loc = await stockApi.updateLocation(warehouseId, locationId, payload);
      return loc;
    }

    await stockSyncQueue.enqueue({
      operation: "updateWarehouseLocation",
      entityId: locationId,
      parentId: warehouseId,
      payload: stockSyncQueue.payload({ locationId, payload }),
    });

    return {
      id: locationId,
      tenantId: "local",
      warehouseId,
      code: "LOC",
      zone: "A",
      aisle: "01",
      rack: "01",
      bin: "01",
      capacity: payload.capacity ?? null,
      isActive: payload.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
  },

  // --- MOVEMENTS ---
  async listEntries(): Promise<StockMovement[]> {
    return readWithOfflineFallback(
      async () => {
        const data = await stockApi.listEntries();
        await Promise.all(data.map((m) => stockOfflineRepository.upsertMovement(m, "synced")));
        return data;
      },
      () => stockOfflineRepository.listMovements("ENTRY"),
    );
  },

  async listExits(): Promise<StockMovement[]> {
    return readWithOfflineFallback(
      async () => {
        const data = await stockApi.listExits();
        await Promise.all(data.map((m) => stockOfflineRepository.upsertMovement(m, "synced")));
        return data;
      },
      () => stockOfflineRepository.listMovements("EXIT"),
    );
  },

  async getMovement(id: string): Promise<StockMovement> {
    return readWithOfflineFallback(
      async () => {
        const m = await stockApi.getMovement(id);
        await stockOfflineRepository.upsertMovement(m, "synced");
        return m;
      },
      async () => {
        const cached = await stockOfflineRepository.getMovement(id);
        if (!cached) throw new Error("Mouvement introuvable en mode hors-ligne");
        return cached;
      },
    );
  },

  async createEntry(payload: CreateStockEntryPayload): Promise<StockMovement> {
    if (!isOfflineMode()) {
      const created = await stockApi.createEntry(payload);
      await stockOfflineRepository.upsertMovement(created, "synced");
      return created;
    }

    const localId = createLocalId();
    const optimistic: StockMovement = {
      id: localId,
      number: `ENT-LOCAL-${localId.slice(-6).toUpperCase()}`,
      movementType: payload.movementType,
      status: "draft",
      warehouseId: payload.warehouseId,
      movementDate: payload.movementDate ?? new Date().toISOString(),
      reference: payload.reference ?? null,
      supplierId: payload.supplierId ?? null,
      qualityStatus: payload.qualityStatus ?? null,
      reason: payload.reason ?? null,
      notes: payload.notes ?? null,
      createdAt: new Date().toISOString(),
      lines: payload.lines.map((l, idx) => ({
        id: `${localId}-${idx}`,
        qtyPlanned: l.qtyPlanned,
        qtyActual: l.qtyActual ?? l.qtyPlanned,
        unitCost: l.unitCost,
        totalCost: (l.qtyActual ?? l.qtyPlanned) * l.unitCost,
        lotNumber: l.lotNumber ?? null,
        location: l.locationId ? { id: l.locationId, code: "LOC" } : null,
      })),
    };

    await stockOfflineRepository.upsertMovement(optimistic, "pending");
    await stockSyncQueue.enqueue({
      operation: "createStockEntry",
      entityId: localId,
      payload: stockSyncQueue.payload(payload),
    });

    return optimistic;
  },

  async createExit(payload: CreateStockExitPayload): Promise<StockMovement> {
    if (!isOfflineMode()) {
      const created = await stockApi.createExit(payload);
      await stockOfflineRepository.upsertMovement(created, "synced");
      return created;
    }

    const localId = createLocalId();
    const optimistic: StockMovement = {
      id: localId,
      number: `SORT-LOCAL-${localId.slice(-6).toUpperCase()}`,
      movementType: payload.movementType,
      status: "validated",
      warehouseId: payload.warehouseId,
      movementDate: payload.movementDate ?? new Date().toISOString(),
      reference: payload.reference ?? null,
      supplierId: null,
      qualityStatus: null,
      reason: payload.reason ?? null,
      notes: payload.notes ?? null,
      createdAt: new Date().toISOString(),
      lines: payload.lines.map((l, idx) => ({
        id: `${localId}-${idx}`,
        qtyPlanned: l.qty,
        qtyActual: l.qty,
        unitCost: 0,
        totalCost: 0,
        location: l.locationId ? { id: l.locationId, code: "LOC" } : null,
      })),
    };

    await stockOfflineRepository.upsertMovement(optimistic, "pending");
    await stockSyncQueue.enqueue({
      operation: "createStockExit",
      entityId: localId,
      payload: stockSyncQueue.payload(payload),
    });

    return optimistic;
  },

  async validateEntry(id: string): Promise<StockMovement> {
    assertOnlineForAction();
    const validated = await stockApi.validateEntry(id);
    await stockOfflineRepository.upsertMovement(validated, "synced");
    return validated;
  },

  async listAvailableLots(
    stockItemId: string,
    warehouseId: string,
  ): Promise<AvailableLotsResponse> {
    return readWithOfflineFallback(
      () => stockApi.listAvailableLots(stockItemId, warehouseId),
      async () => ({
        stockItemId,
        valuationMethod: "cmup",
        trackLots: true,
        trackSerials: false,
        levels: [],
      }),
    );
  },

  // --- TRANSFERS ---
  async listTransfers(): Promise<StockTransfer[]> {
    return readWithOfflineFallback(
      async () => {
        const data = await stockApi.listTransfers();
        await Promise.all(data.map((tr) => stockOfflineRepository.upsertTransfer(tr, "synced")));
        return data;
      },
      () => stockOfflineRepository.listTransfers(),
    );
  },

  async getTransfer(id: string): Promise<StockTransfer> {
    return readWithOfflineFallback(
      async () => {
        const tr = await stockApi.getTransfer(id);
        await stockOfflineRepository.upsertTransfer(tr, "synced");
        return tr;
      },
      async () => {
        const cached = await stockOfflineRepository.getTransfer(id);
        if (!cached) throw new Error("Transfert introuvable en mode hors-ligne");
        return cached;
      },
    );
  },

  async createTransfer(payload: CreateStockTransferPayload): Promise<StockTransfer> {
    if (!isOfflineMode()) {
      const created = await stockApi.createTransfer(payload);
      await stockOfflineRepository.upsertTransfer(created, "synced");
      return created;
    }

    const localId = createLocalId();
    const optimistic: StockTransfer = {
      id: localId,
      number: `TR-LOCAL-${localId.slice(-6).toUpperCase()}`,
      status: "draft",
      sourceWarehouseId: payload.sourceWarehouseId,
      destWarehouseId: payload.destWarehouseId,
      plannedDate: payload.plannedDate ?? null,
      shippedAt: null,
      receivedAt: null,
      movementOutId: null,
      movementInId: null,
      varianceReason: null,
      notes: payload.notes ?? null,
      createdAt: new Date().toISOString(),
      lines: payload.lines.map((l, idx) => ({
        id: `${localId}-${idx}`,
        stockItemId: l.stockItemId,
        lotId: l.lotId ?? null,
        lotNumber: null,
        serialNumbers: l.serialNumbers ?? [],
        sourceLocationId: l.sourceLocationId ?? null,
        destLocationId: l.destLocationId ?? null,
        qtyPlanned: l.qty,
        qtyShipped: 0,
        qtyReceived: null,
        unitCost: 0,
        varianceReason: null,
      })),
    };

    await stockOfflineRepository.upsertTransfer(optimistic, "pending");
    await stockSyncQueue.enqueue({
      operation: "createStockTransfer",
      entityId: localId,
      payload: stockSyncQueue.payload(payload),
    });

    return optimistic;
  },

  async submitTransfer(id: string): Promise<StockTransfer> {
    assertOnlineForAction();
    const tr = await stockApi.submitTransfer(id);
    await stockOfflineRepository.upsertTransfer(tr, "synced");
    return tr;
  },

  async shipTransfer(id: string): Promise<StockTransfer> {
    assertOnlineForAction();
    const tr = await stockApi.shipTransfer(id);
    await stockOfflineRepository.upsertTransfer(tr, "synced");
    return tr;
  },

  async receiveTransfer(
    id: string,
    payload: ReceiveStockTransferPayload,
  ): Promise<StockTransfer> {
    assertOnlineForAction();
    const tr = await stockApi.receiveTransfer(id, payload);
    await stockOfflineRepository.upsertTransfer(tr, "synced");
    return tr;
  },

  async cancelTransfer(id: string): Promise<StockTransfer> {
    assertOnlineForAction();
    const tr = await stockApi.cancelTransfer(id);
    await stockOfflineRepository.upsertTransfer(tr, "synced");
    return tr;
  },
};
