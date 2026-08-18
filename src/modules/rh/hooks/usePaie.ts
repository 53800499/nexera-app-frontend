"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { rhApi } from "../services/rhApi.service";

export const RH_CYCLES_QUERY_KEY = ["rh", "cycles"] as const;
export const RH_PAYSLIPS_QUERY_KEY = ["rh", "bulletins"] as const;

export function usePaie(annee = 2026) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();

  const cyclesQuery = useQuery({
    queryKey: [...RH_CYCLES_QUERY_KEY, annee],
    queryFn: () => rhApi.listCycles(annee),
    enabled: queryEnabled,
  });

  const openCycleMutation = useMutation({
    mutationFn: (payload: any) => rhApi.openCycle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RH_CYCLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["rh", "dashboard"] });
    },
  });

  const calculateCycleMutation = useMutation({
    mutationFn: (cycleId: string) => rhApi.calculateCycle(cycleId),
    onSuccess: (_, cycleId) => {
      queryClient.invalidateQueries({ queryKey: RH_CYCLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["rh", "cycle", cycleId] });
      queryClient.invalidateQueries({ queryKey: RH_PAYSLIPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["rh", "dashboard"] });
    },
  });

  const validateCycleMutation = useMutation({
    mutationFn: (cycleId: string) => rhApi.validateCycle(cycleId),
    onSuccess: (_, cycleId) => {
      queryClient.invalidateQueries({ queryKey: RH_CYCLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["rh", "cycle", cycleId] });
      queryClient.invalidateQueries({ queryKey: ["rh", "dashboard"] });
    },
  });

  return {
    cycles: cyclesQuery.data ?? [],
    isLoading: cyclesQuery.isLoading,
    refetch: cyclesQuery.refetch,
    openCycle: openCycleMutation.mutateAsync,
    calculateCycle: calculateCycleMutation.mutateAsync,
    validateCycle: validateCycleMutation.mutateAsync,
    isCalculating: calculateCycleMutation.isPending,
    isValidating: validateCycleMutation.isPending,
  };
}

export function useCyclePaie(cycleId: string) {
  const queryEnabled = useQueryEnabled();

  return useQuery({
    queryKey: ["rh", "cycle", cycleId],
    queryFn: () => (cycleId ? rhApi.getCycleById(cycleId) : null),
    enabled: queryEnabled && Boolean(cycleId),
  });
}

export function useBulletinPaie(bulletinId?: string | null) {
  const queryEnabled = useQueryEnabled();

  return useQuery({
    queryKey: ["rh", "bulletin", bulletinId],
    queryFn: () => (bulletinId ? rhApi.getBulletinById(bulletinId) : null),
    enabled: queryEnabled && Boolean(bulletinId),
  });
}
