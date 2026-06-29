"use client";

import { useQueryClient } from "@tanstack/react-query";
import { triggerInvoicesSync } from "../services/invoicesSyncActions";
import { useInvoicesSyncStore } from "../store/invoicesSyncStore";

export function InvoicesSyncStatusBadge() {
  const queryClient = useQueryClient();
  const { isSyncing, pendingCount, lastError } = useInvoicesSyncStore();

  if (pendingCount === 0 && !isSyncing && !lastError) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {pendingCount > 0 ? (
        <span className="rounded-full bg-warning-50 px-2.5 py-1 text-xs font-medium text-warning-700 dark:bg-warning-500/10 dark:text-warning-300">
          Factures · {pendingCount} en attente
        </span>
      ) : null}

      {isSyncing ? (
        <span className="text-xs text-gray-500">Sync. factures...</span>
      ) : null}

      {pendingCount > 0 || lastError ? (
        <button
          type="button"
          onClick={() => void triggerInvoicesSync(queryClient)}
          className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Synchroniser
        </button>
      ) : null}
    </div>
  );
}
