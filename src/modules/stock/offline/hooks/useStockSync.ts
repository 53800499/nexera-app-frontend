"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isBrowserOnline, subscribeNetworkStatus } from "@/shared/hooks/useNetworkStatus";
import {
  refreshStockSyncMeta,
  triggerStockSync,
} from "../services/stockSyncActions";
import { useStockSyncStore } from "../store/stockSyncStore";
import { clearStockOfflineIfOnline, setStockOfflineMode } from "../utils/stockOfflineState";

function syncOfflineFlagWithBrowser() {
  setStockOfflineMode(!isBrowserOnline());
  clearStockOfflineIfOnline();
}

export function useStockSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    syncOfflineFlagWithBrowser();
    void refreshStockSyncMeta();

    const unsubscribe = subscribeNetworkStatus((online) => {
      setStockOfflineMode(!online);
      if (online) {
        clearStockOfflineIfOnline();
        void queryClient.invalidateQueries({ queryKey: ["stock"] });
        void triggerStockSync(queryClient);
      }
    });

    const handleFocus = () => {
      if (!isBrowserOnline()) return;
      const wasOffline = useStockSyncStore.getState().isOffline;
      clearStockOfflineIfOnline();
      if (wasOffline) {
        void queryClient.invalidateQueries({ queryKey: ["stock"] });
        void triggerStockSync(queryClient);
      }
    };

    window.addEventListener("focus", handleFocus);

    if (isBrowserOnline()) {
      void triggerStockSync(queryClient);
    }

    return () => {
      unsubscribe();
      window.removeEventListener("focus", handleFocus);
    };
  }, [queryClient]);

  return {
    ...useStockSyncStore(),
    runSync: () => triggerStockSync(queryClient),
    refreshMeta: refreshStockSyncMeta,
  };
}
