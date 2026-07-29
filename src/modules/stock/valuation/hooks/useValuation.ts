"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { valuationOfflineService } from "../../offline/services/valuationOffline.service";
import { refreshStockSyncMeta } from "../../offline/services/stockSyncActions";
import { useStockSyncStore } from "../../offline/store/stockSyncStore";

export const VALUATION_KEY = ["stock", "valuation"] as const;

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

export function useStockValuation(params: {
  asOf?: string;
  warehouseId?: string;
}) {
  const queryEnabled = useQueryEnabled();
  const isOffline = useStockSyncStore((state) => state.isOffline);

  return useQuery({
    queryKey: [
      ...VALUATION_KEY,
      params.asOf ?? "now",
      params.warehouseId ?? "all",
    ],
    queryFn: () => valuationOfflineService.getReport(params),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
  });
}

export function useStockTurnover(params: {
  from?: string;
  to?: string;
  warehouseId?: string;
}) {
  const queryEnabled = useQueryEnabled(Boolean(params.from && params.to));
  const isOffline = useStockSyncStore((state) => state.isOffline);

  return useQuery({
    queryKey: [
      ...VALUATION_KEY,
      "turnover",
      params.from,
      params.to,
      params.warehouseId ?? "all",
    ],
    queryFn: () =>
      valuationOfflineService.getTurnover({
        from: params.from!,
        to: params.to!,
        warehouseId: params.warehouseId,
      }),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
  });
}

export function useCmupHistory(stockItemId: string) {
  const queryEnabled = useQueryEnabled(Boolean(stockItemId));
  const isOffline = useStockSyncStore((state) => state.isOffline);

  return useQuery({
    queryKey: [...VALUATION_KEY, "cmup", stockItemId],
    queryFn: () => valuationOfflineService.getCmupHistory(stockItemId),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
  });
}

export function usePublishValuation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...stockMutationOptions,
    mutationFn: (params?: { asOf?: string; warehouseId?: string }) =>
      valuationOfflineService.publish(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VALUATION_KEY });
      void refreshStockSyncMeta();
    },
  });
}
