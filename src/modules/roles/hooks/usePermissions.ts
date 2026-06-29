"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { permissionsApi } from "../services/permissionsApi.service";

export const PERMISSIONS_QUERY_KEY = ["permissions"] as const;

export function usePermissions() {
  const queryEnabled = useQueryEnabled();

  const permissionsQuery = useQuery({
    queryKey: PERMISSIONS_QUERY_KEY,
    queryFn: permissionsApi.list,
    enabled: queryEnabled,
  });

  return { permissionsQuery };
}
