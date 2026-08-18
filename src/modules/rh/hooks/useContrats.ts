"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { rhApi } from "../services/rhApi.service";

export const RH_CONTRACTS_QUERY_KEY = ["rh", "contrats"] as const;

export function useContrats(params?: { employeId?: string; statut?: string }) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();

  const contratsQuery = useQuery({
    queryKey: [...RH_CONTRACTS_QUERY_KEY, params],
    queryFn: () => rhApi.listContrats(params),
    enabled: queryEnabled,
  });

  const createContratMutation = useMutation({
    mutationFn: (payload: any) => rhApi.createContrat(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RH_CONTRACTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["rh", "employes"] });
      queryClient.invalidateQueries({ queryKey: ["rh", "dashboard"] });
    },
  });

  return {
    contrats: contratsQuery.data ?? [],
    isLoading: contratsQuery.isLoading,
    isError: contratsQuery.isError,
    error: contratsQuery.error,
    refetch: contratsQuery.refetch,
    createContrat: createContratMutation.mutateAsync,
    isCreating: createContratMutation.isPending,
  };
}
