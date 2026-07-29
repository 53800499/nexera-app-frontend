import { create } from "zustand";
import type { StockSyncState } from "../types/offline.types";

type StockSyncStore = StockSyncState & {
  setOffline: (offline: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setPendingCount: (count: number) => void;
  setLastSyncAt: (value: string | null) => void;
  setLastError: (error: string | null) => void;
  hydrate: (partial: Partial<StockSyncState>) => void;
};

export const useStockSyncStore = create<StockSyncStore>((set) => ({
  isOffline: false,
  isSyncing: false,
  pendingCount: 0,
  lastSyncAt: null,
  lastError: null,
  setOffline: (isOffline) => set({ isOffline }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
  setLastError: (lastError) => set({ lastError }),
  hydrate: (partial) => set(partial),
}));
