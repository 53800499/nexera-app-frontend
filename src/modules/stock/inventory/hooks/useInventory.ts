"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { inventoryOfflineService } from "../../offline/services/inventoryOffline.service";
import { refreshStockSyncMeta } from "../../offline/services/stockSyncActions";
import { useStockSyncStore } from "../../offline/store/stockSyncStore";

import type {
  CreateInventorySessionPayload,
  SubmitInventoryCountsPayload,
} from "../types/inventory.types";

export const INVENTORY_KEY = ["stock", "inventories"] as const;

function stockQueryOptions(isOffline: boolean) {
  return {
    networkMode: "always" as const,
    retry: false,
    staleTime: isOffline ? Number.POSITIVE_INFINITY : 0,
    refetchOnMount: isOffline ? false : ("always" as const),
    refetchOnReconnect: true,
  };
}

const stockMutationOptions = {
  networkMode: "always" as const,
};

export function useInventories() {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();
  const isOffline = useStockSyncStore((state) => state.isOffline);

  const listQuery = useQuery({
    queryKey: INVENTORY_KEY,
    queryFn: () => inventoryOfflineService.list(),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
  });

  const invalidate = (id?: string) => {
    queryClient.invalidateQueries({ queryKey: INVENTORY_KEY });
    if (id) {
      queryClient.invalidateQueries({ queryKey: [...INVENTORY_KEY, id] });
    }
    void refreshStockSyncMeta();
  };

  const createMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (payload: CreateInventorySessionPayload) =>
      inventoryOfflineService.create(payload),
    onSuccess: () => invalidate(),
  });

  const startMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (id: string) => inventoryOfflineService.start(id),
    onSuccess: (_, id) => invalidate(id),
  });

  const submitCountsMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: SubmitInventoryCountsPayload;
    }) => inventoryOfflineService.submitCounts(id, payload),
    onSuccess: (_, { id }) => invalidate(id),
  });

  const completeCountMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (id: string) => inventoryOfflineService.completeCount(id),
    onSuccess: (_, id) => invalidate(id),
  });

  const completeRecountMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (id: string) => inventoryOfflineService.completeRecount(id),
    onSuccess: (_, id) => invalidate(id),
  });

  const validateMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (id: string) => inventoryOfflineService.validate(id),
    onSuccess: (_, id) => invalidate(id),
  });

  const closeMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (id: string) => inventoryOfflineService.close(id),
    onSuccess: (_, id) => invalidate(id),
  });

  const cancelMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (id: string) => inventoryOfflineService.cancel(id),
    onSuccess: (_, id) => invalidate(id),
  });

  return {
    listQuery,
    createMutation,
    startMutation,
    submitCountsMutation,
    completeCountMutation,
    completeRecountMutation,
    validateMutation,
    closeMutation,
    cancelMutation,
  };
}

export function useInventory(id: string, mode: "detail" | "sheet" = "detail") {
  const queryEnabled = useQueryEnabled(Boolean(id));
  const isOffline = useStockSyncStore((state) => state.isOffline);

  return useQuery({
    queryKey: [...INVENTORY_KEY, id, mode],
    queryFn: () =>
      mode === "sheet"
        ? inventoryOfflineService.getCountSheet(id)
        : inventoryOfflineService.get(id),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
  });
}

export function useInventoryVariances(id: string, significantOnly: boolean) {
  const queryEnabled = useQueryEnabled(Boolean(id));
  const isOffline = useStockSyncStore((state) => state.isOffline);

  return useQuery({
    queryKey: [...INVENTORY_KEY, id, "variances", significantOnly],
    queryFn: () => inventoryOfflineService.getVariances(id, significantOnly),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
  });
}
