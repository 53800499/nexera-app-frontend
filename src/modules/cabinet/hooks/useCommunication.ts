import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cabinetApi } from "../services/cabinetApi.service";

export function useCommunication(mandatId?: string) {
  const queryClient = useQueryClient();

  const demandesQuery = useQuery({
    queryKey: ["cabinet", "demandes-pieces", mandatId],
    queryFn: () => cabinetApi.listDemandesPieces(mandatId),
  });

  const messagesQuery = useQuery({
    queryKey: ["cabinet", "messages", mandatId],
    queryFn: () => (mandatId ? cabinetApi.listMessages(mandatId) : []),
    enabled: Boolean(mandatId),
    refetchInterval: 10000,
  });

  const documentsQuery = useQuery({
    queryKey: ["cabinet", "documents-partages", mandatId],
    queryFn: () => (mandatId ? cabinetApi.listDocumentsPartages(mandatId) : []),
    enabled: Boolean(mandatId),
  });

  const createDemandeMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.createDemandePiece(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "demandes-pieces"] });
      queryClient.invalidateQueries({ queryKey: ["cabinet", "cockpit"] });
    },
  });

  const relancerDemandeMutation = useMutation({
    mutationFn: (id: string) => cabinetApi.relancerDemandePiece(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "demandes-pieces"] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.sendMessage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "messages"] });
    },
  });

  const addDocumentMutation = useMutation({
    mutationFn: (payload: any) => cabinetApi.addDocumentPartage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet", "documents-partages"] });
    },
  });

  return {
    demandesQuery,
    messagesQuery,
    documentsQuery,
    createDemandeMutation,
    relancerDemandeMutation,
    sendMessageMutation,
    addDocumentMutation,
  };
}
