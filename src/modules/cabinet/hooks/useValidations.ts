import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cabinetApi } from "../services/cabinetApi.service";

export function useValidations(objetType?: string, objetId?: string) {
  const queryClient = useQueryClient();

  const circuitsQuery = useQuery({
    queryKey: ["cabinet", "circuits-validation"],
    queryFn: () => cabinetApi.listCircuitsValidation(),
  });

  const validationsQuery = useQuery({
    queryKey: ["cabinet", "validations", objetType, objetId],
    queryFn: () =>
      objetType && objetId
        ? cabinetApi.getValidationsByObjet(objetType, objetId)
        : [],
    enabled: Boolean(objetType && objetId),
  });

  const signaturesQuery = useQuery({
    queryKey: ["cabinet", "signatures", objetType, objetId],
    queryFn: () =>
      objetType && objetId
        ? cabinetApi.getSignaturesByObjet(objetType, objetId)
        : [],
    enabled: Boolean(objetType && objetId),
  });

  const submitValidationMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.submitValidation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "validations"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet", "cockpit"] });
    },
  });

  const apposeSignatureMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.apposeSignature(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "signatures"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet", "cockpit"] });
    },
  });

  return {
    circuitsQuery,
    validationsQuery,
    signaturesQuery,
    submitValidationMutation,
    apposeSignatureMutation,
  };
}
