import { isOfflineError } from "@/shared/core/OfflineError";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { withTimeout } from "@/shared/lib/withTimeout";
import { valuationApi } from "../../valuation/services/valuationApi.service";

import type {
  ValuationReport,
  TurnoverReport,
  CmupHistoryResponse,
} from "../../valuation/types/valuation.types";

import { clearStockOfflineIfOnline, setStockOfflineMode } from "../utils/stockOfflineState";
import { stockOfflineRepository } from "./stockOfflineRepository";
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

export const valuationOfflineService = {
  isOnline: () => !isOfflineMode(),

  async getReport(params?: {
    asOf?: string;
    warehouseId?: string;
  }): Promise<ValuationReport> {
    const cacheKey = `valuation-report-${params?.asOf ?? "now"}-${params?.warehouseId ?? "all"}`;
    return readWithOfflineFallback(
      async () => {
        const data = await valuationApi.getReport(params);
        await stockOfflineRepository.setValuationCache(cacheKey, data);
        return data;
      },
      async () => {
        const cached = await stockOfflineRepository.getValuationCache<ValuationReport>(cacheKey);
        if (cached) return cached;
        return {
          asOf: params?.asOf ?? new Date().toISOString().slice(0, 10),
          warehouseId: params?.warehouseId ?? null,
          lines: [],
          totals: {
            totalQty: 0,
            totalValue: 0,
            lineCount: 0,
            byMethod: {},
          },
        };
      },
    );
  },

  async getTurnover(params: {
    from: string;
    to: string;
    warehouseId?: string;
  }): Promise<TurnoverReport> {
    const cacheKey = `turnover-report-${params.from}-${params.to}-${params.warehouseId ?? "all"}`;
    return readWithOfflineFallback(
      async () => {
        const data = await valuationApi.getTurnover(params);
        await stockOfflineRepository.setValuationCache(cacheKey, data);
        return data;
      },
      async () => {
        const cached = await stockOfflineRepository.getValuationCache<TurnoverReport>(cacheKey);
        if (cached) return cached;
        return {
          from: params.from,
          to: params.to,
          warehouseId: params.warehouseId ?? null,
          cogs: 0,
          qtySold: 0,
          openingValue: 0,
          closingValue: 0,
          averageStockValue: 0,
          turnoverRate: null,
          formula: "COGS / ((Opening + Closing) / 2)",
        };
      },
    );
  },

  async getCmupHistory(stockItemId: string): Promise<CmupHistoryResponse> {
    const cacheKey = `cmup-history-${stockItemId}`;
    return readWithOfflineFallback(
      async () => {
        const data = await valuationApi.getCmupHistory(stockItemId);
        await stockOfflineRepository.setValuationCache(cacheKey, data);
        return data;
      },
      async () => {
        const cached = await stockOfflineRepository.getValuationCache<CmupHistoryResponse>(cacheKey);
        if (cached) return cached;
        return {
          stockItemId,
          reference: "ARTICLE",
          name: "Article local",
          valuationMethod: "cmup",
          currentCmup: 0,
          history: [],
        };
      },
    );
  },

  async publish(params?: { asOf?: string; warehouseId?: string }): Promise<ValuationReport> {
    assertOnlineForAction();
    return valuationApi.publish(params);
  },
};
