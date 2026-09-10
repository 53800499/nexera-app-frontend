import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cabinetApi } from "../services/cabinetApi.service";

export function useMissions(params: {
  mandatId?: string;
  statut?: string;
  collaborateurId?: string;
} = {}) {
  const queryClient = useQueryClient();

  const missionsQuery = useQuery({
    queryKey: ["cabinet", "missions", params],
    queryFn: () => cabinetApi.listMissions(params),
  });

  const calendrierQuery = useQuery({
    queryKey: ["cabinet", "calendrier", params],
    queryFn: () => cabinetApi.listCalendrier(params),
  });

  const createMissionMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.createMission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "missions"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet", "cockpit"] });
    },
  });

  const updateMissionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      cabinetApi.updateMission(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "missions"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet", "cockpit"] });
    },
  });

  const createTacheMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.createTache(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "missions"] });
    },
  });

  const updateTacheMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      cabinetApi.updateTache(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "missions"] });
    },
  });

  const createEcheanceMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.createEcheance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "calendrier"] });
    },
  });

  const updateEcheanceMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      cabinetApi.updateEcheance(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "calendrier"] });
    },
  });

  return {
    missionsQuery,
    calendrierQuery,
    createMissionMutation,
    updateMissionMutation,
    createTacheMutation,
    updateTacheMutation,
    createEcheanceMutation,
    updateEcheanceMutation,
  };
}
