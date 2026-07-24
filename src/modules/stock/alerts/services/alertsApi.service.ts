import { authorizedFetch } from "@/shared/http/authorizedFetch";
import type {
  AlertsSummary,
  ReplenishmentProposal,
  ScanResult,
  StockAlert,
  StockAlertStatus,
  StockAlertType,
} from "../types/alerts.types";

export const alertsApi = {
  list: (params?: { status?: StockAlertStatus; alertType?: StockAlertType }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.alertType) q.set("alertType", params.alertType);
    const qs = q.toString();
    return authorizedFetch<StockAlert[]>(`/stock/alerts${qs ? `?${qs}` : ""}`);
  },

  summary: () => authorizedFetch<AlertsSummary>("/stock/alerts/summary"),

  get: (id: string) => authorizedFetch<StockAlert>(`/stock/alerts/${id}`),

  scan: (dormantDays?: number) => {
    const q =
      dormantDays != null ? `?dormantDays=${encodeURIComponent(dormantDays)}` : "";
    return authorizedFetch<ScanResult>(`/stock/alerts/scan${q}`, {
      method: "POST",
    });
  },

  acknowledge: (id: string) =>
    authorizedFetch<StockAlert>(`/stock/alerts/${id}/acknowledge`, {
      method: "POST",
    }),

  dismiss: (id: string) =>
    authorizedFetch<StockAlert>(`/stock/alerts/${id}/dismiss`, {
      method: "POST",
    }),

  listReplenishments: () =>
    authorizedFetch<ReplenishmentProposal[]>("/stock/replenishments"),

  createReplenishment: (payload: {
    alertId?: string;
    stockItemId?: string;
    warehouseId?: string;
    qtyProposed?: number;
    notes?: string;
  }) =>
    authorizedFetch<ReplenishmentProposal>("/stock/replenishments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  approveReplenishment: (id: string) =>
    authorizedFetch<ReplenishmentProposal>(
      `/stock/replenishments/${id}/approve`,
      { method: "POST" },
    ),

  rejectReplenishment: (id: string, reason?: string) =>
    authorizedFetch<ReplenishmentProposal>(
      `/stock/replenishments/${id}/reject`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      },
    ),
};
