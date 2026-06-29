import { authorizedFetch } from "@/shared/http/authorizedFetch";
import type {
  CommercialDashboard,
  DashboardQueryParams,
} from "../types/dashboard.types";

export const dashboardApi = {
  getCommercial: (params?: DashboardQueryParams) => {
    const search = new URLSearchParams();
    if (params?.from) search.set("from", params.from);
    if (params?.to) search.set("to", params.to);
    const query = search.toString();
    return authorizedFetch<CommercialDashboard>(
      `/dashboard/commercial${query ? `?${query}` : ""}`,
    );
  },
};
