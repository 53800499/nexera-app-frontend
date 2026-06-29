"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { CABINET_QUERY_KEYS } from "../constants/routes";
import { cabinetApi } from "../services/cabinetApi.service";
import type {
  GrantCabinetAccessPayload,
  UpdateCabinetPermissionsPayload,
} from "../types/cabinet.types";

export const AUTHORIZED_CABINETS_QUERY_KEY = [
  "cabinet",
  "authorized-cabinets",
] as const;

export function useCabinetAccessGrant(listEnabled = true) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled(listEnabled);

  const authorizedCabinetsQuery = useQuery({
    queryKey: AUTHORIZED_CABINETS_QUERY_KEY,
    queryFn: () => cabinetApi.listAuthorizedCabinets(),
    enabled: queryEnabled,
    staleTime: 1000 * 30,
  });

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: AUTHORIZED_CABINETS_QUERY_KEY,
      }),
      queryClient.invalidateQueries({
        queryKey: CABINET_QUERY_KEYS.linkedCompanies,
      }),
    ]);
  };

  const grantMutation = useMutation({
    mutationFn: (payload: GrantCabinetAccessPayload) =>
      cabinetApi.grantCabinetAccess(payload),
    onSuccess: invalidateAll,
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: ({
      cabinetTenantId,
      permissions,
    }: UpdateCabinetPermissionsPayload & { cabinetTenantId: string }) =>
      cabinetApi.updateCabinetPermissions(cabinetTenantId, { permissions }),
    onSuccess: invalidateAll,
  });

  const revokeMutation = useMutation({
    mutationFn: ({ cabinetTenantId }: { cabinetTenantId: string }) =>
      cabinetApi.revokeCabinetAccess(cabinetTenantId),
    onSuccess: invalidateAll,
  });

  return {
    authorizedCabinetsQuery,
    grantMutation,
    updatePermissionsMutation,
    revokeMutation,
  };
}
