"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { dashboardApi } from "../services/dashboardApi.service";
import type { DashboardQueryParams } from "../types/dashboard.types";

export const COMMERCIAL_DASHBOARD_QUERY_KEY = [
  "dashboard",
  "commercial",
] as const;

export function useCommercialDashboard(params?: DashboardQueryParams) {
  const queryEnabled = useQueryEnabled();

  return useQuery({
    queryKey: [
      ...COMMERCIAL_DASHBOARD_QUERY_KEY,
      params?.from ?? "",
      params?.to ?? "",
    ],
    queryFn: () => dashboardApi.getCommercial(params),
    enabled: queryEnabled,
  });
}
