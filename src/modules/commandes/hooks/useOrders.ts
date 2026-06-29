"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { ordersOfflineService } from "../offline/services/ordersOffline.service";
import { refreshOrdersSyncMeta } from "../offline/services/ordersSyncActions";
import { useOrdersSyncStore } from "../offline/store/ordersSyncStore";
import type {
  CreateOrderInvoicePayload,
  CreateOrderPayload,
  UpdateOrderPayload,
} from "../types/order.types";

export const ORDERS_QUERY_KEY = ["orders"] as const;

function ordersQueryOptions(isOffline: boolean) {
  return {
    networkMode: "always" as const,
    retry: false,
    staleTime: isOffline ? Number.POSITIVE_INFINITY : 0,
    refetchOnMount: isOffline ? false : ("always" as const),
    refetchOnReconnect: true,
  };
}

const ordersMutationOptions = {
  networkMode: "always" as const,
};

type ListParams = {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  clientId?: string;
};

export function useOrders(params: ListParams = {}) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();
  const isOffline = useOrdersSyncStore((state) => state.isOffline);
  const { page = 1, limit = 20, q, status, clientId } = params;
  const searchTerm = q?.trim() ?? "";

  const ordersQuery = useQuery({
    queryKey: [
      ...ORDERS_QUERY_KEY,
      page,
      limit,
      searchTerm,
      status ?? "",
      clientId ?? "",
    ],
    queryFn: () =>
      ordersOfflineService.list({
        page,
        limit,
        q: searchTerm || undefined,
        status,
        clientId,
      }),
    enabled: queryEnabled,
    ...ordersQueryOptions(isOffline),
    placeholderData: (previous) => previous,
  });

  const createMutation = useMutation({
    ...ordersMutationOptions,
    mutationFn: (payload: CreateOrderPayload) =>
      ordersOfflineService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      void refreshOrdersSyncMeta();
    },
  });

  const updateMutation = useMutation({
    ...ordersMutationOptions,
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrderPayload }) =>
      ordersOfflineService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["orders", variables.id] });
      void refreshOrdersSyncMeta();
    },
  });

  const removeMutation = useMutation({
    ...ordersMutationOptions,
    mutationFn: (id: string) => ordersOfflineService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      void refreshOrdersSyncMeta();
    },
  });

  const confirmMutation = useMutation({
    ...ordersMutationOptions,
    mutationFn: (id: string) => ordersOfflineService.confirm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
  });

  const cancelMutation = useMutation({
    ...ordersMutationOptions,
    mutationFn: (id: string) => ordersOfflineService.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
  });

  const createInvoiceMutation = useMutation({
    ...ordersMutationOptions,
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload?: CreateOrderInvoicePayload;
    }) => ordersOfflineService.createInvoice(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["orders", variables.id] });
    },
  });

  return {
    ordersQuery,
    createMutation,
    updateMutation,
    removeMutation,
    confirmMutation,
    cancelMutation,
    createInvoiceMutation,
  };
}

export function useOrder(id: string) {
  const queryEnabled = useQueryEnabled();
  const isOffline = useOrdersSyncStore((state) => state.isOffline);

  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => ordersOfflineService.byId(id),
    enabled: queryEnabled && Boolean(id),
    ...ordersQueryOptions(isOffline),
    placeholderData: (previous) => previous,
  });
}
