"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useLinkedCompanies } from "./useLinkedCompanies";

const DOSSIER_PATH_RE = /^\/cabinet\/dossiers\/([^/]+)/;

export function useCabinetDossierContext() {
  const pathname = usePathname();
  const companyTenantId = useMemo(() => {
    const match = pathname.match(DOSSIER_PATH_RE);
    return match?.[1] ?? null;
  }, [pathname]);

  const { companiesQuery } = useLinkedCompanies();
  const company = companiesQuery.data?.find((item) => item.id === companyTenantId);

  return {
    isInDossier: Boolean(companyTenantId),
    companyTenantId,
    companyName: company?.name ?? null,
    permissions: company?.permissions ?? [],
    isLoading: Boolean(companyTenantId) && companiesQuery.isLoading,
  };
}
