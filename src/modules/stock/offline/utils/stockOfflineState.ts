import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { useStockSyncStore } from "../store/stockSyncStore";

export function setStockOfflineMode(offline: boolean): void {
  if (typeof window === "undefined") return;
  useStockSyncStore.getState().setOffline(offline);
}

export function clearStockOfflineIfOnline(): void {
  if (typeof window === "undefined") return;
  if (isBrowserOnline()) {
    useStockSyncStore.getState().setOffline(false);
  }
}
