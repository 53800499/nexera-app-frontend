import { create } from "zustand";
import type { InvoicesSyncState } from "../types/offline.types";

type InvoicesSyncStore = InvoicesSyncState & {
  setOffline: (offline: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setPendingCount: (count: number) => void;
  setLastSyncAt: (value: string | null) => void;
  setLastError: (error: string | null) => void;
  hydrate: (partial: Partial<InvoicesSyncState>) => void;
};

export const useInvoicesSyncStore = create<InvoicesSyncStore>((set) => ({
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
