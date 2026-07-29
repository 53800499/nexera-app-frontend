import type { QueryClient } from "@tanstack/react-query";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { stockOfflineRepository } from "./stockOfflineRepository";
import { stockSyncEngine } from "./stockSyncEngine.service";
import { stockSyncQueue } from "./stockSyncQueue.service";
import { useStockSyncStore } from "../store/stockSyncStore";

export async function refreshStockSyncMeta() {
  const [pendingCount, lastSyncAt] = await Promise.all([
    stockSyncQueue.count(),
    stockOfflineRepository.getMeta("lastSyncAt"),
  ]);
  const store = useStockSyncStore.getState();
  store.setPendingCount(pendingCount);
  store.setLastSyncAt(lastSyncAt);
}

export async function triggerStockSync(queryClient?: QueryClient) {
  if (!isBrowserOnline()) return;

  const store = useStockSyncStore.getState();
  store.setSyncing(true);
  store.setLastError(null);

  try {
    const result = await stockSyncEngine.sync();
    if (isBrowserOnline()) {
      store.setOffline(false);
    }
    if (result.failed > 0) {
      store.setLastError(
        `${result.failed} opération(s) stock n'ont pas pu être synchronisées`,
      );
    }
    await refreshStockSyncMeta();
    if (result.processed > 0 && queryClient) {
      await queryClient.invalidateQueries({ queryKey: ["stock"] });
    }
  } catch (error) {
    store.setLastError(
      error instanceof Error ? error.message : "Échec de synchronisation du stock",
    );
  } finally {
    store.setSyncing(false);
  }
}
