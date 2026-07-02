"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { quotationsOfflineService } from "../offline/services/quotationsOffline.service";
import { refreshQuotationsSyncMeta } from "../offline/services/quotationsSyncActions";
import { useQuotationsSyncStore } from "../offline/store/quotationsSyncStore";
import type {
  ChangeQuotationStatusPayload,
  ConvertQuotationPayload,
  CreateQuotationPayload,
  SendQuotationPayload,
  UpdateQuotationPayload,
} from "../types/quotation.types";

export const QUOTATIONS_QUERY_KEY = ["quotations"] as const;

function quotationsQueryOptions(isOffline: boolean) {
  return {
    networkMode: "always" as const,
    retry: false,
    staleTime: isOffline ? Number.POSITIVE_INFINITY : 0,
    refetchOnMount: isOffline ? false : ("always" as const),
    refetchOnReconnect: true,
  };
}

const quotationsMutationOptions = {
  networkMode: "always" as const,
};

type ListParams = {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  clientId?: string;
};

export function useQuotations(params: ListParams = {}) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();
  const isOffline = useQuotationsSyncStore((state) => state.isOffline);
  const { page = 1, limit = 20, q, status, clientId } = params;
  const searchTerm = q?.trim() ?? "";

  const quotationsQuery = useQuery({
    queryKey: [
      ...QUOTATIONS_QUERY_KEY,
      page,
      limit,
      searchTerm,
      status ?? "",
      clientId ?? "",
    ],
    queryFn: () =>
      quotationsOfflineService.list({
        page,
        limit,
        q: searchTerm || undefined,
        status,
        clientId,
      }),
    enabled: queryEnabled,
    ...quotationsQueryOptions(isOffline),
    placeholderData: (previous) => previous,
  });

  const createMutation = useMutation({
    ...quotationsMutationOptions,
    mutationFn: (payload: CreateQuotationPayload) =>
      quotationsOfflineService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTATIONS_QUERY_KEY });
      void refreshQuotationsSyncMeta();
    },
  });

  const updateMutation = useMutation({
    ...quotationsMutationOptions,
    mutationFn: ({ id, payload }: { id: string; payload: UpdateQuotationPayload }) =>
      quotationsOfflineService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUOTATIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["quotations", variables.id],
      });
      void refreshQuotationsSyncMeta();
    },
  });

  const removeMutation = useMutation({
    ...quotationsMutationOptions,
    mutationFn: (id: string) => quotationsOfflineService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTATIONS_QUERY_KEY });
      void refreshQuotationsSyncMeta();
    },
  });

  const sendMutation = useMutation({
    ...quotationsMutationOptions,
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload?: SendQuotationPayload;
    }) => quotationsOfflineService.send(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUOTATIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["quotations", variables.id],
      });
    },
  });

  const changeStatusMutation = useMutation({
    ...quotationsMutationOptions,
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ChangeQuotationStatusPayload;
    }) => quotationsOfflineService.changeStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUOTATIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["quotations", variables.id],
      });
    },
  });

  const convertMutation = useMutation({
    ...quotationsMutationOptions,
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ConvertQuotationPayload;
    }) => quotationsOfflineService.convert(id, payload),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: QUOTATIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["quotations", variables.id],
      });

      if (result.target === "order") {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({
          queryKey: ["orders", result.targetId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        queryClient.invalidateQueries({
          queryKey: ["invoices", result.targetId],
        });
      }
    },
  });

  return {
    quotationsQuery,
    createMutation,
    updateMutation,
    removeMutation,
    sendMutation,
    changeStatusMutation,
    convertMutation,
  };
}

export function useQuotation(id: string) {
  const queryEnabled = useQueryEnabled();
  const isOffline = useQuotationsSyncStore((state) => state.isOffline);

  return useQuery({
    queryKey: ["quotations", id],
    queryFn: () => quotationsOfflineService.byId(id),
    enabled: queryEnabled && Boolean(id),
    ...quotationsQueryOptions(isOffline),
    placeholderData: (previous) => previous,
  });
}
