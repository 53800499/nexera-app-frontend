"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { inventoryApi } from "../services/inventoryApi.service";
import type {
  CreateInventorySessionPayload,
  SubmitInventoryCountsPayload,
} from "../types/inventory.types";

export const INVENTORY_KEY = ["stock", "inventories"] as const;

export function useInventories() {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();

  const listQuery = useQuery({
    queryKey: INVENTORY_KEY,
    queryFn: () => inventoryApi.list(),
    enabled: queryEnabled,
  });

  const invalidate = (id?: string) => {
    queryClient.invalidateQueries({ queryKey: INVENTORY_KEY });
    if (id) {
      queryClient.invalidateQueries({ queryKey: [...INVENTORY_KEY, id] });
    }
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateInventorySessionPayload) =>
      inventoryApi.create(payload),
    onSuccess: () => invalidate(),
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => inventoryApi.start(id),
    onSuccess: (_, id) => invalidate(id),
  });

  const submitCountsMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: SubmitInventoryCountsPayload;
    }) => inventoryApi.submitCounts(id, payload),
    onSuccess: (_, { id }) => invalidate(id),
  });

  const completeCountMutation = useMutation({
    mutationFn: (id: string) => inventoryApi.completeCount(id),
    onSuccess: (_, id) => invalidate(id),
  });

  const completeRecountMutation = useMutation({
    mutationFn: (id: string) => inventoryApi.completeRecount(id),
    onSuccess: (_, id) => invalidate(id),
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => inventoryApi.validate(id),
    onSuccess: (_, id) => invalidate(id),
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => inventoryApi.close(id),
    onSuccess: (_, id) => invalidate(id),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => inventoryApi.cancel(id),
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
  return useQuery({
    queryKey: [...INVENTORY_KEY, id, mode],
    queryFn: () =>
      mode === "sheet"
        ? inventoryApi.getCountSheet(id)
        : inventoryApi.get(id),
    enabled: queryEnabled,
  });
}

export function useInventoryVariances(id: string, significantOnly: boolean) {
  const queryEnabled = useQueryEnabled(Boolean(id));
  return useQuery({
    queryKey: [...INVENTORY_KEY, id, "variances", significantOnly],
    queryFn: () => inventoryApi.getVariances(id, significantOnly),
    enabled: queryEnabled,
  });
}
