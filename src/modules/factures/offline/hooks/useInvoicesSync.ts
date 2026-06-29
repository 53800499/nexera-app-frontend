"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  isBrowserOnline,
  subscribeNetworkStatus,
} from "@/shared/hooks/useNetworkStatus";
import {
  refreshInvoicesSyncMeta,
  triggerInvoicesSync,
} from "../services/invoicesSyncActions";
import { INVOICES_QUERY_KEY } from "../../hooks/useInvoices";
import { useInvoicesSyncStore } from "../store/invoicesSyncStore";
import {
  clearInvoicesOfflineIfOnline,
  setInvoicesOfflineMode,
} from "../utils/invoicesOfflineState";

function syncOfflineFlagWithBrowser() {
  setInvoicesOfflineMode(!isBrowserOnline());
  clearInvoicesOfflineIfOnline();
}

export function useInvoicesSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    syncOfflineFlagWithBrowser();
    void refreshInvoicesSyncMeta();

    const unsubscribe = subscribeNetworkStatus((online) => {
      setInvoicesOfflineMode(!online);
      if (online) {
        clearInvoicesOfflineIfOnline();
        void queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
        void triggerInvoicesSync(queryClient);
      }
    });

    const handleFocus = () => {
      if (!isBrowserOnline()) return;
      const wasOffline = useInvoicesSyncStore.getState().isOffline;
      clearInvoicesOfflineIfOnline();
      if (wasOffline) {
        void queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
        void triggerInvoicesSync(queryClient);
      }
    };

    window.addEventListener("focus", handleFocus);

    if (isBrowserOnline()) {
      void triggerInvoicesSync(queryClient);
    }

    return () => {
      unsubscribe();
      window.removeEventListener("focus", handleFocus);
    };
  }, [queryClient]);

  return {
    ...useInvoicesSyncStore(),
    runSync: () => triggerInvoicesSync(queryClient),
    refreshMeta: refreshInvoicesSyncMeta,
  };
}
