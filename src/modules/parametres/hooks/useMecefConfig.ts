"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { invoicesApi } from "@/modules/factures/services/invoicesApi.service";
import type { UpdateMecefConfigPayload } from "@/modules/factures/types/invoice.types";

export const MECEF_CONFIG_KEY = ["settings", "mecef-config"] as const;

export function useMecefConfig(enabled = true) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled(enabled);

  const mecefQuery = useQuery({
    queryKey: MECEF_CONFIG_KEY,
    queryFn: invoicesApi.getMecefConfig,
    enabled: queryEnabled,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateMecefConfigPayload) =>
      invoicesApi.updateMecefConfig(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MECEF_CONFIG_KEY });
    },
  });

  return {
    mecefQuery,
    updateMutation,
  };
}
