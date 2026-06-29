import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { useInvoicesSyncStore } from "../store/invoicesSyncStore";

export function setInvoicesOfflineMode(offline: boolean): void {
  if (typeof window === "undefined") return;
  useInvoicesSyncStore.getState().setOffline(offline);
}

export function clearInvoicesOfflineIfOnline(): void {
  if (typeof window === "undefined") return;
  if (isBrowserOnline()) {
    useInvoicesSyncStore.getState().setOffline(false);
  }
}
