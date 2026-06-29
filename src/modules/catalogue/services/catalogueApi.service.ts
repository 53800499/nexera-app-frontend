import { authorizedFetch } from "@/shared/http/authorizedFetch";
import { settingsApi } from "@/modules/parametres/services/settingsApi.service";
import type {
  CatalogCategory,
  CatalogItem,
  CatalogItemPrice,
  CreateCatalogCategoryPayload,
  CreateCatalogItemPayload,
  CreateCatalogPricePayload,
  UpdateCatalogCategoryPayload,
  UpdateCatalogItemPayload,
  UpdateCatalogPricePayload,
} from "../types/catalogue.types";

export const catalogueApi = {
  // Categories
  listCategories: () =>
    authorizedFetch<CatalogCategory[]>("/catalogue/categories"),

  getCategory: (id: string) =>
    authorizedFetch<CatalogCategory>(`/catalogue/categories/${id}`),

  createCategory: (payload: CreateCatalogCategoryPayload) =>
    authorizedFetch<CatalogCategory>("/catalogue/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateCategory: (id: string, payload: UpdateCatalogCategoryPayload) =>
    authorizedFetch<CatalogCategory>(`/catalogue/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteCategory: (id: string) =>
    authorizedFetch<{ message: string }>(`/catalogue/categories/${id}`, {
      method: "DELETE",
    }),

  // Items
  listItems: (q?: string) => {
    const query = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    return authorizedFetch<CatalogItem[]>(`/catalogue/items${query}`);
  },

  getItem: (id: string) =>
    authorizedFetch<CatalogItem>(`/catalogue/items/${id}`),

  createItem: (payload: CreateCatalogItemPayload) =>
    authorizedFetch<CatalogItem>("/catalogue/items", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateItem: (id: string, payload: UpdateCatalogItemPayload) =>
    authorizedFetch<CatalogItem>(`/catalogue/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  archiveItem: (id: string) =>
    authorizedFetch<{ message: string; itemId: string }>(
      `/catalogue/items/${id}`,
      { method: "DELETE" },
    ),

  // Prices
  listPrices: (itemId: string) =>
    authorizedFetch<CatalogItemPrice[]>(`/catalogue/items/${itemId}/prices`),

  createPrice: (itemId: string, payload: CreateCatalogPricePayload) =>
    authorizedFetch<CatalogItemPrice>(`/catalogue/items/${itemId}/prices`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getPrice: (priceId: string) =>
    authorizedFetch<CatalogItemPrice>(`/catalogue/prices/${priceId}`),

  updatePrice: (priceId: string, payload: UpdateCatalogPricePayload) =>
    authorizedFetch<CatalogItemPrice>(`/catalogue/prices/${priceId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // Tax rates (settings)
  listTaxRates: () => settingsApi.listTaxRates(),
};
