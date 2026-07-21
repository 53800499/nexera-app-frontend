import { authorizedFetch } from "@/shared/http/authorizedFetch";
import type {
  CatalogStockBundle,
  CreateStockItemPayload,
  CreateWarehouseLocationPayload,
  CreateWarehousePayload,
  StockArticleRow,
  StockItem,
  UpdateStockItemPayload,
  UpdateWarehouseLocationPayload,
  UpdateWarehousePayload,
  Warehouse,
  WarehouseLocation,
} from "../types/stock.types";

export const stockApi = {
  listArticles: (q?: string) => {
    const query = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    return authorizedFetch<StockArticleRow[]>(`/stock/articles${query}`);
  },

  getByCatalogItem: (catalogItemId: string) =>
    authorizedFetch<CatalogStockBundle>(
      `/stock/items/by-catalog/${catalogItemId}`,
    ),

  createItem: (payload: CreateStockItemPayload) =>
    authorizedFetch<StockItem>("/stock/items", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateItem: (id: string, payload: UpdateStockItemPayload) =>
    authorizedFetch<StockItem>(`/stock/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  listWarehouses: (includeArchived = true) => {
    const query = includeArchived ? "" : "?includeArchived=false";
    return authorizedFetch<Warehouse[]>(`/stock/warehouses${query}`);
  },

  createWarehouse: (payload: CreateWarehousePayload) =>
    authorizedFetch<Warehouse>("/stock/warehouses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateWarehouse: (id: string, payload: UpdateWarehousePayload) =>
    authorizedFetch<Warehouse>(`/stock/warehouses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  setDefaultWarehouse: (id: string) =>
    authorizedFetch<Warehouse>(`/stock/warehouses/${id}/set-default`, {
      method: "POST",
    }),

  archiveWarehouse: (id: string) =>
    authorizedFetch<Warehouse>(`/stock/warehouses/${id}/archive`, {
      method: "POST",
    }),

  reactivateWarehouse: (id: string) =>
    authorizedFetch<Warehouse>(`/stock/warehouses/${id}/reactivate`, {
      method: "POST",
    }),

  createLocation: (
    warehouseId: string,
    payload: CreateWarehouseLocationPayload,
  ) =>
    authorizedFetch<WarehouseLocation>(
      `/stock/warehouses/${warehouseId}/locations`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  updateLocation: (
    warehouseId: string,
    locationId: string,
    payload: UpdateWarehouseLocationPayload,
  ) =>
    authorizedFetch<WarehouseLocation>(
      `/stock/warehouses/${warehouseId}/locations/${locationId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),
};
