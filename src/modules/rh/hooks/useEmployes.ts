"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { rhApi } from "../services/rhApi.service";
import type { RhEmployeeStatus } from "../types/rh.types";

export const RH_EMPLOYEES_QUERY_KEY = ["rh", "employes"] as const;

export function useEmployes(params?: {
  q?: string;
  statutEmploi?: string;
  departementId?: string;
}) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();

  const employesQuery = useQuery({
    queryKey: [...RH_EMPLOYEES_QUERY_KEY, params],
    queryFn: () =>
      rhApi.listEmployes({
        q: params?.q,
        statutEmploi: params?.statutEmploi,
      }),
    enabled: queryEnabled,
  });

  const createEmployeMutation = useMutation({
    mutationFn: (payload: any) => rhApi.createEmploye(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RH_EMPLOYEES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["rh", "dashboard"] });
    },
  });

  const updateEmployeMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      rhApi.updateEmploye(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: RH_EMPLOYEES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["rh", "employe", variables.id] });
    },
  });

  return {
    employes: employesQuery.data ?? [],
    isLoading: employesQuery.isLoading,
    isError: employesQuery.isError,
    error: employesQuery.error,
    refetch: employesQuery.refetch,
    createEmploye: createEmployeMutation.mutateAsync,
    updateEmploye: updateEmployeMutation.mutateAsync,
    isCreating: createEmployeMutation.isPending,
    isUpdating: updateEmployeMutation.isPending,
  };
}

export function useEmploye(id?: string) {
  const queryEnabled = useQueryEnabled();

  return useQuery({
    queryKey: ["rh", "employe", id],
    queryFn: () => (id ? rhApi.getEmployeById(id) : null),
    enabled: queryEnabled && Boolean(id),
  });
}
