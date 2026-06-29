import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { useCrmSyncStore } from "../store/crmSyncStore";

export function setCrmOfflineMode(offline: boolean): void {
  if (typeof window === "undefined") return;
  useCrmSyncStore.getState().setOffline(offline);
}

export function clearCrmOfflineIfOnline(): void {
  if (typeof window === "undefined") return;
  if (isBrowserOnline()) {
    useCrmSyncStore.getState().setOffline(false);
  }
}
