"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { stockOfflineService } from "../offline/services/stockOffline.service";
import { refreshStockSyncMeta } from "../offline/services/stockSyncActions";
import { useStockSyncStore } from "../offline/store/stockSyncStore";
import { stockApi } from "../services/stockApi.service";

import type {
  CreateStockItemPayload,
  CreateWarehouseLocationPayload,
  CreateWarehousePayload,
  UpdateStockItemPayload,
  UpdateWarehouseLocationPayload,
  UpdateWarehousePayload,
  CreateStockEntryPayload,
  CreateStockExitPayload,
  CreateStockTransferPayload,
  ReceiveStockTransferPayload,
  UpdateDraftSerialsPayload,
} from "../types/stock.types";

export const STOCK_ARTICLES_KEY = ["stock", "articles"] as const;
export const STOCK_WAREHOUSES_KEY = ["stock", "warehouses"] as const;
export const STOCK_ENTRIES_KEY = ["stock", "entries"] as const;
export const STOCK_EXITS_KEY = ["stock", "exits"] as const;
export const STOCK_TRANSFERS_KEY = ["stock", "transfers"] as const;

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

export function useStockArticles(q?: string) {
  const queryEnabled = useQueryEnabled();
  const isOffline = useStockSyncStore((state) => state.isOffline);
  const search = q?.trim() ?? "";

  return useQuery({
    queryKey: [...STOCK_ARTICLES_KEY, search],
    queryFn: () => stockOfflineService.listArticles(search || undefined),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
    placeholderData: (previous) => previous,
  });
}

export function useStockByCatalogItem(catalogItemId: string) {
  const queryEnabled = useQueryEnabled(Boolean(catalogItemId));
  const isOffline = useStockSyncStore((state) => state.isOffline);

  return useQuery({
    queryKey: ["stock", "by-catalog", catalogItemId],
    queryFn: () => stockOfflineService.getByCatalogItem(catalogItemId),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
  });
}

export function useStockItemMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (payload: CreateStockItemPayload) =>
      stockOfflineService.createItem(payload),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: STOCK_ARTICLES_KEY });
      queryClient.invalidateQueries({
        queryKey: ["stock", "by-catalog", item.commercialItemId],
      });
      void refreshStockSyncMeta();
    },
  });

  const updateMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateStockItemPayload;
    }) => stockOfflineService.updateItem(id, payload),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: STOCK_ARTICLES_KEY });
      queryClient.invalidateQueries({
        queryKey: ["stock", "by-catalog", item.commercialItemId],
      });
      void refreshStockSyncMeta();
    },
  });

  return { createMutation, updateMutation };
}

export function useWarehouses(includeArchived = true) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();
  const isOffline = useStockSyncStore((state) => state.isOffline);

  const warehousesQuery = useQuery({
    queryKey: [...STOCK_WAREHOUSES_KEY, includeArchived],
    queryFn: () => stockOfflineService.listWarehouses(includeArchived),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: STOCK_WAREHOUSES_KEY });
    void refreshStockSyncMeta();
  };

  const createWarehouseMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (payload: CreateWarehousePayload) =>
      stockOfflineService.createWarehouse(payload),
    onSuccess: invalidate,
  });

  const updateWarehouseMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateWarehousePayload;
    }) => stockOfflineService.updateWarehouse(id, payload),
    onSuccess: invalidate,
  });

  const setDefaultMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (id: string) => stockOfflineService.setDefaultWarehouse(id),
    onSuccess: invalidate,
  });

  const archiveMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (id: string) => stockOfflineService.archiveWarehouse(id),
    onSuccess: invalidate,
  });

  const reactivateMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (id: string) => stockOfflineService.reactivateWarehouse(id),
    onSuccess: invalidate,
  });

  const createLocationMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: ({
      warehouseId,
      payload,
    }: {
      warehouseId: string;
      payload: CreateWarehouseLocationPayload;
    }) => stockOfflineService.createLocation(warehouseId, payload),
    onSuccess: invalidate,
  });

  const updateLocationMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: ({
      warehouseId,
      locationId,
      payload,
    }: {
      warehouseId: string;
      locationId: string;
      payload: UpdateWarehouseLocationPayload;
    }) => stockOfflineService.updateLocation(warehouseId, locationId, payload),
    onSuccess: invalidate,
  });

  return {
    warehousesQuery,
    createWarehouseMutation,
    updateWarehouseMutation,
    setDefaultMutation,
    archiveMutation,
    reactivateMutation,
    createLocationMutation,
    updateLocationMutation,
  };
}

export function useStockEntries() {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();
  const isOffline = useStockSyncStore((state) => state.isOffline);

  const entriesQuery = useQuery({
    queryKey: STOCK_ENTRIES_KEY,
    queryFn: () => stockOfflineService.listEntries(),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
  });

  const createEntryMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (payload: CreateStockEntryPayload) =>
      stockOfflineService.createEntry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOCK_ENTRIES_KEY });
      queryClient.invalidateQueries({ queryKey: STOCK_ARTICLES_KEY });
      void refreshStockSyncMeta();
    },
  });

  const validateEntryMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (id: string) => stockOfflineService.validateEntry(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: STOCK_ENTRIES_KEY });
      queryClient.invalidateQueries({ queryKey: STOCK_EXITS_KEY });
      queryClient.invalidateQueries({ queryKey: ["stock", "movements", id] });
      queryClient.invalidateQueries({ queryKey: STOCK_ARTICLES_KEY });
      void refreshStockSyncMeta();
    },
  });

  return { entriesQuery, createEntryMutation, validateEntryMutation };
}

