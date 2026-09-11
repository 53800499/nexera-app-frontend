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

export function useCompanyPayments({
  companyTenantId,
  page = 1,
  limit = 20,
  enabled = true,
}: Params) {
  const queryEnabled = useQueryEnabled(Boolean(companyTenantId) && enabled);

  const paymentsQuery = useQuery({
    queryKey: CABINET_QUERY_KEYS.companyPayments(companyTenantId, page, limit),
    queryFn: () =>
      cabinetApi.listCompanyPayments(companyTenantId, { page, limit }),
    enabled: queryEnabled,
    staleTime: 1000 * 30,
  });

  return { paymentsQuery };
}
