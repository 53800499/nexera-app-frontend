"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { clientsOfflineService } from "../offline/services/clientsOffline.service";
import { refreshCrmSyncMeta } from "../offline/services/crmSyncActions";
import { useCrmSyncStore } from "../offline/store/crmSyncStore";
import type {
  CreateClientPayload,
  CreateContactPayload,
  UpdateClientPayload,
} from "../types/client.types";

export const CLIENTS_QUERY_KEY = ["clients"] as const;

function crmQueryOptions(isOffline: boolean) {
  return {
    networkMode: "always" as const,
    retry: false,
    staleTime: isOffline ? Number.POSITIVE_INFINITY : 0,
    refetchOnMount: isOffline ? false : ("always" as const),
    refetchOnReconnect: true,
  };
}

const crmMutationOptions = {
  networkMode: "always" as const,
};

type ListParams = {
  page?: number;
  limit?: number;
  q?: string;
};

export function useClients(params: ListParams = {}) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();
  const isOffline = useCrmSyncStore((state) => state.isOffline);
  const { page = 1, limit = 20, q } = params;
  const searchTerm = q?.trim() ?? "";
  const isSearchMode = searchTerm.length > 0;

  const clientsQuery = useQuery({
    queryKey: isSearchMode
      ? [...CLIENTS_QUERY_KEY, "search", searchTerm]
      : [...CLIENTS_QUERY_KEY, page, limit, ""],
    queryFn: () =>
      isSearchMode
        ? clientsOfflineService.search(searchTerm)
        : clientsOfflineService.list({ page, limit }),
    enabled: queryEnabled,
    ...crmQueryOptions(isOffline),
    placeholderData: (previous) => previous,
  });

  const createMutation = useMutation({
    ...crmMutationOptions,
    mutationFn: (payload: CreateClientPayload) =>
      clientsOfflineService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      void refreshCrmSyncMeta();
    },
  });

  const updateMutation = useMutation({
    ...crmMutationOptions,
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClientPayload }) =>
      clientsOfflineService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["clients", variables.id] });
      void refreshCrmSyncMeta();
    },
  });

  const archiveMutation = useMutation({
    ...crmMutationOptions,
    mutationFn: (id: string) => clientsOfflineService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      void refreshCrmSyncMeta();
    },
  });

  const unarchiveMutation = useMutation({
    ...crmMutationOptions,
    mutationFn: (id: string) => clientsOfflineService.unarchive(id),
    onSuccess: (client, id) => {
      queryClient.setQueryData(["clients", id], client);
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["clients", id] });
      void refreshCrmSyncMeta();
    },
  });

  const addContactMutation = useMutation({
    ...crmMutationOptions,
    mutationFn: ({
      clientId,
      payload,
    }: {
      clientId: string;
      payload: CreateContactPayload;
    }) => clientsOfflineService.addContact(clientId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients", variables.clientId] });
      void refreshCrmSyncMeta();
    },
  });

  const updateContactMutation = useMutation({
    ...crmMutationOptions,
    mutationFn: ({
      contactId,
      clientId,
      payload,
    }: {
      contactId: string;
      clientId: string;
      payload: Partial<CreateContactPayload>;
    }) => clientsOfflineService.updateContact(contactId, clientId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients", variables.clientId] });
      void refreshCrmSyncMeta();
    },
  });

  const removeContactMutation = useMutation({
    ...crmMutationOptions,
    mutationFn: ({
      contactId,
      clientId,
    }: {
      contactId: string;
      clientId: string;
    }) => clientsOfflineService.removeContact(contactId, clientId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients", variables.clientId] });
      void refreshCrmSyncMeta();
    },
  });

  return {
    clientsQuery,
    createMutation,
    updateMutation,
    archiveMutation,
    unarchiveMutation,
    addContactMutation,
    updateContactMutation,
    removeContactMutation,
  };
}

export function useClient(id: string) {
  const queryEnabled = useQueryEnabled();
  const isOffline = useCrmSyncStore((state) => state.isOffline);

  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => clientsOfflineService.byId(id),
    enabled: queryEnabled && Boolean(id),
    ...crmQueryOptions(isOffline),
    placeholderData: (previous) => previous,
  });
}
