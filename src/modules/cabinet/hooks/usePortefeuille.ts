import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cabinetApi } from "../services/cabinetApi.service";

export function usePortefeuille(mandatId?: string) {
  const queryClient = useQueryClient();

  const entiteQuery = useQuery({
    queryKey: ["cabinet", "entite"],
    queryFn: () => cabinetApi.getEntite(),
  });

  const mandatsQuery = useQuery({
    queryKey: ["cabinet", "mandats"],
    queryFn: () => cabinetApi.listMandats(),
  });

  const mandatDetailQuery = useQuery({
    queryKey: ["cabinet", "mandat", mandatId],
    queryFn: () => (mandatId ? cabinetApi.getMandat(mandatId) : null),
    enabled: Boolean(mandatId),
  });

  const createMandatMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.createMandat(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "mandats"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet", "cockpit"] });
    },
  });

  const updateMandatMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      cabinetApi.updateMandat(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "mandats"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet", "mandat"] });
    },
  });

  const createLettreMissionMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.createLettreMission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "mandats"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet", "mandat"] });
    },
  });

  const addContactMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.addClientContact(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "mandat"] });
    },
  });

  return {
    entiteQuery,
    mandatsQuery,
    mandatDetailQuery,
    createMandatMutation,
    updateMandatMutation,
    createLettreMissionMutation,
    addContactMutation,
  };
}
