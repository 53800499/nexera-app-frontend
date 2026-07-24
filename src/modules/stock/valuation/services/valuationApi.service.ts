import { authorizedFetch } from "@/shared/http/authorizedFetch";
import type {
  CmupHistoryResponse,
  TurnoverReport,
  ValuationReport,
} from "../types/valuation.types";

export const valuationApi = {
  getReport: (params?: { asOf?: string; warehouseId?: string }) => {
    const q = new URLSearchParams();
    if (params?.asOf) q.set("asOf", params.asOf);
    if (params?.warehouseId) q.set("warehouseId", params.warehouseId);
    const qs = q.toString();
    return authorizedFetch<ValuationReport>(
      `/stock/valuation${qs ? `?${qs}` : ""}`,
    );
  },

  getTurnover: (params: {
    from: string;
    to: string;
    warehouseId?: string;
  }) => {
    const q = new URLSearchParams();
    q.set("from", params.from);
    q.set("to", params.to);
    if (params.warehouseId) q.set("warehouseId", params.warehouseId);
    return authorizedFetch<TurnoverReport>(
      `/stock/valuation/turnover?${q.toString()}`,
    );
  },

  getCmupHistory: (stockItemId: string) =>
    authorizedFetch<CmupHistoryResponse>(
      `/stock/valuation/cmup-history/${stockItemId}`,
    ),

  publish: (params?: { asOf?: string; warehouseId?: string }) => {
    const q = new URLSearchParams();
    if (params?.asOf) q.set("asOf", params.asOf);
    if (params?.warehouseId) q.set("warehouseId", params.warehouseId);
    const qs = q.toString();
    return authorizedFetch<ValuationReport>(
      `/stock/valuation/publish${qs ? `?${qs}` : ""}`,
      { method: "POST" },
    );
  },
};
