"use client";

import { QuotationsSyncStatusBadge } from "./QuotationsSyncStatusBadge";
import { useQuotationsSync } from "../hooks/useQuotationsSync";

export function QuotationsOfflineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useQuotationsSync();
  return <>{children}</>;
}

export { QuotationsSyncStatusBadge };
