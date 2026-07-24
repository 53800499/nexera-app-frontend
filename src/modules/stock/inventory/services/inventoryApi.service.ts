import { authorizedFetch } from "@/shared/http/authorizedFetch";
import type {
  CreateInventorySessionPayload,
  InventorySession,
  InventoryVariancesResponse,
  SubmitInventoryCountsPayload,
} from "../types/inventory.types";

export const inventoryApi = {
  list: () => authorizedFetch<InventorySession[]>("/stock/inventories"),

  get: (id: string) =>
    authorizedFetch<InventorySession>(`/stock/inventories/${id}`),

  getCountSheet: (id: string) =>
    authorizedFetch<InventorySession>(`/stock/inventories/${id}/count-sheet`),

  getVariances: (id: string, significantOnly = false) =>
    authorizedFetch<InventoryVariancesResponse>(
      `/stock/inventories/${id}/variances?significantOnly=${significantOnly}`,
    ),

  create: (payload: CreateInventorySessionPayload) =>
    authorizedFetch<InventorySession>("/stock/inventories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  start: (id: string) =>
    authorizedFetch<InventorySession>(`/stock/inventories/${id}/start`, {
      method: "POST",
    }),

  submitCounts: (id: string, payload: SubmitInventoryCountsPayload) =>
    authorizedFetch<InventorySession>(`/stock/inventories/${id}/counts`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  completeCount: (id: string) =>
    authorizedFetch<InventorySession>(
      `/stock/inventories/${id}/complete-count`,
      { method: "POST" },
    ),

  completeRecount: (id: string) =>
    authorizedFetch<InventorySession>(
      `/stock/inventories/${id}/complete-recount`,
      { method: "POST" },
    ),

  validate: (id: string) =>
    authorizedFetch<InventorySession>(`/stock/inventories/${id}/validate`, {
      method: "POST",
    }),

  close: (id: string) =>
    authorizedFetch<InventorySession>(`/stock/inventories/${id}/close`, {
      method: "POST",
    }),

  cancel: (id: string) =>
    authorizedFetch<InventorySession>(`/stock/inventories/${id}/cancel`, {
      method: "POST",
    }),
};
