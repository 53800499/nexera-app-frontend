import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cabinetApi } from "../services/cabinetApi.service";

export function useHonoraires(params: {
  collaborateurId?: string;
  mandatId?: string;
  missionId?: string;
  startDate?: string;
  endDate?: string;
} = {}) {
  const queryClient = useQueryClient();

  const tempsQuery = useQuery({
    queryKey: ["cabinet", "temps", params],
    queryFn: () => cabinetApi.listTemps(params),
  });

  const notesQuery = useQuery({
    queryKey: ["cabinet", "notes-honoraires", params.mandatId],
    queryFn: () => cabinetApi.listNotesHonoraires(params.mandatId),
  });

  const createTempsMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.createTemps(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "temps"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet", "missions"] });
    },
  });

  const updateTempsMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      cabinetApi.updateTemps(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "temps"] });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.createNoteHonoraires(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "notes-honoraires"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet", "cockpit"] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      cabinetApi.updateNoteHonoraires(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "notes-honoraires"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet", "cockpit"] });
    },
  });

  return {
    tempsQuery,
    notesQuery,
    createTempsMutation,
    updateTempsMutation,
    createNoteMutation,
    updateNoteMutation,
  };
}
