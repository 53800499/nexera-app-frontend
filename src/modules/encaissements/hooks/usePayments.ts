"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import {
  paymentsApi,
} from "../services/paymentsApi.service";
import type {
  CancelPaymentPayload,
  CreatePaymentPayload,
} from "../types/payment.types";

export const PAYMENTS_QUERY_KEY = ["payments"] as const;

type ListParams = {
  page?: number;
  limit?: number;
  clientId?: string;
  includeCancelled?: boolean;
};

export function usePayments(params: ListParams = {}) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();
  const {
    page = 1,
    limit = 20,
    clientId,
    includeCancelled = false,
  } = params;

  const paymentsQuery = useQuery({
    queryKey: [
      ...PAYMENTS_QUERY_KEY,
      page,
      limit,
      clientId ?? "",
      includeCancelled,
    ],
    queryFn: () =>
      paymentsApi.list({
        page,
        limit,
        clientId,
        includeCancelled,
      }),
    enabled: queryEnabled,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePaymentPayload) => paymentsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CancelPaymentPayload;
    }) => paymentsApi.cancel(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["payments", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  return {
    paymentsQuery,
    createMutation,
    cancelMutation,
  };
}

export function usePayment(id: string) {
  const queryEnabled = useQueryEnabled();

  return useQuery({
    queryKey: ["payments", id],
    queryFn: () => paymentsApi.byId(id),
    enabled: queryEnabled && Boolean(id),
  });
}

export function useClientPaymentContext(clientId: string) {
  const queryEnabled = useQueryEnabled();

  return useQuery({
    queryKey: ["payments", "context", clientId],
    queryFn: () => paymentsApi.clientContext(clientId),
    enabled: queryEnabled && Boolean(clientId),
  });
}
