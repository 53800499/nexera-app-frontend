"use client";

import { InvoicesSyncStatusBadge } from "./InvoicesSyncStatusBadge";
import { useInvoicesSync } from "../hooks/useInvoicesSync";

export function InvoicesOfflineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useInvoicesSync();
  return <>{children}</>;
}

export { InvoicesSyncStatusBadge };
