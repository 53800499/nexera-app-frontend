"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isBrowserOnline, subscribeNetworkStatus } from "@/shared/hooks/useNetworkStatus";
import {
  refreshCrmSyncMeta,
  triggerCrmSync,
} from "../services/crmSyncActions";
import { CLIENTS_QUERY_KEY } from "../../hooks/useClients";
import { useCrmSyncStore } from "../store/crmSyncStore";
import { clearCrmOfflineIfOnline, setCrmOfflineMode } from "../utils/crmOfflineState";

function syncOfflineFlagWithBrowser() {
  setCrmOfflineMode(!isBrowserOnline());
  clearCrmOfflineIfOnline();
}

export function useCrmSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    syncOfflineFlagWithBrowser();
    void refreshCrmSyncMeta();

    const unsubscribe = subscribeNetworkStatus((online) => {
      setCrmOfflineMode(!online);
      if (online) {
        clearCrmOfflineIfOnline();
        void queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
        void triggerCrmSync(queryClient);
      }
    });

    const handleFocus = () => {
      if (!isBrowserOnline()) return;
      const wasOffline = useCrmSyncStore.getState().isOffline;
      clearCrmOfflineIfOnline();
      if (wasOffline) {
        void queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
        void triggerCrmSync(queryClient);
      }
    };

    window.addEventListener("focus", handleFocus);

    if (isBrowserOnline()) {
      void triggerCrmSync(queryClient);
    }

    return () => {
      unsubscribe();
      window.removeEventListener("focus", handleFocus);
    };
  }, [queryClient]);

  return {
    ...useCrmSyncStore(),
    runSync: () => triggerCrmSync(queryClient),
    refreshMeta: refreshCrmSyncMeta,
  };
}
