"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TAX_RATES_KEY } from "@/modules/parametres";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { catalogueReferenceService } from "../services/catalogueReference.service";
import { catalogueApi } from "../services/catalogueApi.service";
import type {
  CreateCatalogCategoryPayload,
  CreateCatalogItemPayload,
  CreateCatalogPricePayload,
  UpdateCatalogCategoryPayload,
  UpdateCatalogItemPayload,
  UpdateCatalogPricePayload,
} from "../types/catalogue.types";

export const CATALOG_ITEMS_KEY = ["catalogue", "items"] as const;
export const CATALOG_CATEGORIES_KEY = ["catalogue", "categories"] as const;

export function useCatalogueItems(q?: string) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();
  const search = q?.trim() ?? "";

  const itemsQuery = useQuery({
    queryKey: [...CATALOG_ITEMS_KEY, search],
    queryFn: () => catalogueReferenceService.listItems(search || undefined),
    enabled: queryEnabled,
    placeholderData: (previous) => previous,
  });

  const createItemMutation = useMutation({
    mutationFn: (payload: CreateCatalogItemPayload) =>
      catalogueApi.createItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_ITEMS_KEY });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCatalogItemPayload }) =>
      catalogueApi.updateItem(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CATALOG_ITEMS_KEY });
      queryClient.invalidateQueries({ queryKey: ["catalogue", "items", variables.id] });
    },
  });

  const archiveItemMutation = useMutation({
    mutationFn: (id: string) => catalogueApi.archiveItem(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: CATALOG_ITEMS_KEY });
      queryClient.invalidateQueries({ queryKey: ["catalogue", "items", id] });
    },
  });

  const unarchiveItemMutation = useMutation({
    mutationFn: (id: string) => catalogueApi.unarchiveItem(id),
    onSuccess: (item, id) => {
      queryClient.setQueryData(["catalogue", "items", id], item);
      queryClient.invalidateQueries({ queryKey: CATALOG_ITEMS_KEY });
      queryClient.invalidateQueries({ queryKey: ["catalogue", "items", id] });
    },
  });

  return {
    itemsQuery,
    createItemMutation,
    updateItemMutation,
    archiveItemMutation,
    unarchiveItemMutation,
  };
}

export function useCatalogItem(id: string) {
  const queryEnabled = useQueryEnabled(Boolean(id));

  return useQuery({
    queryKey: ["catalogue", "items", id],
    queryFn: () => catalogueApi.getItem(id),
    enabled: queryEnabled,
  });
}

export function useCatalogCategory(id: string) {
  const queryEnabled = useQueryEnabled(Boolean(id));

  return useQuery({
    queryKey: ["catalogue", "categories", id],
    queryFn: () => catalogueApi.getCategory(id),
    enabled: queryEnabled,
  });
}

export function useCatalogCategories() {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled();

  const categoriesQuery = useQuery({
    queryKey: CATALOG_CATEGORIES_KEY,
    queryFn: catalogueApi.listCategories,
    enabled: queryEnabled,
  });

  const createCategoryMutation = useMutation({
    mutationFn: (payload: CreateCatalogCategoryPayload) =>
      catalogueApi.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_CATEGORIES_KEY });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCatalogCategoryPayload }) =>
      catalogueApi.updateCategory(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CATALOG_CATEGORIES_KEY });
      queryClient.invalidateQueries({
        queryKey: ["catalogue", "categories", variables.id],
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => catalogueApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_CATEGORIES_KEY });
    },
  });

  return {
    categoriesQuery,
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  };
}

export function useTaxRates() {
  const queryEnabled = useQueryEnabled();

  return useQuery({
    queryKey: TAX_RATES_KEY,
    queryFn: () => catalogueReferenceService.listTaxRates(),
    enabled: queryEnabled,
    placeholderData: (previous) => previous,
  });
}

export function useCatalogItemPrices(itemId: string) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled(Boolean(itemId));

  const pricesQuery = useQuery({
    queryKey: ["catalogue", "items", itemId, "prices"],
    queryFn: () => catalogueApi.listPrices(itemId),
    enabled: queryEnabled,
  });

  const createPriceMutation = useMutation({
    mutationFn: (payload: CreateCatalogPricePayload) =>
      catalogueApi.createPrice(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogue", "items", itemId] });
      queryClient.invalidateQueries({
        queryKey: ["catalogue", "items", itemId, "prices"],
      });
      queryClient.invalidateQueries({ queryKey: CATALOG_ITEMS_KEY });
    },
  });

  return { pricesQuery, createPriceMutation };
}

export function useCatalogPrice(priceId: string) {
  const queryEnabled = useQueryEnabled(Boolean(priceId));

  return useQuery({
    queryKey: ["catalogue", "prices", priceId],
    queryFn: () => catalogueApi.getPrice(priceId),
    enabled: queryEnabled,
  });
}

export function useUpdateCatalogPrice(itemId: string, priceId: string) {
  const queryClient = useQueryClient();

  const updatePriceMutation = useMutation({
    mutationFn: (payload: UpdateCatalogPricePayload) =>
      catalogueApi.updatePrice(priceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogue", "items", itemId] });
      queryClient.invalidateQueries({
        queryKey: ["catalogue", "items", itemId, "prices"],
      });
      queryClient.invalidateQueries({ queryKey: ["catalogue", "prices", priceId] });
      queryClient.invalidateQueries({ queryKey: CATALOG_ITEMS_KEY });
    },
  });

  return { updatePriceMutation };
}
