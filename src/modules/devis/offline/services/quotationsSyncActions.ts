import type { QueryClient } from "@tanstack/react-query";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { QUOTATIONS_QUERY_KEY } from "../../hooks/useQuotations";
import { quotationsOfflineRepository } from "./quotationsOfflineRepository";
import { quotationsSyncEngine } from "./quotationsSyncEngine.service";
import { quotationsSyncQueue } from "./quotationsSyncQueue.service";
import { useQuotationsSyncStore } from "../store/quotationsSyncStore";

export async function refreshQuotationsSyncMeta() {
  const [pendingCount, lastSyncAt] = await Promise.all([
    quotationsSyncQueue.count(),
    quotationsOfflineRepository.getMeta("lastSyncAt"),
  ]);
  const store = useQuotationsSyncStore.getState();
  store.setPendingCount(pendingCount);
  store.setLastSyncAt(lastSyncAt);
}

export async function triggerQuotationsSync(queryClient?: QueryClient) {
  if (!isBrowserOnline()) return;

  const store = useQuotationsSyncStore.getState();
  store.setSyncing(true);
  store.setLastError(null);

  try {
    const result = await quotationsSyncEngine.sync();
    if (isBrowserOnline()) {
      store.setOffline(false);
    }
    if (result.failed > 0) {
      store.setLastError(
        `${result.failed} opération(s) devis n'ont pas pu être synchronisées`,
      );
    }
    await refreshQuotationsSyncMeta();
    if (result.processed > 0 && queryClient) {
      await queryClient.invalidateQueries({ queryKey: QUOTATIONS_QUERY_KEY });
    }
  } catch (error) {
    store.setLastError(
      error instanceof Error ? error.message : "Échec de synchronisation des devis",
    );
  } finally {
    store.setSyncing(false);
  }
}
