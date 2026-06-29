import { create } from "zustand";
import type { OrdersSyncState } from "../types/offline.types";

type OrdersSyncStore = OrdersSyncState & {
  setOffline: (offline: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setPendingCount: (count: number) => void;
  setLastSyncAt: (value: string | null) => void;
  setLastError: (error: string | null) => void;
  hydrate: (partial: Partial<OrdersSyncState>) => void;
};

export const useOrdersSyncStore = create<OrdersSyncStore>((set) => ({
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
