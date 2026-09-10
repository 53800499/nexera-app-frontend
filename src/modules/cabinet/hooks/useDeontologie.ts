import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cabinetApi } from "../services/cabinetApi.service";

export function useDeontologie(mandatId?: string) {
  const queryClient = useQueryClient();

  const conflitsQuery = useQuery({
    queryKey: ["cabinet", "conflits"],
    queryFn: () => cabinetApi.listConflitsInteret(),
  });

  const journalAccesQuery = useQuery({
    queryKey: ["cabinet", "journal-acces", mandatId],
    queryFn: () => cabinetApi.listJournalAcces(mandatId),
  });

  const declareConflitMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.declareConflitInteret(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "conflits"] });
    },
  });

  const arbitrerConflitMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      cabinetApi.arbitrerConflitInteret(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "conflits"] });
    },
  });

  const logAccesMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.logAccesSecretPro(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "journal-acces"] });
    },
  });

  return {
    conflitsQuery,
    journalAccesQuery,
    declareConflitMutation,
    arbitrerConflitMutation,
    logAccesMutation,
  };
}
