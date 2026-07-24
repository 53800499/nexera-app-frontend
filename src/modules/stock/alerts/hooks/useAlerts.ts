"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { alertsApi } from "../services/alertsApi.service";
import type { StockAlertStatus, StockAlertType } from "../types/alerts.types";

export const ALERTS_KEY = ["stock", "alerts"] as const;
export const REPLENISHMENTS_KEY = ["stock", "replenishments"] as const;

export function useStockAlerts(filters?: {
  status?: StockAlertStatus;
  alertType?: StockAlertType;
}) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();

  const alertsQuery = useQuery({
    queryKey: [...ALERTS_KEY, filters?.status ?? "", filters?.alertType ?? ""],
    queryFn: () => alertsApi.list(filters),
    enabled: queryEnabled,
  });

  const summaryQuery = useQuery({
    queryKey: [...ALERTS_KEY, "summary"],
    queryFn: () => alertsApi.summary(),
    enabled: queryEnabled,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ALERTS_KEY });
    queryClient.invalidateQueries({ queryKey: REPLENISHMENTS_KEY });
  };

  const scanMutation = useMutation({
    mutationFn: (dormantDays?: number) => alertsApi.scan(dormantDays),
    onSuccess: invalidate,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => alertsApi.acknowledge(id),
    onSuccess: invalidate,
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => alertsApi.dismiss(id),
    onSuccess: invalidate,
  });

  const createReplenishmentMutation = useMutation({
    mutationFn: (payload: { alertId: string; qtyProposed?: number }) =>
      alertsApi.createReplenishment(payload),
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

  const listQuery = useQuery({
    queryKey: REPLENISHMENTS_KEY,
    queryFn: () => alertsApi.listReplenishments(),
    enabled: queryEnabled,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: REPLENISHMENTS_KEY });
    queryClient.invalidateQueries({ queryKey: ALERTS_KEY });
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => alertsApi.approveReplenishment(id),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      alertsApi.rejectReplenishment(id, reason),
    onSuccess: invalidate,
  });

  return { listQuery, approveMutation, rejectMutation };
}
