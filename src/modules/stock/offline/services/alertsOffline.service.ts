import { isOfflineError } from "@/shared/core/OfflineError";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { withTimeout } from "@/shared/lib/withTimeout";
import { alertsApi } from "../../alerts/services/alertsApi.service";

import type {
  StockAlert,
  AlertsSummary,
  ReplenishmentProposal,
  StockAlertStatus,
  StockAlertType,
  ScanResult,
} from "../../alerts/types/alerts.types";

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
  const offlineData = await offlineReader();

  if (isOfflineMode()) {
    return offlineData;
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
      return offlineData;
    }
    throw error;
  }
}

function assertOnlineForAction() {
  if (isOfflineMode()) {
    throw new Error(OFFLINE_ACTION_ERROR);
  }
}

export const alertsOfflineService = {
  isOnline: () => !isOfflineMode(),

  async list(filters?: {
    status?: StockAlertStatus;
    alertType?: StockAlertType;
  }): Promise<StockAlert[]> {
    return readWithOfflineFallback(
      async () => {
        const data = await alertsApi.list(filters);
        await Promise.all(data.map((alt) => stockOfflineRepository.upsertAlert(alt, "synced")));
        return data;
      },
      () => stockOfflineRepository.listAlerts(filters),
    );
  },

  async summary(): Promise<AlertsSummary> {
    return readWithOfflineFallback(
      () => alertsApi.summary(),
      () => stockOfflineRepository.getAlertsSummary(),
    );
  },

  async get(id: string): Promise<StockAlert> {
    return readWithOfflineFallback(
      async () => {
        const alt = await alertsApi.get(id);
        await stockOfflineRepository.upsertAlert(alt, "synced");
        return alt;
      },
      async () => {
        const cached = (await stockOfflineRepository.listAlerts()).find((a) => a.id === id);
        if (!cached) throw new Error("Alerte introuvable en mode hors-ligne");
        return cached;
      },
    );
  },

  async scan(dormantDays?: number): Promise<ScanResult> {
    assertOnlineForAction();
    return alertsApi.scan(dormantDays);
  },

  async acknowledge(id: string): Promise<StockAlert> {
    assertOnlineForAction();
    const alt = await alertsApi.acknowledge(id);
    await stockOfflineRepository.upsertAlert(alt, "synced");
    return alt;
  },

  async dismiss(id: string): Promise<StockAlert> {
    assertOnlineForAction();
    const alt = await alertsApi.dismiss(id);
    await stockOfflineRepository.upsertAlert(alt, "synced");
    return alt;
  },

  async listReplenishments(): Promise<ReplenishmentProposal[]> {
    return readWithOfflineFallback(
      async () => {
        const data = await alertsApi.listReplenishments();
        await Promise.all(data.map((r) => stockOfflineRepository.upsertReplenishment(r, "synced")));
        return data;
      },
      () => stockOfflineRepository.listReplenishments(),
    );
  },

  async createReplenishment(payload: {
    alertId: string;
    qtyProposed?: number;
  }): Promise<ReplenishmentProposal> {
    assertOnlineForAction();
    const created = await alertsApi.createReplenishment(payload);
    await stockOfflineRepository.upsertReplenishment(created, "synced");
    return created;
  },

  async approveReplenishment(id: string): Promise<ReplenishmentProposal> {
    assertOnlineForAction();
    const updated = await alertsApi.approveReplenishment(id);
    await stockOfflineRepository.upsertReplenishment(updated, "synced");
    return updated;
  },

  async rejectReplenishment(id: string, reason?: string): Promise<ReplenishmentProposal> {
    assertOnlineForAction();
    const updated = await alertsApi.rejectReplenishment(id, reason);
    await stockOfflineRepository.upsertReplenishment(updated, "synced");
    return updated;
  },
};
