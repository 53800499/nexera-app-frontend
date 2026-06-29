"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { CABINET_QUERY_KEYS } from "../constants/routes";
import { cabinetApi } from "../services/cabinetApi.service";

export function useLinkedCompanies() {
  const queryEnabled = useQueryEnabled();

  const companiesQuery = useQuery({
    queryKey: CABINET_QUERY_KEYS.linkedCompanies,
    queryFn: () => cabinetApi.listLinkedCompanies(),
    enabled: queryEnabled,
    staleTime: 1000 * 30,
  });

  return { companiesQuery };
}
