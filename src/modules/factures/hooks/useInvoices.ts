"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { invoicesOfflineService } from "../offline/services/invoicesOffline.service";
import { refreshInvoicesSyncMeta } from "../offline/services/invoicesSyncActions";
import { useInvoicesSyncStore } from "../offline/store/invoicesSyncStore";
import type {
  CreateCreditNotePayload,
  CreateInvoicePayload,
  RecordInvoicePaymentPayload,
  SendInvoicePayload,
  UpdateInvoicePayload,
} from "../types/invoice.types";

export const INVOICES_QUERY_KEY = ["invoices"] as const;

function invoicesQueryOptions(isOffline: boolean) {
  return {
    networkMode: "always" as const,
    retry: false,
    staleTime: isOffline ? Number.POSITIVE_INFINITY : 0,
    refetchOnMount: isOffline ? false : ("always" as const),
    refetchOnReconnect: true,
  };
}

const invoicesMutationOptions = {
  networkMode: "always" as const,
};

type ListParams = {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  invoiceType?: string;
  clientId?: string;
};

export function useInvoices(params: ListParams = {}) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();
  const isOffline = useInvoicesSyncStore((state) => state.isOffline);
  const { page = 1, limit = 20, q, status, invoiceType, clientId } = params;
  const searchTerm = q?.trim() ?? "";

  const invoicesQuery = useQuery({
    queryKey: [
      ...INVOICES_QUERY_KEY,
      page,
      limit,
      searchTerm,
      status ?? "",
      invoiceType ?? "",
      clientId ?? "",
    ],
    queryFn: () =>
      invoicesOfflineService.list({
        page,
        limit,
        q: searchTerm || undefined,
        status,
        invoiceType,
        clientId,
      }),
    enabled: queryEnabled,
    ...invoicesQueryOptions(isOffline),
    placeholderData: (previous) => previous,
  });

  const createMutation = useMutation({
    ...invoicesMutationOptions,
    mutationFn: (payload: CreateInvoicePayload) =>
      invoicesOfflineService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      void refreshInvoicesSyncMeta();
    },
  });

  const updateMutation = useMutation({
    ...invoicesMutationOptions,
    mutationFn: ({ id, payload }: { id: string; payload: UpdateInvoicePayload }) =>
      invoicesOfflineService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["invoices", variables.id] });
      void refreshInvoicesSyncMeta();
    },
  });

  const removeMutation = useMutation({
    ...invoicesMutationOptions,
    mutationFn: (id: string) => invoicesOfflineService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      void refreshInvoicesSyncMeta();
    },
  });

  const issueMutation = useMutation({
    ...invoicesMutationOptions,
    mutationFn: (id: string) => invoicesOfflineService.issue(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["invoices", id] });
    },
  });

  const sendMutation = useMutation({
    ...invoicesMutationOptions,
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload?: SendInvoicePayload;
    }) => invoicesOfflineService.send(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["invoices", variables.id] });
    },
  });

  const creditNoteMutation = useMutation({
    ...invoicesMutationOptions,
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload?: CreateCreditNotePayload;
    }) => invoicesOfflineService.createCreditNote(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
    },
  });

  const recordPaymentMutation = useMutation({
    ...invoicesMutationOptions,
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: RecordInvoicePaymentPayload;
    }) => invoicesOfflineService.recordPayment(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["invoices", variables.id] });
    },
  });

  return {
    invoicesQuery,
    createMutation,
    updateMutation,
    removeMutation,
    issueMutation,
    sendMutation,
    creditNoteMutation,
    recordPaymentMutation,
  };
}

export function useInvoice(id: string) {
  const queryEnabled = useQueryEnabled();
  const isOffline = useInvoicesSyncStore((state) => state.isOffline);

  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => invoicesOfflineService.byId(id),
    enabled: queryEnabled && Boolean(id),
    ...invoicesQueryOptions(isOffline),
    placeholderData: (previous) => previous,
  });
}
