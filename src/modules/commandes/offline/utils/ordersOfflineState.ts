import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { useOrdersSyncStore } from "../store/ordersSyncStore";

export function setOrdersOfflineMode(offline: boolean): void {
  if (typeof window === "undefined") return;
  useOrdersSyncStore.getState().setOffline(offline);
}

export function clearOrdersOfflineIfOnline(): void {
  if (typeof window === "undefined") return;
  if (isBrowserOnline()) {
    useOrdersSyncStore.getState().setOffline(false);
  }
}
