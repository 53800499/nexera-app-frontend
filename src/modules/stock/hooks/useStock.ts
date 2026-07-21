"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
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
} from "../types/stock.types";

export const STOCK_ARTICLES_KEY = ["stock", "articles"] as const;
export const STOCK_WAREHOUSES_KEY = ["stock", "warehouses"] as const;
export const STOCK_ENTRIES_KEY = ["stock", "entries"] as const;
export const STOCK_EXITS_KEY = ["stock", "exits"] as const;

export function useStockArticles(q?: string) {
  const queryEnabled = useQueryEnabled();
  const search = q?.trim() ?? "";

  return useQuery({
    queryKey: [...STOCK_ARTICLES_KEY, search],
    queryFn: () => stockApi.listArticles(search || undefined),
    enabled: queryEnabled,
    placeholderData: (previous) => previous,
  });
}

export function useStockByCatalogItem(catalogItemId: string) {
  const queryEnabled = useQueryEnabled(Boolean(catalogItemId));

  return useQuery({
    queryKey: ["stock", "by-catalog", catalogItemId],
    queryFn: () => stockApi.getByCatalogItem(catalogItemId),
    enabled: queryEnabled,
  });
}

export function useStockItemMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateStockItemPayload) =>
      stockApi.createItem(payload),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: STOCK_ARTICLES_KEY });
      queryClient.invalidateQueries({
        queryKey: ["stock", "by-catalog", item.commercialItemId],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateStockItemPayload;
    }) => stockApi.updateItem(id, payload),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: STOCK_ARTICLES_KEY });
      queryClient.invalidateQueries({
        queryKey: ["stock", "by-catalog", item.commercialItemId],
      });
    },
  });

  return { createMutation, updateMutation };
}

export function useWarehouses(includeArchived = true) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();

  const warehousesQuery = useQuery({
    queryKey: [...STOCK_WAREHOUSES_KEY, includeArchived],
    queryFn: () => stockApi.listWarehouses(includeArchived),
    enabled: queryEnabled,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: STOCK_WAREHOUSES_KEY });
  };

  const createWarehouseMutation = useMutation({
    mutationFn: (payload: CreateWarehousePayload) =>
      stockApi.createWarehouse(payload),
    onSuccess: invalidate,
  });

  const updateWarehouseMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateWarehousePayload;
    }) => stockApi.updateWarehouse(id, payload),
    onSuccess: invalidate,
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => stockApi.setDefaultWarehouse(id),
    onSuccess: invalidate,
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => stockApi.archiveWarehouse(id),
    onSuccess: invalidate,
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => stockApi.reactivateWarehouse(id),
    onSuccess: invalidate,
  });

  const createLocationMutation = useMutation({
    mutationFn: ({
      warehouseId,
      payload,
    }: {
      warehouseId: string;
      payload: CreateWarehouseLocationPayload;
    }) => stockApi.createLocation(warehouseId, payload),
    onSuccess: invalidate,
  });

  const updateLocationMutation = useMutation({
    mutationFn: ({
      warehouseId,
      locationId,
      payload,
    }: {
      warehouseId: string;
      locationId: string;
      payload: UpdateWarehouseLocationPayload;
    }) => stockApi.updateLocation(warehouseId, locationId, payload),
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

  const entriesQuery = useQuery({
    queryKey: STOCK_ENTRIES_KEY,
    queryFn: () => stockApi.listEntries(),
    enabled: queryEnabled,
  });

  const createEntryMutation = useMutation({
    mutationFn: (payload: CreateStockEntryPayload) =>
      stockApi.createEntry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOCK_ENTRIES_KEY });
      queryClient.invalidateQueries({ queryKey: STOCK_ARTICLES_KEY });
    },
  });

  const validateEntryMutation = useMutation({
    mutationFn: (id: string) => stockApi.validateEntry(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: STOCK_ENTRIES_KEY });
      queryClient.invalidateQueries({ queryKey: STOCK_EXITS_KEY });
      queryClient.invalidateQueries({ queryKey: ["stock", "movements", id] });
      queryClient.invalidateQueries({ queryKey: STOCK_ARTICLES_KEY });
    },
  });

  return { entriesQuery, createEntryMutation, validateEntryMutation };
}

export function useStockExits() {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();

  const exitsQuery = useQuery({
    queryKey: STOCK_EXITS_KEY,
    queryFn: () => stockApi.listExits(),
    enabled: queryEnabled,
  });

  const createExitMutation = useMutation({
    mutationFn: (payload: CreateStockExitPayload) =>
      stockApi.createExit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOCK_EXITS_KEY });
      queryClient.invalidateQueries({ queryKey: STOCK_ARTICLES_KEY });
    },
  });

  return { exitsQuery, createExitMutation };
}

export function useStockMovement(id: string) {
  const queryEnabled = useQueryEnabled(Boolean(id));
  return useQuery({
    queryKey: ["stock", "movements", id],
    queryFn: () => stockApi.getMovement(id),
    enabled: queryEnabled,
  });
}

export function useAvailableLots(stockItemId: string, warehouseId: string) {
  const queryEnabled = useQueryEnabled(
    Boolean(stockItemId) && Boolean(warehouseId),
  );
  return useQuery({
    queryKey: ["stock", "available-lots", stockItemId, warehouseId],
    queryFn: () => stockApi.listAvailableLots(stockItemId, warehouseId),
    enabled: queryEnabled,
  });
}
