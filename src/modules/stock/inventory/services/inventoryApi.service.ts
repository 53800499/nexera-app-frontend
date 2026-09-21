import { env } from "@/shared/config/env";
import { authorizedFetch } from "@/shared/http/authorizedFetch";
import { fetchWithOfflineGuard } from "@/shared/http/fetchWithOfflineGuard";
import { refreshAccessToken } from "@/shared/http/refreshAccessToken";
import { tokenStorage } from "@/modules/auth/services/tokenStorage.service";
import type {
  CreateInventorySessionPayload,
  InventorySession,
  InventoryVariancesResponse,
  SubmitInventoryCountsPayload,
} from "../types/inventory.types";

function authHeaders(): Record<string, string> {
  const token = tokenStorage.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const inventoryApi = {
  downloadPdf: async (
    id: string,
    type: "report" | "sheet" = "report",
  ): Promise<Blob> => {
    const url = `${env.apiBaseUrl}/stock/inventories/${id}/pdf?type=${type}`;
    let res = await fetchWithOfflineGuard(url, {
      headers: authHeaders(),
    });
    if (res.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        res = await fetchWithOfflineGuard(url, {
          headers: authHeaders(),
        });
      }
    }
    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      const message =
        errBody?.message ||
        `Erreur serveur (${res.status}) lors de la génération du document PDF`;
      throw new Error(message);
    }
    return res.blob();
  },
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
