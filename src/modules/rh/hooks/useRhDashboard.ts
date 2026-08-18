"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { rhApi } from "../services/rhApi.service";

export const RH_DASHBOARD_QUERY_KEY = ["rh", "dashboard"] as const;

export function useRhDashboard() {
  const queryEnabled = useQueryEnabled();

  const dashboardQuery = useQuery({
    queryKey: RH_DASHBOARD_QUERY_KEY,
    queryFn: () => rhApi.getDashboardSummary(),
    enabled: queryEnabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    metrics: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
  };
}
