"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { CABINET_QUERY_KEYS } from "../constants/routes";
import { cabinetApi } from "../services/cabinetApi.service";

type Params = {
  companyTenantId: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
};

export function useCompanyInvoices({
  companyTenantId,
  page = 1,
  limit = 20,
  enabled = true,
}: Params) {
  const queryEnabled = useQueryEnabled(Boolean(companyTenantId) && enabled);

  const invoicesQuery = useQuery({
    queryKey: CABINET_QUERY_KEYS.companyInvoices(companyTenantId, page, limit),
    queryFn: () =>
      cabinetApi.listCompanyInvoices(companyTenantId, { page, limit }),
    enabled: queryEnabled,
    staleTime: 1000 * 30,
  });

  return { invoicesQuery };
}
