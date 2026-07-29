"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { alertsOfflineService } from "../../offline/services/alertsOffline.service";
import { refreshStockSyncMeta } from "../../offline/services/stockSyncActions";
import { useStockSyncStore } from "../../offline/store/stockSyncStore";

import type { StockAlertStatus, StockAlertType } from "../types/alerts.types";

export const ALERTS_KEY = ["stock", "alerts"] as const;
export const REPLENISHMENTS_KEY = ["stock", "replenishments"] as const;

function stockQueryOptions(isOffline: boolean) {
  return {
    networkMode: "always" as const,
    retry: false,
    staleTime: isOffline ? Number.POSITIVE_INFINITY : 0,
    refetchOnMount: isOffline ? false : ("always" as const),
    refetchOnReconnect: true,
  };
}

const stockMutationOptions = {
  networkMode: "always" as const,
};

export function useStockAlerts(filters?: {
  status?: StockAlertStatus;
  alertType?: StockAlertType;
}) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();
  const isOffline = useStockSyncStore((state) => state.isOffline);

  const alertsQuery = useQuery({
    queryKey: [...ALERTS_KEY, filters?.status ?? "", filters?.alertType ?? ""],
    queryFn: () => alertsOfflineService.list(filters),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
  });

  const summaryQuery = useQuery({
    queryKey: [...ALERTS_KEY, "summary"],
    queryFn: () => alertsOfflineService.summary(),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ALERTS_KEY });
    queryClient.invalidateQueries({ queryKey: REPLENISHMENTS_KEY });
    void refreshStockSyncMeta();
  };

  const scanMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (dormantDays?: number) => alertsOfflineService.scan(dormantDays),
    onSuccess: invalidate,
  });

  const acknowledgeMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (id: string) => alertsOfflineService.acknowledge(id),
    onSuccess: invalidate,
  });

  const dismissMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (id: string) => alertsOfflineService.dismiss(id),
    onSuccess: invalidate,
  });

  const createReplenishmentMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (payload: { alertId: string; qtyProposed?: number }) =>
      alertsOfflineService.createReplenishment(payload),
    onSuccess: invalidate,
  });

  return {
    alertsQuery,
    summaryQuery,
    scanMutation,
    acknowledgeMutation,
    dismissMutation,
    createReplenishmentMutation,
  };
}

export function useReplenishments() {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();
  const isOffline = useStockSyncStore((state) => state.isOffline);

  const listQuery = useQuery({
    queryKey: REPLENISHMENTS_KEY,
    queryFn: () => alertsOfflineService.listReplenishments(),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: REPLENISHMENTS_KEY });
    queryClient.invalidateQueries({ queryKey: ALERTS_KEY });
    void refreshStockSyncMeta();
  };

  const approveMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (id: string) => alertsOfflineService.approveReplenishment(id),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      alertsOfflineService.rejectReplenishment(id, reason),
    onSuccess: invalidate,
  });

  return { listQuery, approveMutation, rejectMutation };
}
