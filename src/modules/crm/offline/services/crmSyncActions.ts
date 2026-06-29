import type { QueryClient } from "@tanstack/react-query";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { CLIENTS_QUERY_KEY } from "../../hooks/useClients";
import { crmOfflineRepository } from "../services/crmOfflineRepository";
import { crmSyncEngine } from "../services/crmSyncEngine.service";
import { crmSyncQueue } from "../services/crmSyncQueue.service";
import { useCrmSyncStore } from "../store/crmSyncStore";

export async function refreshCrmSyncMeta() {
  const [pendingCount, lastSyncAt] = await Promise.all([
    crmSyncQueue.count(),
    crmOfflineRepository.getMeta("lastSyncAt"),
  ]);
  const store = useCrmSyncStore.getState();
  store.setPendingCount(pendingCount);
  store.setLastSyncAt(lastSyncAt);
}

export async function triggerCrmSync(queryClient?: QueryClient) {
  if (!isBrowserOnline()) return;

  const store = useCrmSyncStore.getState();
  store.setSyncing(true);
  store.setLastError(null);

  try {
    const result = await crmSyncEngine.sync();
    if (isBrowserOnline()) {
      store.setOffline(false);
    }
    if (result.failed > 0) {
      store.setLastError(
        `${result.failed} opération(s) n'ont pas pu être synchronisées`,
      );
    }
    await refreshCrmSyncMeta();
    if (result.processed > 0 && queryClient) {
      await queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
    }
  } catch (error) {
    store.setLastError(
      error instanceof Error ? error.message : "Échec de synchronisation",
    );
  } finally {
    store.setSyncing(false);
  }
}
