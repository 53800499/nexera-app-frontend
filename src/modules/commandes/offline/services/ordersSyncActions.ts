import type { QueryClient } from "@tanstack/react-query";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { ORDERS_QUERY_KEY } from "../../hooks/useOrders";
import { ordersOfflineRepository } from "./ordersOfflineRepository";
import { ordersSyncEngine } from "./ordersSyncEngine.service";
import { ordersSyncQueue } from "./ordersSyncQueue.service";
import { useOrdersSyncStore } from "../store/ordersSyncStore";

export async function refreshOrdersSyncMeta() {
  const [pendingCount, lastSyncAt] = await Promise.all([
    ordersSyncQueue.count(),
    ordersOfflineRepository.getMeta("lastSyncAt"),
  ]);
  const store = useOrdersSyncStore.getState();
  store.setPendingCount(pendingCount);
  store.setLastSyncAt(lastSyncAt);
}

export async function triggerOrdersSync(queryClient?: QueryClient) {
  if (!isBrowserOnline()) return;

  const store = useOrdersSyncStore.getState();
  store.setSyncing(true);
  store.setLastError(null);

  try {
    const result = await ordersSyncEngine.sync();
    if (isBrowserOnline()) {
      store.setOffline(false);
    }
    if (result.failed > 0) {
      store.setLastError(
        `${result.failed} opération(s) commandes n'ont pas pu être synchronisées`,
      );
    }
    await refreshOrdersSyncMeta();
    if (result.processed > 0 && queryClient) {
      await queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    }
  } catch (error) {
    store.setLastError(
      error instanceof Error
        ? error.message
        : "Échec de synchronisation des commandes",
    );
  } finally {
    store.setSyncing(false);
  }
}
