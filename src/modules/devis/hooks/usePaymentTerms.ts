"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { readReferenceDataWithCache } from "@/shared/offline/referenceDataOffline.service";
import {
  PAYMENT_TERMS_KEY,
  settingsApi,
} from "@/modules/parametres";

export { PAYMENT_TERMS_KEY };

export function usePaymentTerms() {
  const queryEnabled = useQueryEnabled();

  return useQuery({
    queryKey: PAYMENT_TERMS_KEY,
    queryFn: () =>
      readReferenceDataWithCache({
        key: "payment-terms",
        onlineReader: () => settingsApi.listPaymentTerms(),
        hasUsableCache: (terms) => terms.length > 0,
      }),
    enabled: queryEnabled,
    placeholderData: (previous) => previous,
  });
}
