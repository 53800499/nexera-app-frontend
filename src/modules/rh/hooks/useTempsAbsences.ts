"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { rhApi } from "../services/rhApi.service";

export const RH_ABSENCES_QUERY_KEY = ["rh", "absences"] as const;
export const RH_TIMESHEETS_QUERY_KEY = ["rh", "timesheets"] as const;
export const RH_LEAVE_BALANCES_QUERY_KEY = ["rh", "soldes-conges"] as const;

export function useTempsAbsences() {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();

  const absencesQuery = useQuery({
    queryKey: RH_ABSENCES_QUERY_KEY,
    queryFn: () => rhApi.listAbsences(),
    enabled: queryEnabled,
  });

  const typesAbsenceQuery = useQuery({
    queryKey: ["rh", "types-absence"],
    queryFn: () => rhApi.listAbsenceTypes("BJ"),
    enabled: queryEnabled,
  });

  const soldesQuery = useQuery({
    queryKey: RH_LEAVE_BALANCES_QUERY_KEY,
    queryFn: () => rhApi.listSoldesConges(),
    enabled: queryEnabled,
  });

  const createAbsenceMutation = useMutation({
    mutationFn: (payload: any) => rhApi.createAbsence(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RH_ABSENCES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RH_LEAVE_BALANCES_QUERY_KEY });
    },
  });

  const validateAbsenceMutation = useMutation({
    mutationFn: ({
      id,
      statut,
      motif,
    }: {
      id: string;
      statut: "APPROUVEE" | "REFUSEE";
      motif?: string;
    }) => rhApi.validateAbsence(id, { statut, motifRefus: motif }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RH_ABSENCES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RH_LEAVE_BALANCES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["rh", "employes"] });
    },
  });

  const saveTimesheetMutation = useMutation({
    mutationFn: (payload: any) => rhApi.saveReleveTemps(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RH_TIMESHEETS_QUERY_KEY });
    },
  });

  return {
    absences: absencesQuery.data ?? [],
    typesAbsence: typesAbsenceQuery.data ?? [],
    soldesConges: soldesQuery.data ?? [],
    isLoading: absencesQuery.isLoading || soldesQuery.isLoading,
    refetch: () => {
      absencesQuery.refetch();
      soldesQuery.refetch();
    },
    createAbsence: createAbsenceMutation.mutateAsync,
    validateAbsence: validateAbsenceMutation.mutateAsync,
    saveTimesheet: saveTimesheetMutation.mutateAsync,
    isCreatingAbsence: createAbsenceMutation.isPending,
    isValidatingAbsence: validateAbsenceMutation.isPending,
  };
}
