"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  isBrowserOnline,
  subscribeNetworkStatus,
} from "@/shared/hooks/useNetworkStatus";
import {
  refreshQuotationsSyncMeta,
  triggerQuotationsSync,
} from "../services/quotationsSyncActions";
import { QUOTATIONS_QUERY_KEY } from "../../hooks/useQuotations";
import { useQuotationsSyncStore } from "../store/quotationsSyncStore";
import {
  clearQuotationsOfflineIfOnline,
  setQuotationsOfflineMode,
} from "../utils/quotationsOfflineState";

function syncOfflineFlagWithBrowser() {
  setQuotationsOfflineMode(!isBrowserOnline());
  clearQuotationsOfflineIfOnline();
}

export function useQuotationsSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    syncOfflineFlagWithBrowser();
    void refreshQuotationsSyncMeta();

    const unsubscribe = subscribeNetworkStatus((online) => {
      setQuotationsOfflineMode(!online);
      if (online) {
        clearQuotationsOfflineIfOnline();
        void queryClient.invalidateQueries({ queryKey: QUOTATIONS_QUERY_KEY });
        void triggerQuotationsSync(queryClient);
      }
    });

    const handleFocus = () => {
      if (!isBrowserOnline()) return;
      const wasOffline = useQuotationsSyncStore.getState().isOffline;
      clearQuotationsOfflineIfOnline();
      if (wasOffline) {
        void queryClient.invalidateQueries({ queryKey: QUOTATIONS_QUERY_KEY });
        void triggerQuotationsSync(queryClient);
      }
    };

    window.addEventListener("focus", handleFocus);

    if (isBrowserOnline()) {
      void triggerQuotationsSync(queryClient);
    }

    return () => {
      unsubscribe();
      window.removeEventListener("focus", handleFocus);
    };
  }, [queryClient]);

  return {
    ...useQuotationsSyncStore(),
    runSync: () => triggerQuotationsSync(queryClient),
    refreshMeta: refreshQuotationsSyncMeta,
  };
}
