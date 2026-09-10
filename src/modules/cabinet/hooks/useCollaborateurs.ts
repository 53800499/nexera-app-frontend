import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cabinetApi } from "../services/cabinetApi.service";

export function useCollaborateurs(mandatId?: string) {
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: ["cabinet", "roles"],
    queryFn: () => cabinetApi.listRoles(),
  });

  const collaborateursQuery = useQuery({
    queryKey: ["cabinet", "collaborateurs"],
    queryFn: () => cabinetApi.listCollaborateurs(),
  });

  const habilitationsQuery = useQuery({
    queryKey: ["cabinet", "habilitations", mandatId],
    queryFn: () =>
      mandatId ? cabinetApi.listHabilitationsByMandat(mandatId) : [],
    enabled: Boolean(mandatId),
  });

  const createCollaborateurMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.createCollaborateur(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "collaborateurs"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet", "cockpit"] });
    },
  });

  const updateCollaborateurMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      cabinetApi.updateCollaborateur(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "collaborateurs"] });
    },
  });

  const createHabilitationMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.createHabilitation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "habilitations"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet", "mandats"] });
    },
  });

  const deleteHabilitationMutation = useMutation({
    mutationFn: (id: string) => cabinetApi.deleteHabilitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "habilitations"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet", "mandats"] });
    },
  });

  return {
    rolesQuery,
    collaborateursQuery,
    habilitationsQuery,
    createCollaborateurMutation,
    updateCollaborateurMutation,
    createHabilitationMutation,
    deleteHabilitationMutation,
  };
}