export function useStockExits() {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();
  const isOffline = useStockSyncStore((state) => state.isOffline);

  const exitsQuery = useQuery({
    queryKey: STOCK_EXITS_KEY,
    queryFn: () => stockOfflineService.listExits(),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
  });

  const createExitMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (payload: CreateStockExitPayload) =>
      stockOfflineService.createExit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOCK_EXITS_KEY });
      queryClient.invalidateQueries({ queryKey: STOCK_ARTICLES_KEY });
      void refreshStockSyncMeta();
    },
  });

  return { exitsQuery, createExitMutation };
}

export function useStockTransfers() {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();
  const isOffline = useStockSyncStore((state) => state.isOffline);

  const transfersQuery = useQuery({
    queryKey: STOCK_TRANSFERS_KEY,
    queryFn: () => stockOfflineService.listTransfers(),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: STOCK_TRANSFERS_KEY });
    queryClient.invalidateQueries({ queryKey: STOCK_ARTICLES_KEY });
    void refreshStockSyncMeta();
  };

  const createTransferMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (payload: CreateStockTransferPayload) =>
      stockOfflineService.createTransfer(payload),
    onSuccess: () => invalidate(),
  });

  const submitTransferMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (id: string) => stockOfflineService.submitTransfer(id),
    onSuccess: (_, id) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["stock", "transfers", id] });
    },
  });

  const shipTransferMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (id: string) => stockOfflineService.shipTransfer(id),
    onSuccess: (_, id) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["stock", "transfers", id] });
    },
  });

  const receiveTransferMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ReceiveStockTransferPayload;
    }) => stockOfflineService.receiveTransfer(id, payload),
    onSuccess: (_, { id }) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["stock", "transfers", id] });
    },
  });

  const cancelTransferMutation = useMutation({
    ...stockMutationOptions,
    mutationFn: (id: string) => stockOfflineService.cancelTransfer(id),
    onSuccess: (_, id) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["stock", "transfers", id] });
    },
  });

  return {
    transfersQuery,
    createTransferMutation,
    submitTransferMutation,
    shipTransferMutation,
    receiveTransferMutation,
    cancelTransferMutation,
  };
}

export function useStockTransfer(id: string) {
  const queryEnabled = useQueryEnabled(Boolean(id));
  const isOffline = useStockSyncStore((state) => state.isOffline);

  return useQuery({
    queryKey: ["stock", "transfers", id],
    queryFn: () => stockOfflineService.getTransfer(id),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
  });
}

export function useStockMovement(id: string) {
  const queryEnabled = useQueryEnabled(Boolean(id));
  const isOffline = useStockSyncStore((state) => state.isOffline);

  return useQuery({
    queryKey: ["stock", "movements", id],
    queryFn: () => stockOfflineService.getMovement(id),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
  });
}

export function useAvailableLots(stockItemId: string, warehouseId: string) {
  const queryEnabled = useQueryEnabled(
    Boolean(stockItemId) && Boolean(warehouseId),
  );
  const isOffline = useStockSyncStore((state) => state.isOffline);

  return useQuery({
    queryKey: ["stock", "available-lots", stockItemId, warehouseId],
    queryFn: () => stockOfflineService.listAvailableLots(stockItemId, warehouseId),
    enabled: queryEnabled,
    ...stockQueryOptions(isOffline),
  });
}

export function useAvailableSerials(stockItemId: string, warehouseId: string) {
  const queryEnabled = useQueryEnabled(
    Boolean(stockItemId) && Boolean(warehouseId),
  );

  return useQuery({
    queryKey: ["stock", "available-serials", stockItemId, warehouseId],
    queryFn: () => stockApi.listAvailableSerials(stockItemId, warehouseId),
    enabled: queryEnabled,
  });
}

export function useDraftMovementActions() {
  const queryClient = useQueryClient();

  const updateDraftSerialsMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateDraftSerialsPayload;
    }) => stockApi.updateDraftSerials(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["stock", "movements", id] });
      queryClient.invalidateQueries({ queryKey: STOCK_ENTRIES_KEY });
      queryClient.invalidateQueries({ queryKey: STOCK_EXITS_KEY });
    },
  });

  const deleteDraftMovementMutation = useMutation({
    mutationFn: (id: string) => stockApi.deleteDraftMovement(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ["stock", "movements", id] });
      queryClient.invalidateQueries({ queryKey: STOCK_ENTRIES_KEY });
      queryClient.invalidateQueries({ queryKey: STOCK_EXITS_KEY });
    },
  });

  return { updateDraftSerialsMutation, deleteDraftMovementMutation };
}
