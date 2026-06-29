import type { QueryClient } from "@tanstack/react-query";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { INVOICES_QUERY_KEY } from "../../hooks/useInvoices";
import { invoicesOfflineRepository } from "./invoicesOfflineRepository";
import { invoicesSyncEngine } from "./invoicesSyncEngine.service";
import { invoicesSyncQueue } from "./invoicesSyncQueue.service";
import { useInvoicesSyncStore } from "../store/invoicesSyncStore";

export async function refreshInvoicesSyncMeta() {
  const [pendingCount, lastSyncAt] = await Promise.all([
    invoicesSyncQueue.count(),
    invoicesOfflineRepository.getMeta("lastSyncAt"),
  ]);
  const store = useInvoicesSyncStore.getState();
  store.setPendingCount(pendingCount);
  store.setLastSyncAt(lastSyncAt);
}

export async function triggerInvoicesSync(queryClient?: QueryClient) {
  if (!isBrowserOnline()) return;

  const store = useInvoicesSyncStore.getState();
  store.setSyncing(true);
  store.setLastError(null);

  try {
    const result = await invoicesSyncEngine.sync();
    if (isBrowserOnline()) {
      store.setOffline(false);
    }
    if (result.failed > 0) {
      store.setLastError(
        `${result.failed} opération(s) factures n'ont pas pu être synchronisées`,
      );
    }
    await refreshInvoicesSyncMeta();
    if (result.processed > 0 && queryClient) {
      await queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
    }
  } catch (error) {
    store.setLastError(
      error instanceof Error
        ? error.message
        : "Échec de synchronisation des factures",
    );
  } finally {
    store.setSyncing(false);
  }
}
