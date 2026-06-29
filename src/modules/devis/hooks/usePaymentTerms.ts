"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import {
  PAYMENT_TERMS_KEY,
  settingsApi,
} from "@/modules/parametres";

export { PAYMENT_TERMS_KEY };

export function usePaymentTerms() {
  const queryEnabled = useQueryEnabled();

  return useQuery({
    queryKey: PAYMENT_TERMS_KEY,
    queryFn: () => settingsApi.listPaymentTerms(),
    enabled: queryEnabled,
  });
}
