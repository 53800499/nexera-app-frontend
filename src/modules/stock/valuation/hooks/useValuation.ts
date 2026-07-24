"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { valuationApi } from "../services/valuationApi.service";

export const VALUATION_KEY = ["stock", "valuation"] as const;

export function useStockValuation(params: {
  asOf?: string;
  warehouseId?: string;
}) {
  const queryEnabled = useQueryEnabled();
  return useQuery({
    queryKey: [
      ...VALUATION_KEY,
      params.asOf ?? "now",
      params.warehouseId ?? "all",
    ],
    queryFn: () => valuationApi.getReport(params),
    enabled: queryEnabled,
  });
}

export function useStockTurnover(params: {
  from?: string;
  to?: string;
  warehouseId?: string;
}) {
  const queryEnabled = useQueryEnabled(Boolean(params.from && params.to));
  return useQuery({
    queryKey: [
      ...VALUATION_KEY,
      "turnover",
      params.from,
      params.to,
      params.warehouseId ?? "all",
    ],
    queryFn: () =>
      valuationApi.getTurnover({
        from: params.from!,
        to: params.to!,
        warehouseId: params.warehouseId,
      }),
    enabled: queryEnabled,
  });
}

export function useCmupHistory(stockItemId: string) {
  const queryEnabled = useQueryEnabled(Boolean(stockItemId));
  return useQuery({
    queryKey: [...VALUATION_KEY, "cmup", stockItemId],
    queryFn: () => valuationApi.getCmupHistory(stockItemId),
    enabled: queryEnabled,
  });
}

export function usePublishValuation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params?: { asOf?: string; warehouseId?: string }) =>
      valuationApi.publish(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VALUATION_KEY });
    },
  });
}
