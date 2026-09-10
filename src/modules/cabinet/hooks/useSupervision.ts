import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cabinetApi } from "../services/cabinetApi.service";

export function useSupervision(params: {
  mandatId?: string;
  moduleSource?: string;
  statut?: string;
  niveau?: string;
} = {}) {
  const queryClient = useQueryClient();

  const pointsRevueQuery = useQuery({
    queryKey: ["cabinet", "points-revue", params],
    queryFn: () => cabinetApi.listPointsRevue(params),
  });

  const checklistsQuery = useQuery({
    queryKey: ["cabinet", "checklists"],
    queryFn: () => cabinetApi.listChecklists(),
  });

  const createPointRevueMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.createPointRevue(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "points-revue"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet", "cockpit"] });
    },
  });

  const updatePointRevueMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      cabinetApi.updatePointRevue(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "points-revue"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet", "cockpit"] });
    },
  });

  const submitChecklistResultatMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.submitChecklistResultat(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "missions"] });
    },
  });

  return {
    pointsRevueQuery,
    checklistsQuery,
    createPointRevueMutation,
    updatePointRevueMutation,
    submitChecklistResultatMutation,
  };
}
