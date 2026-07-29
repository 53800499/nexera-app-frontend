import { isOfflineError } from "@/shared/core/OfflineError";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { withTimeout } from "@/shared/lib/withTimeout";
import { inventoryApi } from "../../inventory/services/inventoryApi.service";

import type {
  InventorySession,
  InventoryVariancesResponse,
  CreateInventorySessionPayload,
  SubmitInventoryCountsPayload,
} from "../../inventory/types/inventory.types";

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

export const inventoryOfflineService = {
  isOnline: () => !isOfflineMode(),

  async list(): Promise<InventorySession[]> {
    return readWithOfflineFallback(
      async () => {
        const data = await inventoryApi.list();
        await Promise.all(data.map((inv) => stockOfflineRepository.upsertInventory(inv, "synced")));
        return data;
      },
      () => stockOfflineRepository.listInventories(),
    );
  },

  async get(id: string): Promise<InventorySession> {
    return readWithOfflineFallback(
      async () => {
        const inv = await inventoryApi.get(id);
        await stockOfflineRepository.upsertInventory(inv, "synced");
        return inv;
      },
      async () => {
        const cached = await stockOfflineRepository.getInventory(id);
        if (!cached) throw new Error("Session d'inventaire introuvable en mode hors-ligne");
        return cached;
      },
    );
  },

  async getCountSheet(id: string): Promise<InventorySession> {
    return readWithOfflineFallback(
      () => inventoryApi.getCountSheet(id),
      async () => {
        const cached = await stockOfflineRepository.getInventory(id);
        if (!cached) throw new Error("Feuille de comptage introuvable en mode hors-ligne");
        return cached;
      },
    );
  },

  async getVariances(
    id: string,
    significantOnly: boolean,
  ): Promise<InventoryVariancesResponse> {
    return readWithOfflineFallback(
      () => inventoryApi.getVariances(id, significantOnly),
      async () => ({
        session: {
          id,
          number: "INV-LOCAL",
          status: "counting",
          significantVarianceValue: 10000,
        },
        lines: [],
      }),
    );
  },

  async create(payload: CreateInventorySessionPayload): Promise<InventorySession> {
    if (!isOfflineMode()) {
      const created = await inventoryApi.create(payload);
      await stockOfflineRepository.upsertInventory(created, "synced");
      return created;
    }

    const localId = createLocalId();
    const optimistic: InventorySession = {
      id: localId,
      number: `INV-LOCAL-${localId.slice(-6).toUpperCase()}`,
      type: payload.type,
      status: "draft",
      warehouseId: payload.warehouseId,
      categoryId: payload.categoryId ?? null,
      plannedDate: payload.plannedDate ?? null,
      freezeMovements: payload.freezeMovements ?? false,
      varianceThresholdQty: payload.varianceThresholdQty ?? 0,
      significantVarianceValue: payload.significantVarianceValue ?? 10000,
      startedAt: null,
      validatedAt: null,
      closedAt: null,
      notes: payload.notes ?? null,
      lines: [],
      createdAt: new Date().toISOString(),
    };

    await stockOfflineRepository.upsertInventory(optimistic, "pending");
    await stockSyncQueue.enqueue({
      operation: "createInventorySession",
      entityId: localId,
      payload: stockSyncQueue.payload(payload),
    });

    return optimistic;
  },

  async start(id: string): Promise<InventorySession> {
    if (!isOfflineMode()) {
      const started = await inventoryApi.start(id);
      await stockOfflineRepository.upsertInventory(started, "synced");
      return started;
    }

    const existing = await stockOfflineRepository.getInventory(id);
    if (!existing) throw new Error("Inventaire introuvable");

    const updated: InventorySession = {
      ...existing,
      status: "counting",
      startedAt: new Date().toISOString(),
    };

    await stockOfflineRepository.upsertInventory(updated, "pending");
    await stockSyncQueue.enqueue({
      operation: "startInventorySession",
      entityId: id,
      payload: stockSyncQueue.payload({}),
    });

    return updated;
  },

  async submitCounts(
    id: string,
    payload: SubmitInventoryCountsPayload,
  ): Promise<InventorySession> {
    if (!isOfflineMode()) {
      const updated = await inventoryApi.submitCounts(id, payload);
      await stockOfflineRepository.upsertInventory(updated, "synced");
      return updated;
    }

    const existing = await stockOfflineRepository.getInventory(id);
    if (!existing) throw new Error("Inventaire introuvable");

    const updatedLines = [...(existing.lines ?? [])];
    for (const count of payload.lines) {
      const idx = updatedLines.findIndex((l) => l.id === count.lineId);
      if (idx !== -1) {
        updatedLines[idx] = {
          ...updatedLines[idx],
          qtyCounted1: count.qtyCounted,
        };
      }
    }

    const updated: InventorySession = {
      ...existing,
      lines: updatedLines,
    };

    await stockOfflineRepository.upsertInventory(updated, "pending");
    await stockSyncQueue.enqueue({
      operation: "submitInventoryCounts",
      entityId: id,
      payload: stockSyncQueue.payload(payload),
    });

    return updated;
  },

  async completeCount(id: string): Promise<InventorySession> {
    assertOnlineForAction();
    const updated = await inventoryApi.completeCount(id);
    await stockOfflineRepository.upsertInventory(updated, "synced");
    return updated;
  },

  async completeRecount(id: string): Promise<InventorySession> {
    assertOnlineForAction();
    const updated = await inventoryApi.completeRecount(id);
    await stockOfflineRepository.upsertInventory(updated, "synced");
    return updated;
  },

  async validate(id: string): Promise<InventorySession> {
    assertOnlineForAction();
    const updated = await inventoryApi.validate(id);
    await stockOfflineRepository.upsertInventory(updated, "synced");
    return updated;
  },

  async close(id: string): Promise<InventorySession> {
    assertOnlineForAction();
    const updated = await inventoryApi.close(id);
    await stockOfflineRepository.upsertInventory(updated, "synced");
    return updated;
  },

  async cancel(id: string): Promise<InventorySession> {
    assertOnlineForAction();
    const updated = await inventoryApi.cancel(id);
    await stockOfflineRepository.upsertInventory(updated, "synced");
    return updated;
  },
};
