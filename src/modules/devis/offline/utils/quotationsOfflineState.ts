import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { useQuotationsSyncStore } from "../store/quotationsSyncStore";

export function setQuotationsOfflineMode(offline: boolean): void {
  if (typeof window === "undefined") return;
  useQuotationsSyncStore.getState().setOffline(offline);
}

export function clearQuotationsOfflineIfOnline(): void {
  if (typeof window === "undefined") return;
  if (isBrowserOnline()) {
    useQuotationsSyncStore.getState().setOffline(false);
  }
}
