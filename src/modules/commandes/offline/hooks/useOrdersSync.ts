"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  isBrowserOnline,
  subscribeNetworkStatus,
} from "@/shared/hooks/useNetworkStatus";
import {
  refreshOrdersSyncMeta,
  triggerOrdersSync,
} from "../services/ordersSyncActions";
import { ORDERS_QUERY_KEY } from "../../hooks/useOrders";
import { useOrdersSyncStore } from "../store/ordersSyncStore";
import {
  clearOrdersOfflineIfOnline,
  setOrdersOfflineMode,
} from "../utils/ordersOfflineState";

function syncOfflineFlagWithBrowser() {
  setOrdersOfflineMode(!isBrowserOnline());
  clearOrdersOfflineIfOnline();
}

export function useOrdersSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    syncOfflineFlagWithBrowser();
    void refreshOrdersSyncMeta();

    const unsubscribe = subscribeNetworkStatus((online) => {
      setOrdersOfflineMode(!online);
      if (online) {
        clearOrdersOfflineIfOnline();
        void queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
        void triggerOrdersSync(queryClient);
      }
    });

    const handleFocus = () => {
      if (!isBrowserOnline()) return;
      const wasOffline = useOrdersSyncStore.getState().isOffline;
      clearOrdersOfflineIfOnline();
      if (wasOffline) {
        void queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
        void triggerOrdersSync(queryClient);
      }
    };

    window.addEventListener("focus", handleFocus);

    if (isBrowserOnline()) {
      void triggerOrdersSync(queryClient);
    }

    return () => {
      unsubscribe();
      window.removeEventListener("focus", handleFocus);
    };
  }, [queryClient]);

  return {
    ...useOrdersSyncStore(),
    runSync: () => triggerOrdersSync(queryClient),
    refreshMeta: refreshOrdersSyncMeta,
  };
}
