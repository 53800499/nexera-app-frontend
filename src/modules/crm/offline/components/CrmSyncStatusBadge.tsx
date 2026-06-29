"use client";

import { useQueryClient } from "@tanstack/react-query";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { clearCrmOfflineIfOnline } from "../utils/crmOfflineState";
import { triggerCrmSync } from "../services/crmSyncActions";
import { useCrmSyncStore } from "../store/crmSyncStore";

export function CrmSyncStatusBadge() {
  const queryClient = useQueryClient();
  const { isOffline, isSyncing, pendingCount, lastError } = useCrmSyncStore();
  const browserOnline = isBrowserOnline();
  const showStaleOffline = isOffline && browserOnline;

  if (!isOffline && pendingCount === 0 && !isSyncing && !lastError) {
    return null;
  }

  const handleReconnect = () => {
    clearCrmOfflineIfOnline();
    void triggerCrmSync(queryClient);
  };

  return (
    <div className="flex items-center gap-2">
      {isOffline ? (
        <span className="rounded-full bg-error-50 px-2.5 py-1 text-xs font-medium text-error-700 dark:bg-error-500/10 dark:text-error-400">
          {showStaleOffline ? "API indisponible" : "Hors-ligne"}
        </span>
      ) : null}

      {showStaleOffline ? (
        <button
          type="button"
          onClick={handleReconnect}
          className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Réessayer
        </button>
      ) : null}

      {pendingCount > 0 ? (
        <span className="rounded-full bg-warning-50 px-2.5 py-1 text-xs font-medium text-warning-700 dark:bg-warning-500/10 dark:text-warning-300">
          {pendingCount} en attente
        </span>
      ) : null}

      {isSyncing ? (
        <span className="text-xs text-gray-500">Synchronisation...</span>
      ) : null}

      {!isOffline && (pendingCount > 0 || lastError) ? (
        <button
          type="button"
          onClick={() => void triggerCrmSync(queryClient)}
          className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Synchroniser
        </button>
      ) : null}
    </div>
  );
}
